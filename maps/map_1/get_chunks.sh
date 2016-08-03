#!/bin/bash
map=1
for i in {-21..9}
do
  for j in {-9..21}
  do
    FILE_NAME="chunk_${map}_${i}_${j}.json"
    URL="https://apex.oraclecorp.com/pls/apex/rest/wurld/${FILE_NAME}"
    wget $URL
  done
done
