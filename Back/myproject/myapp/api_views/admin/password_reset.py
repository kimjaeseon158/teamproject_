# 관리자의 사용자 비밀번호 재설정 요청 처리 API

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...encryption.crypto import normalize_resident_number, resident_number_blind_index
from ...models import PasswordResetRequest, UserRefreshToken, User_Login_Info
from ...serializers import User_InfoSerializer, User_Login_InfoSerializer
from ..token import AdminJWTAuthentication


class AdminPasswordResetRequestAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reset_requests = (
            PasswordResetRequest.objects.filter(
                status=PasswordResetRequest.Status.PENDING
            )
            .select_related("user")
            .order_by("requested_at")
        )
        result = [
            {
                "request_uuid": item.request_uuid,
                "user_uuid": item.user_id,
                "user_id": item.user.user_id,
                "user_name": item.user.user_name,
                "requested_at": item.requested_at,
                "status": item.status,
            }
            for item in reset_requests
        ]
        return Response({"success": True, "requests": result})

    def patch(self, request):
        request_uuid = request.data.get("request_uuid")
        if not request_uuid:
            return Response(
                {"success": False, "error": "request_uuid is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                reset_request = (
                    PasswordResetRequest.objects.select_for_update()
                    .select_related("user")
                    .get(request_uuid=request_uuid)
                )
            except (PasswordResetRequest.DoesNotExist, ValueError):
                return Response(
                    {"success": False, "error": "Reset request not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if reset_request.status != PasswordResetRequest.Status.PENDING:
                return Response(
                    {"success": False, "error": "Reset request was already processed."},
                    status=status.HTTP_409_CONFLICT,
                )

            user = User_Login_Info.objects.select_for_update().get(
                user_uuid=reset_request.user_id
            )
            user.password = normalize_resident_number(user.resident_number)[:6]
            user.must_change_password = True
            user.save(update_fields=["password", "must_change_password"])
            UserRefreshToken.objects.filter(user_uuid=user).delete()

            reset_request.status = PasswordResetRequest.Status.APPROVED
            reset_request.processed_at = timezone.now()
            reset_request.save(
                update_fields=["status", "processed_at"]
            )

        return Response({"success": True, "request_uuid": reset_request.request_uuid})
