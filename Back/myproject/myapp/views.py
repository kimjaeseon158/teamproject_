# views.py
from rest_framework.views                import APIView
from rest_framework.response             import Response
from rest_framework_simplejwt.exceptions import TokenError    
from rest_framework_simplejwt.tokens     import RefreshToken, AccessToken
from rest_framework.permissions          import AllowAny
from rest_framework.exceptions           import AuthenticationFailed
from rest_framework                      import status

from .serializers     import User_Login_InfoSerializer, User_InfoSerializer, User_Work_InfoSerializer, IncomeSerializer, ExpenseSerializer
from .auth_utils      import check_user_credentials, check_admin_credentials
from .jwt_utils       import get_user_from_cookie, get_user_from_token, CustomRefreshToken
from .models          import User_Login_Info, Admin_Login_Info,Expense, Income
from django.db.models import Sum
from datetime         import datetime


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
        admin_id   = request.data.get('id')
        password   = request.data.get('password')
        admin_code = request.data.get('admin_code')

        success = check_admin_credentials(admin_id, password, admin_code)

        if success:
            admin_instance = Admin_Login_Info.objects.get(admin_id=admin_id)

            # ✅ 원하는 값으로 토큰 생성 (id 대신 admin_id 사용)
            refresh = CustomRefreshToken.for_subject(
                subject_value=admin_instance.admin_id,
                admin_name=admin_instance.admin_name,
                role="admin"
            )
            access = refresh.access_token

            response = Response({
                'success': True,
                'access' : str(access),
                'refresh': str(refresh)
            })

            response.set_cookie("access_token", str(access),
                                httponly=True, secure=False, samesite='Lax', path='/')
            response.set_cookie("refresh_token", str(refresh),
                                httponly=True, secure=False, samesite='Lax', path='/')
            return response

        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------
# 2️⃣ 일반 유저 로그인
# ----------------------
class CheckUserLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id  = request.data.get('user_id')
        password = request.data.get('password')

        success, user_name, employee_number = check_user_credentials(user_id, password)

        if success:
            user_instance = User_Login_Info.objects.get(employee_number=employee_number)

            # ✅ id 대신 employee_number를 sub에 넣고, user_name, role도 추가
            refresh = CustomRefreshToken.for_subject(
                subject_value=employee_number,   # PK 대신 employee_number를 사용
                user_name=user_name,
                role="user"
            )
            access = refresh.access_token

            response = Response({
                'success'        : True,
                'user_name'      : user_name,
                'employee_number': employee_number,
                'access'         : str(access),                
                'refresh'        : str(refresh)
            })

            response.set_cookie("access_token",  str(access),  httponly=True, secure=False, samesite='Lax')
            response.set_cookie("refresh_token", str(refresh), httponly=True, secure=False, samesite='Lax')
            return response

        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)

# ----------------------
# 2 데이터 처리 뷰
# ----------------------
class UserInfoListAPIView(APIView):
    def get(self, request):
        try:
            try:
                # 1️⃣ Access Token 확인
                user = get_user_from_cookie(request)

                # 2️⃣ 유저 정보 가져오기
                users = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(users, many=True)

                return Response({'success': True, 'users': user_data.data})

            except AuthenticationFailed:
                
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


class UserWorkInfoAPIView(APIView):
    def post(self, request):
        try:
            try:
                # 1️⃣ Access Token 확인
                user = get_user_from_cookie(request)

                # 2️⃣ 작업 정보 등록
                data = request.data
                serializer = User_Work_InfoSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response({'success': True})
                else:
                    return Response({'success': False})

            except AuthenticationFailed:
                
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)  


class UserInfoDeleteAPIView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

            # 2️⃣ 사용자 삭제
            employee_number = request.data.get('employee_number')
            try:
                user_instance = User_Login_Info.objects.get(employee_number=employee_number)
                user_instance.delete()
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                result = user_data.data
                success = True

            except User_Login_Info.DoesNotExist:
                result = {}
                success = False

            return Response({'success': success, 'user_data': result})

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
        

class UserInfoUpdateAPIView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

            # 2️⃣ 사용자 정보 업데이트
            employee_number = request.data.get('employee_number')
            try:
                user_instance = User_Login_Info.objects.get(employee_number=employee_number)
                serializer = User_Login_InfoSerializer(user_instance, data=request.data, partial=True)
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

            # 3️⃣ 최종 반환
            return Response({'success': success, 'user_data': result})

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


class UserInfoAddAPIView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

            # 2️⃣ 새로운 사용자 생성
            serializer = User_Login_InfoSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                all_data = User_Login_Info.objects.all()
                user_data = User_InfoSerializer(all_data, many=True)
                result = user_data.data
                success = True
            else:
                result = serializer.errors
                success = False

            # 3️⃣ 최종 반환
            return Response({'success': success, 'user_data': result}, status=201 if success else 400)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


class UserInfoFilteringAPIView(APIView):
    def post(self, request):
        try:
            try:
                user = get_user_from_cookie(request)
                
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
                return Response({'success': True, 'data': result})

            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
        

class FinanceTableDateFilteredAPIView(APIView):
    def post(self, request):
        try:
            try:
                # 사용자 인증
                user = get_user_from_cookie(request)

                # 프론트에서 날짜 범위 받기
                start_date_str = request.data.get('start_date')
                end_date_str = request.data.get('end_date')

                if not start_date_str or not end_date_str:
                    return Response({'success': False, 'message': 'start_date and end_date are required'}, status=400)

                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

                # 1️⃣ Expense 합계 (날짜 필터링)
                expense_qs = Expense.objects.filter(date__gte=start_date, date__lte=end_date) \
                                            .values('expense_name') \
                                            .annotate(total_amount=Sum('amount'))
                expense_totals = {item['expense_name']: item['total_amount'] for item in expense_qs}

                # 2️⃣ Income 합계 (날짜 필터링)
                income_qs = Income.objects.filter(date__gte=start_date, date__lte=end_date) \
                                          .values('company_name') \
                                          .annotate(total_amount=Sum('amount'))
                income_totals = {item['company_name']: item['total_amount'] for item in income_qs}

                result = {
                    'expense_totals': expense_totals,
                    'income_totals': income_totals
                }

                return Response({'success': True, 'data': result})

            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
        

class ExpenseAddAPIView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

            # 2️⃣ 새로운 지출 추가
            serializer = ExpenseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                result = serializer.data
                success = True
            else:
                result = serializer.errors
                success = False

            # 3️⃣ 최종 반환
            return Response({'success': success, 'expense_data': result}, status=201 if success else 400)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
        

class IncomeAddAPIView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Access Token 확인
            try:
                user = get_user_from_cookie(request)
            except AuthenticationFailed:
                return Response({'success': False, 'message': 'Authentication failed'}, status=401)

            # 2️⃣ 새로운 매출 추가
            serializer = IncomeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                result = serializer.data
                success = True
            else:
                result = serializer.errors
                success = False

            # 3️⃣ 최종 반환
            return Response({'success': success, 'income_data': result}, status=201 if success else 400)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
        

