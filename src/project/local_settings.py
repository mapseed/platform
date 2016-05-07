from __future__ import print_function
import os
import re

# The SHAREABOUTS['FLAVOR'] environment variable is used as a prefix for the
# Shareabouts configuration. configuration is expected to live in a package
# named 'flavors.<SHAREABOUTS_FLAVOR>'. This package will correspond to a
# folder in the root of the src tree that contains all the configuration
# information for the flavor.


def read_env():
    try:
        file_path = os.path.join(os.path.dirname(__file__), '..',  '.env')
        # print "filepath:" + str(file_path)
        with open(file_path) as f:
            content = f.read()
    except IOError:
        content = ''

    for line in content.splitlines():
        m1 = re.match(r'\A([A-Za-z_0-9]+)=(.*)\Z', line)
        if m1:
            key, val = m1.group(1), m1.group(2)
            m2 = re.match(r"\A'(.*)'\Z", val)
            if m2:
                val = m2.group(1)
            m3 = re.match(r'\A"(.*)"\Z', val)
            if m3:
                val = re.sub(r'\\(.)', r'\1', m3.group(1))
            # overrides existing env variables, only in the Python env
            os.environ[key] = val
read_env()

env = os.environ

TIME_ZONE = env.get('TIME_ZONE', 'America/Los_Angeles')
DEBUG = TEMPLATE_DEBUG = (env.get('DEBUG', 'true').lower()
                          in ('true', 'on', 't', 'yes'))

# Admin Settings:
if 'ADMIN_NAME' in env and 'ADMIN_EMAIL' in env:
    ADMINS = (
        (env['ADMIN_NAME'],
         env['ADMIN_EMAIL']),
    )

MANAGERS = ADMINS


# Email notification settings:
if 'EMAIL_ADDRESS' in env:
    EMAIL_ADDRESS = env['EMAIL_ADDRESS']
if 'EMAIL_HOST' in env:
    EMAIL_HOST = env['EMAIL_HOST']
if 'EMAIL_PORT' in env:
    EMAIL_PORT = env['EMAIL_PORT']
if 'EMAIL_USERNAME' in env:
    EMAIL_HOST_USER = env['EMAIL_USERNAME']
if 'EMAIL_PASSWORD' in env:
    EMAIL_HOST_PASSWORD = env['EMAIL_PASSWORD']
if 'EMAIL_USE_TLS' in env:
    EMAIL_USE_TLS = env['EMAIL_USE_TLS']

if 'EMAIL_NOTIFICATIONS_BCC' in env:
    EMAIL_NOTIFICATIONS_BCC = env['EMAIL_NOTIFICATIONS_BCC'].split(',')
# Send emails from our smtp server:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# Use this backend to only print our emails to the console:
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# Flavor settings:
# Using print function for logging because handlers are not set in settings.py
if 'FLAVOR' not in env:
    print("INFO: Using default flavor")
if 'SITE_URL' not in env:
    print("ERROR: No SITE_URL found!")
if 'SITE_KEY' not in env:
    print("ERROR: No SITE_KEY found!")


SHAREABOUTS = {
    'FLAVOR': env.get('FLAVOR', 'defaultflavor'),
    'DATASET_ROOT': env.get('SITE_URL', 'NO_SITE_URL'),
    'DATASET_KEY': env.get('SITE_KEY', 'NO_SITE_KEY')
}

#programatically add environment variables of type *_SITE_URL and *_DATASET_KEY
for k in os.environ:
    if re.match('.+_DATASET_KEY$|.+_SITE_URL$', k):
        SHAREABOUTS[k] = os.environ.get(k, 'Error')

# For geocoding...
MAPQUEST_KEY = 'Fmjtd%7Cluur2g0bnl%2C25%3Do5-9at29u'
