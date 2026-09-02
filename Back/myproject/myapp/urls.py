# myapp/urls.py
from django.urls import path
from .views import (
    CheckAdminLoginAPIView,
    UserWorkInfoAPIView,
    UserInfoDeleteAPIView,
    UserInfoUpdateAPIView,
    UserPasswordChangeAPIView,
    UserPasswordResetRequestAPIView,
    CheckUserLoginAPIView,
    UserInfoFilteringAPIView,
    UserInfoListAPIView,
    UserInfoAddAPIView,
    AdminPasswordResetRequestAPIView,
    UserWorkPlaceListAPIView,
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
    GoogleLogoutAPIView,
    GoogleCallbackAPIView,
    GoogleCalendarEventsAPIView,
    GoogleDriveWorkplaceExcelExportAPIView,
    GoogleDriveSalaryExcelExportAPIView,
    GoogleDriveUserPayExcelExportAPIView,
    AdminLogoutAPIView,
    UserLogoutAPIView,
    AdminPageWorkDayListAPIView,
    AdminWorkDayStatusUpdateAPIView,
    AdminWorkPlaceListCreateAPIView,
    AdminWorkPlaceUpdateDeleteAPIView,
    WorkPlaceRateListCreateAPIView,
    WorkPlaceRateUpdateDeleteAPIView,
    WorkPlaceRateListfilteringAPIView,
    Expense3MonthsTotalsAPIView,
    UserMonthlyWorkSummaryAPIView,
    AdminWorkScheduleBatchAPIView,
    AdminWorkScheduleWeekAPIView,
    UserWorkScheduleWeekAPIView,
    UserContactListAPIView,
    AdminNoticeDetailAPIView,
    AdminNoticeListCreateAPIView,
    UserNoticeDetailAPIView,
    UserNoticeListCreateAPIView,
    UserNoticeReadAPIView,
)

