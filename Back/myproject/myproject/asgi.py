"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

# 1. 환경 변수 설정을 최상단으로
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from myproject.middlewares import TokenAuthMiddleware
import myapp.routing

# 2. application 설정
application = ProtocolTypeRouter({
    # HTTP 요청은 기존 방식으로 처리
    "http": get_asgi_application(),
    
    # 웹소켓 요청은 우리가 만든 미들웨어와 루팅으로 처리
    "websocket": TokenAuthMiddleware(
        URLRouter(
            myapp.routing.websocket_urlpatterns
        )
    ),
})
