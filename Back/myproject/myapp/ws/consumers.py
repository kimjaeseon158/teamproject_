import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser  # 인증 확인을 위해 임포트
from ..models import Notice
from .pending import get_pending_counts

class RequestMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. 미들웨어에서 인증된 유저 가져오기
        self.user = self.scope.get("user")

        # 2. 수정됨: Admin_Login_Info 객체에는 is_anonymous 속성이 없으므로 isinstance로 체크
        if self.user is None or isinstance(self.user, AnonymousUser):
            await self.close()
            return

        self.group_name = "admin_request_monitor"
        self.last_count = None  # 직전 카운트 상태 저장용
        self.last_counts_by_date = None

        # 3. 그룹 가입
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # 4. Subprotocol 수락 (클라이언트가 보낸 토큰을 그대로 응답 헤더에 포함)
        subprotocols = self.scope.get("subprotocols", [])
        if subprotocols:
            await self.accept(subprotocols[0])
        else:
            await self.accept()

        # 5. 최초 연결 시 현재 카운트 조회 및 전송
        # DB 조회는 비동기적으로 처리
        payload = await sync_to_async(get_pending_counts)()
        initial_count = payload["count"]

        self.last_count = initial_count
        self.last_counts_by_date = payload["counts_by_date"]

        # 최초 접속 시 0보다 크면 데이터 전송
        if initial_count > 0:
            await self.send(
                text_data=json.dumps({**payload, "is_initial": True})
            )

    async def disconnect(self, close_code):
        # 그룹 탈퇴
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # 스케줄러(operator.py)로부터 메시지를 받았을 때 실행
    async def count_update_message(self, event):
        new_count = event["count"]
        counts_by_date = event["counts_by_date"]

        changed = (
            new_count != self.last_count
            or counts_by_date != self.last_counts_by_date
        )
        self.last_count = new_count
        self.last_counts_by_date = counts_by_date
        # 전체 건수 또는 날짜별 분포가 바뀌었을 때 전송 (0건은 제외)
        if new_count > 0 and changed:
            await self.send(
                text_data=json.dumps({
                    "count": new_count,
                    "counts_by_date": counts_by_date,
                    "is_initial": False,
                })
            )

class UserRejectMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")

        if self.user is None or isinstance(self.user, AnonymousUser):
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

        from ..models import User_WorkDay

        def _initial_payload():
            qs = (
                User_WorkDay.objects
                .filter(user_uuid_id=self.user_uuid, is_approved=False)
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

        if initial_count > 0:            # 최초 접속 시 0보다 크면 데이터 전송
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

        # 값이 바뀐 경우만 전송
        if new_count > 0 and new_count != self.last_count:
            self.last_count = new_count
            await self.send(text_data=json.dumps({
                "count": new_count,
                "rejects": rejects,
                "is_initial": False
            }))
        else:
            self.last_count = new_count


class UserNoticeConsumer(AsyncWebsocketConsumer):
    group_name = "user_notices"

    async def connect(self):
        self.user = self.scope.get("user")
        if self.user is None or isinstance(self.user, AnonymousUser):
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        subprotocols = self.scope.get("subprotocols", [])
        await self.accept(subprotocols[0] if subprotocols else None)

        unread_titles = await sync_to_async(list)(
            Notice.objects.exclude(read_records__user=self.user).values_list(
                "title",
                flat=True,
            )
        )
        for title in unread_titles:
            await self.send(text_data=json.dumps({"title": title}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notice_created_message(self, event):
        await self.send(text_data=json.dumps({"title": event["title"]}))
