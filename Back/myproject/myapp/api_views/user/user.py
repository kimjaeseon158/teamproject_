# 사용자 로그인/근무 API

import logging

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...models import UserRefreshToken
from ...serializers import UserWorkDaySerializer
from ...models import User_Login_Info
from ...models import User_WorkDay
from ...salary import calculate_daily_salary_breakdown
from django.contrib.auth.hashers import check_password
from ...salary import get_rates_for_workday
from ..shared import normalize_work_type
from ..token import CustomRefreshToken
from ..token import UserJWTAuthentication
from ..token import check_user_credentials
from ..token import save_or_update_user_refresh_token
from django.conf import settings
from rest_framework import status

logger = logging.getLogger(__name__)

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


class UserPasswordChangeAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        new_password_confirm = request.data.get("new_password_confirm")

        if not current_password or not new_password or not new_password_confirm:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(current_password, user.password):
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password_confirm:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if check_password(new_password, user.password):
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        user.password = new_password
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])

        return Response({"success": True, "must_change_password": False})


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


class UserWorkInfoAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.must_change_password:
            return Response(
                {"success": False, "must_change_password": True},
                status=status.HTTP_403_FORBIDDEN,
            )

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
        if user.must_change_password:
            return Response(
                {"success": False, "must_change_password": True},
                status=status.HTTP_403_FORBIDDEN,
            )

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
