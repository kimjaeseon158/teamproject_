from datetime import date

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
