# Google 로그인·콜백·로그아웃 API

from datetime import datetime
import requests
from django.conf import settings
from django.shortcuts import redirect
from google_auth_oauthlib.flow import Flow
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import User_Login_Info, User_WorkDay
from .excel_utils import generate_salary_excel, generate_users_pay_excel, generate_workplace_excel
from .google_drive_utils import GoogleDriveService, GoogleDriveUploadError, download_drive_template, parse_year_month, save_workbook_to_drive, workbook_download_response


class GoogleLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        flow = Flow.from_client_config(
            settings.GOOGLE_OAUTH2_CLIENT_CONFIG,
            scopes=[
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/drive",
            ],
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI  # 꼭 이 줄 있어야 함

        authorization_url, state = flow.authorization_url(
            access_type="offline", include_granted_scopes="true", prompt="consent"
        )

        request.session["state"] = state
        return redirect(authorization_url)


class GoogleCallbackAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")
        
        base_url = settings.FRONTEND_URL  # .env에서 읽어온 http://localhost:3000
    
        if not code:
            return redirect(f"{base_url}/dashboard?google_auth=failed")

        # 쿠키에서 state 검증
        saved_state = request.session.get("state")

        if not saved_state or saved_state != state:
            return redirect(f"{base_url}/dashboard?google_auth=invalid_state")

        # 토큰 교환 요청
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_res = requests.post(token_url, data=data)
        token_json = token_res.json()

        access_token = token_json.get("access_token")
        refresh_token = token_json.get("refresh_token")

        if not access_token:
            return redirect(f"{base_url}/dashboard?google_auth=failed")

        # 보안상 프론트엔드로 직접 토큰을 보내지 않음
        # 대신 Django HttpOnly 쿠키에 저장
        response = redirect(f"{base_url}/dashboard?google_auth=success")
        response.delete_cookie("oauth_state")
        
        cookie_secure = not settings.DEBUG

        response.set_cookie(
            "google_access_token",
            access_token,
            httponly=True,
            secure=cookie_secure,
            samesite="Lax",
        )
        if refresh_token:
            response.set_cookie(
                "google_refresh_token",
                refresh_token,
                httponly=True,
                secure=cookie_secure,
                samesite="Lax",
            )

        return response


class GoogleLogoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def delete(self, request):
        refresh_token = request.COOKIES.get("google_refresh_token")
        access_token = request.COOKIES.get("google_access_token")
        token = refresh_token or access_token
        token_revoked = False

        if token:
            try:
                revoke_response = requests.post(
                    "https://oauth2.googleapis.com/revoke",
                    data={"token": token},
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10,
                )
                token_revoked = revoke_response.status_code == 200
            except requests.RequestException:
                # Local logout must still complete if Google's endpoint is unavailable.
                token_revoked = False

        response = Response(
            {
                "success": True,
                "google_token_revoked": token_revoked,
            }
        )
        response.delete_cookie("google_access_token", path="/")
        response.delete_cookie("google_refresh_token", path="/")
        return response
