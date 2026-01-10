# user_request/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # ws://localhost:8000/ws/requests/ 경로로 접속하면 
    # RequestMonitorConsumer를 실행하라는 의미입니다.
    re_path(r'ws/requests/$', consumers.RequestMonitorConsumer.as_asgi()),
]