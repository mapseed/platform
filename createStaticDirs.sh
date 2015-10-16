#!/bin/bash

DIRS=`ls -l src/flavors/ | egrep '^d' | awk '{print $9}'`

# and now loop through the directories:
for DIR in $DIRS
do
mkdir /${DIR}
chown -R smartercleanup:smartercleanup /${DIR}
chmod -R 0755 /${DIR}
done
