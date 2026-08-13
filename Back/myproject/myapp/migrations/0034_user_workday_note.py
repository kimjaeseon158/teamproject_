from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0033_workschedule_workschedulepreviewpage_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="user_workday",
            name="note",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
