import os
from openpyxl import load_workbook, Workbook
from django.conf import settings
from .models import User_WorkDay, WorkPlaceRate
from datetime import date
import calendar


def _get_workbook(template_file, workplace_name=None, default_template="default.xlsx"):
    """템플릿을 로드하거나 새로 생성합니다."""
    if template_file:
        try:
            return load_workbook(template_file)
        except Exception as e:
            print(f"Failed to load provided template: {e}")
    
    # 로컬 템플릿 로드 시도
    base_dir = settings.BASE_DIR
    template_dir = os.path.join(base_dir, 'workload')
    
    if workplace_name:
        template_path = os.path.join(template_dir, f"{workplace_name}.xlsx")
        if os.path.exists(template_path):
            return load_workbook(template_path)
            
    default_path = os.path.join(template_dir, default_template)
    if os.path.exists(default_path):
        return load_workbook(default_path)
        
    return Workbook()

def generate_workplace_excel(work_place, year, month, template_file=None):
    """특정 근무지의 전체 근무 데이터를 기반으로 매트릭스 형태의 엑셀 생성"""
    wb = _get_workbook(template_file, workplace_name=work_place)
    ws = wb.active

    # 1. 데이터 조회 (승인된 데이터만)
    work_days = User_WorkDay.objects.filter(
        work_place=work_place,
        work_date__year=year,
        work_date__month=month,
        is_approved=True
    ).values('user_name', 'work_date')

    # 2. 유저별로 일한 날짜(day)를 집합(set)으로 정리
    user_work_map = {}
    for wd in work_days:
        name = wd['user_name']
        day = wd['work_date'].day
        if name not in user_work_map:
            user_work_map[name] = set()
        user_work_map[name].add(day)

    # 3. 해당 월의 총 일수 및 날짜 헤더 정보 설정
    _, last_day = calendar.monthrange(year, month)
    days_kr = ['월', '화', '수', '목', '금', '토', '일']

    # 작성 위치 설정
    header_row_day = 4
    header_row_date = 5
    data_start_row = 6
    name_col = 1
    date_start_col = 2

    # 제목 및 기본 정보 (템플릿에 따라 위치 조정 가능)
    ws.cell(row=2, column=2, value=f"{year}년 {month}월 {work_place} 근무 현황")

    # 4. 가로 날짜 및 요일 헤더 생성
    for day in range(1, last_day + 1):
        col = date_start_col + day - 1
        d = date(year, month, day)
        ws.cell(row=header_row_day, column=col, value=days_kr[d.weekday()])
        ws.cell(row=header_row_date, column=col, value=day)

    # 5. 유저별 데이터 작성
    current_row = data_start_row
    sorted_names = sorted(user_work_map.keys())
    
    for name in sorted_names:
        # 이름은 세로로 한 번만 작성 (각 행의 첫 번째 컬럼)
        ws.cell(row=current_row, column=name_col, value=name)
        
        worked_days = user_work_map[name]
        for day in range(1, last_day + 1):
            if day in worked_days:
                # 일한 날짜 칸에 "1" 입력
                ws.cell(row=current_row, column=date_start_col + day - 1, value=1)
        current_row += 1

    return wb

def generate_user_pay_excel(user_uuid, year, month, template_file=None):
    """관리자용: 특정 유저의 월급 명세서 엑셀 생성 (뼈대)"""
    wb = _get_workbook(template_file, default_template="user_pay_template.xlsx")
    ws = wb.active
    # TODO: 유저 월급 데이터 채우기
    ws['B2'] = f"{year}년 {month}월 급여 명세서"
    return wb

def generate_user_record_excel(user_uuid, year, month, template_file=None):
    """사용자용: 자신의 근무 기록 엑셀 생성 (뼈대)"""
    wb = _get_workbook(template_file, default_template="user_record_template.xlsx")
    ws = wb.active
    # TODO: 개인 근무 기록 데이터 채우기
    ws['B2'] = f"{year}년 {month}월 개인 근무 기록"
    return wb
