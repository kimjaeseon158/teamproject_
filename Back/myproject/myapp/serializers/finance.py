# 수입과 지출 serializer

from rest_framework import serializers
from ..models import Expense, Income


class ExpenseSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if attrs.get("work_day") is not None:
            raise serializers.ValidationError("급여 지출은 근무 승인에서만 생성할 수 있습니다.")
        return attrs

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("expense_uuid",)


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = "__all__"
        read_only_fields = ("Income_uuid",)
