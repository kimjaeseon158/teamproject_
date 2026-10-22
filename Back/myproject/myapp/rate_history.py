"""단가 이력 쓰기는 사용자 행 잠금 아래에서 검증한다."""

from datetime import timedelta
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import User_Login_Info, WorkPlaceRate


def validate_period(start, end):
    if start is None:
        raise ValidationError({"effective_start_date": "적용 시작일은 필수입니다."})
    if end is not None and end < start:
        raise ValidationError(
            {"effective_end_date": "종료일은 시작일 이후여야 합니다."}
        )


@transaction.atomic
def save_rate_history(data, instance=None):
    user = instance.user if instance else data["user"]
    User_Login_Info.objects.select_for_update().get(pk=user.pk)
    if instance:
        instance = WorkPlaceRate.objects.select_for_update().get(pk=instance.pk)
        if "user" in data and data["user"].pk != instance.user_id:
            raise ValidationError({"user": "이력의 사용자는 변경할 수 없습니다."})
        if "work_place" in data and data["work_place"] != instance.work_place:
            raise ValidationError({"work_place": "이력의 근무지는 변경할 수 없습니다."})
    start = data.get(
        "effective_start_date", instance.effective_start_date if instance else None
    )
    end = data.get(
        "effective_end_date", instance.effective_end_date if instance else None
    )
    place = instance.work_place if instance else data["work_place"]
    validate_period(start, end)
    others = list(
        WorkPlaceRate.objects.filter(user=user, work_place=place)
        .exclude(pk=instance.pk if instance else None)
        .order_by("effective_start_date")
    )
    # 신규 이력은 마지막 기간 뒤에만 추가한다. 기존 이력은 PATCH로 교정한다.
    if not instance and others:
        last = others[-1]
        if start <= last.effective_start_date:
            raise ValidationError(
                {"effective_start_date": "마지막 이력 시작일 이후로 지정해주세요."}
            )
        if last.effective_end_date is None:
            last.effective_end_date = start - timedelta(days=1)
            last.save(update_fields=["effective_end_date"])
    for other in others:
        if (end is None or other.effective_start_date <= end) and (
            other.effective_end_date is None or start <= other.effective_end_date
        ):
            raise ValidationError(
                {"effective_start_date": "기존 단가 적용 기간과 겹칩니다."}
            )
    if instance:
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
    return WorkPlaceRate.objects.create(**data)


@transaction.atomic
def delete_rate_history(rate):
    User_Login_Info.objects.select_for_update().get(pk=rate.user_id)
    rate = WorkPlaceRate.objects.select_for_update().get(pk=rate.pk)
    if rate.used_for_approval or rate.approved_workdays.exists():
        raise ValidationError(
            {"rate_uuid": "승인에 사용된 단가 이력은 삭제할 수 없습니다."}
        )
    rate.delete()
