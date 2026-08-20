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
            .order_by("work_place")
            .values("rate_uuid", "work_place")
        )

        return Response(
            {
                "success": True,
                "work_places": list(work_places),
            }
        )
