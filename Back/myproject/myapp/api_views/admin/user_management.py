# 관리자 사용자 정보 관리 API

from uuid import UUID

from django.core.paginator import EmptyPage, Paginator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...encryption.crypto import resident_number_blind_index
from ...models import User_Login_Info
from ...serializers import User_InfoSerializer, User_Login_InfoSerializer
from ..token import AdminJWTAuthentication


USER_LIST_PAGE_SIZE = 10
USER_LIST_ORDERING = {
    "user_name": "user_name",
    "phone_number": "phone_number",
}


def _get_list_queryset(query_params):
    """Build the safe, indexed filters shared by the paginated employee list."""
    if any(
        key == "address"
        or key.startswith("address__")
        or key.startswith("resident_number__")
        or key.startswith("resident_number_hash")
        for key in query_params
    ):
        return None, "Encrypted fields do not support partial filtering."

    queryset = User_Login_Info.objects.all()
    user_name = query_params.get("user_name", "").strip()
    phone_number = query_params.get("phone_number", "").strip()
    mobile_carrier = query_params.get("mobile_carrier", "").strip()
    user_uuid = query_params.get("user_uuid", "").strip()
    resident_number = query_params.get("resident_number", "").strip()

    if user_name:
        queryset = queryset.filter(user_name__icontains=user_name)
    if phone_number:
        queryset = queryset.filter(phone_number=phone_number)
    if mobile_carrier:
        queryset = queryset.filter(mobile_carrier__icontains=mobile_carrier)
    if user_uuid:
        try:
            UUID(user_uuid)
        except (TypeError, ValueError, AttributeError):
            return None, "user_uuid must be a valid UUID."
        queryset = queryset.filter(user_uuid=user_uuid)
    if resident_number:
        queryset = queryset.filter(
            resident_number_hash=resident_number_blind_index(resident_number)
        )

    return queryset, None


class UserInfoListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset, error = _get_list_queryset(request.query_params)
        if error:
            return Response({"success": False}, status=400)

        page_str = request.query_params.get("page", "1")
        ordering = request.query_params.get("ordering", "user_name")
        try:
            page_number = int(page_str)
            if page_number < 1:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"success": False},
                status=400,
            )

        descending = ordering.startswith("-")
        ordering_key = ordering[1:] if descending else ordering
        ordering_field = USER_LIST_ORDERING.get(ordering_key)
        if ordering_field is None:
            return Response(
                {"success": False},
                status=400,
            )

        order_by = f"-{ordering_field}" if descending else ordering_field
        queryset = queryset.order_by(order_by, "user_uuid")
        paginator = Paginator(queryset, USER_LIST_PAGE_SIZE)
        try:
            page = paginator.page(page_number)
        except EmptyPage:
            return Response(
                {"success": False},
                status=400,
            )

        return Response(
            {
                "success": True,
                "users": User_InfoSerializer(page.object_list, many=True).data,
                "pagination": {
                    "page": page.number,
                    "page_size": USER_LIST_PAGE_SIZE,
                    "total_count": paginator.count,
                    "total_pages": paginator.num_pages,
                },
            }
        )


class UserInfoDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_uuid = request.data.get("user_uuid")
        try:
            user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
            user_instance.delete()
            return Response({"success": True, "deleted_user_uuid": str(user_uuid)})

        except User_Login_Info.DoesNotExist:
            return Response({"success": False}, status=404)


class UserInfoUpdateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 사용자 정보 업데이트
        user_uuid = request.data.get("user_uuid")
        try:
            user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
            serializer = User_Login_InfoSerializer(
                user_instance, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "success": True,
                        "updated_user": User_InfoSerializer(user_instance).data,
                    }
                )
            return Response({"success": False, "errors": serializer.errors}, status=400)
        except User_Login_Info.DoesNotExist:
            return Response({"success": False}, status=404)


class UserInfoAddAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 새로운 사용자 생성
        serializer = User_Login_InfoSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"success": True, "created_user": User_InfoSerializer(user).data},
                status=201,
            )
        return Response({"success": False, "errors": serializer.errors}, status=400)


class UserInfoFilteringAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtering = request.query_params.dict()
        sorting = filtering.pop("sorting", None)

        sensitive_filter_keys = {
            key for key in filtering if key == "address" or key.startswith("address__")
            or key.startswith("resident_number__") or key.startswith("resident_number_hash")
        }
        if sensitive_filter_keys:
            return Response(
                {"success": False},
                status=400,
            )
        sort_field = sorting.lstrip("-") if sorting else ""
        if sort_field == "address" or sort_field.startswith("address__") or sort_field.startswith("resident_number"):
            return Response(
                {"success": False},
                status=400,
            )

        filters = {}
        for key, value in filtering.items():
            if key == "resident_number":
                filters["resident_number_hash"] = resident_number_blind_index(value)
                continue
            if isinstance(value, str):
                filters[f"{key}__icontains"] = value
            elif isinstance(value, (int, float)):
                filters[f"{key}__icontains"] = str(value)
            else:
                filters[key] = value

        queryset = User_Login_Info.objects.filter(**filters)
        if sorting:
            queryset = queryset.order_by(sorting)

        result = User_InfoSerializer(queryset, many=True).data

        return Response({"success": True, "data": result})
