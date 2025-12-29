from rest_framework import serializers
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
    details = UserWorkDetailSerializer(many=True, read_only=True)

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

    def create(self, validated_data):
        details_data = validated_data.pop("details")

        # WorkDay 생성
        work_day = User_WorkDay.objects.create(**validated_data)

        # WorkDetail 생성
        User_WorkDetail.objects.bulk_create([
            User_WorkDetail(work_day=work_day, **d) for d in details_data
        ])

        return work_day

