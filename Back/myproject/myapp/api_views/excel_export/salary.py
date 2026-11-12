import re
from datetime import date
from uuid import UUID

from django.db.models import F, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Expense, User_Login_Info, User_WorkDay
from ..shared.salary_utils import FULL_DAY_MINUTES, get_workday_salary
from ..token.authentication import AdminJWTAuthentication


class _MonthlySalaryExportAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        month = request.query_params.get("date", "")
        try:
            if not re.fullmatch(r"[0-9]{4}-[0-9]{2}", month):
                raise ValueError
            start = date.fromisoformat(f"{month}-01")
        except ValueError:
            return Response(
                {"success": False, "code": "INVALID_PERIOD", "message": "조회 월을 YYYY-MM 형식으로 입력해주세요."},
                status=400,
            )

        return self.export_month(request, start.year, start.month)


class SalaryExcelExportAPIView(_MonthlySalaryExportAPIView):
    def export_month(self, request, year, month):
        rows = (
            Expense.objects.filter(
                work_day__is_approved=True,
                work_day__work_date__year=year,
                work_day__work_date__month=month,
            )
            .values(
                user_uuid=F("work_day__user_uuid_id"),
                user_name=F("work_day__user_uuid__user_name"),
            )
            .annotate(total_amount=Sum("amount"))
            .order_by("user_name", "user_uuid")
        )
        data = list(rows)
        users = User_Login_Info.objects.only("user_uuid", "resident_number").in_bulk(
            [row["user_uuid"] for row in data]
        )
        for row in data:
            user = users.get(row["user_uuid"])
            row["resident_number"] = user.resident_number if user else ""

        return Response({"success": True, "data": data})


USER_PAY_RATE_FIELD_BY_WORK_TYPE = {
    "주간": "base_hourly_wage",
    "평일 잔업": "overtime_hourly_wage",
    "중식연장": "meal_ot_hourly_wage",
    "주간 특근": "day_special_hourly_wage",
    "야간 특근": "night_special_hourly_wage",
    "야간": "overnight_hourly_wage",
    "야간 잔업": "overnight_ot_hourly_wage",
    "조기출근": "early_hourly_wage",
}

USER_PAY_DAY_COUNT_WORK_TYPES = {
    "주간",
    "주간 특근",
    "야간 특근",
    "야간",
}


class UserPayExcelExportAPIView(_MonthlySalaryExportAPIView):
    def export_month(self, request, year, month):
        days = User_WorkDay.objects.filter(
            is_approved=True, work_date__year=year, work_date__month=month,
        )
        users = User_Login_Info.objects.values("user_uuid", "user_name").order_by("user_name", "user_uuid")
        raw_uuids = request.query_params.get("user_uuid")
        if raw_uuids:
            try:
                user_ids = {UUID(value.strip()) for value in raw_uuids.split(",")}
            except ValueError:
                return Response({"success": False, "code": "INVALID_USER_UUID"}, status=400)
            employees = list(users.filter(user_uuid__in=user_ids))
            if len(employees) != len(user_ids):
                return Response({"success": False, "code": "USER_NOT_FOUND"}, status=404)
        else:
            employees = list(users.filter(user_uuid__in=days.order_by().values("user_uuid_id")))

        data = {employee["user_uuid"]: {**employee, "total_amount": 0} for employee in employees}
        groups = {user_id: {} for user_id in data}
        days = days.filter(user_uuid_id__in=data)
        for day in days.select_related("salary_expense").order_by("work_date", "pk"):
            salary = get_workday_salary(day)
            if salary["amount"] is None:
                return Response(
                    {"success": False, "code": "final_amount_missing", "work_date": day.work_date},
                    status=400,
                )
            data[day.user_uuid_id]["total_amount"] += salary["amount"]
            self.add_pay_rows(groups[day.user_uuid_id], day, salary)

        for user_id, employee in data.items():
            employee["rows"] = []
            for row in groups[user_id].values():
                minutes_per_unit = FULL_DAY_MINUTES if row["work_type"] in USER_PAY_DAY_COUNT_WORK_TYPES else 60
                whole, remainder = divmod(row["minutes"], minutes_per_unit)
                quantity = row["minutes"] / minutes_per_unit if remainder else whole
                employee["rows"].append({
                    "work_place": row["work_place"],
                    "work_type": row["work_type"],
                    "quantity": quantity,
                    "unit_price": row["unit_price"],
                    "amount": row["amount"],
                })
        return Response({"success": True, "data": list(data.values())})

    @staticmethod
    def add_pay_rows(rows, day, salary):
        if not salary["details_available"]:
            key = (day.work_place, "기존 확정 급여", None)
            row = rows.setdefault(key, {
                "work_place": day.work_place, "work_type": "기존 확정 급여",
                "unit_price": None, "minutes": 0, "amount": 0,
            })
            row["amount"] += salary["amount"]
            return

        rates = (day.salary_snapshot or {}).get("rates") or {}
        for detail in salary["detail_amounts"]:
            work_type = detail["work_type"]
            unit_price = rates.get(USER_PAY_RATE_FIELD_BY_WORK_TYPE.get(work_type))
            if unit_price is None and work_type in {"주간 특근", "야간 특근"}:
                unit_price = rates.get("special_hourly_wage")
            if rates:
                unit_price = int(unit_price or 0)

            key = (day.work_place, work_type, unit_price)
            row = rows.setdefault(key, {
                "work_place": day.work_place, "work_type": work_type,
                "unit_price": unit_price, "minutes": 0, "amount": 0,
            })
            row["minutes"] += detail["minutes"] or 0
            row["amount"] += detail["amount"]
