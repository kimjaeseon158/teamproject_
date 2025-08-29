from django.db import models
from django.contrib.auth.hashers import make_password

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
    admin_name = models.CharField(max_length=50)       # 관리자 이름
    admin_id   = models.CharField(max_length=50)       # 관리자 ID
    password   = models.CharField(max_length=100)      # 관리자 비밀번호
    admin_code = models.CharField(max_length=20)       # 설정한 인증번호

    def save(self, *args, **kwargs):
        # 비밀번호가 해시되지 않은 상태일 때만 해시
        if not self.password.startswith('pbkdf2_'):  # Django 기본 prefix 체크
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

# 매출 테이블(임시 사용)
class RevenueInfo(models.Model):
    company_name    = models.CharField(max_length=100)                              # 회사명
    revenue_date    = models.DateField()                                            # 날짜 (YYYY-MM-DD)
    income          = models.DecimalField(max_digits=12, decimal_places=2)          # 수입금

# 지출 테이블(임시 사용)
class ExpenseInfo(models.Model):
    expense_date      = models.DateField()                                           # 날짜 (YYYY-MM-DD)
    total_amount      = models.DecimalField(max_digits=12, decimal_places=2)         # 총일금
    food_expense      = models.DecimalField(max_digits=12, decimal_places=2)         # 식비
    material_expense  = models.DecimalField(max_digits=12, decimal_places=2)         # 자재비
    transport_expense = models.DecimalField(max_digits=12, decimal_places=2)         # 교통비
    etc_expense       = models.DecimalField(max_digits=12, decimal_places=2)         # 기타