import re
from datetime import date

from django.db.models import F, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Expense, User_Login_Info
from ..token.authentication import AdminJWTAuthentication


class SalaryExcelExportAPIView(APIView):
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

        rows = (
            Expense.objects.filter(
                work_day__is_approved=True,
                work_day__work_date__year=start.year,
                work_day__work_date__month=start.month,
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
