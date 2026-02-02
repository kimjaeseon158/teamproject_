import uuid
from django.db import models
from django.contrib.auth.hashers import make_password
from .unique_serial import generate_unique_serial


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
    user_name       = models.CharField(max_length=50)                               # 유저 이름
    work_date       = models.DateField()                                            # 근무 날짜
    work_start      = models.DateTimeField()                                        # 작업 시작 시간 (시간만)
    work_end        = models.DateTimeField()                                        # 작업 종료 시간 (시간만)
    work_place      = models.CharField(max_length=100)                              # 근무 장소
    is_approved     = models.BooleanField(null=True,blank=True)                     # 승인 여부 (None=미처리)
    reject_reason   = models.TextField(null=True,blank=True)                        # 반려 사유

    # FK값 -> PK값 파싱 클래스 단순화
    @property
    def user_uuid_str(self):
        return str(self.user_uuid_id)


class User_WorkDetail(models.Model):
    user_uuid = models.UUIDField()
    work_date = models.ForeignKey(User_WorkDay, on_delete=models.CASCADE,related_name="details")
    work_type = models.CharField(max_length=20)                               # DAY, NIGHT, OVERTIME, MEAL_OT 등
    minutes   = models.PositiveIntegerField()                                 # 근무 시간 (분)


class User_Work_Pay(models.Model):
    user_uuid = models.ForeignKey(
        User_Login_Info,
        to_field="user_uuid",        # UUID 컬럼을 참조
        on_delete=models.CASCADE,
        null=False,                   
        related_name="work_pays",
    )
    company         = models.CharField(max_length=50)                               # 회사명
    daily_wages     = models.IntegerField()                                         # 일급



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

class Income(models.Model):
    date           = models.DateField()                                                      # 매출 날짜
    company_name   = models.CharField(max_length=100)                                        # 업체명 (자유 입력)
    company_detail = models.CharField(max_length=100,blank=True,null=True)                   # 업체명 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 매출 금액 (정수)
    serial_number  = models.IntegerField(primary_key=True)    # 새 레코드 생성 시 자동 값 중복되지 않음 고유번호 저장 

    def save(self, *args, **kwargs):
        if not self.serial_number:
            self.serial_number = generate_unique_serial(Income)
        super().save(*args, **kwargs)


class Expense(models.Model):
    date           = models.DateField()                                                      # 지출 날짜
    expense_name   = models.CharField(max_length=100)                                        # 지출명 (대분류, 자유 입력)
    expense_detail = models.CharField(max_length=100, blank=True, null=True)                 # 지출 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 지출 금액 (정수)
    serial_number  = models.IntegerField(primary_key=True)    # 새 레코드 생성 시 자동 값 중복되지 않음 고유번호 저장 

    def save(self, *args, **kwargs):
        if not self.serial_number:
            self.serial_number = generate_unique_serial(Expense)
        super().save(*args, **kwargs)


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
        return f"Admin Token for {self.admin.admin_name}"


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
