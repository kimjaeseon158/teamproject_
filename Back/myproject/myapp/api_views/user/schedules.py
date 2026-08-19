# 사용자 주간 근무 일정 조회 API

from django.db import IntegrityError, transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import AdminWorkPlace, EmployeeWorkSchedule, User_Login_Info
from ...serializers import EmployeeWorkScheduleWriteSerializer
from ..shared.schedule_utils import ScheduleBatchError, _error_response, _normalized_uuid, _required_date, _week_range, build_week_response
from ..token import AdminJWTAuthentication, UserJWTAuthentication


class UserWorkScheduleWeekAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            base_date = _required_date(request.query_params.get("date"))
        except ScheduleBatchError as error:
            return _error_response(error)
        return Response(build_week_response(base_date, include_ids=False))
