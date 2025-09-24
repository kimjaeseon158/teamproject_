from django.db import models
from django.contrib.auth.hashers import make_password
from .unique_serial import generate_unique_serial

# User 관련 테이블

class User_Login_Info(models.Model):
    employee_number = models.CharField(max_length=50, primary_key=True)
    user_name       = models.CharField(max_length=50, default='홍길동')   # 유저 이름
    user_id         = models.CharField(max_length=50)
    password        = models.CharField(max_length=100, default='1234')
    phone_number    = models.CharField(max_length=20)
    mobile_carrier  = models.CharField(max_length=10)
    resident_number = models.CharField(max_length=14)
    address         = models.CharField(max_length=200)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee_number'], name='unique_employee_number'),
            models.UniqueConstraint(fields=['user_id'],         name='unique_user_id'),
            models.UniqueConstraint(fields=['resident_number'], name='unique_resident_number'),
            models.UniqueConstraint(fields=['phone_number'],    name='unique_phone_number'),
        ]

    def save(self, *args, **kwargs):
        # 비밀번호가 해시되지 않은 상태일 때만 해시
        if not self.password.startswith('pbkdf2_'):  # Django 기본 prefix 체크
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class User_Work_Info(models.Model):
    employee_number = models.ForeignKey(User_Login_Info, on_delete=models.CASCADE) # FK 선언
    user_name       = models.CharField(max_length=50)                              # 사용자 이름
    work_start      = models.DateTimeField()                                       # 작업 시작 시간 (날짜 + 시간)
    work_end        = models.DateTimeField()                                       # 작업 종료 시간 (날짜 + 시간)
    total_time      = models.CharField(max_length=20)                              # 일한 총 시간 (시간 간격)
    work_date       = models.DateField()                                           # 근무 날짜
    work_place      = models.CharField(max_length=100)                             # 근무 장소


class User_Work_Pay(models.Model):
    employee_number = models.ForeignKey(User_Login_Info, on_delete=models.CASCADE)  # FK 선언
    company         = models.CharField(max_length=50)                               # 회사명
    daily_wages     = models.IntegerField()                                         # 일급



# Admin 관련 테이블 

class Admin_Login_Info(models.Model):
    admin_name = models.CharField(max_length=50)                         # 관리자 이름
    admin_id   = models.CharField(max_length=50, primary_key=True)       # 관리자 ID
    password   = models.CharField(max_length=100)                        # 관리자 비밀번호
    admin_code = models.CharField(max_length=20)                         # 설정한 인증번호

    def save(self, *args, **kwargs):
        # 비밀번호가 해시되지 않은 상태일 때만 해시
        if not self.password.startswith('pbkdf2_'):  # Django 기본 prefix 체크
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

# 수입 매출 관련 테이블

class Income(models.Model):
    date           = models.DateField()                                                      # 매출 날짜
    company_name   = models.CharField(max_length=100)                                        # 업체명 (자유 입력)
    company_detail = models.CharField(max_length=100,blank=True,null=True)                   # 업체명 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 매출 금액 (정수)
    serial_number  = models.IntegerField(unique=True)    # 새 레코드 생성 시 자동 값 중복되지 않음 고유번호 저장 

    def save(self, *args, **kwargs):
        if not self.serial_number:
            self.serial_number = generate_unique_serial(Income)
        super().save(*args, **kwargs)


class Expense(models.Model):
    date           = models.DateField()                                                      # 지출 날짜
    expense_name   = models.CharField(max_length=100)                                        # 지출명 (대분류, 자유 입력)
    expense_detail = models.CharField(max_length=100, blank=True, null=True)                 # 지출 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 지출 금액 (정수)
    serial_number  = models.IntegerField(unique=True)    # 새 레코드 생성 시 자동 값 중복되지 않음 고유번호 저장 

    def save(self, *args, **kwargs):
        if not self.serial_number:
            self.serial_number = generate_unique_serial(Expense)
        super().save(*args, **kwargs)
