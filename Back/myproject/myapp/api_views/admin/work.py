# 관리자 근무/근무지/시급 관리

from rest_framework.views import APIView
from ...models import AdminWorkPlace
from ...serializers import AdminWorkPlaceCreateSerializer
from ...serializers import AdminWorkPlaceSerializer
from django.db.utils import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...serializers import UserWorkDaySerializer
from ...models import User_Login_Info
from ...models import User_WorkDay
from ...models import WorkPlaceRate
from ...serializers import WorkPlaceRateCreateSerializer
from ...serializers import WorkPlaceRateSerializer
from datetime import datetime
from ...salary import group_rates_by_user
from ...salary import sync_salary_expense_for_workday
from django.db import transaction
from ..token import AdminJWTAuthentication

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


def _admin_work_place_qs(admin):
    return AdminWorkPlace.objects.filter(admin=admin).order_by("work_place")


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
                admin=admin,
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

    try:
        admin_work_place = AdminWorkPlace.objects.get(admin=admin, work_place=work_place)
    except AdminWorkPlace.DoesNotExist:
        return None, "저장된 근무지만 선택할 수 있습니다."

    for field in RATE_FIELD_NAMES:
        if data.get(field) is None:
            data[field] = getattr(admin_work_place, field)
    return data, None


class AdminPageWorkDayListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status = request.query_params.get("status")  # 대기, 승인, 거절, 전체
        work_shift = request.query_params.get("work_shift")
        work_place = request.query_params.get("work_place")
        user_name = request.query_params.get("user_name")
        extra_work = request.query_params.get("extra_work")
        start_date_str = request.query_params.get("start_date")  # YYYY-MM-DD
        end_date_str = request.query_params.get("end_date")  # YYYY-MM-DD

        user_work_day = User_WorkDay.objects.prefetch_related("details").order_by(
            "-work_date"
        )

        # 상태 필터 (선택)
        if status == "대기":
            user_work_day = user_work_day.filter(is_approved__isnull=True)
        elif status == "승인":
            user_work_day = user_work_day.filter(is_approved=True)
        elif status == "거절":
            user_work_day = user_work_day.filter(is_approved=False)
        elif status == "전체":
            pass
        else:
            return Response({"success": False})

        # 근무 형태 / 근무지 필터 (선택)
        if work_shift:
            user_work_day = user_work_day.filter(work_shift=work_shift)

        if work_place:
            user_work_day = user_work_day.filter(work_place=work_place)
            
        if user_name:
            user_work_day = user_work_day.filter(user_name__icontains=user_name)

        if extra_work:
            user_work_day = user_work_day.filter(
                details__work_type=extra_work
                ).distinct()
            
        # 날짜 필터 (선택)
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"success": False})

            user_work_day = user_work_day.filter(
                work_date__gte=start_date, work_date__lte=end_date
            )

        serializer = UserWorkDaySerializer(user_work_day, many=True)
        return Response({"success": True, "data": serializer.data})


class AdminWorkDayStatusUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_work_day_update(self, item, default_status=None, default_reject_reason=None):
        user_uuid = item.get("user_uuid")
        work_date_str = item.get("work_date")
        work_shift = item.get("work_shift")
        status = item.get("status", default_status)
        reject_reason = item.get("reject_reason", default_reject_reason)

        if not user_uuid or not work_date_str or status is None or not work_shift:
            return None

        if status not in [True, False]:
            return None

        try:
            work_date = datetime.strptime(work_date_str, "%Y-%m-%d").date()
        except ValueError:
            return None

        try:
            work_day = User_WorkDay.objects.get(
                user_uuid_id=user_uuid, work_date=work_date, work_shift=work_shift
            )
        except User_WorkDay.DoesNotExist:
            return None

        return {
            "work_day": work_day,
            "status": status,
            "reject_reason": reject_reason,
        }

    def patch(self, request):
        request_items = request.data.get("data")
        default_status = request.data.get("status")
        default_reject_reason = request.data.get("reject_reason")

        if request_items is None:
            request_items = [request.data]
        elif not isinstance(request_items, list) or len(request_items) == 0:
            return Response({"success": False})

        updates = []
        for item in request_items:
            if not isinstance(item, dict):
                return Response({"success": False})

            update = self._get_work_day_update(
                item,
                default_status=default_status,
                default_reject_reason=default_reject_reason,
            )
            if update is None:
                return Response({"success": False})
            updates.append(update)

        with transaction.atomic():
            for update in updates:
                work_day = update["work_day"]
                status = update["status"]
                reject_reason = update["reject_reason"]

                if status == True:
                    work_day.is_approved = True
                    work_day.reject_reason = None
                elif status == False:
                    work_day.is_approved = False
                    work_day.reject_reason = reject_reason

                work_day.save()
                sync_salary_expense_for_workday(work_day)

        return Response({"success": True, "updated_count": len(updates)})


class AdminWorkPlaceListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return _admin_work_place_list_response(request.user)

    @transaction.atomic
    def post(self, request):
        serializer = AdminWorkPlaceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors})

        try:
            serializer.save(admin=request.user)
        except IntegrityError:
            return Response({"success": False, "message": "이미 저장된 근무지입니다."})

        return _admin_work_place_list_response(request.user)


class AdminWorkPlaceUpdateDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        admin_work_place_uuid = request.data.get("admin_work_place_uuid")
        if not admin_work_place_uuid:
            return Response({"success": False, "message": "admin_work_place_uuid가 필요합니다."})

        try:
            admin_work_place = AdminWorkPlace.objects.get(
                admin=request.user,
                admin_work_place_uuid=admin_work_place_uuid,
            )
        except AdminWorkPlace.DoesNotExist:
            return Response({"success": False, "message": "저장된 근무지가 아닙니다."})

        serializer = AdminWorkPlaceCreateSerializer(
            admin_work_place,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors})

        try:
            serializer.save()
        except IntegrityError:
            return Response({"success": False, "message": "이미 저장된 근무지입니다."})

        return _admin_work_place_list_response(request.user)

    def delete(self, request):
        admin_work_place_uuid = request.data.get("admin_work_place_uuid")
        if not admin_work_place_uuid:
            return Response({"success": False, "message": "admin_work_place_uuid가 필요합니다."})

        deleted_count, _ = AdminWorkPlace.objects.filter(
            admin=request.user,
            admin_work_place_uuid=admin_work_place_uuid,
        ).delete()
        if not deleted_count:
            return Response({"success": False, "message": "저장된 근무지가 아닙니다."})

        return _admin_work_place_list_response(request.user)


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
            return Response({"success": False, "errors": "입력 정보가 유효하지 않습니다."})

        user_uuid = create_ser.validated_data.pop("user_uuid")
        rate_data, error_message = _apply_admin_work_place(request.user, create_ser.validated_data)
        if error_message:
            return Response({"success": False, "message": error_message})

        try:
            user = User_Login_Info.objects.get(user_uuid=user_uuid)
        except User_Login_Info.DoesNotExist:
            return Response({"success": False, "message": "존재하지 않는 user 입니다."})

        try:
            WorkPlaceRate.objects.create(user=user, **rate_data)
        except IntegrityError:
            return Response({"success": False, "message": "이미 존재하는 근무지입니다."})

        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
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
        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
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
        WorkPlace_qs = WorkPlaceRate.objects.select_related("user").all().order_by("work_place")
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
