# 근무일·근무지·급여율 serializer

from django.db import transaction
from rest_framework import serializers
from ..api_views.shared import normalize_work_type
from ..models import AdminWorkPlace, User_WorkDay, User_WorkDetail, WorkPlaceRate


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
            "note",
            "work_shift",
            "is_approved",
            "details",
        ]

    @transaction.atomic
    def create(self, validated_data):
        details_data = validated_data.pop("details")
        work_shift = validated_data["work_shift"]
        for detail in details_data:
            detail["work_type"] = normalize_work_type(
                detail.get("work_type"), work_shift
            )

        user = validated_data["user_uuid"]
        work_date = validated_data["work_date"]

        with transaction.atomic():
            rejected = (
                User_WorkDay.objects.select_for_update()
                .filter(
                    user_uuid=user,
                    work_date=work_date,
                    work_shift=work_shift,
                    is_approved=False,  # 반려건
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
                User_WorkDetail.objects.bulk_create(
                    [
                        User_WorkDetail(
                            work_date=rejected, user_uuid=rejected.user_uuid_id, **d
                        )
                        for d in details_data
                    ]
                )
                return rejected

            # 반려건이 없으면 새로 생성 (미처리/승인 중복은 DB 제약이 막아줌)
            work_day = User_WorkDay.objects.create(**validated_data)
            User_WorkDetail.objects.bulk_create(
                [
                    User_WorkDetail(
                        work_date=work_day, user_uuid=work_day.user_uuid_id, **d
                    )
                    for d in details_data
                ]
            )
            return work_day

    @transaction.atomic
    def update(self, instance, validated_data):
        details_data = validated_data.pop("details")
        work_shift = validated_data["work_shift"]

        for detail in details_data:
            detail["work_type"] = normalize_work_type(
                detail.get("work_type"),
                work_shift,
            )

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.is_approved = None
        instance.reject_reason = None
        instance.save()

        instance.details.all().delete()
        User_WorkDetail.objects.bulk_create(
            [
                User_WorkDetail(
                    work_date=instance,
                    user_uuid=instance.user_uuid_id,
                    **detail,
                )
                for detail in details_data
            ]
        )
        return instance


class WorkPlaceRateSerializer(serializers.ModelSerializer):
    user_uuid = serializers.CharField(source="user_uuid_str", read_only=True)
    user_name = serializers.CharField(read_only=True)

    class Meta:
        model = WorkPlaceRate
        fields = "__all__"


class WorkPlaceRateCreateSerializer(serializers.ModelSerializer):
    user_uuid = serializers.UUIDField(write_only=True)
    admin_work_place_uuid = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = WorkPlaceRate
        fields = [
            "user_uuid",
            "admin_work_place_uuid",
            "work_place",
            "base_hourly_wage",
            "overtime_hourly_wage",
            "meal_ot_hourly_wage",
            "special_hourly_wage",
            "day_special_hourly_wage",
            "night_special_hourly_wage",
            "overnight_hourly_wage",
            "overnight_ot_hourly_wage",
            "early_hourly_wage",
        ]


class AdminWorkPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminWorkPlace
        fields = [
            "admin_work_place_uuid",
            "work_place",
            "base_hourly_wage",
            "overtime_hourly_wage",
            "meal_ot_hourly_wage",
            "special_hourly_wage",
            "day_special_hourly_wage",
            "night_special_hourly_wage",
            "overnight_hourly_wage",
            "overnight_ot_hourly_wage",
            "early_hourly_wage",
        ]
        read_only_fields = ("admin_work_place_uuid",)


class AdminWorkPlaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminWorkPlace
        fields = [
            "work_place",
            "base_hourly_wage",
            "overtime_hourly_wage",
            "meal_ot_hourly_wage",
            "special_hourly_wage",
            "day_special_hourly_wage",
            "night_special_hourly_wage",
            "overnight_hourly_wage",
            "overnight_ot_hourly_wage",
            "early_hourly_wage",
        ]
