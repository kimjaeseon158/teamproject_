from django.db import migrations, models

import myapp.encryption.fields
from myapp.encryption.crypto import resident_number_blind_index


def encrypt_existing_values(apps, schema_editor):
    UserLoginInfo = apps.get_model("myapp", "User_Login_Info")
    for user in UserLoginInfo.objects.all().iterator():
        # The custom fields accept plaintext during this transition and encrypt on save.
        user.resident_number_hash = resident_number_blind_index(user.resident_number)
        user.save(update_fields=["resident_number", "address", "resident_number_hash"])


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0031_user_login_info_must_change_password"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="user_login_info",
            name="unique_resident_number",
        ),
        migrations.AddField(
            model_name="user_login_info",
            name="resident_number_hash",
            field=models.CharField(blank=True, editable=False, max_length=64, null=True),
        ),
        migrations.AlterField(
            model_name="user_login_info",
            name="resident_number",
            field=myapp.encryption.fields.EncryptedTextField(),
        ),
        migrations.AlterField(
            model_name="user_login_info",
            name="address",
            field=myapp.encryption.fields.EncryptedTextField(),
        ),
        migrations.RunPython(encrypt_existing_values, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user_login_info",
            name="resident_number_hash",
            field=models.CharField(editable=False, max_length=64, unique=True),
        ),
    ]
