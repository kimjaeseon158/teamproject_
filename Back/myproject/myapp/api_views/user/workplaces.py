# 사용자 근무지 조회 API

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import WorkPlaceRate
from ..token import UserJWTAuthentication


class UserWorkPlaceListAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        work_places = (
            WorkPlaceRate.objects.filter(user=request.user)
            .order_by("work_place", "-effective_start_date")
            .values("rate_uuid", "work_place", "effective_start_date", "effective_end_date")
        )

        unique_places = {}
        for item in work_places:
            unique_places.setdefault(item["work_place"], item)

        return Response(
            {
                "success": True,
                "work_places": list(unique_places.values()),
            }
        )
