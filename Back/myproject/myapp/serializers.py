from rest_framework import serializers
from django.db import transaction
from .models import User_Login_Info, Expense, Income, User_WorkDay, User_WorkDetail, WorkPlaceRate

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
        read_only_fields = ('expense_uuid',)  

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ('Income_uuid',)

# user_work 저장

class UserWorkDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_WorkDetail
        fields = ["work_type", "minutes", "is_overtime_approved"]


class UserWorkDaySerializer(serializers.ModelSerializer):
    details = UserWorkDetailSerializer(many=True)

    class Meta:
        model = User_WorkDay
        fields = [
            "user_uuid",
            "user_name",
            "work_date",
            "work_start",
            "work_end",
            "work_place",
            "work_shift",
            "is_approved",
            "details",
        ]

    @transaction.atomic
    
    def create(self, validated_data):
        details_data = validated_data.pop("details")  # details 무조건 온다

        work_day = User_WorkDay.objects.create(**validated_data)

        User_WorkDetail.objects.bulk_create([
            User_WorkDetail(
                work_date=work_day,            # FK 이름 맞추기
                user_uuid=work_day.user_uuid_str,  # 반드시 필요
                **d
            )
            for d in details_data
        ])
        
        return work_day


class WorkPlaceRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkPlaceRate
        fields = "__all__"
