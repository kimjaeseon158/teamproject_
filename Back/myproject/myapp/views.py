# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status

from .serializers import User_Login_InfoSerializer, User_InfoSerializer, User_Work_InfoSerializer
from .auth_utils import check_user_credentials, check_admin_credentials
from .jwt_utils import CookieJWTAuthentication
from .models import User_Login_Info, Admin_Login_Info

# ----------------------
# 1️⃣ 관리자 로그인
# ----------------------
class CheckAdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        admin_id   = request.data.get('id')
        password   = request.data.get('password')
        admin_code = request.data.get('admin_code')

        success, user_data = check_admin_credentials(admin_id, password, admin_code)

        if success:
            admin_instance = Admin_Login_Info.objects.get(admin_id=admin_id)

            refresh = RefreshToken()
            refresh['admin_id']   = admin_instance.admin_id
            refresh['admin_name'] = admin_instance.admin_name
            refresh['role']       = 'admin'
            access = refresh.access_token

            response = Response({
                'success': True,
                'user_data': user_data,
                'access'   : str(access),
                'refresh': str(refresh)
            })

            # http-only 쿠키로 access token 전달
            response.set_cookie(
                key="access_token",
                value=str(access),
                httponly=True,
                secure=False,  # 개발 환경
                samesite='Lax'
            )
            return response

        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------
# 2️⃣ 일반 유저 로그인
# ----------------------
class UserLoginInfoAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        serializer = User_Login_InfoSerializer(data=data)
        if serializer.is_valid():
            user_instance = serializer.save()
            
            refresh = RefreshToken.for_user(user_instance)
            access = refresh.access_token

            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)

            response = Response({
                'success': True,
                'user_data': user_data.data,
                'refresh': str(refresh)
            })

            response.set_cookie(
                key="access_token",
                value=str(access),
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            return response

        return Response({'success': False})


# ----------------------
# 2 데이터 처리 뷰
# ----------------------
class UserWorkInfoAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    
    def post(self, request):
        data = request.data
        serializer = User_Work_InfoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})
        return Response({'success': False})    
                         
class UserInfoDeleteAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]


    def post(self, request):
        employee_number = request.data.get('employee_number')
        try:
            user = User_Login_Info.objects.get(employee_number=employee_number)
            user.delete()
            all_data = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)
            return Response({'success': True, 'user_data': user_data.data})
        except User_Login_Info.DoesNotExist:
            return Response({'success': False})
        
class UserInfoUpdateAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]    

    def post(self, request):
        employee_number = request.data.get('employee_number')
        try:
            user = User_Login_Info.objects.get(employee_number=employee_number)
            serializer = User_Login_InfoSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                return Response({'success': True, 'user_data': user_data.data})
            return Response({'success': False})
        except User_Login_Info.DoesNotExist:
            return Response({'success': False})

class CheckUserLoginAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        user_id = request.data.get('id')
        password = request.data.get('password')
        success, user_name, employee_number = check_user_credentials(user_id, password)
        if success:
            return Response({
                'success': True,
                'user_name': user_name,
                'employee_number': employee_number
            })
        return Response({'success': False})

class TableFilteringAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        try:
            # 이제 user가 request.user로 접근 가능
            user = request.user

            filtering = request.data.get('filtering', {})
            sorting = request.data.get('sorting')

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
            return Response({'success': True, 'data': result}, status=200)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
