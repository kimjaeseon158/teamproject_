from django.db import migrations, models
from django.db.models import Min
import django.db.models.deletion
from datetime import datetime
from zoneinfo import ZoneInfo


def backfill(apps, schema_editor):
    alias = schema_editor.connection.alias
    Rate = apps.get_model("myapp", "WorkPlaceRate")
    Day = apps.get_model("myapp", "User_WorkDay")
    Expense = apps.get_model("myapp", "Expense")
    today = datetime.now(ZoneInfo("Asia/Seoul")).date()
    missing = (
        Day.objects.using(alias)
        .filter(is_approved=True, salary_expense__isnull=True)
        .count()
    )
    if missing:
        raise RuntimeError(
            f"승인된 근무 {missing}건에 급여 지출이 없습니다. 전환 전에 확인해주세요."
        )
    for rate in Rate.objects.using(alias).all().iterator():
        first = (
            Day.objects.using(alias)
            .filter(user_uuid_id=rate.user_id, work_place=rate.work_place)
            .aggregate(first=Min("work_date"))["first"]
        )
        Rate.objects.using(alias).filter(pk=rate.pk).update(
            effective_start_date=first or today,
            used_for_approval=Day.objects.using(alias)
            .filter(
                user_uuid_id=rate.user_id, work_place=rate.work_place, is_approved=True
            )
            .exists(),
        )
    for expense in (
        Expense.objects.using(alias).filter(work_day__is_approved=True).iterator()
    ):
        Day.objects.using(alias).filter(pk=expense.work_day_id).update(
            salary_amount=expense.amount
        )


class Migration(migrations.Migration):
    dependencies = [("myapp", "0045_user_failed_login_attempts")]
    operations = [
        migrations.RemoveConstraint(
            model_name="workplacerate", name="uniq_user_work_place_rate"
        ),
        migrations.AddField(
            model_name="workplacerate",
            name="used_for_approval",
            field=models.BooleanField(default=False, editable=False),
        ),
        migrations.AddField(
            model_name="workplacerate",
            name="effective_start_date",
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name="workplacerate",
            name="effective_end_date",
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="user_workday",
            name="salary_amount",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="user_workday",
            name="salary_snapshot",
            field=models.JSONField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="user_workday",
            name="salary_rate",
            field=models.ForeignKey(
                to="myapp.workplacerate",
                on_delete=django.db.models.deletion.RESTRICT,
                null=True,
                blank=True,
                related_name="approved_workdays",
            ),
        ),
        migrations.RunPython(backfill, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="workplacerate",
            name="effective_start_date",
            field=models.DateField(),
        ),
        migrations.AlterModelOptions(
            name="workplacerate",
            options={"ordering": ["work_place", "-effective_start_date"]},
        ),
        migrations.AddConstraint(
            model_name="workplacerate",
            constraint=models.UniqueConstraint(
                fields=["user", "work_place", "effective_start_date"],
                name="uniq_user_place_rate_start",
            ),
        ),
        migrations.AddConstraint(
            model_name="workplacerate",
            constraint=models.CheckConstraint(
                check=models.Q(effective_end_date__isnull=True)
                | models.Q(effective_end_date__gte=models.F("effective_start_date")),
                name="rate_valid_period",
            ),
        ),
    ]
