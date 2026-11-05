# Google Drive 근무·급여 Excel 내보내기 API

import calendar
from datetime import date
from io import BytesIO
import re
from xml.etree.ElementTree import ParseError
from zipfile import BadZipFile

from openpyxl.utils.exceptions import InvalidFileException
from requests import RequestException
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import Expense, Income, User_Login_Info, User_WorkDay
from ..token.authentication import AdminJWTAuthentication
from .excel_utils import (
    generate_expense_excel,
    generate_income_excel,
    generate_salary_excel,
    generate_users_pay_excel,
    generate_workplace_excel,
)
from .google_drive_utils import GoogleDriveService, GoogleDriveUploadError, download_drive_template, parse_year_month, save_workbook_to_drive, workbook_download_response


class _GoogleDriveFinanceExcelExportAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_month = request.query_params.get("start_month", "")
        end_month = request.query_params.get("end_month", "")
        try:
            if not all(re.fullmatch(r"[0-9]{4}-[0-9]{2}", month) for month in (start_month, end_month)):
                raise ValueError
            start = date.fromisoformat(f"{start_month}-01")
            end = date.fromisoformat(f"{end_month}-01")
            end = end.replace(day=calendar.monthrange(end.year, end.month)[1])
            if start > end:
                raise ValueError
        except ValueError:
            return self._error("INVALID_PERIOD", "올바른 시작 월과 종료 월을 선택해주세요.", 400)

        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return self._google_auth_error()
        drive = GoogleDriveService(access_token, strict_errors=True)

        try:
            folder_id = drive.get_or_create_folder(self.folder_name, parent_id="root")
            template_file = download_drive_template(drive, folder_id, f"{self.folder_name}_template")
        except RequestException as exc:
            if exc.response is not None and exc.response.status_code == 401:
                return self._google_auth_error()
            return self._error("DRIVE_READ_FAILED", "Google Drive에서 템플릿을 가져오지 못했습니다.", 502)
        if template_file is None:
            return self._error("TEMPLATE_MISSING", f"Google Drive의 {self.folder_name} 폴더에 {self.label} 엑셀 템플릿이 없습니다.", 404)

        records = self.model.objects.filter(date__range=(start, end)).order_by("date", "pk")
        try:
            workbook = self.generate_excel(records.iterator(), template_file)
        except (BadZipFile, InvalidFileException, KeyError, ValueError, OSError, ParseError, SyntaxError):
            return self._error("TEMPLATE_INVALID", f"{self.label} 엑셀 템플릿이 손상되었거나 형식이 올바르지 않습니다.", 422)
        output = BytesIO()
        workbook.save(output)
        content = output.getvalue()

        period = f"{start_month}_to_{end_month}"
        try:
            filename = save_workbook_to_drive(
                drive, content, f"{self.filename_prefix}_{period}.xlsx", folder_id=folder_id
            )
        except (GoogleDriveUploadError, RequestException) as exc:
            status = getattr(exc, "status_code", None)
            if isinstance(exc, RequestException) and exc.response is not None:
                status = exc.response.status_code
            if status == 401:
                return self._google_auth_error()
            return self._error("DRIVE_SAVE_FAILED", f"{self.label} 엑셀을 Google Drive에 저장하지 못했습니다.", 502)

        return workbook_download_response(content, filename)

    @staticmethod
    def _error(code, message, status):
        return Response({"success": False, "code": code, "message": message}, status=status)

    def _google_auth_error(self):
        return self._error("GOOGLE_AUTH_EXPIRED", "Google Drive에 다시 연결해주세요.", 409)


class GoogleDriveExcelExportAPIView(_GoogleDriveFinanceExcelExportAPIView):
    label = "수입"
    folder_name = "income"
    filename_prefix = "income"
    model = Income
    generate_excel = staticmethod(generate_income_excel)


class GoogleDriveExpenseExcelExportAPIView(_GoogleDriveFinanceExcelExportAPIView):
    label = "지출"
    folder_name = "expemse"
    filename_prefix = "expense"
    model = Expense
    generate_excel = staticmethod(generate_expense_excel)


class GoogleDriveWorkplaceExcelExportAPIView(APIView):
    """
    workload 폴더에서 템플릿을 찾고, workload/YYYY-MM 폴더에 근무현황 파일을 저장합니다.
    work_place가 있으면 해당 근무지만, 없으면 모든 근무지의 승인 근무내역을 한 파일로 생성합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")
        work_place = request.query_params.get("work_place")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        workload_folder_id = drive.get_or_create_folder("workload")
        template_io = download_drive_template(drive, workload_folder_id, "workload_template")

        if work_place:
            wb = generate_workplace_excel(work_place, year, month, template_file=template_io)
            save_filename = f"{work_place}_{year}_{month:02d}.xlsx"
            try:
                save_filename = save_workbook_to_drive(drive, wb, save_filename, ["workload", date_str])
            except GoogleDriveUploadError as exc:
                return Response({"success": False}, status=exc.status_code)

            return workbook_download_response(wb, save_filename)

        wb = generate_workplace_excel(None, year, month, template_file=template_io)
        save_filename = f"workload_all_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["workload", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)


class GoogleDriveSalaryExcelExportAPIView(APIView):
    """
    salary 폴더에서 템플릿을 찾고, salary/YYYY-MM 폴더에 월 급여대장 파일을 저장합니다.
    생성된 파일은 Google Drive에 저장한 뒤 브라우저 다운로드 응답으로도 반환합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        salary_folder_id = drive.get_or_create_folder("salary")
        template_io = download_drive_template(drive, salary_folder_id, "salary_template")

        wb = generate_salary_excel(year, month, template_file=template_io)
        save_filename = f"salary_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["salary", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)


class GoogleDriveUserPayExcelExportAPIView(APIView):
    """
    user_pay 폴더에서 템플릿을 찾고, user_pay/YYYY-MM 폴더에 개인 월급명세서 파일을 저장합니다.
    하나의 엑셀 파일 안에 사원별 시트를 생성합니다.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")
        if not access_token:
            return Response({"success": False}, status=401)

        date_str = request.query_params.get("date")
        user_uuid = request.query_params.get("user_uuid")

        year, month = parse_year_month(date_str)
        if year is None:
            return Response({"success": False}, status=400)

        drive = GoogleDriveService(access_token)
        pay_folder_id = drive.get_or_create_folder("user_pay")
        template_io = download_drive_template(drive, pay_folder_id, "user_pay_template")

        if user_uuid:
            user_uuids = [
                value.strip()
                for value in user_uuid.split(",")
                if value.strip()
            ]
        else:
            user_uuids = list(
                User_WorkDay.objects
                .filter(
                    work_date__year=year,
                    work_date__month=month,
                    is_approved=True,
                )
                .order_by("user_name")
                .values_list("user_uuid_id", flat=True)
                .distinct()
            )

        existing_count = User_Login_Info.objects.filter(user_uuid__in=user_uuids).count()
        if existing_count != len(user_uuids):
            return Response({"success": False}, status=404)

        wb = generate_users_pay_excel(user_uuids, year, month, template_file=template_io)
        save_filename = f"user_pay_{year}_{month:02d}.xlsx"
        try:
            save_filename = save_workbook_to_drive(drive, wb, save_filename, ["user_pay", date_str])
        except GoogleDriveUploadError as exc:
            return Response({"success": False}, status=exc.status_code)

        return workbook_download_response(wb, save_filename)
