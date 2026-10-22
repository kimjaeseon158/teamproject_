# 사용자 월별 근무와 급여 요약 API

from datetime import date, datetime

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import User_WorkDay, WorkPlaceRate
from ..shared import normalize_work_type
from ..shared.salary_utils import get_workday_salary
from ..token import UserJWTAuthentication


class UserMonthlyWorkSummaryAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.must_change_password:
            return Response(
                {"success": False, "must_change_password": True},
                status=status.HTTP_403_FORBIDDEN,
            )

        date_str = request.query_params.get("date")
        try:
            month_start = datetime.strptime(date_str or "", "%Y-%m").date()
        except ValueError:
            return Response(
                {"success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        year, month = month_start.year, month_start.month
        next_month_start = date(
            year + (1 if month == 12 else 0), 1 if month == 12 else month + 1, 1
        )

        work_days = (
            User_WorkDay.objects.filter(
                user_uuid=user,
                work_date__gte=month_start,
                work_date__lt=next_month_start,
            )
            .select_related("salary_expense")
            .prefetch_related("details")
            .order_by("work_date")
        )
        rate_history = list(WorkPlaceRate.objects.filter(user=user))
        uncalculated_count = 0

        daily_list = []
        total_amount = 0
        approved_amount = 0
        pending_amount = 0
        day_shift_count = 0
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

            salary = get_workday_salary(wd, rate_history)
            day_amount = salary["amount"]
            amount_breakdown = salary["amount_breakdown"]
            detail_amounts = salary["detail_amounts"]
            if day_amount is None:
                uncalculated_count += 1

            daily_list.append(
                {
                    "date": wd.work_date,
                    "work_place": wd.work_place if wd.work_place else "Unknown",
                    "work_shift": wd.work_shift,
                    "amount": day_amount,
                    "amount_breakdown": amount_breakdown or {},
                    "detail_amounts": detail_amounts,
                    "calculation_status": salary["calculation_status"],
                    "details_available": salary["details_available"],
                    "is_final": salary["is_final"],
                    "is_approved": is_approved,
                }
            )

            total_amount += day_amount or 0

            if is_approved is True:
                approved_amount += day_amount or 0
            elif is_approved is None:
                pending_amount += day_amount or 0

        return Response(
            {
                "date": f"{year}-{month:02d}",  # 2026-04
                "total_amount": total_amount,
                "approved_amount": approved_amount,
                "pending_amount": pending_amount,
                "day_shift_count": day_shift_count,
                "night_shift_count": night_shift_count,
                "early_work_count": early_work_count,
                "early_work_minutes": early_work_minutes,
                "uncalculated_count": uncalculated_count,
                "daily_list": daily_list,
            }
        )
