#!/bin/bash

#Replace all song names with a particular file

baseFile='./test song.mp3'

find . -iname "*.mp3" -type f -print0 | while IFS= read -r -d $'\0' file; do
  echo -e "Replacing song: $file"
  cp "$baseFile" "$file"
done