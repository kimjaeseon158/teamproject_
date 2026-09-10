from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("myapp", "0042_noticeimage")]

    operations = [
        migrations.CreateModel(
            name="AdminWidgetLayout",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("layout", models.JSONField(default=dict)),
                ("version", models.PositiveIntegerField(default=1)),
                ("previous_layout", models.JSONField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("admin", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="widget_layout", to="myapp.admin_login_info")),
            ],
        ),
    ]
