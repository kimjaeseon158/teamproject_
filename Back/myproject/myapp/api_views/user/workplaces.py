# 사용자 근무지 조회 API

import logging
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...encryption.crypto import resident_number_blind_index
from ...models import PasswordResetRequest, UserRefreshToken, User_Login_Info, User_WorkDay, WorkPlaceRate
from ...serializers import UserWorkDaySerializer
from ..shared import normalize_work_type
from ..shared.salary_utils import calculate_daily_salary_breakdown, get_rates_for_workday
from ..token import CustomRefreshToken, UserJWTAuthentication, check_user_credentials, save_or_update_user_refresh_token


class UserWorkPlaceListAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        work_places = (
            WorkPlaceRate.objects.filter(user=request.user)
            .order_by("work_place")
            .values("rate_uuid", "work_place")
        )

        return Response(
            {
                "success": True,
                "work_places": list(work_places),
            }
        )
