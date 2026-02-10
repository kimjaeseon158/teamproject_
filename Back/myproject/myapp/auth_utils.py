from django.contrib.auth.hashers import check_password
from .models import User_Login_Info, Admin_Login_Info, AdminRefreshToken, UserRefreshToken
import hashlib, hmac
from django.conf import settings
from datetime import timedelta
from django.utils import timezone

def check_user_credentials(user_id, password):
    try:
        user = User_Login_Info.objects.get(user_id=user_id)
        if check_password(password, user.password):  # 평문 vs 해시 비교
            return True, user.user_name, user.user_uuid
    except User_Login_Info.DoesNotExist:
        pass
    return False, None, None

def check_admin_credentials(admin_id, password, admin_code):
    try:
        admin = Admin_Login_Info.objects.get(admin_id=admin_id)
        if check_password(password, admin.password) and admin.admin_code == admin_code:

            return True, admin.admin_uuid
    except (Admin_Login_Info.DoesNotExist):
        pass
    return False, None


# REFRESH_TOKEN 해시
def hash_refresh(raw: str) -> str:
    secret = settings.REFRESH_TOKEN_HASH_SECRET.encode()
    return hmac.new(secret, raw.encode(), hashlib.sha256).hexdigest()


# REFRESH_TOKEN 
def save_or_update_admin_refresh_token(admin_uuid: str, raw_refresh_token: str, lifetime_days: int = 7):
    """
    admin_uuid(FK)로 연결된 기존 리프레시 토큰이 있으면 업데이트,
    없으면 새로 생성.
    """
    admin_instance = Admin_Login_Info.objects.get(admin_uuid=admin_uuid)

    hashed_token = hash_refresh(raw_refresh_token)
    expires_at = timezone.now() + timedelta(days=lifetime_days)

    token_obj, _created = AdminRefreshToken.objects.update_or_create(
        admin_uuid=admin_instance,
        defaults={
            "hashed_token": hashed_token,
            "expires_at": expires_at,
        }
    )
    return token_obj

def save_or_update_user_refresh_token(user_uuid: str, raw_refresh_token: str, lifetime_days: int = 7):
    """
    user_uuid(FK) 기준으로 기존 토큰이 있으면 업데이트,
    없으면 새로 생성하는 함수
    """
    user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
    hashed_token = hash_refresh(raw_refresh_token)
    expires_at = timezone.now() + timedelta(days=lifetime_days)

    token_obj, created = UserRefreshToken.objects.update_or_create(
        user_uuid=user_instance,  # FK 기준
        defaults={
            "hashed_token": hashed_token,
            "expires_at": expires_at,
        }
    )

    return token_obj