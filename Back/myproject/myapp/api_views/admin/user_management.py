# 관리자 사용자 관리

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...serializers import User_InfoSerializer
from ...models import User_Login_Info
from ...serializers import User_Login_InfoSerializer
from ..token import AdminJWTAuthentication
from ...encryption.crypto import resident_number_blind_index

class UserInfoListAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 유저 정보 가져오기
        users = User_Login_Info.objects.all()
        user_data = User_InfoSerializer(users, many=True)

        return Response({"success": True, "users": user_data.data})


class UserInfoDeleteAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_uuid = request.data.get("user_uuid")
        try:
            user_instance = User_Login_Info.objects.get(user_uuid=user_uuid)
            user_instance.delete()
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            result = user_data.data
            success = True

        except User_Login_Info.DoesNotExist:
            result = {}
            success = False

        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


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
                # 업데이트 후 전체 유저 데이터 가져오기
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                result = user_data.data
                success = True
            else:
                result = {}
                success = False
        except User_Login_Info.DoesNotExist:
            result = {}
            success = False

        # 최종 반환
        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


class UserInfoAddAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 새로운 사용자 생성
        serializer = User_Login_InfoSerializer(data=request.data)
        if serializer.is_valid():
            # 유저 생성
            serializer.save()
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            result = user_data.data
            success = True
        else:
            result = serializer.errors
            success = False

        # 최종 반환
        return Response(
            {"success": success, "user_data": result}
            if success
            else {"success": success}
        )


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
                {"success": False, "error": "Encrypted fields do not support partial filtering."},
                status=400,
            )
        sort_field = sorting.lstrip("-") if sorting else ""
        if sort_field == "address" or sort_field.startswith("address__") or sort_field.startswith("resident_number"):
            return Response(
                {"success": False, "error": "Encrypted fields do not support sorting."},
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

