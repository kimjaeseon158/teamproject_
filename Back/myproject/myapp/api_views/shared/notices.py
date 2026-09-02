from rest_framework.pagination import PageNumberPagination

from ...models import Notice


class NoticePagination(PageNumberPagination):
    page_size = 20


def filter_notices(query_params):
    notices = Notice.objects.all()
    title = query_params.get("title", "").strip()
    author = query_params.get("author", "").strip()
    if title:
        notices = notices.filter(title__icontains=title)
    if author:
        notices = notices.filter(author_name__icontains=author)
    return notices


def get_notice(notice_uuid):
    try:
        return Notice.objects.get(notice_uuid=notice_uuid)
    except (Notice.DoesNotExist, ValueError, TypeError):
        return None
