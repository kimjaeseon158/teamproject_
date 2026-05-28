from django.db import migrations, models


def copy_special_wage(apps, schema_editor):
    WorkPlaceRate = apps.get_model("myapp", "WorkPlaceRate")
    for rate in WorkPlaceRate.objects.all():
        rate.day_special_hourly_wage = rate.special_hourly_wage
        rate.night_special_hourly_wage = rate.special_hourly_wage
        rate.save(
            update_fields=[
                "day_special_hourly_wage",
                "night_special_hourly_wage",
            ]
        )


def clear_split_special_wage(apps, schema_editor):
    WorkPlaceRate = apps.get_model("myapp", "WorkPlaceRate")
    WorkPlaceRate.objects.update(
        day_special_hourly_wage=None,
        night_special_hourly_wage=None,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0026_split_special_work_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="workplacerate",
            name="day_special_hourly_wage",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="workplacerate",
            name="night_special_hourly_wage",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.RunPython(copy_special_wage, clear_split_special_wage),
    ]
