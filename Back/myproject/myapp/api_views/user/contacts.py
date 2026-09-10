# 사용자 전화번호부 조회 API

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import User_Login_Info
from ..token import UserJWTAuthentication


class UserContactListAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        name = request.query_params.get("name", "").strip()
        users = User_Login_Info.objects.all()
        if name:
            users = users.filter(user_name__icontains=name)

        contacts = list(
            users.order_by("user_name", "user_uuid").values(
                "user_name",
                "phone_number",
            )
        )

        return Response({"success": True, "contacts": contacts})
