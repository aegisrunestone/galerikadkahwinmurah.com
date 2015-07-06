#!/bin/sh

find . -type f -name '*.jpg' | while read FILE ; do
  newfile="$(echo ${FILE} |sed -e 's/_/-/')" ;
  mv "${FILE}" "${newfile}" ;
done 
