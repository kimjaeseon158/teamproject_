# 관리자 주간 근무 일정 조회와 일괄 변경 API

from django.db import IntegrityError, transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import AdminWorkPlace, EmployeeWorkSchedule, User_Login_Info
from ...serializers import EmployeeWorkScheduleWriteSerializer
from ..shared.schedule_utils import ScheduleBatchError, _error_response, _normalized_uuid, _required_date, _week_range, build_week_response
from ..token import AdminJWTAuthentication, UserJWTAuthentication


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
