STANDARD_WORK_TYPES = {
    "주간",
    "평일 잔업",
    "중식연장",
    "특근",
    "철야",
    "철야 잔업",
    "조기출근",
}

#기존 db에 잔업, 철야연장 표시되어있을 가능성이 있음
#기존 db 완전 삭제 후 지우기
WORK_TYPE_ALIASES = {
    "잔업": "평일 잔업",
    "철야연장": "철야 잔업",
}


def normalize_work_type(work_type: str) -> str:
    return WORK_TYPE_ALIASES.get(work_type or "", work_type or "")
