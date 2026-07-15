# 관리자 로그인/로그아웃

import logging

from rest_framework.views import APIView
from ...models import AdminRefreshToken
from ...models import Admin_Login_Info
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..token import CustomRefreshToken
from ..token import check_admin_credentials
from ..token import save_or_update_admin_refresh_token
from django.conf import settings
from rest_framework import status

logger = logging.getLogger(__name__)

class CheckAdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        admin_id = request.data.get("id")
        password = request.data.get("password")
        admin_code = request.data.get("admin_code")

        # 0) 크리덴셜 검증
        success, admin_uuid = check_admin_credentials(admin_id, password, admin_code)
        if not success:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        # 1) 관리자 인스턴스 조회
        admin_instance = Admin_Login_Info.objects.get(admin_uuid=admin_uuid)

        # 2) JWT 생성 (원하는 클레임 포함)
        refresh = CustomRefreshToken.for_subject(
            subject_value=str(admin_instance.admin_uuid),
            admin_name=admin_instance.admin_name,
            role="admin",
        )
        access = refresh.access_token
        raw_refresh_token = str(refresh)  # 쿠키로 내려보낼 값

        # 3) DB 저장 (FK=admin 기준으로 upsert)
        #    기존 것이 있으면 hashed_token, expires_at 업데이트
        #    없으면 새로 생성
        save_or_update_admin_refresh_token(
            admin_uuid=str(admin_instance.admin_uuid),
            raw_refresh_token=raw_refresh_token,
            lifetime_days=7,
        )

        # 4) 응답 구성: access는 body, refresh는 HttpOnly 쿠키 ONLY
        response = Response(
            {
                "success": True,
                "admin_uuid": admin_uuid,
                "access": str(access),
            }
        )

        response.set_cookie(
            key="refresh_token",
            value=raw_refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,  # 7일
        )

        return response


class AdminLogoutAPIView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def delete(self, request):
        admin_uuid = request.data.get("admin_uuid")
        if not admin_uuid:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            admin = Admin_Login_Info.objects.get(admin_uuid=admin_uuid)
        except Admin_Login_Info.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            AdminRefreshToken.objects.filter(
                admin_uuid__admin_uuid=admin.admin_uuid
            ).delete()
            
            success = True
        except Exception:
            # 예외 처리: DB 에러 등 예상치 못한 상황
            logger.exception("Admin logout failed")
            return Response({"success": False})
   
        # 마무리: 성공 응답과 함께 쿠키 삭제
        response = Response({"success": success})
        response.delete_cookie("refresh_token", path="/")
        return response

