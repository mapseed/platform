#!/bin/bash
npm run build
python src/manage.py collectstatic --noinput
python src/manage.py compilemessages
gunicorn wsgi:application -w 3 -b 0.0.0.0:${PORT} --log-level=debug
