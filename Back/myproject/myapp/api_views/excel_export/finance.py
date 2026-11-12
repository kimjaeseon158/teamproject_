import calendar
import re
from datetime import date

from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Expense, Income
from ...serializers.finance import ExpenseSerializer, IncomeSerializer
from ..token.authentication import AdminJWTAuthentication


class _FinanceExcelExportAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        start_month = request.query_params.get("start_month", "")
        end_month = request.query_params.get("end_month", "")
        try:
            if not all(re.fullmatch(r"[0-9]{4}-[0-9]{2}", month) for month in (start_month, end_month)):
                raise ValueError
            start = date.fromisoformat(f"{start_month}-01")
            end = date.fromisoformat(f"{end_month}-01")
            if start > end:
                raise ValueError
        except ValueError:
            return Response(
                {
                    "success": False,
                    "code": "INVALID_PERIOD",
                    "message": "올바른 시작 월과 종료 월을 선택해주세요.",
                },
                status=400,
            )

        end = end.replace(day=calendar.monthrange(end.year, end.month)[1])
        records = self.model.objects.filter(date__range=(start, end)).order_by("date", "pk")
        return Response({"success": True, "data": self.serializer_class(records, many=True).data})


class IncomeExcelExportAPIView(_FinanceExcelExportAPIView):
    model = Income
    serializer_class = IncomeSerializer


class ExpenseExcelExportAPIView(_FinanceExcelExportAPIView):
    model = Expense
    serializer_class = ExpenseSerializer
