#!/bin/zsh

DIRECTORY=~/Private/timed
DIST=$DIRECTORY/dist

cd $DIRECTORY

if [ ! -d "$DIST" ]; then
  tsc
fi

node dist/index.js

