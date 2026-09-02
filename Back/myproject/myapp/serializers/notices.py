from rest_framework import serializers

from ..models import Notice


class NoticeSerializer(serializers.ModelSerializer):
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
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Content must not be blank.")
        return value
