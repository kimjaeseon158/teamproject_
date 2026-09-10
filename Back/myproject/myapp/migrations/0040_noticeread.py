from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("myapp", "0039_notice")]

    operations = [
        migrations.CreateModel(
            name="NoticeRead",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("read_at", models.DateTimeField(auto_now_add=True)),
                (
                    "notice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="read_records",
                        to="myapp.notice",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notice_reads",
                        to="myapp.user_login_info",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="noticeread",
            constraint=models.UniqueConstraint(
                fields=("user", "notice"),
                name="unique_notice_read_per_user",
            ),
        ),
    ]