# fmt:off
urlpatterns = [
    # Login-Home
    path('check-admin-login/',    CheckAdminLoginAPIView.as_view(),  name='check-admin-login'),
    path('admin-logout/',         AdminLogoutAPIView.as_view(),      name='admin-logout'),
    path('check-user-login/',     CheckUserLoginAPIView.as_view(),   name='check-user-login'),
    path('user-password-change/', UserPasswordChangeAPIView.as_view(), name='user-password-change'),
    path('user-password-reset-request/', UserPasswordResetRequestAPIView.as_view(), name='user-password-reset-request'),
    path('user-logout/',          UserLogoutAPIView.as_view(),       name='user-logout'),
    
    # Dashboard-admin-page
    path('user-info-list/',                                     UserInfoListAPIView.as_view(),                name='user-info-list'),
    path('user-info-delete/',                                   UserInfoDeleteAPIView.as_view(),              name='user-info-delete'),
    path('user-info-update/',                                   UserInfoUpdateAPIView.as_view(),              name='user-info-update'),
    path('user-info-add/',                                      UserInfoAddAPIView.as_view(),                 name='user-info-add'),    
    path('admin-password-reset-requests/',                      AdminPasswordResetRequestAPIView.as_view(),   name='admin-password-reset-requests'),
    path('user-info-filtering/',                                UserInfoFilteringAPIView.as_view(),           name='user-info-filtering'),
    path('admin-page-workday/',                                 AdminPageWorkDayListAPIView.as_view(),        name='admin-page-workday'),
    path('admin-workday-status-update/',                        AdminWorkDayStatusUpdateAPIView.as_view(),    name='admin-workday-status-update'),
    path('admin-work-place-list-create/',                       AdminWorkPlaceListCreateAPIView.as_view(),    name='admin-work-place-list-create'),
    path('admin-work-place-update-delete/',                     AdminWorkPlaceUpdateDeleteAPIView.as_view(),  name='admin-work-place-update-delete'),
    path('work-place-rate-list-create/',                        WorkPlaceRateListCreateAPIView.as_view(),     name='work-place-rate-list-create'),
    path('work-place-rate-update-delete/',                      WorkPlaceRateUpdateDeleteAPIView.as_view(),   name='work-place-rate-update-delete'),
    path('work-place-rate-list-filtering/',                     WorkPlaceRateListfilteringAPIView.as_view(),  name='work-place-rate-list-filtering'),
    path('admin-work-schedules/',                               AdminWorkScheduleWeekAPIView.as_view(),       name='admin-work-schedules'),
    path('admin-work-schedules/batch/',                         AdminWorkScheduleBatchAPIView.as_view(),      name='admin-work-schedules-batch'),
    


    # Google OAuth / Calendar
    path('google/login/',                       GoogleLoginAPIView.as_view(),          name='google-login'),
    path('google/logout/',                      GoogleLogoutAPIView.as_view(),         name='google-logout'),
    path('google/callback/',                    GoogleCallbackAPIView.as_view(),       name='google-callback'),
    path('google/calendar/events/',             GoogleCalendarEventsAPIView.as_view(), name='google-calendar-events'),
    path('google-drive-excel-export/',          GoogleDriveWorkplaceExcelExportAPIView.as_view(), name='google-drive-excel-export'),
    path('google-drive-salary-excel-export/',   GoogleDriveSalaryExcelExportAPIView.as_view(), name='google-drive-salary-excel-export'),
    path('google-drive-user-pay-excel-export/', GoogleDriveUserPayExcelExportAPIView.as_view(), name='google-drive-user-pay-excel-export'),

    
    # Dashboard-Total-sales
    path('finance-total/',           FinanceTableDateFilteredAPIView.as_view(),  name='finance-total'),
    path('income-filtered/',         IncomeDateFilteredAPIView.as_view(),        name='income-filtered'),
    path('expense-filtered/',        ExpenseDateFilteredAPIView.as_view(),       name='expense-filtered'),
    path('expense-3months-totals/',  Expense3MonthsTotalsAPIView.as_view(),      name='expense-3months'),    
    path('income-add/',              IncomeAddAPIView.as_view(),                 name='income-add'),
    path('expense-add/',             ExpenseAddAPIView.as_view(),                name='expense-add'),
    path('income-update/',           IncomeUpdateAPIView.as_view(),              name='income-update'),
    path('expense-update/',          ExpenseUpdateAPIView.as_view(),             name='expense-update'),
    path('income-delete/',           IncomeDeleteAPIView.as_view(),              name='income-delete'),
    path('expense-delete/',          ExpenseDeleteAPIView.as_view(),             name='expense-delete'),

    # User-page
    path('user-work-info/',              UserWorkInfoAPIView.as_view(),           name='user-work-info'),
    path('user-monthly-work-summary/',   UserMonthlyWorkSummaryAPIView.as_view(), name='user-monthly-work-summary'),
    path('user-work-places/',            UserWorkPlaceListAPIView.as_view(), name='user-work-places'),
    path('user-work-schedule/',           UserWorkScheduleWeekAPIView.as_view(), name='user-work-schedule'),
    path('user-contacts/',                UserContactListAPIView.as_view(), name='user-contacts'),

    # Notices
    path('admin/notices/', AdminNoticeListCreateAPIView.as_view(), name='admin-notice-list-create'),
    path('admin/notices/<uuid:notice_uuid>/', AdminNoticeDetailAPIView.as_view(), name='admin-notice-detail'),
    path('user/notices/', UserNoticeListCreateAPIView.as_view(), name='user-notice-list-create'),
    path('user/notices/<uuid:notice_uuid>/', UserNoticeDetailAPIView.as_view(), name='user-notice-detail'),
    path('user/notices/<uuid:notice_uuid>/read/', UserNoticeReadAPIView.as_view(), name='user-notice-read'),

    # Refresh-Token
    path('refresh-token/',   TokenRefreshAPIView.as_view(), name='refresh-token')
]
# fmt:on
