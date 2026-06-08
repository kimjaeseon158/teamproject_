# myapp/urls.py
from django.urls import path
from .views import (
    CheckAdminLoginAPIView,
    UserWorkInfoAPIView,
    UserInfoDeleteAPIView,
    UserInfoUpdateAPIView,
    CheckUserLoginAPIView,
    UserInfoFilteringAPIView,
    UserInfoListAPIView,
    UserInfoAddAPIView,
    TokenRefreshAPIView,
    FinanceTableDateFilteredAPIView,
    IncomeDateFilteredAPIView,
    ExpenseDateFilteredAPIView,
    IncomeAddAPIView,
    ExpenseAddAPIView,
    IncomeUpdateAPIView,
    ExpenseUpdateAPIView,
    IncomeDeleteAPIView,
    ExpenseDeleteAPIView,
    GoogleLoginAPIView,
    GoogleCallbackAPIView,
    GoogleCalendarEventsAPIView,
    GoogleDriveWorkplaceExcelExportAPIView,
    GoogleDriveSalaryExcelExportAPIView,
    GoogleDriveUserPayExcelExportAPIView,
    AdminLogoutAPIView,
    UserLogoutAPIView,
    AdminPageWorkDayListAPIView,
    AdminWorkDayStatusUpdateAPIView,
    WorkPlaceRateListCreateAPIView,
    WorkPlaceRateUpdateDeleteAPIView,
    WorkPlaceRateListfilteringAPIView,
    Expense3MonthsTotalsAPIView,
    UserMonthlyWorkSummaryAPIView
)

# fmt:off
urlpatterns = [
    # Login-Home
    path('check_admin_login/', CheckAdminLoginAPIView.as_view(),  name='check-admin-login'),
    path('admin_logout/',      AdminLogoutAPIView.as_view(),      name='admin-logout'),
    path('check_user_login/',  CheckUserLoginAPIView.as_view(),   name='check-user-login'),
    path('user_logout/',       UserLogoutAPIView.as_view(),       name='user-logout'),
    
    # Dashboard-admin-page
    path('user_info_list/',                  UserInfoListAPIView.as_view(),                name='user-info-list'),
    path('user_info_delete/',                UserInfoDeleteAPIView.as_view(),              name='user-info-delete'),
    path('user_info_update/',                UserInfoUpdateAPIView.as_view(),              name='user-info-update'),
    path('user_info_add/',                   UserInfoAddAPIView.as_view(),                 name='user-info-add'),    
    path('user_info_filtering/',             UserInfoFilteringAPIView.as_view(),           name='user-info-filtering'),
    path('admin_page_workday/',              AdminPageWorkDayListAPIView.as_view(),        name='admin-page-workday'),
    path('admin_workday_status_update/',     AdminWorkDayStatusUpdateAPIView.as_view(),    name='admin-workday-status-update'),
    path('work_place_rate_list_create/',     WorkPlaceRateListCreateAPIView.as_view(),     name='work-place-rate-list-create'),
    path('work_place_rate_update_delete/',   WorkPlaceRateUpdateDeleteAPIView.as_view(),   name='work-place-rate-update-delete'),
    path('work_place_rate_list_filtering/',  WorkPlaceRateListfilteringAPIView.as_view(),  name='work-place-rate-list-filtering'),
    


    # Dashboard-google-calendar
    path('google_calendar_auth/',             GoogleLoginAPIView.as_view(),                     name='google-calendar-auth'),
    path('google_calendar_auth/callback/',    GoogleCallbackAPIView.as_view(),                  name='google-calendar-auth-back'),
    path('google_calendar_auth/events/',      GoogleCalendarEventsAPIView.as_view(),            name='google-calendar-auth-events'),
    path('google_drive_excel_export/',        GoogleDriveWorkplaceExcelExportAPIView.as_view(), name='google-drive-excel-export'),
    path('google_drive_salary_excel_export/', GoogleDriveSalaryExcelExportAPIView.as_view(), name='google-drive-salary-excel-export'),
    path('google_drive_user_pay_excel_export/', GoogleDriveUserPayExcelExportAPIView.as_view(), name='google-drive-user-pay-excel-export'),

    
    # Dashboard-Total-sales
    path('finance_total/',           FinanceTableDateFilteredAPIView.as_view(),  name='finance-total'),
    path('income_filtered/',         IncomeDateFilteredAPIView.as_view(),        name='income-filtered'),
    path('expense_filtered/',        ExpenseDateFilteredAPIView.as_view(),       name='expense-filtered'),
    path('expense_3months_totals/',  Expense3MonthsTotalsAPIView.as_view(),      name='expense-3months'),    
    path('income_add/',              IncomeAddAPIView.as_view(),                 name='income-add'),
    path('expense_add/',             ExpenseAddAPIView.as_view(),                name='expense-add'),
    path('income_update/',           IncomeUpdateAPIView.as_view(),              name='income-update'),
    path('expense_update/',          ExpenseUpdateAPIView.as_view(),             name='expense_update'),
    path('income_delete/',           IncomeDeleteAPIView.as_view(),              name='income-delete'),
    path('expense_delete/',          ExpenseDeleteAPIView.as_view(),             name='expense-delete'),

    # User-page
    path('user_work_info/',              UserWorkInfoAPIView.as_view(),           name='user-work-info'),
    path('user_monthly_work_summary/',   UserMonthlyWorkSummaryAPIView.as_view(), name='user-work-info'),


    # Refersh-Token
    path('refresh_token/',   TokenRefreshAPIView.as_view(), name='refresh-token')
]
# fmt:on
