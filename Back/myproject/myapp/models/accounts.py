# 사용자와 관리자 계정 및 비밀번호 재설정 모델

import uuid
from django.contrib.auth.hashers import make_password
from django.db import models
from django.db.models import Q
from ..encryption.crypto import resident_number_blind_index
from ..encryption.fields import EncryptedTextField


class User_Login_Info(models.Model):
    user_uuid            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name            = models.CharField(max_length=50, default='홍길동')   # 유저 이름
    user_id              = models.CharField(max_length=50,unique=True)
    password             = models.CharField(max_length=100, default='1234')
    must_change_password = models.BooleanField(default=True)
    phone_number         = models.CharField(max_length=20)
    mobile_carrier       = models.CharField(max_length=20)
    resident_number      = EncryptedTextField()
    resident_number_hash = models.CharField(max_length=64, unique=True, editable=False)
    address              = EncryptedTextField()
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['phone_number'],    name='unique_phone_number'),
        ]

    def save(self, *args, **kwargs):
        self.resident_number_hash = resident_number_blind_index(self.resident_number)
        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            kwargs["update_fields"] = set(update_fields) | {"resident_number_hash"}
        # 비밀번호가 해시되지 않은 상태일 때만 해시
        if not self.password.startswith('pbkdf2_'):  # Django 기본 prefix 체크
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    @property
    def is_authenticated(self):
        # 🌟 인증된 사용자는 True를 반환해야 합니다.
        return True 
    
    @property
    def is_active(self):
        # 🌟 계정 활성화 상태를 나타냅니다.
        return True


class Admin_Login_Info(models.Model):
    admin_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_name = models.CharField(max_length=50)                         # 관리자 이름
    admin_id   = models.CharField(max_length=50, unique=True)            # 관리자 ID
    password   = models.CharField(max_length=100)                        # 관리자 비밀번호
    admin_code = models.CharField(max_length=20)                         # 설정한 인증번호

    def save(self, *args, **kwargs):
        # 비밀번호가 해시되지 않은 상태일 때만 해시
        if not self.password.startswith('pbkdf2_'):  # Django 기본 prefix 체크
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    @property
    def is_authenticated(self):
        # 🌟 인증된 사용자는 True를 반환해야 합니다.
        return True 
    
    @property
    def is_active(self):
        # 🌟 계정 활성화 상태를 나타냅니다.
        return True


class PasswordResetRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"

    request_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",
        on_delete=models.CASCADE,
        related_name="password_reset_requests",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["requested_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(status="PENDING"),
                name="unique_pending_password_reset_per_user",
            )
        ]
