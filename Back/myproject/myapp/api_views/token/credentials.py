# 관리자·사용자 로그인 자격 증명 검사 함수

from django.contrib.auth.hashers import check_password
from django.db import transaction
from ...models import Admin_Login_Info, User_Login_Info


def check_user_credentials(user_id, password):
    if not isinstance(user_id, str) or not user_id or len(user_id) > 50:
        return False, None, None, 0
    if not isinstance(password, str) or not password:
        return False, None, None, 0

    with transaction.atomic():
        try:
            user = User_Login_Info.objects.select_for_update().get(user_id=user_id)
        except User_Login_Info.DoesNotExist:
            return False, None, None, 0

        if check_password(password, user.password):
            User_Login_Info.objects.filter(pk=user.pk).update(failed_login_attempts=0)
            return True, user.user_name, user.user_uuid, 0

        attempts = min(user.failed_login_attempts + 1, 20)
        User_Login_Info.objects.filter(pk=user.pk).update(failed_login_attempts=attempts)
        return False, None, None, attempts


def check_admin_credentials(admin_id, password, admin_code):
    try:
        admin = Admin_Login_Info.objects.get(admin_id=admin_id)
        if check_password(password, admin.password) and admin.admin_code == admin_code:
            return True, admin.admin_uuid
    except Admin_Login_Info.DoesNotExist:
        pass
    return False, None
