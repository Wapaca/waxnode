#!/bin/bash

# wait to be sure consumer is started
sleep 3

if [ "$(ls -A /chronicle/data)" ]
then
  /usr/local/sbin/chronicle-receiver --config-dir=./config \
   --data-dir=./data \
   --mode=scan
else
  /usr/local/sbin/chronicle-receiver --config-dir=./config \
   --data-dir=./data \
   --start-block=162507170 \
   --mode=scan
fi
