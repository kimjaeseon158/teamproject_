from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from .serializers import (
    User_Login_InfoSerializer,
    User_InfoSerializer,
    IncomeSerializer,
    ExpenseSerializer,
    UserWorkDaySerializer,
    WorkPlaceRateSerializer,
    WorkPlaceRateCreateSerializer
)
from .auth_utils import check_user_credentials, check_admin_credentials
from .jwt_utils import (
    CustomRefreshToken,
    UserJWTAuthentication,
    AdminJWTAuthentication,
)
from .models import (
    User_Login_Info,
    Admin_Login_Info,
    Expense,
    Income,
    AdminRefreshToken,
    UserRefreshToken,
    User_WorkDay,
    User_WorkDetail,
    WorkPlaceRate
)
from django.db.models import Sum
from django.db import transaction
from django.db.utils import IntegrityError
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings
from django.shortcuts import redirect
from datetime import datetime
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2 import credentials
from rest_framework_simplejwt.tokens import RefreshToken
from .auth_utils import (
    save_or_update_admin_refresh_token,
    save_or_update_user_refresh_token,
)
from .excel_utils import (
    generate_workplace_excel,
    generate_salary_excel,
    generate_users_pay_excel,
    generate_user_record_excel
)
from .google_drive_utils import (
    GoogleDriveService,
    GoogleDriveUploadError,
    parse_year_month,
    download_drive_template,
    workbook_download_response,
    save_workbook_to_drive,
)

from .salary import (
    sync_salary_expense_for_workday,
    group_rates_by_user,
    calculate_daily_salary_breakdown,
    get_rates_for_workday

)
from .date_utils import month_start_end, add_months
from .work_types import normalize_work_type
import requests
import os
import json
import io
import urllib.parse


# ------------------- Refresh API -------------------
class TokenRefreshAPIView(APIView):
    permission_classes = []  # 인증 필요 없음

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token missing"}, status=401
            )

        try:
            refresh_obj = RefreshToken(refresh_token)

            #Token Claim 추출
            role = refresh_obj.get("role", "")
            new_access = refresh_obj.access_token

            response = Response({"success": True, "access": str(new_access), "Role" : role})
            return response
        except Exception:
            return Response(
                {"success": False, "message": "Invalid refresh token"}, status=401
            )


# ----------------------
# 관리자 로그인, 로그아웃
# ----------------------


# ---------------------- Google OAuth ----------------------
class GoogleLoginAPIView(APIView):
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

        # ✅ 보안상 프론트엔드로 직접 토큰을 보내지 않음
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
            secure=False,  # 로컬 개발: False / 배포: True
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,  # 7일
        )

        return response


class AdminLogoutAPIView(APIView):
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
            # 1. 시도: 개수 정보만 받고 상세내역(_)은 무시
            deleted_count, _ = AdminRefreshToken.objects.filter(admin_uuid_id=admin).delete()
            
            # 삭제 개수와 상관없이(0개여도) 로그아웃 절차 진행
            success = True
        except Exception as e:
            # 2. 예외 처리: DB 에러 등 예상치 못한 상황
            print(f"Logout Error: {e}")
            return Response({"success": False})
   
        # 3. 마무리: 성공 응답과 함께 쿠키 삭제
        response = Response({"success": success})
        response.delete_cookie("refresh_token", path="/")
        return response




# ----------------------
# 일반 유저 로그인, 로그아웃
# ----------------------
class CheckUserLoginAPIView(APIView):
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
            }
        )

        response.set_cookie(
            "refresh_token",
            raw_refresh_token,
            httponly=True,
            secure=False,  # 배포 시 True 권장
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,
        )

        return response


class UserLogoutAPIView(APIView):
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
            # 1. 시도: 개수 정보만 받고 상세내역(_)은 무시
            deleted_count, _ = UserRefreshToken.objects.filter(user_uuid=user).delete()
            
            # 삭제 개수와 상관없이(0개여도) 로그아웃 절차 진행
            success = True
        except Exception as e:
            # 2. 예외 처리: DB 에러 등 예상치 못한 상황
            print(f"Logout Error: {e}")
            return Response({"success": False})
   
        # 3. 마무리: 성공 응답과 함께 쿠키 삭제
        response = Response({"success": success})
        response.delete_cookie("refresh_token", path="/")

        return response


