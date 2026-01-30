import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser  # 인증 확인을 위해 임포트

class RequestMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. 미들웨어에서 인증된 유저 가져오기
        self.user = self.scope.get("user")

        # 2. 수정됨: Admin_Login_Info 객체에는 is_anonymous 속성이 없으므로 isinstance로 체크
        if self.user is None or isinstance(self.user, AnonymousUser):
            print("WS 연결 거부: 인증되지 않은 사용자")
            await self.close()
            return

        print(f"WS 연결 수락: 관리자({self.user.admin_id}) 접속")

        self.group_name = f"admin_request_monitor_{self.admin_uuid}" # 여러
        self.last_count = None  # 직전 카운트 상태 저장용

        # 3. 그룹 가입
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # 4. Subprotocol 수락 (클라이언트가 보낸 토큰을 그대로 응답 헤더에 포함)
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
            print(f"WS 연결 종료: 코드 {close_code}")

    # 스케줄러(operator.py)로부터 메시지를 받았을 때 실행
    async def count_update_message(self, event):
        new_count = event["count"]

        # 비즈니스 로직: 0보다 커야 하고, 이전 값과 달라야 전송
        if new_count > 0 and new_count != self.last_count:
            self.last_count = new_count

            await self.send(
                text_data=json.dumps({"count": new_count, "is_initial": False})
            )
        else:
            # 0이거나 값이 같다면 서버 메모리만 업데이트하고 클라이언트에 쏘지 않음
            self.last_count = new_count

class UserRejectMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")

        if self.user is None or isinstance(self.user, AnonymousUser):
            print("WS 연결 거부: 인증되지 않은 사용자")
            await self.close()
            return

        # 유저 UUID 
        self.user_uuid = str(self.user.user_uuid) 

        # 유저별 그룹
        self.group_name = f"user_reject_monitor_{self.user_uuid}"
        self.last_count = None

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        subprotocols = self.scope.get("subprotocols", [])
        if subprotocols:
            await self.accept(subprotocols[0])
        else:
            await self.accept()

        from .models import User_WorkDay

        def _initial_payload():
            qs = (
                User_WorkDay.objects
                .filter(user_uuid_id=self.user_uuid, is_approved="N")
                .order_by("-work_date")
                .values("work_date", "reject_reason")
            )
            rejects = [
                {"work_date": str(r["work_date"]), "reject_reason": r["reject_reason"]}
                for r in qs
            ]
            return len(rejects), rejects

        initial_count, rejects = await sync_to_async(_initial_payload)()
        self.last_count = initial_count

        # 초기 전송 (0이어도 보내고 싶으면 조건 제거)
        await self.send(text_data=json.dumps({
            "count": initial_count,
            "rejects": rejects,
            "is_initial": True
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def reject_update_message(self, event):
        new_count = event["count"]
        rejects = event.get("rejects", [])

        # 값이 바뀐 경우만 전송 (원하면 always 전송으로 바꿔도 됨)
        if new_count != self.last_count:
            self.last_count = new_count
            await self.send(text_data=json.dumps({
                "count": new_count,
                "rejects": rejects,
                "is_initial": False
            }))
        else:
            self.last_count = new_count