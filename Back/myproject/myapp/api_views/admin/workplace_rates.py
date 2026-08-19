# 사용자별 근무지 급여율 관리 API

from datetime import datetime
from django.db import transaction
from django.db.utils import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import AdminWorkPlace, User_Login_Info, User_WorkDay, WorkPlaceRate
from ...serializers import AdminWorkPlaceCreateSerializer, AdminWorkPlaceSerializer, UserWorkDaySerializer, WorkPlaceRateCreateSerializer, WorkPlaceRateSerializer
from ..shared.salary_utils import group_rates_by_user, sync_salary_expense_for_workday
from ..token import AdminJWTAuthentication
from .workplace_helpers import _admin_work_place_list_response, _apply_admin_work_place


class WorkPlaceRateListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all()

        grouped = group_rates_by_user(WorkPlace_qs)

        return Response({"success": True, "users": grouped})

    @transaction.atomic
    def post(self, request):
        create_ser = WorkPlaceRateCreateSerializer(data=request.data)
        if not create_ser.is_valid():
            return Response(
                {"success": False, "errors": "입력 정보가 유효하지 않습니다."}
            )

        user_uuid = create_ser.validated_data.pop("user_uuid")
        rate_data, error_message = _apply_admin_work_place(
            request.user, create_ser.validated_data
        )
        if error_message:
            return Response({"success": False, "message": error_message})

        try:
            user = User_Login_Info.objects.get(user_uuid=user_uuid)
        except User_Login_Info.DoesNotExist:
            return Response({"success": False, "message": "존재하지 않는 user 입니다."})

        try:
            WorkPlaceRate.objects.create(user=user, **rate_data)
        except IntegrityError:
            return Response(
                {"success": False, "message": "이미 존재하는 근무지입니다."}
            )

        WorkPlace_qs = (
            WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        )
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})


class WorkPlaceRateUpdateDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        rate_uuid = request.data.get("rate_uuid")
        if not rate_uuid:
            return Response({"success": False})

        try:
            rate = WorkPlaceRate.objects.select_related("user").get(rate_uuid=rate_uuid)
        except WorkPlaceRate.DoesNotExist:
            return Response({"success": False})

        rate_data = request.data.copy()
        if "admin_work_place_uuid" in rate_data or "work_place" in rate_data:
            rate_data, error_message = _apply_admin_work_place(request.user, rate_data)
            if error_message:
                return Response({"success": False, "message": error_message})

        serializer = WorkPlaceRateSerializer(rate, data=rate_data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False})

        serializer.save()

        # 수정 후 전체 목록 반환
        WorkPlace_qs = (
            WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        )
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})

    def delete(self, request):
        rate_uuid = request.data.get("rate_uuid")
        if not rate_uuid:
            return Response({"success": False})

        try:
            rate = WorkPlaceRate.objects.get(rate_uuid=rate_uuid)
        except WorkPlaceRate.DoesNotExist:
            return Response({"success": False})

        rate.delete()

        # 삭제 후 전체 목록 반환
        WorkPlace_qs = (
            WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
        )
        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})


class WorkPlaceRateListfilteringAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_name = request.query_params.get("user_name")
        work_place = request.query_params.get("work_place")

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all()

        if user_name:
            WorkPlace_qs = WorkPlace_qs.filter(user__user_name__icontains=user_name)

        if work_place:
            WorkPlace_qs = WorkPlace_qs.filter(work_place__icontains=work_place)

        grouped = group_rates_by_user(WorkPlace_qs)
        return Response({"success": True, "users": grouped})