# ----------------------
# 2 데이터 처리 뷰 - Admin
# ----------------------
class UserInfoListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 유저 정보 가져오기
        users = User_Login_Info.objects.all()
        user_data = User_InfoSerializer(users, many=True)

        return Response({"success": True, "users": user_data.data})


class UserInfoDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_uuid = request.data.get("user_uuid")
        try:
            user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
            user_instance.delete()
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            result = user_data.data
            success = True

        except User_Login_Info.DoesNotExist:
            result = {}
            success = False

        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


class UserInfoUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 사용자 정보 업데이트
        user_uuid = request.data.get("user_uuid")
        try:
            user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
            serializer = User_Login_InfoSerializer(
                user_instance, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                # 업데이트 후 전체 유저 데이터 가져오기
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                result = user_data.data
                success = True
            else:
                result = {}
                success = False
        except User_Login_Info.DoesNotExist:
            result = {}
            success = False

        # 최종 반환
        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


class UserInfoAddAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 새로운 사용자 생성
        serializer = User_Login_InfoSerializer(data=request.data)
        if serializer.is_valid():
            # 유저 생성
            user = serializer.save()

            # 자동 Rate 생성
            WorkPlaceRate.objects.create(
                user=user,
                work_place="미지정",   # 기본 근무지
            )
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            result = user_data.data
            success = True
        else:
            result = serializer.errors
            success = False

        # 최종 반환
        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


class UserInfoFilteringAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):

        filtering = request.query_params.dict()
        sorting = request.query_params.get("sorting")

        filters = {}
        for key, value in filtering.items():
            if isinstance(value, str):
                filters[f"{key}__icontains"] = value
            elif isinstance(value, (int, float)):
                filters[f"{key}__icontains"] = str(value)
            else:
                filters[key] = value

        queryset = User_Login_Info.objects.filter(**filters)
        if sorting:
            queryset = queryset.order_by(sorting)

        result = list(queryset.values())

        return Response({"success": True, "data": result})


class FinanceTableDateFilteredAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 프론트에서 날짜 범위 받기
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return Response(
                {
                    "success": False,
                    "message": "start_date and end_date are required",
                }
            )

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

        # Expense 합계 (날짜 필터링)
        expense_qs = (
            Expense.objects.filter(date__gte=start_date, date__lte=end_date)
            .values("expense_name")
            .annotate(total_amount=Sum("amount"))
        )
        expense_totals = {
            item["expense_name"]: item["total_amount"] for item in expense_qs
        }

        # Income 합계 (날짜 필터링)
        income_qs = (
            Income.objects.filter(date__gte=start_date, date__lte=end_date)
            .values("company_name")
            .annotate(total_amount=Sum("amount"))
        )
        income_totals = {
            item["company_name"]: item["total_amount"] for item in income_qs
        }

        result = {"expense_totals": expense_totals, "income_totals": income_totals}

        return Response({"success": True, "data": result})


class IncomeDateFilteredAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 프론트에서 날짜 범위 받기
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return Response({"success": False})

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

        # 지정 날짜 범위의 모든 수입 가져오기
        incomes = Income.objects.filter(
            date__gte=start_date, date__lte=end_date
        ).values("Income_uuid", "date", "company_name", "company_detail", "amount")
        result = list(incomes)

        return Response({"success": True, "data": result})


class ExpenseDateFilteredAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 프론트에서 날짜 범위 받기
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return Response({"success": False})

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

        # 지정 날짜 범위의 모든 지출 가져오기
        expenses = Expense.objects.filter(
            date__gte=start_date, date__lte=end_date
        ).values("expense_uuid", "date", "expense_name", "expense_detail", "amount")
        result = list(expenses)

        return Response({"success": True, "data": result})

