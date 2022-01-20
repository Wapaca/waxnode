import { createClient } from 'redis';



class App {
  constructor(redisClient) {
    this.redis = redisClient
  }

  
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const client = createClient({
    url: 'redis://redis:6379'
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  while(true) {
    await delay(5000);
    client.keys('*').then((keylist) => {
      if(keylist.length)
        console.log(keylist)
      keylist.forEach((key) => {
        client.get(key).then((v) => {const data = JSON.parse(v); console.log(data);})
      })
    });
  }
})();