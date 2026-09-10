from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("myapp", "0037_passwordresetrequest")]

    operations = [
        migrations.AddField(
            model_name="expense",
            name="payment_method",
            field=models.CharField(
                blank=True,
                max_length=20,
                null=True,
            ),
        ),
    ]
