from pathlib import Path
from datetime import timedelta
import environ
import os

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    # env 디버깅 값 활성화 여부 선택
    DEBUG=(bool, False)
)

environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
REFRESH_TOKEN_HASH_SECRET = env('REFRESH_TOKEN_HASH_SECRET')
DEBUG = env('DEBUG')

DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

INSTALLED_APPS = [
    "daphne",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "myapp",
    "django_apscheduler"
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
    'USER_ID_CLAIM': 'sub',
}

GOOGLE_CLIENT_ID     = env('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET')
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
        'ENGINE': 'django.db.backends.postgresql',
        
        # .env에서 값 읽어오기
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)], # Redis 기본 포트
        },
    },
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# CHANNEL_LAYERS = {
#     "default": {
#         # ✅ 별도의 Redis 서버 설치 없이 작동하는 방식
#         "BACKEND": "channels.layers.InMemoryChannelLayer",
#     },
# }

# --------------------------
# Other
# --------------------------
ROOT_URLCONF = "myproject.urls"
WSGI_APPLICATION = "myproject.wsgi.application"
ASGI_APPLICATION = "myproject.asgi.application"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = False
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
