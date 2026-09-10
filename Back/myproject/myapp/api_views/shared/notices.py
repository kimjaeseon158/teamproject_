from rest_framework.pagination import PageNumberPagination

from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import Max

from ...models import Notice, NoticeImage
from ...sanitizers import extract_notice_text
from ...serializers.notices import MAX_NOTICE_IMAGES, NoticeImageUploadSerializer


class NoticePagination(PageNumberPagination):
    page_size = 20


def filter_notices(query_params):
    notices = Notice.objects.prefetch_related("images").all()
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


def get_notice_images(request):
    if not hasattr(request.data, "getlist"):
        return []
    return request.data.getlist("images")


def validate_notice_images(images, existing_count=0):
    if existing_count + len(images) > MAX_NOTICE_IMAGES:
        raise ValidationError(
            {"images": [f"A notice can have at most {MAX_NOTICE_IMAGES} images."]}
        )

    validated = []
    errors = {}
    for index, image in enumerate(images):
        serializer = NoticeImageUploadSerializer(data={"image": image})
        if serializer.is_valid():
            uploaded = serializer.validated_data["image"]
            uploaded.seek(0)
            validated.append(uploaded)
        else:
            errors[index] = serializer.errors["image"]
    if errors:
        raise ValidationError({"images": errors})
    return validated


def create_notice_images(notice, images):
    highest_order = notice.images.aggregate(value=Max("display_order"))["value"]
    next_order = 0 if highest_order is None else highest_order + 1
    created = []
    try:
        for offset, image in enumerate(images):
            created.append(
                NoticeImage.objects.create(
                    notice=notice,
                    image=image,
                    display_order=next_order + offset,
                )
            )
    except Exception:
        for notice_image in created:
            notice_image.image.delete(save=False)
        raise
    return created


def save_notice_with_images(serializer, images, **save_kwargs):
    created_images = []
    try:
        with transaction.atomic():
            notice = serializer.save(**save_kwargs)
            created_images = create_notice_images(notice, images)
        return notice
    except Exception:
        for notice_image in created_images:
            notice_image.image.delete(save=False)
        raise


def get_notice_image(notice, image_uuid):
    try:
        return notice.images.get(image_uuid=image_uuid)
    except (NoticeImage.DoesNotExist, ValueError, TypeError):
        return None


def delete_notice_image(notice, notice_image):
    if not extract_notice_text(notice.content).strip() and not notice.images.exclude(
        pk=notice_image.pk
    ).exists():
        raise ValidationError(
            {"images": ["Content or at least one image is required."]}
        )
    notice_image.delete()
