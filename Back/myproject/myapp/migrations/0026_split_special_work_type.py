from django.db import migrations


def split_special_work_type(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(
        work_type="특근",
        work_date__work_shift="야간",
    ).update(work_type="야간 특근")
    UserWorkDetail.objects.filter(work_type="특근").update(work_type="주간 특근")


def restore_special_work_type(apps, schema_editor):
    UserWorkDetail = apps.get_model("myapp", "User_WorkDetail")
    UserWorkDetail.objects.filter(work_type__in=["주간 특근", "야간 특근"]).update(
        work_type="특근"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0025_normalize_user_workdetail_work_type"),
    ]

    operations = [
        migrations.RunPython(split_special_work_type, restore_special_work_type),
    ]
