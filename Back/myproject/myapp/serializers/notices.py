from rest_framework import serializers

from ..models import Notice
from ..sanitizers import extract_notice_text, sanitize_notice_html
from ..sanitizers.notices import NOTICE_HTML_MAX_LENGTH, NOTICE_TEXT_MAX_LENGTH


class StrictStringField(serializers.CharField):
    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


class NoticeSerializer(serializers.ModelSerializer):
    content = StrictStringField(trim_whitespace=False)

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
        )
        read_only_fields = (
            "notice_uuid",
            "author_type",
            "author_name",
            "created_at",
            "updated_at",
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
        if not plain_text.strip():
            raise serializers.ValidationError("Content must not be blank.")
        if len(plain_text) > NOTICE_TEXT_MAX_LENGTH:
            raise serializers.ValidationError(
                "Content text must be 5000 characters or fewer."
            )
        return cleaned
