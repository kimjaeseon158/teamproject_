from django.db import models

from .accounts import Admin_Login_Info


class AdminWidgetLayout(models.Model):
    admin = models.OneToOneField(
        Admin_Login_Info, on_delete=models.CASCADE, related_name="widget_layout"
    )
    layout = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    previous_layout = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
