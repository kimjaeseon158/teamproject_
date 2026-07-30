"""Compatibility exports for API views.

The concrete view implementations live in ``myapp.api_views``.
Keeping these imports here preserves existing URL imports.
"""

from .api_views.token import (
    TokenRefreshAPIView,
)
from .api_views.user import (
    CheckUserLoginAPIView,
    UserPasswordChangeAPIView,
    UserWorkPlaceListAPIView,
    UserLogoutAPIView,
    UserWorkInfoAPIView,
    UserMonthlyWorkSummaryAPIView,
)
from .api_views.admin.admin_auth import (
    CheckAdminLoginAPIView,
    AdminLogoutAPIView,
)
from .api_views.admin.user_management import (
    UserInfoListAPIView,
    UserInfoDeleteAPIView,
    UserInfoUpdateAPIView,
    UserInfoAddAPIView,
    UserInfoFilteringAPIView,
)
from .api_views.google import (
    GoogleLoginAPIView,
    GoogleLogoutAPIView,
    GoogleCallbackAPIView,
    GoogleCalendarEventsAPIView,
    GoogleDriveWorkplaceExcelExportAPIView,
    GoogleDriveSalaryExcelExportAPIView,
    GoogleDriveUserPayExcelExportAPIView,
)
from .api_views.admin.finance import (
    FinanceTableDateFilteredAPIView,
    IncomeDateFilteredAPIView,
    ExpenseDateFilteredAPIView,
    Expense3MonthsTotalsAPIView,
    ExpenseAddAPIView,
    IncomeAddAPIView,
    IncomeUpdateAPIView,
    ExpenseUpdateAPIView,
    IncomeDeleteAPIView,
    ExpenseDeleteAPIView,
)
from .api_views.admin.work import (
    AdminPageWorkDayListAPIView,
    AdminWorkDayStatusUpdateAPIView,
    AdminWorkPlaceListCreateAPIView,
    AdminWorkPlaceUpdateDeleteAPIView,
    WorkPlaceRateListCreateAPIView,
    WorkPlaceRateUpdateDeleteAPIView,
    WorkPlaceRateListfilteringAPIView,
)
from .api_views.work_schedule import (
    AdminWorkScheduleDetailAPIView,
    AdminWorkScheduleDownloadAPIView,
    AdminWorkScheduleListCreateAPIView,
    UserWorkScheduleAPIView,
    UserWorkSchedulePreviewPageAPIView,
)

__all__ = [
    "TokenRefreshAPIView",
    "CheckUserLoginAPIView",
    "UserPasswordChangeAPIView",
    "UserWorkPlaceListAPIView",
    "UserLogoutAPIView",
    "UserWorkInfoAPIView",
    "UserMonthlyWorkSummaryAPIView",
    "CheckAdminLoginAPIView",
    "AdminLogoutAPIView",
    "UserInfoListAPIView",
    "UserInfoDeleteAPIView",
    "UserInfoUpdateAPIView",
    "UserInfoAddAPIView",
    "UserInfoFilteringAPIView",
    "GoogleLoginAPIView",
    "GoogleLogoutAPIView",
    "GoogleCallbackAPIView",
    "GoogleCalendarEventsAPIView",
    "GoogleDriveWorkplaceExcelExportAPIView",
    "GoogleDriveSalaryExcelExportAPIView",
    "GoogleDriveUserPayExcelExportAPIView",
    "FinanceTableDateFilteredAPIView",
    "IncomeDateFilteredAPIView",
    "ExpenseDateFilteredAPIView",
    "Expense3MonthsTotalsAPIView",
    "ExpenseAddAPIView",
    "IncomeAddAPIView",
    "IncomeUpdateAPIView",
    "ExpenseUpdateAPIView",
    "IncomeDeleteAPIView",
    "ExpenseDeleteAPIView",
    "AdminPageWorkDayListAPIView",
    "AdminWorkDayStatusUpdateAPIView",
    "AdminWorkPlaceListCreateAPIView",
    "AdminWorkPlaceUpdateDeleteAPIView",
    "WorkPlaceRateListCreateAPIView",
    "WorkPlaceRateUpdateDeleteAPIView",
    "WorkPlaceRateListfilteringAPIView",
    "AdminWorkScheduleDetailAPIView",
    "AdminWorkScheduleDownloadAPIView",
    "AdminWorkScheduleListCreateAPIView",
    "UserWorkScheduleAPIView",
    "UserWorkSchedulePreviewPageAPIView",
]