class Expense3MonthsTotalsAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month_str = request.query_params.get("month")  
        if not month_str:
            return Response({"success": False})

        try:
            year, month = map(int, month_str.split("-"))
            if not (1 <= month <= 12):
                raise ValueError
        except ValueError:
            return Response({"success": False})

        data = {}

        # 기준달(0), 지난달(1), 지지난달(2)
        for delta in [0, 1, 2]:
            y, m = add_months(year, month, delta)

            month_key = f"expense_totals_{y}-{m:02d}"

            start, next_start = month_start_end(y, m)

            qs = (
                Expense.objects
                .filter(date__gte=start, date__lt=next_start)
                .values("expense_name")
                .annotate(total=Coalesce(Sum("amount"), 0))
            )
            data[month_key] = {
                row["expense_name"]: int(row["total"] or 0)
                for row in qs
            }
        return Response({"success": True, "data": data})

class ExpenseAddAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 새로운 지출 추가
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            result = serializer.data
            success = True
        else:
            result = serializer.errors
            success = False

        # 최종 반환
        return Response(
            {"success": success, "expense_data": result}
            if success
            else {"success": success}
        )


class IncomeAddAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 새로운 매출 추가
        serializer = IncomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            result = serializer.data
            success = True
        else:
            result = serializer.errors
            success = False

        # 최종 반환
        return Response(
            {"success": success, "income_data": result}
            if success
            else {"success": success}
        )


class IncomeUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 필수: Income_uuid 및 날짜 범위
        Income_uuid = request.data["Income_uuid"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        # 레코드 업데이트
        income_instance = Income.objects.get(Income_uuid=Income_uuid)
        serializer = IncomeSerializer(income_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # 날짜 범위 필터링된 데이터 반환
            income_qs = Income.objects.filter(date__gte=start_date, date__lte=end_date)
            income_data = IncomeSerializer(income_qs, many=True)

            return Response({"success": True, "income_data": income_data.data})
        else:
            return Response({"success": False})


class ExpenseUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 필수: expense_uuid 및 날짜 범위
        expense_uuid = request.data["expense_uuid"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        # 레코드 업데이트
        expense_instance = Expense.objects.get(expense_uuid=expense_uuid)
        serializer = ExpenseSerializer(
            expense_instance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()

            # 날짜 범위 필터링된 데이터 반환
            expense_qs = Expense.objects.filter(
                date__gte=start_date, date__lte=end_date
            )
            expense_data = ExpenseSerializer(expense_qs, many=True)

            return Response({"success": True, "expense_data": expense_data.data})
        else:
            return Response({"success": False})


class IncomeDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        # 필수: Income_uuid 및 날짜 범위
        Income_uuid = request.data["Income_uuid"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        try:
            # 레코드 삭제
            income_instance = Income.objects.get(Income_uuid=Income_uuid)
            income_instance.delete()

            # 삭제 후 날짜 범위 필터링된 데이터 반환
            income_qs = Income.objects.filter(date__gte=start_date, date__lte=end_date)
            income_data = IncomeSerializer(income_qs, many=True)

            return Response({"success": True, "income_data": income_data.data})

        except Income.DoesNotExist:
            return Response({"success": False})


class ExpenseDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        # 필수: expense_uuid 및 날짜 범위
        expense_uuid = request.data["expense_uuid"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        try:
            # 레코드 삭제
            expense_instance = Expense.objects.get(expense_uuid=expense_uuid)
            expense_instance.delete()

            # 삭제 후 날짜 범위 필터링된 데이터 반환
            expense_qs = Expense.objects.filter(
                date__gte=start_date, date__lte=end_date
            )
            expense_data = ExpenseSerializer(expense_qs, many=True)

            return Response({"success": True, "expense_data": expense_data.data})

        except Expense.DoesNotExist:
            return Response({"success": False})


class AdminPageWorkDayListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status = request.query_params.get("status")  # 대기, 승인, 거절, 전체
        work_shift = request.query_params.get("work_shift")
        work_place = request.query_params.get("work_place")
        start_date_str = request.query_params.get("start_date")  # YYYY-MM-DD
        end_date_str = request.query_params.get("end_date")  # YYYY-MM-DD

        user_work_day = User_WorkDay.objects.prefetch_related("details").order_by(
            "-work_date"
        )

        # 상태 필터 (선택)
        if status == "대기":
            user_work_day = user_work_day.filter(is_approved__isnull=True)
        elif status == "승인":
            user_work_day = user_work_day.filter(is_approved=True)
        elif status == "거절":
            user_work_day = user_work_day.filter(is_approved=False)
        elif status == "전체":
            pass
        else:
            return Response({"success": False})

        # 근무 형태 / 근무지 필터 (선택)
        if work_shift:
            user_work_day = user_work_day.filter(work_shift=work_shift)

        if work_place:
            user_work_day = user_work_day.filter(work_place=work_place)

        # 날짜 필터 (선택)
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"success": False})

            user_work_day = user_work_day.filter(
                work_date__gte=start_date, work_date__lte=end_date
            )

        serializer = UserWorkDaySerializer(user_work_day, many=True)
        return Response({"success": True, "data": serializer.data})


class AdminWorkDayStatusUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user_uuid = request.data.get("user_uuid")
        work_date_str = request.data.get("work_date")
        work_shift = request.data.get("work_shift")
        status = request.data.get("status")  # True / False
        reject_reason = request.data.get("reject_reason")

        if not user_uuid or not work_date_str or status is None or not work_shift:
            return Response({"success": False})

        if status not in [True, False]:
            return Response({"success": False})
        

        try:
            work_date = datetime.strptime(work_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"success": False},
            )

        try:
            work_day = User_WorkDay.objects.get(
                user_uuid_id=user_uuid, work_date=work_date, work_shift=work_shift
            )
        except User_WorkDay.DoesNotExist:
            return Response(
                {"success": False},
            )

        with transaction.atomic():
            # 완료(승인)
            if status == True:
                work_day.is_approved = True
                work_day.reject_reason = None

        # 거절(반려)
            elif status == False:
                if not reject_reason:
                    return Response({"success": False})  # 반려 사유 반드시 기제
                work_day.is_approved = False
                work_day.reject_reason = reject_reason

            work_day.save()

            # 승인/반려/대기 상태에 따라 Expense 동기화
            sync_salary_expense_for_workday(work_day)

        return Response({"success": True})


class WorkPlaceRateListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all()

        grouped = group_rates_by_user(WorkPlace_qs)

        return Response({"success": True, "users": grouped})

    @transaction.atomic
    def post(self, request):
        create_ser = WorkPlaceRateCreateSerializer(data=request.data)
        if not create_ser.is_valid():
            return Response({"success": False, "errors": "입력 정보가 유효하지 않습니다."})

        user_uuid = create_ser.validated_data.pop("user_uuid")

        try:
            user = User_Login_Info.objects.get(user_uuid=user_uuid)
        except User_Login_Info.DoesNotExist:
            return Response({"success": False, "message": "존재하지 않는 user 입니다."})

        try:
            WorkPlaceRate.objects.create(user=user, **create_ser.validated_data)
        except IntegrityError:
            return Response({"success": False, "message": "이미 존재하는 근무지입니다."})

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})
    
class WorkPlaceRateUpdateDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        rate_uuid = request.data.get("rate_uuid")
        if not rate_uuid:
            return Response({"success": False})

        try:
            rate = WorkPlaceRate.objects.select_related("user").get(rate_uuid=rate_uuid)
        except WorkPlaceRate.DoesNotExist:
            return Response({"success": False})

        serializer = WorkPlaceRateSerializer(rate, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False})

        serializer.save()

        # 수정 후 전체 목록 반환
        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})

    def delete(self, request):
        rate_uuid = request.data.get("rate_uuid")
        if not rate_uuid:
            return Response({"success": False})

        try:
            rate = WorkPlaceRate.objects.get(rate_uuid=rate_uuid)
        except WorkPlaceRate.DoesNotExist:
            return Response({"success": False})

        rate.delete()

        # 삭제 후 전체 목록 반환
        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})
    

class WorkPlaceRateListfilteringAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_name = request.query_params.get("user_name")   
        work_place = request.query_params.get("work_place") 

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all()

        if user_name:
            WorkPlace_qs = WorkPlace_qs.filter(user__user_name__icontains=user_name)

        if work_place:
            WorkPlace_qs = WorkPlace_qs.filter(work_place__icontains=work_place)

        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})


