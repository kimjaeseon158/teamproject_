# Generated manually for initial user password change flow.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0030_adminworkplace"),
    ]

    operations = [
        migrations.AddField(
            model_name="user_login_info",
            name="must_change_password",
            field=models.BooleanField(default=True),
        ),
    ]
