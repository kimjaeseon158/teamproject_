# 사용자 월별 근무와 급여 요약 API

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

            # 승인 여부와 관계없이 현재 시급표를 기준으로 같은 방식으로 계산한다.
            # Expense는 승인 시점의 저장값이라 시급 변경 후 상세 합계와 달라질 수 있다.
            if is_approved is not False:
                rates = get_rates_for_workday(wd)
                breakdown = calculate_daily_salary_breakdown(details, rates, wd.work_shift)
                day_amount = breakdown["total_amount"]
                amount_breakdown = breakdown["by_work_type"]
                detail_amounts = breakdown["detail_amounts"]
            # is_approved가 False (반려됨)인 경우 day_amount는 기본값 0으로 유지됨

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
