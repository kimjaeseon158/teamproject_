# 사용자 로그인과 로그아웃 API

import logging
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...encryption.crypto import resident_number_blind_index
from ...models import PasswordResetRequest, UserRefreshToken, User_Login_Info, User_WorkDay, WorkPlaceRate
from ...serializers import UserWorkDaySerializer
from ..shared import normalize_work_type
from ..shared.salary_utils import calculate_daily_salary_breakdown, get_rates_for_workday
from ..token import CustomRefreshToken, UserJWTAuthentication, check_user_credentials, save_or_update_user_refresh_token


logger = logging.getLogger(__name__)


class CheckUserLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get("user_id")
        password = request.data.get("password")

        # (1) 로그인 검증
        success, user_name, user_uuid = check_user_credentials(user_id, password)
        if not success:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)

        # (2) JWT 생성
        refresh = CustomRefreshToken.for_subject(
            subject_value=str(user_instance.user_uuid),
            user_name=user_name,
            role="user",
        )
        access = refresh.access_token
        raw_refresh_token = str(refresh)

        # (3) Refresh 토큰 저장 (기존 있으면 업데이트)
        save_or_update_user_refresh_token(
            user_uuid=str(user_instance.user_uuid),
            raw_refresh_token=raw_refresh_token,
            lifetime_days=7,
        )

        # (4) 응답 구성
        response = Response(
            {
                "success": True,
                "user_name": user_name,
                "user_uuid": user_uuid,
                "access": str(access),
                "must_change_password": user_instance.must_change_password,
            }
        )

        response.set_cookie(
            "refresh_token",
            raw_refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,
        )

        return response


class UserLogoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def delete(self, request):
        user_uuid = request.data.get("user_uuid")
        if not user_uuid:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User_Login_Info.objects.get(user_uuid=user_uuid)
        except User_Login_Info.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        try:

            UserRefreshToken.objects.filter(
                user_uuid__user_uuid=user.user_uuid
            ).delete()
            
            success = True
        except Exception:
            # 예외 처리: DB 에러 등 예상치 못한 상황
            logger.exception("User logout failed")
            return Response({"success": False})
   
        # 3. 마무리: 성공 응답과 함께 쿠키 삭제
        response = Response({"success": success})
        response.delete_cookie("refresh_token", path="/")

        return response
