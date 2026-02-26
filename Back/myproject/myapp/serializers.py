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
        details_data = validated_data.pop("details")
    
        user = validated_data["user_uuid"]
        work_date = validated_data["work_date"]
        work_shift = validated_data["work_shift"]
    
        with transaction.atomic():
            rejected = (
                User_WorkDay.objects
                .select_for_update()
                .filter(
                    user_uuid=user,
                    work_date=work_date,
                    work_shift=work_shift,
                    is_approved=False,   # 반려건
                )
                .order_by("-id")
                .first()
            )
    
            if rejected:
                # 반려건을 재제출로 덮어쓰기
                for k, v in validated_data.items():
                    setattr(rejected, k, v)
                rejected.is_approved = None
                rejected.reject_reason = None
                rejected.save()
    
                User_WorkDetail.objects.filter(work_date=rejected).delete()
                User_WorkDetail.objects.bulk_create([
                    User_WorkDetail(
                        work_date=rejected,
                        user_uuid=rejected.user_uuid_id,
                        **d
                    )
                    for d in details_data
                ])
                return rejected
    
            # 반려건이 없으면 새로 생성 (미처리/승인 중복은 DB 제약이 막아줌)
            work_day = User_WorkDay.objects.create(**validated_data)
            User_WorkDetail.objects.bulk_create([
                User_WorkDetail(
                    work_date=work_day,
                    user_uuid=work_day.user_uuid_id,
                    **d
                )
                for d in details_data
            ])
            return work_day


class WorkPlaceRateSerializer(serializers.ModelSerializer):
    user_uuid = serializers.CharField(source="user_uuid_str", read_only=True)
    user_name = serializers.CharField(read_only=True)

    class Meta:
        model = WorkPlaceRate
        fields = '__all__'


class WorkPlaceRateCreateSerializer(serializers.ModelSerializer):
    user_uuid = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkPlaceRate
        fields = [
            "user_uuid",            
            "work_place",
            "base_hourly_wage",
            "overtime_hourly_wage",
            "meal_ot_hourly_wage",
            "special_hourly_wage",
            "overnight_hourly_wage",
            "overnight_ot_hourly_wage",
        ]