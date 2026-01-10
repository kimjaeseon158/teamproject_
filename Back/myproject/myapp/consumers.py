import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class RequestMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "request_monitor_group"
        self.last_count = None  # 직전 카운트를 저장할 변수

        # 1. 그룹 가입
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # 2. 최초 연결 시 로직 처리
        from .models import User_WorkDay
        # DB 조회는 비동기 처리를 위해 sync_to_async 사용
        initial_count = await sync_to_async(User_WorkDay.objects.filter(is_approved__isnull=True).count)()
        
        self.last_count = initial_count
        
        # 최초 연결 시 0보다 크면 전송
        if initial_count > 0:
            await self.send(text_data=json.dumps({
                'count': initial_count,
                'is_initial': True
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # 시그널로부터 메시지를 받았을 때
    async def count_update_message(self, event):
        new_count = event['count']
        
        # 조건: 0보다 커야 함 AND 직전 값과 달라야 함
        if new_count > 0 and new_count != self.last_count:
            self.last_count = new_count  # 현재 값을 마지막 값으로 업데이트
            
            await self.send(text_data=json.dumps({
                'count': new_count,
                'is_initial': False
            }))
        else:
            # 조건에 맞지 않으면(예: 여전히 0이거나 값이 같으면) 클라이언트에 보내지 않음
            self.last_count = new_count
            
class RequestMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        # 토큰 인증이 안 된(AnonymousUser) 경우 연결 거부
        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = "request_monitor_group"
        self.last_count = None

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # 최초 카운트 전송 로직
        from .models import User_WorkDay
        count = await sync_to_async(User_WorkDay.objects.filter(is_approved__isnull=True).count)()
        self.last_count = count
        
        if count > 0:
            await self.send(text_data=json.dumps({'count': count, 'is_initial': True}))