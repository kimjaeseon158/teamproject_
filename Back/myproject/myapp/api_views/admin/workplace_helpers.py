# 관리자 근무지와 급여율 공통 처리 함수

from ...models import AdminWorkPlace
from ...serializers import AdminWorkPlaceSerializer


RATE_FIELD_NAMES = [
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


def _admin_work_place_qs(admin=None):
    return AdminWorkPlace.objects.all().order_by("work_place", "admin_work_place_uuid")


def _admin_work_place_list_response(admin):
    serializer = AdminWorkPlaceSerializer(_admin_work_place_qs(admin), many=True)
    return Response({"success": True, "work_places": serializer.data})


def _apply_admin_work_place(admin, data):
    data = data.copy()
    admin_work_place_uuid = data.pop("admin_work_place_uuid", None)
    work_place = data.get("work_place")

    if admin_work_place_uuid:
        try:
            admin_work_place = AdminWorkPlace.objects.get(
                admin_work_place_uuid=admin_work_place_uuid,
            )
        except AdminWorkPlace.DoesNotExist:
            return None, "저장된 근무지가 아닙니다."

        data["work_place"] = admin_work_place.work_place
        for field in RATE_FIELD_NAMES:
            if data.get(field) is None:
                data[field] = getattr(admin_work_place, field)
        return data, None

    if not work_place:
        return None, "근무지를 선택해주세요."

    admin_work_place = (
        AdminWorkPlace.objects.filter(work_place=work_place)
        .order_by("admin_work_place_uuid")
        .first()
    )
    if admin_work_place is None:
        return None, "저장된 근무지만 선택할 수 있습니다."

    for field in RATE_FIELD_NAMES:
        if data.get(field) is None:
            data[field] = getattr(admin_work_place, field)
    return data, None
