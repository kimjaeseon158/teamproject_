# views.py
from rest_framework.views                import APIView
from rest_framework.response             import Response
from rest_framework_simplejwt.exceptions import TokenError    
from rest_framework_simplejwt.tokens     import RefreshToken, AccessToken
from rest_framework.permissions          import AllowAny
from rest_framework.exceptions           import AuthenticationFailed
from rest_framework                      import status

from .serializers import User_Login_InfoSerializer, User_InfoSerializer, User_Work_InfoSerializer
from .auth_utils  import check_user_credentials, check_admin_credentials
from .jwt_utils   import get_user_from_cookie, get_user_from_token
from .models      import User_Login_Info, Admin_Login_Info


# ------------------- Refresh API -------------------
class TokenRefreshAPIView(APIView):
    permission_classes = []  # 인증 필요 없음

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({'success': False, 'message': 'Refresh token missing'}, status=401)

        try:
            refresh_obj = RefreshToken(refresh_token)
            new_access = refresh_obj.access_token

            response = Response({'success': True})
            response.set_cookie("access_token", str(new_access), httponly=True, secure=False, samesite='Lax')
            return response
        except Exception:
            return Response({'success': False, 'message': 'Invalid refresh token'}, status=401) 
        
# ----------------------
# 1️⃣ 관리자 로그인
# ----------------------
class CheckAdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("test")
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
            response.set_cookie("access_token",  str(access),  httponly=True, secure=False, samesite='Lax', path='/')
            response.set_cookie("refresh_token", str(refresh), httponly=True, secure=False, samesite='Lax', path='/')
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
            access  = refresh.access_token

            all_data  = User_Login_Info.objects.all()
            user_data = User_InfoSerializer(all_data, many=True)

            response = Response({
                'success': True,
                'user_data': user_data.data,
                'refresh': str(refresh)
            })

            response.set_cookie("access_token",  str(access),  httponly=True, secure=False, samesite='Lax')
            response.set_cookie("refresh_token", str(refresh), httponly=True, secure=False, samesite='Lax')

            return response

        return Response({'success': False})


# ----------------------
# 2 데이터 처리 뷰
# ----------------------
class UserWorkInfoAPIView(APIView):
    def post(self, request):
        user = get_user_from_cookie(request)
        
        data = request.data
        serializer = User_Work_InfoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})
        return Response({'success': False})    
                         
class UserInfoDeleteAPIView(APIView):
    def post(self, request):
        user = get_user_from_cookie(request)
        
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
    def post(self, request):
        user = get_user_from_cookie(request)
        
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
    def post(self, request):
        user = get_user_from_cookie(request)
        
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
    """
    Access Token 만료 시 Refresh Token으로 자동 갱신 후 요청 처리
    """
    def post(self, request):
        try:
            user = None
            new_access_response = None

            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                # ⬇️ 이 부분을 추가/수정하세요.
                print("--- AUTHENTICATION FAILED ---")
                print("Cookies received by Django:", request.COOKIES) # 이 로그를 반드시 확인하세요!
                
                refresh_token = request.COOKIES.get("refresh_token")
                if not refresh_token:
                    return Response({'success': False, 'message': 'Authentication failed'}, status=401)

                try:
                    refresh_obj = RefreshToken(refresh_token)
                    new_access = refresh_obj.access_token

                    # 새 Access Token 쿠키 세팅
                    new_access_response = Response()
                    new_access_response.set_cookie(
                        key="access_token",
                        value=str(new_access),
                        httponly=True,
                        secure=False,  # 개발 환경
                        samesite='Lax',
                        path='/'
                    )

                    # 새 토큰으로 사용자 인증
                    user = get_user_from_token(str(new_access))

                except TokenError:
                    return Response({'success': False, 'message': 'Refresh token expired'}, status=401)

            # 2️⃣ 필터링 및 정렬 처리
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

            # 3️⃣ 새 Access Token 쿠키가 있는 경우 통합 반환
            if new_access_response:
                new_access_response.data = {'success': True, 'data': result}
                return new_access_response

            return Response({'success': True, 'data': result})

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)