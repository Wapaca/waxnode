'use strict';

console.log('test');

const program = require('commander');
const ConsumerServer = require('..');
import { createClient } from 'redis';
const redisClient = createClient({
    url: 'redis://redis:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

program
    .option('--host [value]', 'Binding address', '0.0.0.0')
    .option('--port [value]', 'Websocket server port', '8855')
    .option('--ack [value]', 'Ack every X blocks', '10')
    .option('--async', 'Run asynchronous emitter')
    .parse(process.argv);


const server = new ConsumerServer({host: program.host,
                                   port: program.port,
                                   ackEvery: program.ack,
                                   async: program.async});


server.on('fork', function(data) {
    const block_num = data['block_num'];
    console.log('fork: ' + block_num);

    // Remove tx on higher height than fork
    redisClient.keys('*').then((txkeys) => {
        txkeys.forEach((txkey) => {
            const txblock_num = txkey.split('_').shift()
            if(txblock_num >= block_num) {
                redisClient.delete(txkey).then(() => {
                    console.log('DELETED '+txkey);
                })
            }
        })
    })
    
});


function extractDataIfTraceOfInterest(trace) {
    if(trace.receiver !== 'alcordexmain')
        return false;

    const actions = trace.action_traces.filter(t => ['sellreceipt', 'sellmatch', 'buyreceipt', 'buymatch'].indexOf(t.act.name) !== -1)

    if(actions.length === 1) {
        console.log(actions);
        let data = actions[0].act.data;
        const side = (actions[0].act.name.substr(0,1) === 'b') ? 'buy' : 'sell';

        // buy_order = limit , record = market
        if(data[side+'_order'] !== undefined) {
          data =  data[side+'_order'];
          data.isExecutedOrder = false;
        }
        else {
          data = data.record;
          data.isExecutedOrder = true;
        }
        return data;
    }

    return false;
}

server.on('tx', function(data) {
    let tx_printed = false;
    const block_num = data['block_num'];
    const trace = data.trace;
    if(trace.status == 'executed') {
        console.log('block: '+block_num+' tx: '+trace.id);
        const txdata = extractDataIfTraceOfInterest(trace)
        if(txdata !== false) {
          // save into redis
          const txkey = block_num+'_'+trace.id;
          redisClient.set(txkey, JSON.stringify(txdata), {
            EX: 600, // 10 minutes
            NX: true
          }).then(() => {console.log('SET: '+txkey);});  
        }
    }
});

server.on('blockCompleted', function(data) {
    let block_num = data['block_num'];
    console.log('block completed: ' + block_num);
});



server.on('ackBlock', function(bnum) {
    console.log('ack: ' + bnum);
});


server.on('connected', function() {
    console.log('CONNECTED');
});

server.on('disconnected', function() {
    console.log('DISCONNECTED');
});

redisClient.connect().then(() => {
    server.start();
    console.log('started');    
});