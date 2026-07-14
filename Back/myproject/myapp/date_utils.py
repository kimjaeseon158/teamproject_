from datetime import date, datetime


DATE_FORMAT = "%Y-%m-%d"


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
