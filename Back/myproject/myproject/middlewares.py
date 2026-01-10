from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        # 토큰 검증 및 유저 추출
        access_token = AccessToken(token_key)
        emp_number = access_token['sub']
        return User.objects.get(employee_number=emp_number)
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # URL 쿼리 스트링에서 token 추출 (예: ws://.../?token=ABC)
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token_key = query_params.get("token")

        if token_key:
            scope['user'] = await get_user(token_key)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)