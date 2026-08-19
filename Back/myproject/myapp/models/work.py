# 근무일·근무 상세·근무지·급여율 모델

import uuid
from django.db import models
from django.db.models import Q
from .accounts import Admin_Login_Info, User_Login_Info


class User_WorkDay(models.Model):
    user_uuid = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",        # UUID 컬럼을 참조
        on_delete=models.CASCADE,
        null=False,                   
        related_name="workdays",
    )
    work_shift      = models.CharField(max_length=2)                            # "주간", "야간"
    user_name       = models.CharField(max_length=50)                           # 유저 이름
    work_date       = models.DateField()                                        # 근무 날짜
    work_start      = models.DateTimeField()                                    # 작업 시작 시간 (시간만)
    work_end        = models.DateTimeField()                                    # 작업 종료 시간 (시간만)
    work_place      = models.CharField(max_length=100)                          # 근무 장소
    note            = models.CharField(max_length=200, blank=True, default="")  # 비고란
    is_approved     = models.BooleanField(null=True,blank=True)                 # 승인 여부 (None=미처리)
    reject_reason   = models.TextField(null=True,blank=True)                    # 반려 사유

    # FK값 -> PK값 파싱 클래스 단순화
    @property
    def user_uuid_str(self):
        return str(self.user_uuid_id)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_uuid", "work_date", "work_shift"],
                condition=Q(is_approved__isnull=True) | Q(is_approved=True),
                name="uniq_user_date_shift_not_rejected",
            )
        ]


class User_WorkDetail(models.Model):
    user_uuid            = models.UUIDField()
    work_date            = models.ForeignKey(User_WorkDay, on_delete=models.CASCADE,related_name="details")
    work_type            = models.CharField(max_length=20)                               # DAY, NIGHT, OVERTIME, MEAL_OT 등
    minutes              = models.PositiveIntegerField()                                 # 근무 시간 (분)
    is_overtime_approved = models.BooleanField(default=False)


class WorkPlaceRate(models.Model):
    rate_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "User_Login_Info",
        to_field="user_uuid",
        on_delete=models.CASCADE,
        related_name="rates",
    )
    work_place = models.CharField(max_length=100)                       #  근무지 마다 금액이 다를경우 대비

    #  전부 시간당 단가
    base_hourly_wage          = models.PositiveIntegerField(null=True, blank=True)  # 기본 시급
    overtime_hourly_wage      = models.PositiveIntegerField(null=True, blank=True)  # 잔업(연장)
    meal_ot_hourly_wage       = models.PositiveIntegerField(null=True, blank=True)  # 중식연장
    special_hourly_wage       = models.PositiveIntegerField(null=True, blank=True)  # 특근
    day_special_hourly_wage   = models.PositiveIntegerField(null=True, blank=True)  # 주간 특근
    night_special_hourly_wage = models.PositiveIntegerField(null=True, blank=True)  # 야간 특근
    overnight_hourly_wage     = models.PositiveIntegerField(null=True, blank=True)  # 야간(기본)
    overnight_ot_hourly_wage  = models.PositiveIntegerField(null=True, blank=True)  # 야간 잔업(OT)
    early_hourly_wage         = models.PositiveIntegerField(null=True, blank=True)  # 조기출근

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "work_place"], name="uniq_user_work_place_rate")
        ]                       

    @property
    def user_uuid_str(self):
        return str(self.user_id) if self.user_id else None

    @property
    def user_name(self):
        return self.user.user_name if self.user else None


class AdminWorkPlace(models.Model):
    admin_work_place_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(
        Admin_Login_Info,
        to_field="admin_uuid",
        on_delete=models.CASCADE,
        related_name="work_places",
    )
    work_place = models.CharField(max_length=100)

    base_hourly_wage          = models.PositiveIntegerField(null=True, blank=True)
    overtime_hourly_wage      = models.PositiveIntegerField(null=True, blank=True)
    meal_ot_hourly_wage       = models.PositiveIntegerField(null=True, blank=True)
    special_hourly_wage       = models.PositiveIntegerField(null=True, blank=True)
    day_special_hourly_wage   = models.PositiveIntegerField(null=True, blank=True)
    night_special_hourly_wage = models.PositiveIntegerField(null=True, blank=True)
    overnight_hourly_wage     = models.PositiveIntegerField(null=True, blank=True)
    overnight_ot_hourly_wage  = models.PositiveIntegerField(null=True, blank=True)
    early_hourly_wage         = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["admin", "work_place"], name="uniq_admin_work_place")
        ]
        ordering = ["work_place"]

    @property
    def admin_uuid_str(self):
        return str(self.admin_id) if self.admin_id else None
