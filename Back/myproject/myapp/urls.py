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
    FinanceTableDateFilteredAPIView
)

urlpatterns = [
    # Login-Home
    path('check_admin_login/', CheckAdminLoginAPIView.as_view(),  name='check-admin-login'),
    path('check_user_login/',  CheckUserLoginAPIView.as_view(),   name='check-user-login'),
    
    # Dashboard-admin-page
    path('user_info_list/',       UserInfoListAPIView.as_view(),       name='user-info-list'),
    path('user_info_delete/',     UserInfoDeleteAPIView.as_view(),     name='user-info-delete'),
    path('user_info_update/',     UserInfoUpdateAPIView.as_view(),     name='user-info-update'),
    path('user_info_add/',        UserInfoAddAPIView.as_view(),        name='user-info-add'),    
    path('user_info_filtering/',  UserInfoFilteringAPIView.as_view(),  name='user-info-filtering'),

    # Dashboard-admin-sales
    path('finance_total/',  FinanceTableDateFilteredAPIView.as_view(),  name='finance_total'),


    # User-page
    path('user_work_info/',   UserWorkInfoAPIView.as_view(), name='user-work-info'),

    # Refersh-Token
    path('refresh_token/',   TokenRefreshAPIView.as_view(), name='refresh-token'),
]