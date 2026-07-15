from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0028_rename_overnight_work_types_to_night"),
    ]

    operations = [
        migrations.AddField(
            model_name="workplacerate",
            name="early_hourly_wage",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
