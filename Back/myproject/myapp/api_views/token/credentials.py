# 관리자·사용자 로그인 자격 증명 검사 함수

from django.contrib.auth.hashers import check_password
from ...models import Admin_Login_Info, User_Login_Info


def check_user_credentials(user_id, password):
    try:
        user = User_Login_Info.objects.get(user_id=user_id)
        if check_password(password, user.password):  # 평문 vs 해시 비교
            return True, user.user_name, user.user_uuid
    except User_Login_Info.DoesNotExist:
        pass
    return False, None, None


def check_admin_credentials(admin_id, password, admin_code):
    try:
        admin = Admin_Login_Info.objects.get(admin_id=admin_id)
        if check_password(password, admin.password) and admin.admin_code == admin_code:
            return True, admin.admin_uuid
    except Admin_Login_Info.DoesNotExist:
        pass
    return False, None
