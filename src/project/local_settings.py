from __future__ import print_function
import os
import re

TIME_ZONE = 'America/New_York'
DEBUG = True
TEMPLATE_DEBUG = DEBUG

EMAIL_ADDRESS = 'luke@smartercleanup.org'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Uncomment the following line if you would like to also receive emails that
# are sent to your users.
#EMAIL_NOTIFICATIONS_BCC = 'shareabouts@example.com'

# The SHAREABOUTS['FLAVOR'] environment variable is used as a prefix for the
# Shareabouts configuration. configuration is expected to live in a package
# named 'flavors.<SHAREABOUTS_FLAVOR>'. This package will correspond to a
# folder in the root of the src tree that contains all the configuration
# information for the flavor.


def read_env():
    """Pulled from Honcho code with minor updates, reads local default
    environment variables from a .env file located in the project root
    directory.

    """
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
            os.environ.setdefault(key, val)
read_env()

# Using print function for logging because handlers are not set in settings.py
if 'FLAVOR' not in os.environ:
    os.environ['FLAVOR'] = 'duwamish_flavor'
    print("INFO: Using default flavor")
if 'SITE_URL' not in os.environ:
    os.environ['SITE_URL'] = 'nosite'
    print("ERROR: No SITE_URL found!")
if 'SITE_KEY' not in os.environ:
    os.environ['SITE_KEY'] = '1234'
    print("ERROR: No SITE_KEY found!")

SHAREABOUTS = {
  'FLAVOR': os.environ['FLAVOR'],
  'DATASET_ROOT': os.environ['SITE_URL'],
  'DATASET_KEY': os.environ['SITE_KEY']
}

# For geocoding...
MAPQUEST_KEY = 'Fmjtd%7Cluur2g0bnl%2C25%3Do5-9at29u'
