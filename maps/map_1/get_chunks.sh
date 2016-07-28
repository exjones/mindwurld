#!/bin/bash

for i in {-21..9}
do
  for j in {-9..21}
  do
    FILE_NAME="chunk_1_${i}_${j}.json"
    URL="https://apex.oraclecorp.com/pls/apex/wurld/${FILE_NAME}"
    wget $URL
  done
done

