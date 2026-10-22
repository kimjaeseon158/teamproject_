# 근무 유형별 급여 계산과 급여 지출 동기화 함수

from __future__ import annotations
from dataclasses import dataclass, asdict
from django.db import transaction
from myapp.models import WorkPlaceRate, Expense, User_WorkDay, User_Login_Info
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from collections import OrderedDict
from django.core.exceptions import ObjectDoesNotExist

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

        detail_amounts.append(
            {
                "work_type": amount_type,
                "minutes": minutes,
                "amount": amount,
                "is_overtime_approved": d.is_overtime_approved,
            }
        )

    total_amount = sum(by_work_type.values())
    by_work_type["합계"] = total_amount

    return {
        "by_work_type": by_work_type,
        "detail_amounts": detail_amounts,
        "total_amount": total_amount,
    }


def get_rate_for_workday(work_day, rate_history=None):
    if rate_history is None:
        rate_history = WorkPlaceRate.objects.filter(
            user_id=work_day.user_uuid_id,
            work_place=work_day.work_place,
            effective_start_date__lte=work_day.work_date,
        ).filter(
            Q(effective_end_date__isnull=True)
            | Q(effective_end_date__gte=work_day.work_date)
        )
    matches = [
        rate
        for rate in rate_history
        if rate.user_id == work_day.user_uuid_id
        and rate.work_place == work_day.work_place
        and rate.effective_start_date <= work_day.work_date
        and (
            rate.effective_end_date is None
            or work_day.work_date <= rate.effective_end_date
        )
    ]
    if len(matches) != 1:
        raise ValidationError(
            {
                "code": "rate_missing" if not matches else "rate_overlap",
                "work_date": str(work_day.work_date),
                "message": "근무일에 적용할 단가가 없거나 적용 기간이 겹칩니다.",
            }
        )
    return matches[0]


def get_rates_for_workday(work_day):
    return wage_rates_from_model(get_rate_for_workday(work_day))


def wage_rates_from_model(rate):
    return WageRates(
        base_hourly_wage=rate.base_hourly_wage or 0,
        overtime_hourly_wage=rate.overtime_hourly_wage or 0,
        meal_ot_hourly_wage=rate.meal_ot_hourly_wage or 0,
        special_hourly_wage=rate.special_hourly_wage or 0,
        day_special_hourly_wage=rate.day_special_hourly_wage
        or rate.special_hourly_wage
        or 0,
        night_special_hourly_wage=rate.night_special_hourly_wage
        or rate.special_hourly_wage
        or 0,
        overnight_hourly_wage=rate.overnight_hourly_wage or 0,
        overnight_ot_hourly_wage=rate.overnight_ot_hourly_wage or 0,
        early_hourly_wage=rate.early_hourly_wage or 0,
    )


def get_workday_salary(work_day, rate_history=None):
    result = {
        "amount": None,
        "amount_breakdown": {},
        "detail_amounts": [],
        "calculation_status": "rate_missing",
        "details_available": False,
        "is_final": work_day.is_approved is True,
    }
    if work_day.is_approved is False:
        return {**result, "amount": 0, "calculation_status": "rejected"}
    if work_day.is_approved is True:
        amount = work_day.salary_amount
        if amount is None:
            try:
                amount = work_day.salary_expense.amount
            except ObjectDoesNotExist:
                return {**result, "calculation_status": "final_amount_missing"}
        snapshot = work_day.salary_snapshot or {}
        return {
            **result,
            "amount": amount,
            "calculation_status": "confirmed",
            "amount_breakdown": snapshot.get("by_work_type", {}),
            "detail_amounts": snapshot.get("detail_amounts", []),
            "details_available": "detail_amounts" in snapshot,
        }
    try:
        rate = get_rate_for_workday(work_day, rate_history)
    except ValidationError as exc:
        return {**result, "calculation_status": str(exc.detail["code"])}
    breakdown = calculate_daily_salary_breakdown(
        work_day.details.all(), wage_rates_from_model(rate), work_day.work_shift
    )
    return {
        **result,
        "amount": breakdown["total_amount"],
        "amount_breakdown": breakdown["by_work_type"],
        "detail_amounts": breakdown["detail_amounts"],
        "calculation_status": "calculated",
        "details_available": True,
    }


@transaction.atomic
def sync_salary_expense_for_workday(work_day):
    # 단가 이력 수정과 같은 사용자 행을 잠근다.
    User_Login_Info.objects.select_for_update().get(pk=work_day.user_uuid_id)
    if work_day.is_approved is True:
        if work_day.salary_amount is None:
            try:
                existing_amount = work_day.salary_expense.amount
            except ObjectDoesNotExist:
                existing_amount = None
            if existing_amount is not None:
                work_day.salary_amount = existing_amount
            else:
                rate = get_rate_for_workday(work_day)
                rates = wage_rates_from_model(rate)
                breakdown = calculate_daily_salary_breakdown(
                    work_day.details.all(), rates, work_day.work_shift
                )
                work_day.salary_amount = breakdown["total_amount"]
                WorkPlaceRate.objects.filter(pk=rate.pk).update(used_for_approval=True)
                work_day.salary_rate = rate
                work_day.salary_snapshot = {
                    **breakdown,
                    "rates": asdict(rates),
                    "rate_uuid": str(rate.pk),
                    "effective_start_date": str(rate.effective_start_date),
                    "effective_end_date": (
                        str(rate.effective_end_date)
                        if rate.effective_end_date
                        else None
                    ),
                }
            work_day.save(
                update_fields=["salary_amount", "salary_rate", "salary_snapshot"]
            )
        Expense.objects.update_or_create(
            work_day=work_day,
            defaults={
                "date": work_day.work_date,
                "expense_name": f"{work_day.user_name} 급여",
                "expense_detail": f"{work_day.work_place} {work_day.work_shift}",
                "amount": work_day.salary_amount,
            },
        )
        return
    Expense.objects.filter(work_day=work_day).delete()
    # 사용 이력 FK는 남겨 삭제를 방지하고, 재승인 금액은 새로 계산한다.
    work_day.salary_amount = None
    work_day.salary_snapshot = None
    work_day.save(update_fields=["salary_amount", "salary_snapshot"])


RATE_REMOVE_KEYS = {"user", "user_uuid", "user_name"}


def group_rates_by_user(qs):
    # serializers가 salary를 참조하므로 모듈 로드 시의 순환 import를 피한다.
    from myapp.serializers import WorkPlaceRateSerializer

    rate_list = WorkPlaceRateSerializer(
        qs.prefetch_related("approved_workdays").order_by(
            "work_place", "-effective_start_date"
        ),
        many=True,
    ).data
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
