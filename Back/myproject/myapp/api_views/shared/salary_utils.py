# 근무 유형별 급여 계산과 급여 지출 동기화 함수

from __future__ import annotations
from dataclasses import dataclass
from django.db import transaction
from myapp.models import WorkPlaceRate, Expense
from collections import OrderedDict
from django.core.exceptions import ObjectDoesNotExist
from datetime import date


MINUTES_PER_HOUR = 60
FULL_DAY_MINUTES = 480


def _normalize_work_type(work_type: str, work_shift: str | None = None) -> str:
    # api_views 패키지는 뷰를 즉시 import하므로 모듈 로드 시 순환 import를 피한다.
    from .work_type_utils import normalize_work_type

    return normalize_work_type(work_type, work_shift)

@dataclass(frozen=True)
class WageRates:
    base_hourly_wage: int
    overtime_hourly_wage: int
    meal_ot_hourly_wage: int
    special_hourly_wage: int
    day_special_hourly_wage: int
    night_special_hourly_wage: int
    overnight_hourly_wage: int
    overnight_ot_hourly_wage: int
    early_hourly_wage: int

def minutes_to_amount(hourly_wage: int, minutes: int) -> int:
    """
    hourly_wage: 시간당 단가
    minutes: 실제 근무 분
    """
    if hourly_wage <= 0 or minutes <= 0:
        return 0

    # 분 단위 근무 시간을 시급으로 환산한다.
    return (hourly_wage * minutes) // MINUTES_PER_HOUR


def minutes_to_daily_amount(daily_wage: int, minutes: int) -> int:
    """8시간 기준 일급을 실제 근무 분에 비례해 계산한다."""
    if daily_wage <= 0 or minutes <= 0:
        return 0

    return (daily_wage * minutes) // FULL_DAY_MINUTES

def get_detail_salary_amount(
    work_type: str,
    minutes: int,
    rates: WageRates,
    work_shift: str | None = None,
) -> int:
    wt = _normalize_work_type(work_type, work_shift).upper()
    mins = int(minutes or 0)

    if wt in ["주간"]:
        return minutes_to_daily_amount(rates.base_hourly_wage, mins)

    if wt in ["평일 잔업"]:
        return minutes_to_amount(rates.overtime_hourly_wage, mins)

    if wt in ["중식연장"]:
        return minutes_to_amount(rates.meal_ot_hourly_wage, mins)

    if wt in ["주간 특근"]:
        return minutes_to_daily_amount(rates.day_special_hourly_wage, mins)

    if wt in ["야간 특근"]:
        return minutes_to_daily_amount(rates.night_special_hourly_wage, mins)

    if wt in ["특근"]:
        return minutes_to_daily_amount(rates.special_hourly_wage, mins)

    if wt in ["야간"]:
        return minutes_to_daily_amount(rates.overnight_hourly_wage, mins)

    if wt in ["야간 잔업"]:
        return minutes_to_amount(rates.overnight_ot_hourly_wage, mins)

    if wt in ["조기출근"]:
        return minutes_to_amount(rates.early_hourly_wage, mins)

    return 0


def calculate_daily_salary(
    details,
    rates: WageRates,
    work_shift: str | None = None,
) -> int:
    total = 0

    for d in details:
        total += get_detail_salary_amount(d.work_type, d.minutes, rates, work_shift)

    return max(total, 0)


def calculate_daily_salary_breakdown(
    details,
    rates: WageRates,
    work_shift: str | None = None,
) -> dict:
    by_work_type = {
        "주간": 0,
        "평일 잔업": 0,
        "중식연장": 0,
        "주간 특근": 0,
        "야간 특근": 0,
        "야간": 0,
        "야간 잔업": 0,
        "조기출근": 0,
    }
    detail_amounts = []

    for d in details:
        work_type = d.work_type or ""
        amount_type = _normalize_work_type(work_type, work_shift)
        minutes = int(d.minutes or 0)
        amount = get_detail_salary_amount(work_type, minutes, rates, work_shift)

        if amount_type in by_work_type:
            by_work_type[amount_type] += amount

        detail_amounts.append({
            "work_type": amount_type,
            "minutes": minutes,
            "amount": amount,
            "is_overtime_approved": d.is_overtime_approved,
        })

    total_amount = sum(by_work_type.values())
    by_work_type["합계"] = total_amount

    return {
        "by_work_type": by_work_type,
        "detail_amounts": detail_amounts,
        "total_amount": total_amount,
    }



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
        day_special_hourly_wage=rate.day_special_hourly_wage or rate.special_hourly_wage,
        night_special_hourly_wage=rate.night_special_hourly_wage or rate.special_hourly_wage,
        overnight_hourly_wage=rate.overnight_hourly_wage,
        overnight_ot_hourly_wage=rate.overnight_ot_hourly_wage,
        early_hourly_wage=rate.early_hourly_wage,
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
        amount = calculate_daily_salary(details, rates, work_day.work_shift)

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
    # serializers가 salary를 참조하므로 모듈 로드 시의 순환 import를 피한다.
    from myapp.serializers import WorkPlaceRateSerializer

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
