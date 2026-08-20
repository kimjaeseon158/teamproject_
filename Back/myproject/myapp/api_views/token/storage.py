# refresh token 해시와 데이터베이스 저장 함수

import hashlib
import hmac
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from ...models import Admin_Login_Info, AdminRefreshToken, User_Login_Info, UserRefreshToken


def hash_refresh(raw: str) -> str:
    secret = settings.REFRESH_TOKEN_HASH_SECRET.encode()
    return hmac.new(secret, raw.encode(), hashlib.sha256).hexdigest()


def save_or_update_admin_refresh_token(
    admin_uuid: str, raw_refresh_token: str, lifetime_days: int = 7
):
    admin_instance = Admin_Login_Info.objects.get(admin_uuid=admin_uuid)
    hashed_token = hash_refresh(raw_refresh_token)
    expires_at = timezone.now() + timedelta(days=lifetime_days)

    token_obj, _created = AdminRefreshToken.objects.update_or_create(
        admin_uuid=admin_instance,
        defaults={
            "hashed_token": hashed_token,
            "expires_at": expires_at,
        },
    )
    return token_obj


def save_or_update_user_refresh_token(
    user_uuid: str, raw_refresh_token: str, lifetime_days: int = 7
):
    user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
    hashed_token = hash_refresh(raw_refresh_token)
    expires_at = timezone.now() + timedelta(days=lifetime_days)

    token_obj, _created = UserRefreshToken.objects.update_or_create(
        user_uuid=user_instance,  # FK 기준
        defaults={
            "hashed_token": hashed_token,
            "expires_at": expires_at,
        },
    )
    return token_obj
