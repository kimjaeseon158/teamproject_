# 관리자 수입/지출 관리

from rest_framework.views import APIView
from django.db.models.functions import Coalesce
from ...models import Expense
from ...serializers import ExpenseSerializer
from ...models import Income
from ...serializers import IncomeSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from ..shared import add_months
from ..shared import get_date_range
from ..shared import month_start_end
from ..token import AdminJWTAuthentication


def _date_filtered_queryset(model, start_date, end_date):
    return model.objects.filter(date__gte=start_date, date__lte=end_date)


def _serialize_date_filtered(model, serializer_class, start_date, end_date):
    queryset = _date_filtered_queryset(model, start_date, end_date)
    return serializer_class(queryset, many=True).data


class FinanceTableDateFilteredAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 프론트에서 날짜 범위 받기
        start_date, end_date = get_date_range(request.query_params)

        if not start_date or not end_date:
            return Response(
                {
                    "success": False,
                    "message": "start_date and end_date are required",
                }
            )

        # Expense 합계 (날짜 필터링)
        expense_qs = (
            _date_filtered_queryset(Expense, start_date, end_date)
            .values("expense_name")
            .annotate(total_amount=Sum("amount"))
        )
        expense_totals = {
            item["expense_name"]: item["total_amount"] for item in expense_qs
        }

        # Income 합계 (날짜 필터링)
        income_qs = (
            _date_filtered_queryset(Income, start_date, end_date)
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
        start_date, end_date = get_date_range(request.query_params)

        if not start_date or not end_date:
            return Response({"success": False})

        # 지정 날짜 범위의 모든 수입 가져오기
        incomes = _date_filtered_queryset(Income, start_date, end_date).values(
            "Income_uuid", "date", "company_name", "company_detail", "amount"
        )
        result = list(incomes)

        return Response({"success": True, "data": result})


class ExpenseDateFilteredAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 프론트에서 날짜 범위 받기
        start_date, end_date = get_date_range(request.query_params)

        if not start_date or not end_date:
            return Response({"success": False})

        # 지정 날짜 범위의 모든 지출 가져오기
        expenses = _date_filtered_queryset(Expense, start_date, end_date).values(
            "expense_uuid", "date", "expense_name", "expense_detail", "amount"
        )
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
        start_date, end_date = get_date_range(request.data)

        # 레코드 업데이트
        income_instance = Income.objects.get(Income_uuid=Income_uuid)
        serializer = IncomeSerializer(income_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # 날짜 범위 필터링된 데이터 반환
            income_data = _serialize_date_filtered(
                Income, IncomeSerializer, start_date, end_date
            )

            return Response({"success": True, "income_data": income_data})
        else:
            return Response({"success": False})


class ExpenseUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 필수: expense_uuid 및 날짜 범위
        expense_uuid = request.data["expense_uuid"]
        start_date, end_date = get_date_range(request.data)

        # 레코드 업데이트
        expense_instance = Expense.objects.get(expense_uuid=expense_uuid)
        serializer = ExpenseSerializer(
            expense_instance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()

            # 날짜 범위 필터링된 데이터 반환
            expense_data = _serialize_date_filtered(
                Expense, ExpenseSerializer, start_date, end_date
            )

            return Response({"success": True, "expense_data": expense_data})
        else:
            return Response({"success": False})


class IncomeDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        # 필수: Income_uuid 및 날짜 범위
        Income_uuid = request.data["Income_uuid"]
        start_date, end_date = get_date_range(request.data)

        try:
            # 레코드 삭제
            income_instance = Income.objects.get(Income_uuid=Income_uuid)
            income_instance.delete()

            # 삭제 후 날짜 범위 필터링된 데이터 반환
            income_data = _serialize_date_filtered(
                Income, IncomeSerializer, start_date, end_date
            )

            return Response({"success": True, "income_data": income_data})

        except Income.DoesNotExist:
            return Response({"success": False})


class ExpenseDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        # 필수: expense_uuid 및 날짜 범위
        expense_uuid = request.data["expense_uuid"]
        start_date, end_date = get_date_range(request.data)

        try:
            # 레코드 삭제
            expense_instance = Expense.objects.get(expense_uuid=expense_uuid)
            expense_instance.delete()

            # 삭제 후 날짜 범위 필터링된 데이터 반환
            expense_data = _serialize_date_filtered(
                Expense, ExpenseSerializer, start_date, end_date
            )

            return Response({"success": True, "expense_data": expense_data})

        except Expense.DoesNotExist:
            return Response({"success": False})
