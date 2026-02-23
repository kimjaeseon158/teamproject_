from __future__ import annotations
from dataclasses import dataclass
from django.db import transaction
from myapp.models import WorkPlaceRate, Expense
from myapp.serializers import WorkPlaceRateSerializer
from collections import OrderedDict

@dataclass(frozen=True)
class WageRates:
    base_hourly_wage: int
    overtime_hourly_wage: int
    meal_ot_hourly_wage: int
    special_hourly_wage: int
    overnight_hourly_wage: int
    overnight_ot_hourly_wage: int

def minutes_to_amount(minutes: int, hourly_wage: int) -> int:
    # 분 단위 -> 원 단위 (시급 기준)
    # 1시간=60분
    if minutes <= 0 or hourly_wage <= 0:
        return 0
    return (minutes * hourly_wage + 30) // 60

def calculate_daily_salary(details, rates: WageRates) -> int:
    """
    details: User_WorkDetail queryset or list
    work_type 예: DAY, NIGHT, OVERTIME, MEAL_OT, SPECIAL, OVERNIGHT
    """
    total = 0

    for d in details:
        wt = (d.work_type or "").upper()
        mins = int(d.minutes or 0)

        if wt in ["DAY", "BASE"]:
            total += minutes_to_amount(mins, rates.base_hourly_wage)

        elif wt in ["OVERTIME", "OT"]:
            total += minutes_to_amount(mins, rates.overtime_hourly_wage)

        elif wt in ["MEAL_OT", "MEAL"]:
            total += minutes_to_amount(mins, rates.meal_ot_hourly_wage)

        elif wt in ["SPECIAL"]:
            # 필요하면 d.is_overtime_approved 같은 조건도 반영 가능
            total += minutes_to_amount(mins, rates.special_hourly_wage)

        elif wt in ["OVERNIGHT", "NIGHT"]:
            # 철야 기본
            total += minutes_to_amount(mins, rates.overnight_hourly_wage)

        elif wt in ["OVERNIGHT_OT", "NIGHT_OT", "OVERNIGHT_OVERTIME"]:
            # 철야 연장
            total += minutes_to_amount(mins, rates.overnight_ot_hourly_wage)

        else:
            # 정의 안 된 work_type은 일단 무시, 예외 처리
            continue

    return max(total, 0)



def get_rates_for_workday(work_day):
    rate = WorkPlaceRate.objects.get(
        user_id=work_day.user_uuid_id,
        work_place=work_day.work_place,
    )
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


def group_rates_by_user(qs):
    """
    WorkPlaceRate queryset → user 기준으로 묶어서 반환
    """

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

        grouped[user_uuid]["rates"].append(r)

    # user_name 채우기
    for obj in qs:
        u = str(obj.user_id)
        if u in grouped and grouped[u]["user_name"] is None:
            grouped[u]["user_name"] = getattr(obj.user, "user_name", None)

    return list(grouped.values())