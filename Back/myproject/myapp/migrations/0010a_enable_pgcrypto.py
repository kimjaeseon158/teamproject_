from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0009_remove_adminrefreshtoken_admin_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql=r"""
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]