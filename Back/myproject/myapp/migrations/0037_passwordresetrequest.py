import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("myapp", "0036_employeeworkschedule_and_more")]

    operations = [
        migrations.CreateModel(
            name="PasswordResetRequest",
            fields=[
                ("request_uuid", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("APPROVED", "Approved")], db_index=True, default="PENDING", max_length=10)),
                ("requested_at", models.DateTimeField(auto_now_add=True)),
                ("processed_at", models.DateTimeField(blank=True, null=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="password_reset_requests", to="myapp.user_login_info")),
            ],
            options={"ordering": ["requested_at"]},
        ),
        migrations.AddConstraint(
            model_name="passwordresetrequest",
            constraint=models.UniqueConstraint(condition=models.Q(("status", "PENDING")), fields=("user",), name="unique_pending_password_reset_per_user"),
        ),
    ]
