# myapp/urls.py
from django.urls import path
from .views import CheckAdminLoginAPIView, ItemUserProfileHandler

urlpatterns = [
    path('check_admin_login/', CheckAdminLoginAPIView.as_view(), name='check-admin-login'),  # 로그인 전용
    path('items/', ItemUserProfileHandler.as_view(), name='item-userprofile-handler'),
]