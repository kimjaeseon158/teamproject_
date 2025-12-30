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
    UserWorkDaySerializer
    
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
    User_WorkDetail
)
from django.db.models import Sum
from datetime import datetime
from django.conf import settings
from django.shortcuts import redirect
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2 import credentials
from rest_framework_simplejwt.tokens import RefreshToken
from .auth_utils import (
    save_or_update_admin_refresh_token,
    save_or_update_user_refresh_token,
)

import requests


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
            new_access = refresh_obj.access_token

            response = Response({"success": True, "access": str(new_access)})
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
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI  # ✅ 꼭 이 줄 있어야 함

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

        if not code:
            return redirect("http://localhost:3000/dashboard?google_auth=failed")

        # 쿠키에서 state 검증
        saved_state = request.session.get("state")

        if not saved_state or saved_state != state:
            return redirect("http://localhost:3000/dashboard?google_auth=invalid_state")

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
            return redirect("http://localhost:3000/dashboard?google_auth=failed")

        # ✅ 보안상 프론트엔드로 직접 토큰을 보내지 않음
        # 대신 Django HttpOnly 쿠키에 저장
        response = redirect("http://localhost:3000/dashboard?google_auth=success")
        response.delete_cookie("oauth_state")

        response.set_cookie(
            "google_access_token",
            access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        if refresh_token:
            response.set_cookie(
                "google_refresh_token",
                refresh_token,
                httponly=True,
                secure=False,
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


class CheckAdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        admin_id = request.data.get("id")
        password = request.data.get("password")
        admin_code = request.data.get("admin_code")

        # 0) 크리덴셜 검증
        success = check_admin_credentials(admin_id, password, admin_code)
        if not success:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        # 1) 관리자 인스턴스 조회
        admin_instance = Admin_Login_Info.objects.get(admin_id=admin_id)

        # 2) JWT 생성 (원하는 클레임 포함)
        refresh = CustomRefreshToken.for_subject(
            subject_value=admin_instance.admin_id,
            admin_name=admin_instance.admin_name,
            role="admin",
        )
        access = refresh.access_token
        raw_refresh_token = str(refresh)  # 쿠키로 내려보낼 값

        # 3) DB 저장 (FK=admin 기준으로 upsert)
        #    기존 것이 있으면 hashed_token, expires_at 업데이트
        #    없으면 새로 생성
        save_or_update_admin_refresh_token(
            admin_id=admin_instance.admin_id,
            raw_refresh_token=raw_refresh_token,
            lifetime_days=7,
        )

        # 4) 응답 구성: access는 body, refresh는 HttpOnly 쿠키 ONLY
        response = Response(
            {
                "success": True,
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
        admin_id = request.data.get("admin_id")
        if not admin_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            admin = Admin_Login_Info.objects.get(admin_id=admin_id)
        except Admin_Login_Info.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        deleted_count, _ = AdminRefreshToken.objects.filter(admin=admin).delete()

        return Response(
            {"success": True, "deleted_tokens": deleted_count},
            status=status.HTTP_200_OK,
        )


# ----------------------
# 일반 유저 로그인, 로그아웃
# ----------------------
class CheckUserLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get("user_id")
        password = request.data.get("password")

        # (1) 로그인 검증
        success, user_name, employee_number = check_user_credentials(user_id, password)
        if not success:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        user_instance = User_Login_Info.objects.get(employee_number=employee_number)

        # (2) JWT 생성
        refresh = CustomRefreshToken.for_subject(
            subject_value=employee_number,
            user_name=user_name,
            role="user",
        )
        access = refresh.access_token
        raw_refresh_token = str(refresh)

        # (3) Refresh 토큰 저장 (기존 있으면 업데이트)
        save_or_update_user_refresh_token(
            employee_number=employee_number,
            raw_refresh_token=raw_refresh_token,
            lifetime_days=7,
        )

        # (4) 응답 구성
        response = Response(
            {
                "success": True,
                "user_name": user_name,
                "employee_number": employee_number,
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
        employee_number = request.data.get("employee_number")
        if not employee_number:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User_Login_Info.objects.get(employee_number=employee_number)
        except User_Login_Info.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        deleted_count = UserRefreshToken.objects.filter(user=user).delete()

        return Response(
            {"success": True, "deleted_tokens": deleted_count},
            status=status.HTTP_200_OK,
        )


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
        employee_number = request.data.get("employee_number")
        try:
            user_instance = User_Login_Info.objects.get(employee_number=employee_number)
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
        employee_number = request.data.get("employee_number")
        try:
            user_instance = User_Login_Info.objects.get(employee_number=employee_number)
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
            serializer.save()
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
        ).values("serial_number", "date", "company_name", "company_detail", "amount")
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
        ).values("serial_number", "date", "expense_name", "expense_detail", "amount")
        result = list(expenses)

        return Response({"success": True, "data": result})


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
        # 필수: serial_number 및 날짜 범위
        serial_number = request.data["serial_number"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        # 레코드 업데이트
        income_instance = Income.objects.get(serial_number=serial_number)
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
        # 필수: serial_number 및 날짜 범위
        serial_number = request.data["serial_number"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        # 레코드 업데이트
        expense_instance = Expense.objects.get(serial_number=serial_number)
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
        # 필수: serial_number 및 날짜 범위
        serial_number = request.data["serial_number"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        try:
            # 레코드 삭제
            income_instance = Income.objects.get(serial_number=serial_number)
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

        # 필수: serial_number 및 날짜 범위
        serial_number = request.data["serial_number"]
        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()
        
        try:
            # 레코드 삭제
            expense_instance = Expense.objects.get(serial_number=serial_number)
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
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        user_work_day = (
            User_WorkDay.objects
            .prefetch_related("details")
            .order_by("-work_date")  
        )

        user_work_day_data = UserWorkDaySerializer(user_work_day, many=True).data
        return Response({"success": True, "work_days": user_work_day_data})

# ----------------------
# 2 데이터 처리 뷰 - User
# ----------------------
        
class UserWorkInfoAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request):    #patch, get, patch 정하기
        data = request.data

        serializer = UserWorkDaySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True})
        else:
            return Response({"success": False})
