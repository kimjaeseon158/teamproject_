from django.db.models import Count

from ..models import User_WorkDay


def get_pending_counts():
    """Return pending workday totals and newest-first counts by work date."""
    rows = (
        User_WorkDay.objects.filter(is_approved__isnull=True)
        .values("work_date")
        .annotate(count=Count("pk"))
        .order_by("-work_date")
    )
    counts_by_date = [
        {"work_date": row["work_date"].isoformat(), "count": row["count"]}
        for row in rows
    ]
    return {
        "count": sum(row["count"] for row in counts_by_date),
        "counts_by_date": counts_by_date,
    }
