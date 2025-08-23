# myapp/urls.py
from django.urls import path
from .views import (
    CheckAdminLoginAPIView, 
    UserLoginInfoAPIView, 
    UserWorkInfoAPIView, 
    UserInfoDeleteAPIView, 
    UserInfoUpdateAPIView, 
    CheckUserLoginAPIView, 
    TableFilteringAPIView
)

urlpatterns = [
    path('check_admin_login/', CheckAdminLoginAPIView.as_view(), name='check-admin-login'),  # 로그인 전용
    path('user_login_info/', UserLoginInfoAPIView.as_view(), name='user-login-info'),
    path('user_work_info/', UserWorkInfoAPIView.as_view(), name='user-work-info'),
    path('user_info_delete/', UserInfoDeleteAPIView.as_view(), name='user-info-delete'),
    path('user_info_update/', UserInfoUpdateAPIView.as_view(), name='user-info-update'),
    path('check_user_login/', CheckUserLoginAPIView.as_view(), name='check-user-login'),
    path('table_filtering/', TableFilteringAPIView.as_view(), name='table-filtering'),
]