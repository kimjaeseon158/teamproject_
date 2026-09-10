from rest_framework.pagination import PageNumberPagination

from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404

from ...models import Notice, NoticeImage
from ...sanitizers import extract_notice_text
from ...sanitizers.notices import notice_image_references, remove_notice_image_reference
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


def create_notice_images(notice, images, next_order):
    created = []
    try:
        for offset, image in enumerate(images):
            item = NoticeImage(notice=notice, image=image, display_order=next_order + offset)
            created.append(item)
            item.save()
    except Exception:
        for notice_image in created:
            if notice_image.image._committed:
                notice_image.image.delete(save=False)
        raise
    return created


def save_notice_with_images(serializer, images, **save_kwargs):
    created_images = []
    committed = []
    try:
        with transaction.atomic():
            # Do not remove committed files if a later notification callback fails.
            transaction.on_commit(lambda: committed.append(True))
            existing_orders = []
            if serializer.instance is not None:
                serializer.instance = get_object_or_404(
                    Notice.objects.select_for_update(), pk=serializer.instance.pk
                )
                existing_orders = list(serializer.instance.images.values_list("display_order", flat=True))
            if len(existing_orders) + len(images) > MAX_NOTICE_IMAGES:
                raise ValidationError({"images": [f"A notice can have at most {MAX_NOTICE_IMAGES} images."]})
            next_order = max(existing_orders, default=-1) + 1
            allowed = {f"order:{order}" for order in existing_orders}
            allowed.update(f"order:{next_order + offset}" for offset in range(len(images)))
            content = serializer.validated_data.get(
                "content", serializer.instance.content if serializer.instance else ""
            )
            try:
                references = notice_image_references(content)
            except ValueError as exc:
                raise ValidationError({"content": [str(exc)]})
            if any(reference not in allowed for reference in references):
                raise ValidationError({"content": ["Content references an image that does not belong to this notice."]})
            if not extract_notice_text(content).strip() and not allowed:
                raise ValidationError({"content": ["Content or at least one image is required."]})
            notice = serializer.save(**save_kwargs)
            created_images = create_notice_images(notice, images, next_order)
        return notice
    except Exception:
        if not committed:
            for notice_image in created_images:
                notice_image.image.delete(save=False)
        raise


def get_notice_image(notice, image_uuid):
    try:
        return notice.images.get(image_uuid=image_uuid)
    except (NoticeImage.DoesNotExist, ValueError, TypeError):
        return None


def delete_notice_image(notice, notice_image):
    with transaction.atomic():
        notice = get_object_or_404(Notice.objects.select_for_update(), pk=notice.pk)
        notice_image = get_object_or_404(notice.images, pk=notice_image.pk)
        content = remove_notice_image_reference(notice.content, notice_image.display_order)
        if not extract_notice_text(content).strip() and not notice.images.exclude(pk=notice_image.pk).exists():
            raise ValidationError({"images": ["Content or at least one image is required."]})
        if content != notice.content:
            notice.content = content
            notice.save(update_fields=["content", "updated_at"])
        notice_image.delete()
