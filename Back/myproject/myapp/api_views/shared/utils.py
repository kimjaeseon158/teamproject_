# 공용 날짜/근무 타입 유틸

from datetime import date, datetime


DATE_FORMAT = "%Y-%m-%d"

STANDARD_WORK_TYPES = {
    "주간",
    "평일 연업",
    "중식연장",
    "주간 출근",
    "야간 출근",
    "야간",
    "야간 연업",
    "조기출근",
}

# Existing data may still contain old labels. Keep aliases until legacy rows are gone.
WORK_TYPE_ALIASES = {
    "연업": "평일 연업",
    "철야": "야간",
    "철야연장": "야간 연업",
    "철야 연업": "야간 연업",
}


def parse_date(date_str):
    return datetime.strptime(date_str, DATE_FORMAT).date()


def get_date_range(params):
    start_date_str = params.get("start_date")
    end_date_str = params.get("end_date")
    if not start_date_str or not end_date_str:
        return None, None

    return parse_date(start_date_str), parse_date(end_date_str)


def month_start_end(year: int, month: int):
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end


def add_months(year: int, month: int, delta: int):
    m = month - delta
    y = year

    while m <= 0:
        m += 12
        y -= 1

    return y, m


def normalize_work_type(work_type: str, work_shift: str | None = None) -> str:
    if work_type == "출근":
        return "야간 출근" if work_shift == "야간" else "주간 출근"

    return WORK_TYPE_ALIASES.get(work_type or "", work_type or "")
