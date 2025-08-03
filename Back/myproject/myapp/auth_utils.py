from django.contrib.auth.hashers import check_password
from .models import User_Login_Info, Admin_Login_Info
from .serializers import User_InfoSerializer

def check_user_credentials(user_id, password):
    try:
        user = User_Login_Info.objects.get(user_id=user_id)
        if check_password(password, user.password):  # 평문 vs 해시 비교
            return True, user.user_name, user.employee_number
    except User_Login_Info.DoesNotExist:
        pass
    return False, None, None

def check_admin_credentials(admin_id, password, admin_code):
    try:
        admin = Admin_Login_Info.objects.get(admin_id=admin_id)
        if check_password(password, admin.password) and admin.admin_code == admin_code:
            # 로그인 성공 시, user_id 매칭되는 사용자 정보 가져오기
            all_users     = User_Login_Info.objects.all()
            all_user_data = User_InfoSerializer(all_users, many=True)
            
            return True, all_user_data.data
    except (Admin_Login_Info.DoesNotExist, User_Login_Info.DoesNotExist):
        pass
    return False, None