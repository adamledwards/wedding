#!/usr/bin/env bash

python3 manage.py migrate
if [ "$WEDDING_ENV" == "PRODUCTION" ]; then
    python3 manage.py collectstatic --noinput
    gunicorn --bind 0.0.0.0:8000 --access-logfile - --capture-output wedding.wsgi:application
else
    python3 manage.py runserver 0.0.0.0:8000
fi