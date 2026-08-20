# 사용자와 관리자 refresh token 모델

from django.db import models
from .accounts import Admin_Login_Info, User_Login_Info


class AdminRefreshToken(models.Model):
    """관리자 전용 리프레시 토큰"""

    admin_uuid = models.ForeignKey(
        Admin_Login_Info,
        to_field="admin_uuid",
        on_delete=models.CASCADE,
        null=False,   # 처음엔 null 허용
        related_name="refresh_tokens",
    )
    hashed_token = models.CharField(max_length=255, unique=True, editable=False)
    expires_at   = models.DateTimeField()
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):    # 디버깅용 코드 차후 삭제 고려
        return f"Admin Token for {self.admin_uuid.admin_name}"


class UserRefreshToken(models.Model):
    """일반 유저(Employee) 전용 리프레시 토큰"""
    user_uuid = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",        # UUID 컬럼을 참조
        on_delete=models.CASCADE,
        null=False,                   # 처음엔 null 허용 (데이터 이관 때문에)
        related_name="refresh_tokens",
    )
    
    hashed_token = models.CharField(max_length=255, unique=True, editable=False)
    expires_at   = models.DateTimeField()
    created_at   = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):    # 디버깅용 코드 차후 삭제 고려
        return f"User Token for {self.user.user_name}"
