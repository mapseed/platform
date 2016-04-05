from __future__ import print_function
import os
import re

EMAIL_ADDRESS = 'luke@smartercleanup.org'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Uncomment the following line if you would like to also receive emails that
# are sent to your users.
# EMAIL_NOTIFICATIONS_BCC = 'shareabouts@example.com'

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

TIME_ZONE = 'America/New_York'
DEBUG = TEMPLATE_DEBUG = (os.environ.get('DEBUG', 'true').lower()
                          in ('true', 'on', 't', 'yes'))

# Using print function for logging because handlers are not set in settings.py
if 'FLAVOR' not in os.environ:
    print("INFO: Using default flavor")
if 'SITE_URL' not in os.environ:
    print("ERROR: No SITE_URL found!")
if 'SITE_KEY' not in os.environ:
    print("ERROR: No SITE_KEY found!")


SHAREABOUTS = {
    'FLAVOR': os.environ.get('FLAVOR', 'duwamish_flavor'),
    'DATASET_ROOT': os.environ.get('SITE_URL', 'NO_SITE_URL'),
    'DATASET_KEY': os.environ.get('SITE_KEY', 'NO_SITE_KEY')
}

#programatically add environment variables of type *_SITE_URL and *_DATASET_KEY
for k in os.environ:
    if re.match('.+_DATASET_KEY$|.+_SITE_URL$', k):
        SHAREABOUTS[k] = os.environ.get(k, 'Error')

# For geocoding...
MAPQUEST_KEY = 'Fmjtd%7Cluur2g0bnl%2C25%3Do5-9at29u'
