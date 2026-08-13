from django.db import migrations


def rename_overnight_to_night(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(work_type="철야").update(work_type="야간")
    UserWorkDetail.objects.filter(work_type="철야 잔업").update(work_type="야간 잔업")
    UserWorkDetail.objects.filter(work_type="철야연장").update(work_type="야간 잔업")


def rename_night_to_overnight(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(work_type="야간").update(work_type="철야")
    UserWorkDetail.objects.filter(work_type="야간 잔업").update(work_type="철야 잔업")


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0027_workplacerate_day_night_special_wage"),
    ]

    operations = [
        migrations.RunPython(rename_overnight_to_night, rename_night_to_overnight),
    ]
