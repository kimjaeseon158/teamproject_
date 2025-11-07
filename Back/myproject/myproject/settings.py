from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-t2&g*_n7m&i2%#00@-s8v@x*36c3oy@b)lc$g-+j=k@w9_jcyo"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

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

REFRESH_TOKEN_HASH_SECRET = "dev-only-refresh-hash-secret-change-me"

GOOGLE_CLIENT_ID     = "150097873816-sjo6bj7v2u1n7usqkn5us3eq878665f8.apps.googleusercontent.com"

GOOGLE_REDIRECT_URI  = "http://localhost:8000/api/google_calendar_auth/callback/"

GOOGLE_OAUTH2_CLIENT_CONFIG = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "project_id": "my-django-react-app",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uris": [GOOGLE_REDIRECT_URI],
    }
}

# --------------------------
# Middleware
# --------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ 맨 위 유지
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",  # 쿠키 기반 CSRF를 쓰려면 추후 활성화 고려
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
    "http://127.0.0.1:3000",
]

# 프런트 도메인을 CSRF 신뢰 도메인으로 등록 (쿠키 기반 요청 허용)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# (선택) 개발 편의용 쿠키 옵션 — 운영 배포 시 True/더 엄격하게 바꾸기
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False

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
