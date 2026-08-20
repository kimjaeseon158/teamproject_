# 사용자 주간 근무 일정 조회 API

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ..shared.schedule_utils import ScheduleBatchError, _error_response, _required_date, build_week_response
from ..token import UserJWTAuthentication


class UserWorkScheduleWeekAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            base_date = _required_date(request.query_params.get("date"))
        except ScheduleBatchError as error:
            return _error_response(error)
        return Response(build_week_response(base_date, include_ids=False))
