from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0044_query_performance_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="user_login_info",
            name="failed_login_attempts",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddConstraint(
            model_name="user_login_info",
            constraint=models.CheckConstraint(
                check=models.Q(failed_login_attempts__gte=0, failed_login_attempts__lte=20),
                name="user_failed_login_attempts_range",
            ),
        ),
    ]
