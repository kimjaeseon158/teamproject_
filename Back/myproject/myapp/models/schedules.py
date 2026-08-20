# 직원 근무 일정 모델과 과거 파일 경로 함수

import uuid
from pathlib import Path
from django.db import models
from .accounts import Admin_Login_Info, User_Login_Info
from .work import AdminWorkPlace


class EmployeeWorkSchedule(models.Model):
    class Status(models.TextChoices):
        DAY = "DAY", "주간"
        NIGHT = "NIGHT", "야간"
        OFF = "OFF", "휴무"
        TRAINING = "TRAINING", "교육"

    schedule_uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",
        on_delete=models.CASCADE,
        related_name="work_schedules",
    )
    work_date = models.DateField(db_index=True)
    status = models.CharField(max_length=10, choices=Status.choices)
    admin_work_place = models.ForeignKey(
        AdminWorkPlace,
        to_field="admin_work_place_uuid",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employee_schedules",
    )
    work_place_name = models.CharField(max_length=100, blank=True, default="")
    work_place_detail = models.CharField(max_length=200, blank=True, default="")
    created_by = models.ForeignKey(
        Admin_Login_Info,
        to_field="admin_uuid",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_employee_schedules",
    )
    updated_by = models.ForeignKey(
        Admin_Login_Info,
        to_field="admin_uuid",
        on_delete=models.SET_NULL,
        null=True,
        related_name="updated_employee_schedules",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["work_date", "user__user_name", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "work_date",
                    "status",
                    "work_place_name",
                    "work_place_detail",
                ],
                name="uniq_employee_schedule_exact",
            )
        ]


def work_schedule_original_upload_to(instance, filename):
    extension = Path(filename).suffix.lower()
    schedule_date = instance.schedule_date
    return (
        f"work_schedules/{schedule_date:%Y}/{schedule_date:%Y-%m}/"
        f"originals/{uuid.uuid4()}{extension}"
    )


def work_schedule_preview_upload_to(instance, filename):
    schedule_date = instance.schedule.schedule_date
    return (
        f"work_schedules/{schedule_date:%Y}/{schedule_date:%Y-%m}/"
        f"previews/{uuid.uuid4()}.png"
    )
