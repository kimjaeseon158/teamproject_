from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0043_adminwidgetlayout"),
    ]

    operations = [
        TrigramExtension(),
        migrations.AddIndex(
            model_name="user_login_info",
            index=GinIndex(
                fields=["user_name"],
                opclasses=["gin_trgm_ops"],
                name="user_name_trgm_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="user_workday",
            index=models.Index(
                fields=["user_uuid", "work_date"], name="workday_user_date_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="user_workday",
            index=models.Index(
                fields=["is_approved", "-work_date"], name="workday_status_date_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="user_workdetail",
            index=models.Index(
                fields=["work_type", "work_date"], name="detail_type_workday_idx"
            ),
        ),
    ]
