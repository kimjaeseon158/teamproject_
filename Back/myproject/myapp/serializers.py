from rest_framework import serializers
from django.db import transaction
from .models import (
    User_Login_Info,
    Expense,
    Income,
    User_WorkDay,
    User_WorkDetail,
    WorkPlaceRate,
    AdminWorkPlace,
    EmployeeWorkSchedule,
)
from .api_views.shared import normalize_work_type
from .encryption.crypto import resident_number_blind_index

DEFAULT_WORK_PLACE = "\ubbf8\uc9c0\uc815"  # \ubbf8\uc9c0\uc815 = "미지정"


class User_Login_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ("resident_number_hash",)

    def validate_resident_number(self, value):
        resident_hash = resident_number_blind_index(value)
        queryset = User_Login_Info.objects.filter(resident_number_hash=resident_hash)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this resident number already exists."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = super().create(validated_data)
        WorkPlaceRate.objects.get_or_create(
            user=user,
            work_place=DEFAULT_WORK_PLACE,
        )
        return user

    def update(self, instance, validated_data):
        if validated_data.get("password"):
            validated_data["must_change_password"] = True

        return super().update(instance, validated_data)


class User_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ("user_id", "password", "resident_number_hash")


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("expense_uuid",)


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = "__all__"
        read_only_fields = ("Income_uuid",)


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


class EmployeeWorkScheduleWriteSerializer(serializers.Serializer):
    user_uuid = serializers.UUIDField(required=False)
    work_date = serializers.DateField(required=False)
    status = serializers.ChoiceField(
        choices=EmployeeWorkSchedule.Status.choices,
        required=False,
    )
    admin_work_place_uuid = serializers.UUIDField(
        required=False,
        allow_null=True,
    )
    work_place_detail = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=200,
        trim_whitespace=True,
    )

    def validate(self, attrs):
        instance = self.context.get("instance")

        user = self.context.get("user") or (instance.user if instance else None)
        work_date = attrs.get("work_date") or (instance.work_date if instance else None)
        status_value = attrs.get("status") or (instance.status if instance else None)
        detail = attrs.get(
            "work_place_detail",
            instance.work_place_detail if instance else "",
        ).strip()

        workplace_was_provided = self.context.get("workplace_was_provided", False)
        workplace = self.context.get("workplace")
        if not workplace_was_provided and instance is not None:
            workplace = instance.admin_work_place

        if user is None:
            raise serializers.ValidationError({"user_uuid": "user_uuid가 필요합니다."})
        if work_date is None:
            raise serializers.ValidationError({"work_date": "work_date가 필요합니다."})
        if status_value is None:
            raise serializers.ValidationError({"status": "status가 필요합니다."})

        if (
            status_value
            in {
                EmployeeWorkSchedule.Status.DAY,
                EmployeeWorkSchedule.Status.NIGHT,
            }
            and workplace is None
        ):
            raise serializers.ValidationError(
                {"admin_work_place_uuid": "주간/야간 일정은 근무지가 필요합니다."}
            )

        if status_value == EmployeeWorkSchedule.Status.TRAINING and not detail:
            raise serializers.ValidationError(
                {"work_place_detail": "교육 일정은 세부내역이 필요합니다."}
            )

        if status_value == EmployeeWorkSchedule.Status.OFF:
            workplace = None

        attrs["user"] = user
        attrs.pop("user_uuid", None)
        attrs.pop("admin_work_place_uuid", None)
        attrs["work_date"] = work_date
        attrs["status"] = status_value
        attrs["admin_work_place"] = workplace
        attrs["work_place_name"] = workplace.work_place if workplace else ""
        attrs["work_place_detail"] = detail
        return attrs
