# 관리자 근무일 조회와 승인 상태 변경 API

from datetime import datetime
from django.core.paginator import EmptyPage, Paginator
from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import User_WorkDay, User_WorkDetail
from ...serializers import UserWorkDaySerializer
from ..shared.salary_utils import sync_salary_expense_for_workday
from ..token import AdminJWTAuthentication


class AdminPageWorkDayListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100
    ORDERING_FIELDS = {
        "work_date": "work_date",
        "user_name": "user_name",
        "total_work_minutes": "total_work_minutes",
    }

    @staticmethod
    def _summary(queryset):
        return queryset.aggregate(
            total=Count("pk", distinct=True),
            pending=Count(
                "pk", filter=Q(is_approved__isnull=True), distinct=True
            ),
            approved=Count("pk", filter=Q(is_approved=True), distinct=True),
            rejected=Count("pk", filter=Q(is_approved=False), distinct=True),
            day=Count("pk", filter=Q(work_shift="주간"), distinct=True),
            night=Count("pk", filter=Q(work_shift="야간"), distinct=True),
            special=Count(
                "pk",
                filter=Q(details__work_type__icontains="특근"),
                distinct=True,
            ),
        )

    def get(self, request):
        status = request.query_params.get("status")  # 대기, 승인, 거절, 전체
        work_shift = request.query_params.get("work_shift")
        work_place = request.query_params.get("work_place")
        user_name = request.query_params.get("user_name")
        extra_work = request.query_params.get("extra_work")
        start_date_str = request.query_params.get("start_date")  # YYYY-MM-DD
        end_date_str = request.query_params.get("end_date")  # YYYY-MM-DD

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", self.DEFAULT_PAGE_SIZE)
        ordering = request.query_params.get("ordering", "-work_date")

        try:
            page_number = int(page_str)
            if page_number < 1:
                raise ValueError
            page_size = int(page_size_str)
            if not 1 <= page_size <= self.MAX_PAGE_SIZE:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"success": False},
                status=400,
            )

        descending = ordering.startswith("-")
        ordering_key = ordering[1:] if descending else ordering
        ordering_field = self.ORDERING_FIELDS.get(ordering_key)
        if ordering_field is None:
            return Response(
                {"success": False},
                status=400,
            )

        user_work_day = User_WorkDay.objects.all()

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
            return Response(
                {"success": False}, status=400
            )

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
        if bool(start_date_str) != bool(end_date_str):
            return Response(
                {"success": False},
                status=400,
            )
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"success": False},
                    status=400,
                )

            user_work_day = user_work_day.filter(
                work_date__gte=start_date, work_date__lte=end_date
            )

        summary = self._summary(user_work_day)

        detail_total = (
            User_WorkDetail.objects.filter(work_date_id=OuterRef("pk"))
            .order_by()
            .values("work_date")
            .annotate(total=Sum("minutes"))
            .values("total")[:1]
        )
        user_work_day = user_work_day.annotate(
            total_work_minutes=Coalesce(
                Subquery(detail_total, output_field=IntegerField()), Value(0)
            )
        )
        order_by = f"-{ordering_field}" if descending else ordering_field
        # Keep date as a stable secondary sort order for records with equal values.
        user_work_day = user_work_day.order_by(order_by, "-work_date", "-pk")

        paginator = Paginator(user_work_day, page_size)
        try:
            page = paginator.page(page_number)
        except EmptyPage:
            return Response(
                {"success": False},
                status=400,
            )

        page_queryset = page.object_list.prefetch_related("details")
        serializer = UserWorkDaySerializer(page_queryset, many=True)
        return Response(
            {
                "success": True,
                "data": serializer.data,
                "pagination": {
                    "page": page.number,
                    "page_size": page_size,
                    "total_count": paginator.count,
                    "total_pages": paginator.num_pages,
                },
                "summary": summary,
            }
        )


class AdminWorkDayStatusUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_work_day_update(
        self, item, default_status=None, default_reject_reason=None
    ):
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
