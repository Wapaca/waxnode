#!/bin/bash

if [ "$(ls -A /chronicle/data)" ]
then
  /usr/local/sbin/chronicle-receiver --config-dir=./config \
   --data-dir=./data \
   --mode=scan
else
  /usr/local/sbin/chronicle-receiver --config-dir=./config \
   --data-dir=./data \
   --start-block=162291175 \
   --mode=scan
fi