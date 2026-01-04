from rest_framework import serializers
from django.db import transaction
from .models import User_Login_Info, Expense, Income, User_WorkDay, User_WorkDetail

class User_Login_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User_Login_Info
        fields = '__all__'
        
class User_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ('user_id', 'password')

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('serial_number',)  

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ('serial_number',)

# user_work 저장

class UserWorkDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_WorkDetail
        fields = ["work_type", "minutes"]


class UserWorkDaySerializer(serializers.ModelSerializer):
    details = UserWorkDetailSerializer(many=True)

    class Meta:
        model = User_WorkDay
        fields = [
            "employee_number",
            "user_name",
            "work_date",
            "work_start",
            "work_end",
            "work_place",
            "details",
        ]

    @transaction.atomic
    
    def create(self, validated_data):
        details_data = validated_data.pop("details")  # details 무조건 온다

        work_day = User_WorkDay.objects.create(**validated_data)

        User_WorkDetail.objects.bulk_create([
            User_WorkDetail(
                work_date=work_day,                     # FK 이름 맞추기
                employee_number=work_day.employee_number,  # 반드시 필요
                **d
            )
            for d in details_data
        ])
        
        return work_day

