# 관리자 Google 연동/Excel export

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from google_auth_oauthlib.flow import Flow
from .google_drive_utils import GoogleDriveService
from .google_drive_utils import GoogleDriveUploadError
from rest_framework.response import Response
from ...models import User_Login_Info
from ...models import User_WorkDay
from datetime import datetime
from .google_drive_utils import download_drive_template
from .excel_utils import generate_salary_excel
from .excel_utils import generate_users_pay_excel
from .excel_utils import generate_workplace_excel
from .google_drive_utils import parse_year_month
from django.shortcuts import redirect
import requests
from .google_drive_utils import save_workbook_to_drive
from django.conf import settings
from .google_drive_utils import workbook_download_response

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


class GoogleCalendarEventsAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")

        if not access_token:
            return Response(
                {"error": "No access token found. Please re-authenticate with Google."},
                status=401,
            )

        events_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

        headers = {
            "Authorization": f"Bearer {access_token}",
        }
        now = datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        if now.month == 12:
            next_month = now.replace(
                year=now.year + 1,
                month=1,
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
        else:
            next_month = now.replace(
                month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0
            )

        params = {
            "maxResults": 10,
            "orderBy": "startTime",
            "singleEvents": True,
            "timeMin": start_of_month.isoformat() + "Z",
            "timeMax": next_month.isoformat() + "Z",
        }


        res = requests.get(events_url, headers=headers, params=params)

        if res.status_code != 200:
            return Response(
                {"error": "Failed to fetch events", "details": res.json()},
                status=res.status_code,
            )

        events = res.json().get("items", [])
        return Response({"events": events})


class GoogleDriveWorkplaceExcelExportAPIView(APIView):
    """
    workload 폴더에서 템플릿을 찾고, workload/YYYY-MM 폴더에 근무현황 파일을 저장합니다.
    work_place가 있으면 해당 근무지만, 없으면 모든 근무지의 승인 근무내역을 한 파일로 생성합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")
        work_place = request.query_params.get("work_place")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        workload_folder_id = drive.get_or_create_folder("workload")
        template_io = download_drive_template(drive, workload_folder_id, "workload_template")

        if work_place:
            wb = generate_workplace_excel(work_place, year, month, template_file=template_io)
            save_filename = f"{work_place}_{year}_{month:02d}.xlsx"
            try:
                save_filename = save_workbook_to_drive(drive, wb, save_filename, ["workload", date_str])
            except GoogleDriveUploadError as exc:
                return Response({"success": False}, status=exc.status_code)

            return workbook_download_response(wb, save_filename)

        wb = generate_workplace_excel(None, year, month, template_file=template_io)
        save_filename = f"workload_all_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["workload", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)


class GoogleDriveSalaryExcelExportAPIView(APIView):
    """
    salary 폴더에서 템플릿을 찾고, salary/YYYY-MM 폴더에 월 급여대장 파일을 저장합니다.
    생성된 파일은 Google Drive에 저장한 뒤 브라우저 다운로드 응답으로도 반환합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        salary_folder_id = drive.get_or_create_folder("salary")
        template_io = download_drive_template(drive, salary_folder_id, "salary_template")

        wb = generate_salary_excel(year, month, template_file=template_io)
        save_filename = f"salary_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["salary", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)


class GoogleDriveUserPayExcelExportAPIView(APIView):
    """
    user_pay 폴더에서 템플릿을 찾고, user_pay/YYYY-MM 폴더에 개인 월급명세서 파일을 저장합니다.
    하나의 엑셀 파일 안에 사원별 시트를 생성합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")
        user_uuid = request.query_params.get("user_uuid")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        pay_folder_id = drive.get_or_create_folder("user_pay")
        template_io = download_drive_template(drive, pay_folder_id, "user_pay_template")

        if user_uuid:
            user_uuids = [
                value.strip()
                for value in user_uuid.split(",")
                if value.strip()
            ]
        else:
            user_uuids = list(
                User_WorkDay.objects
                .filter(
                    work_date__year=year,
                    work_date__month=month,
                    is_approved=True,
                )
                .order_by("user_name")
                .values_list("user_uuid_id", flat=True)
                .distinct()
            )

        existing_count = User_Login_Info.objects.filter(user_uuid__in=user_uuids).count()
        if existing_count != len(user_uuids):
            return Response({"success": False}, status=404)

        wb = generate_users_pay_excel(user_uuids, year, month, template_file=template_io)
        save_filename = f"user_pay_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["user_pay", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)
