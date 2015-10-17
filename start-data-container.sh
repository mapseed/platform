#!/bin/bash

# echo 'starting...'
npm run build
# echo 'starting staticfile collection'
python /duwamish/src/manage.py collectstatic --noinput
# whoami
cp -r /duwamish/staticfiles /${FLAVOR}/
ln -s /${FLAVOR}/staticfiles /${FLAVOR}/static
# ls -la /air
# echo 'all done!'
