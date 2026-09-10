# 공지사항 모델

import uuid
from pathlib import Path

from django.db import models


def notice_image_upload_to(instance, filename):
    extension = Path(filename).suffix.lower()
    return f"notices/{instance.notice_id}/{instance.image_uuid}{extension}"


class Notice(models.Model):
    class AuthorType(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    notice_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    content = models.TextField()
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


class NoticeImage(models.Model):
    image_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to=notice_image_upload_to)
    display_order = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "created_at", "image_uuid"]
        constraints = [
            models.UniqueConstraint(
                fields=["notice", "display_order"],
                name="unique_notice_image_display_order",
            )
        ]
