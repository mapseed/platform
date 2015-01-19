import os
import re

TIME_ZONE = 'America/New_York'
DEBUG = True
TEMPLATE_DEBUG = DEBUG

EMAIL_ADDRESS = 'shareabouts@example.com'
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
        with open('src/.env') as f:
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

dataset_root_val = os.environ['DUWAMISH_SITE_URL']
dataset_key_val = os.environ['DUWAMISH_SITE_KEY']
SHAREABOUTS = {
  'FLAVOR': 'duwamish_flavor',
  'DATASET_ROOT': dataset_root_val,
  'DATASET_KEY': dataset_key_val,
  # Default settings:
  # 'FLAVOR': 'default',
#  'DATASET_ROOT': 'http://data.shareabouts.org/api/v2/demo-user/datasets/demo-data/',
#  'DATASET_KEY': 'NTNhODE3Y2IzODlmZGZjMWU4NmU3NDhj',
}
# print "root: " + dataset_root_val
# print "key: " + dataset_key_val
# print "SHAREABOUTS: " + str(SHAREABOUTS)

# For geocoding...
MAPQUEST_KEY = 'Fmjtd%7Cluur2g0bnl%2C25%3Do5-9at29u'
