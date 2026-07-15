from django.db import migrations


def normalize_user_workdetail_work_type(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(work_type="잔업").update(work_type="평일 잔업")
    UserWorkDetail.objects.filter(work_type="철야연장").update(work_type="철야 잔업")


def restore_user_workdetail_work_type(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(work_type="평일 잔업").update(work_type="잔업")
    UserWorkDetail.objects.filter(work_type="철야 잔업").update(work_type="철야연장")


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0024_remove_user_workday_uniq_user_date_shift_and_more"),
    ]

    operations = [
        migrations.RunPython(
            normalize_user_workdetail_work_type,
            restore_user_workdetail_work_type,
        ),
    ]
