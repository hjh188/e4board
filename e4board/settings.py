"""
Django settings for e4board project.

Generated by 'django-admin startproject' using Django 1.8.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '0h&gzdt#quv1nzud#l$bmt&0uoa(qlk##a^+u%a_%dm+#w(8^&'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework.authtoken',
    'djcelery',
    'django_crontab',
    'django_extensions',
    'compressor',
    'eboard',
    'euser',
    'eweb',
    'efile',
    'eapp',
)

CRONJOBS = [
]

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'e4board.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "web"), os.path.join(BASE_DIR, "web", "plugin")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'e4board.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'e4board',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

# STATIC_URL define the web entry
# STATICFIELS_DIRS map the real web files to the web entry
# below means access `web` will fetch the files from pweb/web dir
STATIC_URL = '/web/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "web"),
)

# STATIC_ROOT setting to the directory from which you'd like to serve these files,
# run the command `python manage.py collectstatic`, this will copy all statics files
# located in STATIC_URL to STATIC_ROOT
STATIC_ROOT = '/usr/share/nginx/html/web/'


# compress for css and js. run `python manage.py compress` offline
COMPRESS_ROOT = 'web/'
COMPRESS_ENABLED = True
COMPRESS_OFFLINE = True
COMPRESS_CSS_FILTERS = [
    #creates absolute urls from relative ones
    'compressor.filters.css_default.CssAbsoluteFilter',
    #css minimizer
    'compressor.filters.cssmin.CSSMinFilter'
]
COMPRESS_JS_FILTERS = [
    'compressor.filters.jsmin.JSMinFilter',
]
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #other
    'compressor.finders.CompressorFinder',
)

# For Download
MEDIA_URL = '/customer_file/'
MEDIA_ROOT = BASE_DIR

AUTH_USER_MODEL = 'euser.User'

DISABLE_CSRF_CHECK = True

from lucommon import *

# LOGIN config
LOGIN_URL = 'http://127.0.0.1:9572/eboard/eweb/login'

# APP log switch
APP_DEBUG = False

# Use redis for session cache
CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        # Production Env
        'LOCATION': '',
    }
}
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

SILENCED_SYSTEM_CHECKS = [
    'django_mysql.W003',
]

# LDAP settings
import ldap
from django_auth_ldap.config import LDAPSearch

AUTHENTICATION_BACKENDS = (
    'django_auth_ldap.backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
)

AUTH_LDAP_SERVER_URI = ""

AUTH_LDAP_BIND_DN = ""
AUTH_LDAP_BIND_PASSWORD = ""

OU = ""

AUTH_LDAP_USER_SEARCH = LDAPSearch(OU, ldap.SCOPE_SUBTREE, "(sAMAccountName=%(user)s)")

#AUTH_LDAP_USER_DN_TEMPLATE = "cn=%(user)s,OU=Accounts, DC=splunkcorp, DC=com"

AUTH_LDAP_USER_ATTR_MAP = {
    'first_name': 'givenName',
    'last_name': 'sn',
    'username': 'sAMAccountName',
    'bio': 'title',
    'phone': 'telephoneNumber',
    'location': 'co',
    'display_name': 'displayName',
    'employee_id': 'employeeID',
    'manager': 'manager',
    'email': 'mail',
}

# Celery settings
import djcelery
djcelery.setup_loader()
# Production Env
BROKER_URL= ''
CELERY_RESULT_BACKEND = ''
CELERYD_LOG_FILE = "logs/celery.log"
# PREFETCH behavior depends on the ACK behavior
# If ACKS_LATE = False
# * Task 1 is prefetched
# * Task 1 is Ack'ed
# * Task 2 is prefetched
# * Task 1 is run
#
# But if ACKS_LATE = True:
# * Task 1 is prefetched
# * Task 1 is run
# * Task 1 is Ack'ed
# * Task 2 is prefetched
CELERY_ACKS_LATE = True
CELERY_IGNORE_RESULT = True
CELERY_STORE_ERRORS_EVEN_IF_IGNORED = False
CELERYD_PREFETCH_MULTIPLIER = 1 # solve long time task unconsumed issue unack meesage in queue
CELERY_ROUTES = {
}
BROKER_TRANSPORT_OPTIONS = {
    'socket_timeout': 10, # timeout in case of network errors
    'fanout_prefix': True,
    'fanout_patterns': True,
}

