# 근무 유형 별칭과 정규화 공통 함수




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


WORK_TYPE_ALIASES = {
    "연업": "평일 연업",
    "철야": "야간",
    "철야연장": "야간 연업",
    "철야 연업": "야간 연업",
}


def normalize_work_type(work_type: str, work_shift: str | None = None) -> str:
    if work_type == "출근":
        return "야간 출근" if work_shift == "야간" else "주간 출근"

    return WORK_TYPE_ALIASES.get(work_type or "", work_type or "")
