# 토큰 발급/검증 API

import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ...models import Admin_Login_Info, AdminRefreshToken, User_Login_Info, UserRefreshToken


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
    except Admin_Login_Info.DoesNotExist:
        pass
    return False, None


# REFRESH_TOKEN 해시
def hash_refresh(raw: str) -> str:
    secret = settings.REFRESH_TOKEN_HASH_SECRET.encode()
    return hmac.new(secret, raw.encode(), hashlib.sha256).hexdigest()


# REFRESH_TOKEN 
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


class TokenRefreshAPIView(APIView):
    permission_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token missing"}, status=401
            )

        try:
            refresh_obj = RefreshToken(refresh_token)
            role = refresh_obj.get("role", "")
            new_access = refresh_obj.access_token

            return Response({"success": True, "access": str(new_access), "Role": role})
        except Exception:
            return Response(
                {"success": False, "message": "Invalid refresh token"}, status=401
            )
