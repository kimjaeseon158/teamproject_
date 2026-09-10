import uuid

from django.db import migrations, models
import django.db.models.deletion
import myapp.models.notices


class Migration(migrations.Migration):
    dependencies = [("myapp", "0041_notice_tiptap_content")]

    operations = [
        migrations.CreateModel(
            name="NoticeImage",
            fields=[
                (
                    "image_uuid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "image",
                    models.ImageField(
                        upload_to=myapp.models.notices.notice_image_upload_to
                    ),
                ),
                ("display_order", models.PositiveSmallIntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "notice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="myapp.notice",
                    ),
                ),
            ],
            options={
                "ordering": ["display_order", "created_at", "image_uuid"],
            },
        ),
        migrations.AddConstraint(
            model_name="noticeimage",
            constraint=models.UniqueConstraint(
                fields=("notice", "display_order"),
                name="unique_notice_image_display_order",
            ),
        ),
    ]
