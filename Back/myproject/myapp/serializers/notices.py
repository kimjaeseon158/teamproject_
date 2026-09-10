from rest_framework import serializers

from pathlib import Path

from PIL import Image as PillowImage
from ..models import Notice, NoticeImage
from ..sanitizers import extract_notice_text, sanitize_notice_html
from ..sanitizers.notices import NOTICE_HTML_MAX_LENGTH, NOTICE_TEXT_MAX_LENGTH


class StrictStringField(serializers.CharField):
    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_NOTICE_IMAGE_SIZE = 5 * 1024 * 1024
MAX_NOTICE_IMAGES = 5


class NoticeImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NoticeImage
        fields = ("image_uuid", "image_url", "display_order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class StrictImageField(serializers.ImageField):
    def to_internal_value(self, data):
        declared_content_type = getattr(data, "content_type", None)
        original_name = getattr(data, "name", "")
        value = super().to_internal_value(data)
        value.declared_content_type = declared_content_type
        value.original_name = original_name
        return value


class NoticeImageUploadSerializer(serializers.Serializer):
    image = StrictImageField()

    def validate_image(self, value):
        if value.size > MAX_NOTICE_IMAGE_SIZE:
            raise serializers.ValidationError("Each image must be 5 MB or smaller.")
        declared_content_type = value.declared_content_type
        if declared_content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise serializers.ValidationError(
                "Only JPEG, PNG, and WebP images are allowed."
            )
        if Path(value.original_name).suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS:
            raise serializers.ValidationError(
                "Only .jpg, .jpeg, .png, and .webp files are allowed."
            )

        try:
            value.seek(0)
            detected_format = PillowImage.open(value).format
            value.seek(0)
        except (OSError, ValueError):
            raise serializers.ValidationError("The uploaded file is not a valid image.")

        expected_formats = {
            "image/jpeg": {"JPEG"},
            "image/png": {"PNG"},
            "image/webp": {"WEBP"},
        }
        if detected_format not in expected_formats[declared_content_type]:
            raise serializers.ValidationError(
                "The file content does not match its declared image type."
            )
        return value


class NoticeSerializer(serializers.ModelSerializer):
    content = StrictStringField(trim_whitespace=False, required=False, allow_blank=True, default="")
    images = NoticeImageSerializer(many=True, read_only=True)

    class Meta:
        model = Notice
        fields = (
            "notice_uuid",
            "title",
            "content",
            "author_type",
            "author_name",
            "created_at",
            "updated_at",
            "images",
        )
        read_only_fields = (
            "notice_uuid",
            "author_type",
            "author_name",
            "created_at",
            "updated_at",
            "images",
        )

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title must not be blank.")
        return value

    def validate_content(self, value):
        if len(value) > NOTICE_HTML_MAX_LENGTH:
            raise serializers.ValidationError(
                "Content HTML must be 50000 characters or fewer."
            )

        cleaned = sanitize_notice_html(value)
        plain_text = extract_notice_text(cleaned)
        if len(plain_text) > NOTICE_TEXT_MAX_LENGTH:
            raise serializers.ValidationError(
                "Content text must be 5000 characters or fewer."
            )
        return cleaned

    def validate(self, attrs):
        content = attrs.get("content", self.instance.content if self.instance else "")
        has_images = bool(self.context.get("uploaded_images"))
        if self.instance is not None:
            has_images = has_images or self.instance.images.exists()
        if not extract_notice_text(content).strip() and not has_images:
            raise serializers.ValidationError(
                {"content": "Content or at least one image is required."}
            )
        return attrs
