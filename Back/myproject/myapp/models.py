import uuid
from django.db import models
from django.contrib.auth.hashers import make_password
from django.db.models import Q



# fmt:off
# User 관련 테이블
class User_Login_Info(models.Model):
    user_uuid       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name       = models.CharField(max_length=50, default='홍길동')   # 유저 이름
    user_id         = models.CharField(max_length=50,unique=True)
    password        = models.CharField(max_length=100, default='1234')
    phone_number    = models.CharField(max_length=20)
    mobile_carrier  = models.CharField(max_length=20)
    resident_number = models.CharField(max_length=14)
    address         = models.CharField(max_length=200)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['resident_number'], name='unique_resident_number'),
            models.UniqueConstraint(fields=['phone_number'],    name='unique_phone_number'),
        ]

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

class User_WorkDay(models.Model):
    user_uuid = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",        # UUID 컬럼을 참조
        on_delete=models.CASCADE,
        null=False,                   
        related_name="workdays",
    )
    work_shift      = models.CharField(max_length=2)                        # "주간", "야간"
    user_name       = models.CharField(max_length=50)                       # 유저 이름
    work_date       = models.DateField()                                    # 근무 날짜
    work_start      = models.DateTimeField()                                # 작업 시작 시간 (시간만)
    work_end        = models.DateTimeField()                                # 작업 종료 시간 (시간만)
    work_place      = models.CharField(max_length=100)                      # 근무 장소
    is_approved     = models.BooleanField(null=True,blank=True)             # 승인 여부 (None=미처리)
    reject_reason   = models.TextField(null=True,blank=True)                # 반려 사유

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
    is_overtime_approved = models.BooleanField(default=False)                            # 특근 여부


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


# Admin 관련 테이블 

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

# 수입 매출 관련 테이블

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


class Income(models.Model):
    Income_uuid    = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    date           = models.DateField()                                                      # 매출 날짜
    company_name   = models.CharField(max_length=100)                                        # 업체명 (자유 입력)
    company_detail = models.CharField(max_length=100,blank=True,null=True)                   # 업체명 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 매출 금액 (정수)

class Expense(models.Model):
    expense_uuid   = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    date           = models.DateField()                                                      # 지출 날짜
    expense_name   = models.CharField(max_length=100)                                        # 지출명 (대분류, 자유 입력)
    expense_detail = models.CharField(max_length=100, blank=True, null=True)                 # 지출 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 지출 금액 (정수)
    # 급여 지출의 출처 , Expense에 저장된 work_day(FK)로 User_WorkDay를 조회
    work_day = models.OneToOneField(
        "User_WorkDay",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="salary_expense",
    )

# Token 저장 테이블

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

# fmt:on
