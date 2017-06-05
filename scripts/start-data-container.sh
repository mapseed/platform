#!/bin/bash

cd /platform
echo 'starting build...'
echo 'pwd:'
pwd
yarn
NODE_ENV=production npm run build
echo 'starting static file collection...'
python /platform/src/manage.py collectstatic --noinput
echo 'whoami:'
whoami
cp -r /platform/staticfiles /${CONTAINER}/
ln -s /${CONTAINER}/staticfiles /${CONTAINER}/static
ls -la /${CONTAINER}
cd -
echo 'all done!'
