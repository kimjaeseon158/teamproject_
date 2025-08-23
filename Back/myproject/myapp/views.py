# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .serializers import User_Login_InfoSerializer, User_Work_InfoSerializer, User_InfoSerializer
from .auth_utils import check_user_credentials, check_admin_credentials
from .models import User_Login_Info, Admin_Login_Info


# ----------------------
# 1관리자 로그인 뷰
# ----------------------
class CheckAdminLoginAPIView(APIView):
    permission_classes = [AllowAny]  # 로그인은 인증 없이 접근 가능

    def post(self, request):
        admin_id   = request.data.get('id')
        password   = request.data.get('password')
        admin_code = request.data.get('admin_code')

        success, user_data = check_admin_credentials(admin_id, password, admin_code)

        if success:
            # 실제 admin 객체 가져오기
            admin_instance = Admin_Login_Info.objects.get(admin_id=admin_id)

            # JWT 토큰 생성
            refresh = RefreshToken()
            refresh['admin_id']   = admin_instance.admin_id
            refresh['admin_name'] = admin_instance.admin_name
            refresh['role']       = 'admin'  # 필요시 payload 추가
            access = refresh.access_token

            return Response({
                'success'   : True,
                'user_data' : user_data,
                'access'    : str(access),
                'refresh'   : str(refresh)
            }, status=status.HTTP_200_OK)
        else:
            return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------
# 2️⃣ 기존 데이터 처리 뷰
# ----------------------
class BaseModelHandler(APIView):
    permission_classes = [IsAuthenticated]  # 로그인 후 토큰 필요

    def handle_data(self, data_type, data):
        # User 관련 처리
        if data_type == 'user_login_info':
            serializer = User_Login_InfoSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                success = True
            else:
                success = False
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            return {'success': success, 'user_data': user_data.data}, None

        elif data_type == 'user_work_info':
            serializer = User_Work_InfoSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return {'success': True}, None
            return None, {'success': False}

        elif data_type == 'user_info_delete':
            employee_number = data.get('employee_number')
            try:
                user = User_Login_Info.objects.get(employee_number=employee_number)
                user.delete()
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                return {'success': True, 'user_data': user_data.data}, None
            except User_Login_Info.DoesNotExist:
                return None, {'success': False}

        elif data_type == 'user_info_update':
            employee_number = data.get('employee_number')
            try:
                user = User_Login_Info.objects.get(employee_number=employee_number)
                serializer = User_Login_InfoSerializer(user, data=data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    all_data = User_Login_Info.objects.all()
                    user_data = User_InfoSerializer(all_data, many=True)
                    return {'success': True, 'user_data': user_data.data}, None
                return None, {'success': False}
            except User_Login_Info.DoesNotExist:
                return None, {'success': False}

        # User 로그인 처리
        elif data_type == 'check_user_login':
            user_id = data.get('id')
            password = data.get('password')
            success, user_name, employee_number = check_user_credentials(user_id, password)
            if success:
                return {'success': True, 'user_name': user_name, 'employee_number': employee_number}, None
            return None, {'success': False}

        # 테이블 필터링
        elif data_type == 'table_filtering':
            filtering = data.get('filtering', {})
            sorting = data.get('sorting')
            try:
                filters = {}
                for key, value in filtering.items():
                    if isinstance(value, str):
                        filters[f'{key}__icontains'] = value
                    elif isinstance(value, (int, float)):
                        filters[f'{key}__icontains'] = str(value)
                    else:
                        filters[key] = value

                queryset = User_Login_Info.objects.filter(**filters)
                if sorting:
                    queryset = queryset.order_by(sorting)
                result = list(queryset.values())
                return {'success': True, 'data': result}, None
            except Exception:
                return None, {'success': False}

        return None, {'success': False}


class ItemUserProfileHandler(BaseModelHandler):
    # permission_classes는 BaseModelHandler에서 상속
    def post(self, request):
        data_type = request.data.get('data_type')
        serializer, instance = self.handle_data(data_type, request.data.get('data'))

        if serializer:
            response_data = serializer.data if hasattr(serializer, 'data') else serializer
            return Response({
                'message': f'{data_type} 처리 완료!',
                'data': response_data
            }, status=status.HTTP_200_OK)

        return Response(instance, status=status.HTTP_400_BAD_REQUEST)
