from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    try:
        # 1. 토큰 해독 및 검증
        access_token = AccessToken(token_key)

        # 2. 'sub' 필드(사번) 추출
        emp_num = access_token.get("sub")

        if not emp_num:
            return AnonymousUser()

        # 3. 유저 조회 (employee_number 필드명 확인 완료)
        return User.objects.get(employee_number=emp_num)

    except Exception as e:
        # 토큰 만료, 서명 불일치, 유저 없음 등 모든 예외 처리
        print(f"WS Auth Error: {e}")
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # 1. Subprotocols 리스트에서 토큰 추출
        # 클라이언트가 [token] 식으로 보냈으므로 첫 번째 요소를 가져옵니다.
        subprotocols = scope.get("subprotocols", [])

        if subprotocols:
            token_key = subprotocols[0]  # 첫 번째 인자가 토큰
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
