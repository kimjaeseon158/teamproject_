# 공지사항 모델

import uuid

from django.db import models


class Notice(models.Model):
    class AuthorType(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    notice_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=500)
    author_type = models.CharField(max_length=5, choices=AuthorType.choices)
    author_uuid = models.UUIDField()
    author_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-notice_uuid"]


class NoticeRead(models.Model):
    user = models.ForeignKey(
        "User_Login_Info",
        on_delete=models.CASCADE,
        related_name="notice_reads",
    )
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name="read_records",
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "notice"],
                name="unique_notice_read_per_user",
            )
        ]
