#!/bin/bash

echo 'starting build...'
npm run build
echo 'starting staticfile collection...'
python /platform/src/manage.py collectstatic --noinput
# whoami
cp -r /platform/staticfiles /${CONTAINER}/
ln -s /${CONTAINER}/staticfiles /${CONTAINER}/static
ls -la /${CONTAINER}
echo 'all done!'
