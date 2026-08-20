# 관리자 근무지 생성·조회·수정·삭제 API

from django.db import transaction
from django.db.utils import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import AdminWorkPlace
from ...serializers import AdminWorkPlaceCreateSerializer
from ..token import AdminJWTAuthentication
from .workplace_helpers import _admin_work_place_list_response


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

        work_place = serializer.validated_data["work_place"].strip()
        if AdminWorkPlace.objects.filter(work_place__iexact=work_place).exists():
            return Response(
                {"success": False, "message": "이미 저장된 근무지입니다."},
                status=409,
            )

        try:
            serializer.save(admin=request.user, work_place=work_place)
        except IntegrityError:
            return Response({"success": False, "message": "이미 저장된 근무지입니다."})

        return _admin_work_place_list_response(request.user)


class AdminWorkPlaceUpdateDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        admin_work_place_uuid = request.data.get("admin_work_place_uuid")
        if not admin_work_place_uuid:
            return Response(
                {"success": False, "message": "admin_work_place_uuid가 필요합니다."}
            )

        try:
            admin_work_place = AdminWorkPlace.objects.get(
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

        work_place = serializer.validated_data.get(
            "work_place",
            admin_work_place.work_place,
        ).strip()
        if (
            AdminWorkPlace.objects.filter(work_place__iexact=work_place)
            .exclude(admin_work_place_uuid=admin_work_place_uuid)
            .exists()
        ):
            return Response(
                {"success": False, "message": "이미 저장된 근무지입니다."},
                status=409,
            )

        try:
            serializer.save(work_place=work_place)
        except IntegrityError:
            return Response({"success": False, "message": "이미 저장된 근무지입니다."})

        return _admin_work_place_list_response(request.user)

    def delete(self, request):
        admin_work_place_uuid = request.data.get("admin_work_place_uuid")
        if not admin_work_place_uuid:
            return Response(
                {"success": False, "message": "admin_work_place_uuid가 필요합니다."}
            )

        deleted_count, _ = AdminWorkPlace.objects.filter(
            admin_work_place_uuid=admin_work_place_uuid,
        ).delete()
        if not deleted_count:
            return Response({"success": False, "message": "저장된 근무지가 아닙니다."})

        return _admin_work_place_list_response(request.user)
