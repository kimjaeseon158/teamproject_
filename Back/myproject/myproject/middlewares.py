from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from myapp.models import Admin_Login_Info  # ✅ 관리자 모델 임포트


@database_sync_to_async
def get_user(token_key):
    try:
        print(f"--- 미들웨어에 도달한 토큰: {token_key[:20]}... ---")  # 첫 부분 출력
        access_token = AccessToken(token_key)
        sub = access_token.get("sub")
        print(f"--- 토큰 파싱 성공 (sub: {sub}) ---")

        return Admin_Login_Info.objects.get(admin_id=sub)
    except Exception as e:
        print(f"❌ WS Auth Error 상세: {e}")  # 에러 원인 구체적으로 출력
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        subprotocols = scope.get("subprotocols", [])
        if subprotocols:
            token_key = subprotocols[0]
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
