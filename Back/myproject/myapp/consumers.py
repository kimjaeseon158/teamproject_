import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async


class RequestMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. 미들웨어에서 인증된 유저 가져오기
        self.user = self.scope["user"]

        # 2. 토큰 인증 실패(AnonymousUser) 시 연결 거부
        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = "request_monitor_group"
        self.last_count = None  # 직전 카운트 상태 저장용

        # 3. 그룹 가입
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # 4. ✅ Subprotocol 수락 (클라이언트가 보낸 토큰을 그대로 응답 헤더에 포함)
        subprotocols = self.scope.get("subprotocols", [])
        if subprotocols:
            await self.accept(subprotocols[0])
        else:
            await self.accept()

        # 5. 최초 연결 시 현재 카운트 조회 및 전송
        from .models import User_WorkDay

        # DB 조회는 비동기적으로 처리
        initial_count = await sync_to_async(
            lambda: User_WorkDay.objects.filter(is_approved__isnull=True).count()
        )()

        self.last_count = initial_count

        # 최초 접속 시 0보다 크면 데이터 전송
        if initial_count > 0:
            await self.send(
                text_data=json.dumps({"count": initial_count, "is_initial": True})
            )

    async def disconnect(self, close_code):
        # 그룹 탈퇴
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # 스케줄러(operator.py)로부터 메시지를 받았을 때 실행
    async def count_update_message(self, event):
        new_count = event["count"]

        # ✅ 비즈니스 로직: 0보다 커야 하고, 이전 값과 달라야 전송
        if new_count > 0 and new_count != self.last_count:
            self.last_count = new_count

            await self.send(
                text_data=json.dumps({"count": new_count, "is_initial": False})
            )
        else:
            # 0이거나 값이 같다면 서버 메모리만 업데이트하고 클라이언트에 쏘지 않음
            self.last_count = new_count
