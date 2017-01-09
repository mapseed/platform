#!/bin/bash

cd ..
echo 'starting build...'
npm run build
echo 'starting staticfile collection...'
python /platform/src/manage.py collectstatic --noinput
# whoami
cp -r /platform/staticfiles /${CONTAINER}/
ln -s /${CONTAINER}/staticfiles /${CONTAINER}/static
ls -la /${CONTAINER}
cd -
echo 'all done!'
