import uuid
from django.db import migrations

def fill_admin_uuid(apps, schema_editor):
    Admin = apps.get_model("myapp", "Admin_Login_Info")
    qs = Admin.objects.filter(admin_uuid__isnull=True)

    for a in qs.iterator():
        a.admin_uuid = uuid.uuid4()
        a.save(update_fields=["admin_uuid"])

class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0010_switch_user_pk_to_uuid"),
    ]

    operations = [
        migrations.RunPython(fill_admin_uuid, migrations.RunPython.noop),
    ]