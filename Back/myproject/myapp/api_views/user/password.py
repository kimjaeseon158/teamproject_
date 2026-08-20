# 사용자 비밀번호 변경과 재설정 요청 API

from django.contrib.auth.hashers import check_password
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...encryption.crypto import resident_number_blind_index
from ...models import PasswordResetRequest, User_Login_Info
from ..token import UserJWTAuthentication


class UserPasswordResetRequestAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    generic_response = {
        "success": True
    }

    def post(self, request):
        user_id = request.data.get("user_id")
        resident_number = request.data.get("resident_number")

        if user_id and resident_number:
            try:
                user = User_Login_Info.objects.get(
                    user_id=user_id,
                    resident_number_hash=resident_number_blind_index(resident_number),
                )
                PasswordResetRequest.objects.get_or_create(
                    user=user,
                    status=PasswordResetRequest.Status.PENDING,
                )
            except (User_Login_Info.DoesNotExist, IntegrityError):
                pass

        return Response(self.generic_response, status=status.HTTP_202_ACCEPTED)


class UserPasswordChangeAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        new_password_confirm = request.data.get("new_password_confirm")

        if not current_password or not new_password or not new_password_confirm:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(current_password, user.password):
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password_confirm:
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        if check_password(new_password, user.password):
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

        user.password = new_password
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])

        return Response({"success": True, "must_change_password": False})
