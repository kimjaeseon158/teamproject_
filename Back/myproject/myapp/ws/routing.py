# user_request/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # ws://localhost:8000/ws/requests/ 경로로 접속하면 
    # RequestMonitorConsumer를 실행하라는 의미입니다.
    re_path(r'ws/admin/request-monitor/$', consumers.RequestMonitorConsumer.as_asgi()),
    re_path(r'ws/user/request-monitor/$', consumers.UserRejectMonitorConsumer.as_asgi()),
]