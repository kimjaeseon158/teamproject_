from django.db import transaction
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Admin_Login_Info, AdminWidgetLayout
from ...serializers.widget_layouts import WidgetLayoutSaveSerializer, WidgetLayoutSerializer
from ..token import AdminJWTAuthentication


def layout_data(instance):
    if instance is None:
        return {"layout": None, "version": 0, "updated_at": None, "previous_layout": None}
    return WidgetLayoutSerializer(instance).data


class AdminWidgetLayoutAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request):
        instance = AdminWidgetLayout.objects.filter(admin=request.user).first()
        return Response(layout_data(instance))

    def patch(self, request):
        serializer = WidgetLayoutSaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with transaction.atomic():
            # Lock the parent, which exists even during concurrent first saves.
            admin = Admin_Login_Info.objects.select_for_update().get(pk=request.user.pk)
            instance = AdminWidgetLayout.objects.filter(admin=admin).first()
            current_version = instance.version if instance else 0
            if data["version"] != current_version:
                return Response(
                    {
                        "code": "layout_version_conflict",
                        "detail": "다른 화면에서 배치가 변경되었습니다. 현재 배치를 덮어쓰거나 서버 배치를 불러오세요.",
                        "current": layout_data(instance),
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            if instance is None:
                instance = AdminWidgetLayout.objects.create(admin=admin, layout=data["layout"])
            else:
                instance.previous_layout = instance.layout
                instance.layout = data["layout"]
                instance.version += 1
                instance.save(update_fields=["previous_layout", "layout", "version", "updated_at"])
            return Response(layout_data(instance))