# ----------------------
# 2 데이터 처리 뷰 - User
# ----------------------


class UserWorkInfoAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.get("data")

        # 1개/여러개 자동 판별
        is_many = isinstance(data, list)

        serializer = UserWorkDaySerializer(data=data, many=is_many)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"success": True})

class UserMonthlyWorkSummaryAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user        = request.user
        date_str    = request.query_params.get("date")
        year, month = map(int, date_str.split("-"))

        work_days = User_WorkDay.objects.filter(
            user_uuid=user,
            work_date__year=year,
            work_date__month=month
        ).prefetch_related("details", "salary_expense").order_by('work_date')

        daily_list      = []
        total_amount    = 0
        approved_amount = 0
        pending_amount  = 0
        day_shift_count   = 0
        night_shift_count = 0
        early_work_count = 0
        early_work_minutes = 0

        for wd in work_days:
            
            day_amount = 0
            amount_breakdown = None
            detail_amounts = []
            is_approved = wd.is_approved
            details = list(wd.details.all())

            for detail in details:
                if normalize_work_type(detail.work_type, wd.work_shift) == "조기출근":
                    early_work_count += 1
                    early_work_minutes += int(detail.minutes or 0)

            # 근무 형태 카운트 (주간/야간)
            if wd.work_shift == "주간":
                day_shift_count += 1
            elif wd.work_shift == "야간":
                night_shift_count += 1

            if is_approved is True: # 승인된 경우: Expense에서 급여 가져오기
                # wd.salary_expense는 OneToOneField로 연결된 Expense 객체
                if hasattr(wd, 'salary_expense') and wd.salary_expense:
                    day_amount = wd.salary_expense.amount
                else:
                    # 승인되었으나 Expense가 없는 경우는 로직상 발생하지 않음을 가정하고,
                    # 해당 경우 발생 시 ValueError를 그대로 발생시킴.
                    rates = get_rates_for_workday(wd) # WorkPlaceRate가 있을 것으로 가정
                    breakdown = calculate_daily_salary_breakdown(details, rates, wd.work_shift)
                    day_amount = breakdown["total_amount"]
                    amount_breakdown = breakdown["by_work_type"]
                    detail_amounts = breakdown["detail_amounts"]
            elif is_approved is None: # 대기 중인 경우: 실시간으로 급여 계산 (WorkPlaceRate가 있을 것으로 가정)
                # WorkPlaceRate가 없을 경우 ValueError 발생
                rates = get_rates_for_workday(wd)
                breakdown = calculate_daily_salary_breakdown(details, rates, wd.work_shift)
                day_amount = breakdown["total_amount"]
                amount_breakdown = breakdown["by_work_type"]
                detail_amounts = breakdown["detail_amounts"]
            # is_approved가 False (반려됨)인 경우 day_amount는 기본값 0으로 유지됨

            if amount_breakdown is None and details and is_approved is not False:
                try:
                    rates = get_rates_for_workday(wd)
                    breakdown = calculate_daily_salary_breakdown(details, rates, wd.work_shift)
                    amount_breakdown = breakdown["by_work_type"]
                    detail_amounts = breakdown["detail_amounts"]
                except ValueError:
                    pass

            daily_list.append({
                "date": wd.work_date,
                "work_place": wd.work_place if wd.work_place else "Unknown",
                "work_shift": wd.work_shift,
                "amount": day_amount,
                "amount_breakdown": amount_breakdown or {},
                "detail_amounts": detail_amounts,
                "is_approved": is_approved
            })

            total_amount += day_amount

            if is_approved is True:
                approved_amount += day_amount
            elif is_approved is None:
                pending_amount += day_amount

        return Response({
            "date": f"{year}-{month:02d}",  #2026-04
            "total_amount": total_amount,
            "approved_amount": approved_amount,
            "pending_amount": pending_amount,
            "day_shift_count": day_shift_count,
            "night_shift_count": night_shift_count,
            "early_work_count": early_work_count,
            "early_work_minutes": early_work_minutes,
            "daily_list": daily_list
        })
