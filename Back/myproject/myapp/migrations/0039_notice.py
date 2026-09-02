import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("myapp", "0038_expense_payment_method")]

    operations = [
        migrations.CreateModel(
            name="Notice",
            fields=[
                (
                    "notice_uuid",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("title", models.CharField(max_length=100)),
                ("content", models.CharField(max_length=500)),
                (
                    "author_type",
                    models.CharField(
                        choices=[("admin", "Admin"), ("user", "User")], max_length=5
                    ),
                ),
                ("author_uuid", models.UUIDField()),
                ("author_name", models.CharField(max_length=50)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at", "-notice_uuid"]},
        )
    ]
