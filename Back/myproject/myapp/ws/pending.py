from django.db.models import Count
from django.db.models.functions import TruncMonth

from ..models import User_WorkDay


def get_pending_counts():
    """Return pending workday totals and newest-first counts by work month."""
    rows = (
        User_WorkDay.objects.filter(is_approved__isnull=True)
        .annotate(work_month=TruncMonth("work_date"))
        .values("work_month")
        .annotate(count=Count("pk"))
        .order_by("-work_month")
    )
    counts_by_month = [
        {"work_month": row["work_month"].strftime("%Y-%m"), "count": row["count"]}
        for row in rows
    ]
    return {
        "count": sum(row["count"] for row in counts_by_month),
        "counts_by_month": counts_by_month,
    }
