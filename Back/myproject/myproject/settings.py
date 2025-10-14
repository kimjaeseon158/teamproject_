from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-t2&g*_n7m&i2%#00@-s8v@x*36c3oy@b)lc$g-+j=k@w9_jcyo"
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "myapp",
]

# --------------------------
# REST Framework + JWT
# --------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME"   : timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME"  : timedelta(days=7),
    "ROTATE_REFRESH_TOKENS"   : False,
    "BLACKLIST_AFTER_ROTATION": False,
}

GOOGLE_CLIENT_ID     = "150097873816-sjo6bj7v2u1n7usqkn5us3eq878665f8.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "test_secret"
GOOGLE_REDIRECT_URI  = "http://localhost:8000/api/google_calendar/callback"

# --------------------------
# Middleware
# --------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # 반드시 맨 위
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",  # 필요 시 활성화
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --------------------------
# CORS
# --------------------------
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# --------------------------
# Database
# --------------------------
DATABASES = {
    'default': {
        'ENGINE'   : 'django.db.backends.postgresql',
        'NAME'     : 'postgres',
        'USER'     : 'postgres',
        'PASSWORD' : 'test',
        'HOST'     : 'localhost',
        'PORT'     : '5432',
    }
}

# --------------------------
# Other
# --------------------------
ROOT_URLCONF = "myproject.urls"
WSGI_APPLICATION = "myproject.wsgi.application"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
