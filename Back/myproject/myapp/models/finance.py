# 수입과 지출 모델

import uuid
from django.db import models


class Income(models.Model):
    Income_uuid    = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    date           = models.DateField()                                                      # 매출 날짜
    company_name   = models.CharField(max_length=100)                                        # 업체명 (자유 입력)
    company_detail = models.CharField(max_length=100,blank=True,null=True)                   # 업체명 상세 (자유 입력)
    amount         = models.IntegerField()


class Expense(models.Model):
    expense_uuid   = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    date           = models.DateField()                                                      # 지출 날짜
    expense_name   = models.CharField(max_length=100)                                        # 지출명 (대분류, 자유 입력)
    expense_detail = models.CharField(max_length=100, blank=True, null=True)                 # 지출 상세 (자유 입력)
    amount         = models.IntegerField()                                                   # 지출 금액 (정수)
    payment_method = models.CharField(max_length=20, blank=True, null=True)                  # 결제 방식 (자유 입력)
    # 급여 지출의 출처 , Expense에 저장된 work_day(FK)로 User_WorkDay를 조회
    work_day = models.OneToOneField(
        "User_WorkDay",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="salary_expense",
    )
