# 관리자 기능별 API 패키지
# 관리자 인증·사용자·근무·일정·재무 API를 제공하는 패키지

from .admin_auth import AdminLogoutAPIView, CheckAdminLoginAPIView
from .finance import (
    Expense3MonthsTotalsAPIView,
    ExpenseAddAPIView,
    ExpenseDateFilteredAPIView,
    ExpenseDeleteAPIView,
    ExpenseUpdateAPIView,
    FinanceTableDateFilteredAPIView,
    IncomeAddAPIView,
    IncomeDateFilteredAPIView,
    IncomeDeleteAPIView,
    IncomeUpdateAPIView,
)
from .password_reset import AdminPasswordResetRequestAPIView
from .notices import AdminNoticeDetailAPIView, AdminNoticeListCreateAPIView
from .schedules import AdminWorkScheduleBatchAPIView, AdminWorkScheduleWeekAPIView
from .user_management import (
    UserInfoAddAPIView,
    UserInfoDeleteAPIView,
    UserInfoFilteringAPIView,
    UserInfoListAPIView,
    UserInfoUpdateAPIView,
)
from .workdays import AdminPageWorkDayListAPIView, AdminWorkDayStatusUpdateAPIView
from .workplace_rates import (
    WorkPlaceRateListCreateAPIView,
    WorkPlaceRateListfilteringAPIView,
    WorkPlaceRateUpdateDeleteAPIView,
)
from .workplaces import AdminWorkPlaceListCreateAPIView, AdminWorkPlaceUpdateDeleteAPIView

__all__ = [name for name in globals() if name.endswith("APIView")]
