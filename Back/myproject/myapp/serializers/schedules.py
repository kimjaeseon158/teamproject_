# 직원 근무 일정 입력 serializer

from rest_framework import serializers
from ..models import EmployeeWorkSchedule


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
