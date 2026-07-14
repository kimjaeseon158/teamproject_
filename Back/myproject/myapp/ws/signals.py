from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from ..models import User_WorkDay
from django.db import transaction

@receiver([post_save, post_delete], sender=User_WorkDay)
def notify_count_change(sender, instance, **kwargs):
    def send_ws_update():
      channel_layer = get_channel_layer()
      # status가 null인 전체 건수 카운트
      # admin: 전체 대기(None) 카운트
      current_null_count = User_WorkDay.objects.filter(is_approved__isnull=True).count()
      
      # 그룹 전체에 알림 (로직 처리는 Consumer에서 수행)
      async_to_sync(channel_layer.group_send)(
          "admin_request_monitor",
          {
              "type": "count_update_message",
              "count": current_null_count,
          }
      )
  
      # user: 해당 유저의 반려(N) 카운트 + 사유 목록
      user_uuid = str(instance.user_uuid_id)  # FK 필드명에 맞게 (Ex.user_uuid_id)
      user_group_name = f"user_reject_monitor_{user_uuid}"
  
      qs = (
          User_WorkDay.objects
          .filter(user_uuid_id=user_uuid, is_approved=False)
          .order_by("-work_date")
          .values("work_date", "reject_reason")
      )
      rejects = [
          {"work_date": str(r["work_date"]), "reject_reason": r["reject_reason"]}
          for r in qs
      ]
  
      async_to_sync(channel_layer.group_send)(
          user_group_name,
          {
              "type": "reject_update_message",
              "count": len(rejects),
              "rejects": rejects,
          }
      )
    
    # 반드시 커밋된 후에 조회하고 전송하도록 보장
    transaction.on_commit(send_ws_update)
