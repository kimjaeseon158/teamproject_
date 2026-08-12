from collections import defaultdict
from datetime import timedelta
from uuid import UUID

from django.db import IntegrityError, transaction
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import AdminWorkPlace, EmployeeWorkSchedule, User_Login_Info
from ..serializers import EmployeeWorkScheduleWriteSerializer
from .token import AdminJWTAuthentication, UserJWTAuthentication


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


class AdminWorkScheduleWeekAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            base_date = _required_date(request.query_params.get("date"))
        except ScheduleBatchError as error:
            return _error_response(error)
        return Response(build_week_response(base_date, include_ids=True))


class AdminWorkScheduleBatchAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _lists(self, request):
        result = {}
        for field in ("create", "update", "delete"):
            value = request.data.get(field, [])
            if not isinstance(value, list):
                raise ScheduleBatchError(
                    f"{field}는 배열이어야 합니다.",
                    status.HTTP_400_BAD_REQUEST,
                )
            result[field] = value
        return result

    def _resolve_user(self, user_uuid, required):
        if not user_uuid:
            if required:
                raise ScheduleBatchError(
                    "user_uuid가 필요합니다.",
                    status.HTTP_400_BAD_REQUEST,
                )
            return None
        try:
            return User_Login_Info.objects.get(user_uuid=user_uuid)
        except (User_Login_Info.DoesNotExist, ValueError, TypeError):
            raise ScheduleBatchError(
                "존재하지 않는 직원입니다.",
                status.HTTP_404_NOT_FOUND,
            )

    def _resolve_workplace(self, item):
        if "admin_work_place_uuid" not in item:
            return False, None
        workplace_uuid = item.get("admin_work_place_uuid")
        if workplace_uuid in (None, ""):
            return True, None
        try:
            workplace = AdminWorkPlace.objects.get(admin_work_place_uuid=workplace_uuid)
        except (AdminWorkPlace.DoesNotExist, ValueError, TypeError):
            raise ScheduleBatchError(
                "존재하지 않는 근무지입니다.",
                status.HTTP_404_NOT_FOUND,
            )
        return True, workplace

    def _validated_data(self, item, instance, week_start, week_end, index, group):
        if not isinstance(item, dict):
            raise ScheduleBatchError(
                f"{group}[{index}]는 객체여야 합니다.",
                status.HTTP_400_BAD_REQUEST,
            )

        user = self._resolve_user(
            item.get("user_uuid"),
            required=instance is None,
        )
        workplace_was_provided, workplace = self._resolve_workplace(item)
        serializer = EmployeeWorkScheduleWriteSerializer(
            data=item,
            partial=instance is not None,
            context={
                "instance": instance,
                "user": user,
                "workplace": workplace,
                "workplace_was_provided": workplace_was_provided,
            },
        )
        if not serializer.is_valid():
            raise ScheduleBatchError(
                f"{group}[{index}] 입력값이 올바르지 않습니다.",
                status.HTTP_400_BAD_REQUEST,
                serializer.errors,
            )

        validated = serializer.validated_data
        if not week_start <= validated["work_date"] <= week_end:
            raise ScheduleBatchError(
                f"{group}[{index}]의 work_date가 조회 주간 범위 밖입니다.",
                status.HTTP_400_BAD_REQUEST,
            )
        return validated

    def patch(self, request):
        try:
            base_date = _required_date(request.data.get("date"))
            week_start, week_end = _week_range(base_date)
            groups = self._lists(request)

            update_ids = []
            for index, item in enumerate(groups["update"]):
                if not isinstance(item, dict) or not item.get("schedule_uuid"):
                    raise ScheduleBatchError(
                        f"update[{index}]에 schedule_uuid가 필요합니다.",
                        status.HTTP_400_BAD_REQUEST,
                    )
                update_ids.append(
                    _normalized_uuid(
                        item["schedule_uuid"], f"update[{index}].schedule_uuid"
                    )
                )
            delete_ids = [
                _normalized_uuid(item, f"delete[{index}]")
                for index, item in enumerate(groups["delete"])
            ]

            if len(update_ids) != len(set(update_ids)) or len(delete_ids) != len(
                set(delete_ids)
            ):
                raise ScheduleBatchError(
                    "같은 일정 UUID를 중복해서 전달할 수 없습니다.",
                    status.HTTP_400_BAD_REQUEST,
                )
            if set(update_ids) & set(delete_ids):
                raise ScheduleBatchError(
                    "같은 일정을 수정과 삭제에 동시에 포함할 수 없습니다.",
                    status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                list(
                    EmployeeWorkSchedule.objects.select_for_update().filter(
                        work_date__range=(week_start, week_end)
                    )
                )
                requested_ids = set(update_ids) | set(delete_ids)
                locked = {
                    str(item.schedule_uuid): item
                    for item in EmployeeWorkSchedule.objects.select_for_update().filter(
                        schedule_uuid__in=requested_ids
                    )
                }
                if set(locked) != requested_ids:
                    raise ScheduleBatchError(
                        "존재하지 않는 일정이 포함되어 있습니다.",
                        status.HTTP_404_NOT_FOUND,
                    )

                for schedule_uuid in delete_ids:
                    locked[schedule_uuid].delete()

                for index, item in enumerate(groups["update"]):
                    schedule = locked[str(item["schedule_uuid"])]
                    validated = self._validated_data(
                        item,
                        schedule,
                        week_start,
                        week_end,
                        index,
                        "update",
                    )
                    for field, value in validated.items():
                        setattr(schedule, field, value)
                    schedule.updated_by = request.user
                    schedule.save()

                for index, item in enumerate(groups["create"]):
                    validated = self._validated_data(
                        item,
                        None,
                        week_start,
                        week_end,
                        index,
                        "create",
                    )
                    EmployeeWorkSchedule.objects.create(
                        **validated,
                        created_by=request.user,
                        updated_by=request.user,
                    )
        except ScheduleBatchError as error:
            return _error_response(error)
        except IntegrityError:
            return Response(
                {
                    "success": False,
                    "message": "완전히 같은 근무 일정이 이미 존재합니다.",
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(build_week_response(base_date, include_ids=True))


class UserWorkScheduleWeekAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            base_date = _required_date(request.query_params.get("date"))
        except ScheduleBatchError as error:
            return _error_response(error)
        return Response(build_week_response(base_date, include_ids=False))
