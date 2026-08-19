# 근무 일정 검증과 주간 응답 공통 함수

from collections import defaultdict
from datetime import timedelta
from uuid import UUID
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.response import Response
from ...models import EmployeeWorkSchedule,User_Login_Info


class ScheduleBatchError(Exception):
    def __init__(self, message, response_status, errors=None):
        self.message = message
        self.response_status = response_status
        self.errors = errors
        super().__init__(message)


def _required_date(value, field_name="date"):
    if not isinstance(value, str):
        raise ScheduleBatchError(
            f"{field_name}는 YYYY-MM-DD 형식으로 필요합니다.",
            status.HTTP_400_BAD_REQUEST,
        )
    parsed = parse_date(value)
    if parsed is None or parsed.isoformat() != value:
        raise ScheduleBatchError(
            f"{field_name}는 YYYY-MM-DD 형식이어야 합니다.",
            status.HTTP_400_BAD_REQUEST,
        )
    return parsed


def _week_range(base_date):
    week_start = base_date - timedelta(days=base_date.weekday())
    return week_start, week_start + timedelta(days=6)


def _week_dates(week_start):
    return [week_start + timedelta(days=offset) for offset in range(7)]


def _normalized_uuid(value, field_name):
    try:
        return str(UUID(str(value)))
    except (ValueError, TypeError, AttributeError):
        raise ScheduleBatchError(
            f"{field_name}가 올바른 UUID 형식이 아닙니다.",
            status.HTTP_400_BAD_REQUEST,
        )


def _schedule_display(schedule, include_ids):
    data = {
        "status": schedule.status,
        "status_label": schedule.get_status_display(),
        "work_place": schedule.work_place_name,
        "work_place_detail": schedule.work_place_detail,
    }
    if include_ids:
        data.update(
            {
                "schedule_uuid": str(schedule.schedule_uuid),
                "admin_work_place_uuid": (
                    str(schedule.admin_work_place_id)
                    if schedule.admin_work_place_id
                    else None
                ),
            }
        )
    return data


def build_week_response(base_date, include_ids):
    week_start, week_end = _week_range(base_date)
    dates = _week_dates(week_start)
    date_keys = [item.isoformat() for item in dates]

    users = list(User_Login_Info.objects.all().order_by("user_name", "user_uuid"))
    schedules = EmployeeWorkSchedule.objects.filter(
        work_date__range=(week_start, week_end)
    ).select_related("admin_work_place", "user")

    schedules_by_user_date = defaultdict(list)
    for schedule in schedules:
        schedules_by_user_date[(schedule.user_id, schedule.work_date)].append(
            _schedule_display(schedule, include_ids)
        )

    user_rows = []
    for user in users:
        row = {
            "user_name": user.user_name,
            "days": {
                date_key: schedules_by_user_date[(user.user_uuid, work_date)]
                for date_key, work_date in zip(date_keys, dates)
            },
        }
        if include_ids:
            row["user_uuid"] = str(user.user_uuid)
        user_rows.append(row)

    return {
        "success": True,
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "dates": date_keys,
        "users": user_rows,
    }


def _error_response(error):
    body = {"success": False, "message": error.message}
    if error.errors is not None:
        body["errors"] = error.errors
    return Response(body, status=error.response_status)
