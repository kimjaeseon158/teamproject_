from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import User_WorkDay

@receiver([post_save, post_delete], sender=User_WorkDay)
def notify_count_change(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    # status가 null인 전체 건수 카운트
    current_null_count = User_WorkDay.objects.filter(is_approved__isnull=True).count()
    
    # 그룹 전체에 알림 (로직 처리는 Consumer에서 수행)
    async_to_sync(channel_layer.group_send)(
        "request_monitor_group",
        {
            "type": "count_update_message",
            "count": current_null_count,
        }
    )