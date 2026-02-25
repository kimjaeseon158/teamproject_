from __future__ import annotations
from dataclasses import dataclass
from django.db import transaction
from myapp.models import WorkPlaceRate, Expense
from myapp.serializers import WorkPlaceRateSerializer
from collections import OrderedDict
from django.core.exceptions import ObjectDoesNotExist
from datetime import date


FULL_DAY_MINUTES = 480

@dataclass(frozen=True)
class WageRates:
    base_hourly_wage: int
    overtime_hourly_wage: int
    meal_ot_hourly_wage: int
    special_hourly_wage: int
    overnight_hourly_wage: int
    overnight_ot_hourly_wage: int

def minutes_to_amount(daily_wage_8h: int, minutes: int) -> int:
    """
    daily_wage_8h: 8시간(480분) 기준 일급
    minutes: 실제 근무 분
    """
    if daily_wage_8h <= 0 or minutes <= 0:
        return 0

    # (minutes / 480) * daily_wage_8h 를 반올림해서 정수로
    # 반올림: +240 (480의 절반)
    return (daily_wage_8h * minutes) // FULL_DAY_MINUTES
    # 예) 일급 100,000원, 240분 근무 (100000 * 240 + 240) // 480 = 50,000원 (정상)

def calculate_daily_salary(details, rates: WageRates) -> int:

    total = 0

    for d in details:
        wt = (d.work_type or "").upper()
        mins = int(d.minutes or 0)

        if wt in ["주간"]:
            total += minutes_to_amount(rates.base_hourly_wage, mins)

        elif wt in ["잔업"]:
            total += minutes_to_amount(rates.overtime_hourly_wage, mins)

        elif wt in ["중식연장"]:
            total += minutes_to_amount(rates.meal_ot_hourly_wage, mins)

        elif wt in ["특근"]:
            total += minutes_to_amount(rates.special_hourly_wage, mins)

        elif wt in ["철야"]:
            total += minutes_to_amount(rates.overnight_hourly_wage, mins)

        elif wt in ["철야연장"]:
            total += minutes_to_amount(rates.overnight_ot_hourly_wage, mins)

        else:
            # 정의 안 된 work_type은 일단 무시, 예외 처리
            continue

    return max(total, 0)



def get_rates_for_workday(work_day) -> WageRates:
    try:
        rate = WorkPlaceRate.objects.get(
            user_id=work_day.user_uuid_id,      
            work_place=work_day.work_place,
        )
    except ObjectDoesNotExist:
        raise ValueError("해당 근무지의 시급표(WorkPlaceRate)가 없습니다.")
    
    return WageRates(
        base_hourly_wage=rate.base_hourly_wage,
        overtime_hourly_wage=rate.overtime_hourly_wage,
        meal_ot_hourly_wage=rate.meal_ot_hourly_wage,
        special_hourly_wage=rate.special_hourly_wage,
        overnight_hourly_wage=rate.overnight_hourly_wage,
        overnight_ot_hourly_wage=rate.overnight_ot_hourly_wage,
    )

@transaction.atomic
def sync_salary_expense_for_workday(work_day):
    """
    work_day 상태 기준으로 Expense(급여 지출) 생성/갱신/삭제를 동기화
    - 승인(True): 계산 후 Expense upsert
    - 반려(False) or 대기(None): Expense 삭제
    """
    if work_day.is_approved is True:
        rates = get_rates_for_workday(work_day)
        details = work_day.details.all()  # related_name="details"
        amount = calculate_daily_salary(details, rates)

        Expense.objects.update_or_create(
            work_day=work_day,
            defaults={
                "date": work_day.work_date,           # 급여 발생일(근무일)
                "expense_name": f"{work_day.user_name} 급여",               
                "expense_detail": f"{work_day.work_place} {work_day.work_shift}",
                "amount": amount,
            },
        )
        return

    # False 또는 None이면 삭제
    Expense.objects.filter(work_day=work_day).delete()


RATE_REMOVE_KEYS = {"user", "user_uuid", "user_name"}

def group_rates_by_user(qs):
    rate_list = WorkPlaceRateSerializer(qs, many=True).data
    grouped = OrderedDict()

    for r in rate_list:
        user_uuid = r.get("user")

        if user_uuid not in grouped:
            grouped[user_uuid] = {
                "user_uuid": user_uuid,
                "user_name": r.get("user_name"),
                "rates": [],
            }

        # rates 안에서는 유저 관련 키 제거
        rate_item = {k: v for k, v in r.items() if k not in RATE_REMOVE_KEYS}

        grouped[user_uuid]["rates"].append(rate_item)

    return list(grouped.values())
    """
def month_start_end(year: int, month: int):
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end  # end는 "다음달 1일(미포함)" 용
    """


def month_start_end(year: int, month: int):
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end  # end는 "다음달 1일(미포함)" 용

def add_months(year: int, month: int, delta: int):
    m = month - delta
    new_month = m
    new_year = year
    if m >= 0 :
        new_month = m + 12
        new_year = year - 1
    return new_year, new_month