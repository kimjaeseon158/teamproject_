import re
from datetime import date

from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import User_WorkDay
from ...serializers.work import WorkplaceExcelExportSerializer
from ..token.authentication import AdminJWTAuthentication


class WorkplaceExcelExportAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        month = request.query_params.get("date", "")
        try:
            if not re.fullmatch(r"[0-9]{4}-[0-9]{2}", month):
                raise ValueError
            start = date.fromisoformat(f"{month}-01")
        except ValueError:
            return Response(
                {"success": False, "code": "INVALID_PERIOD", "message": "조회 월을 YYYY-MM 형식으로 입력해주세요."},
                status=400,
            )

        workdays = User_WorkDay.objects.filter(
            work_date__year=start.year, work_date__month=start.month, is_approved=True,
        )
        work_place = request.query_params.get("work_place")
        if work_place:
            workdays = workdays.filter(work_place=work_place)

        workdays = workdays.prefetch_related("details").order_by("work_date", "user_name", "pk")
        data = WorkplaceExcelExportSerializer(workdays, many=True).data
        return Response({"success": True, "data": data})
