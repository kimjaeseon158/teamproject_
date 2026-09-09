from rest_framework import serializers


class WidgetLayoutSaveSerializer(serializers.Serializer):
    # Both are required even for PATCH: layout replaces the complete document.
    layout = serializers.JSONField()
    version = serializers.IntegerField(min_value=0, max_value=2147483646)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError(
                    {key: "Unknown field." for key in sorted(unknown)}
                )
            if "version" in data and type(data["version"]) is not int:
                raise serializers.ValidationError({"version": "Must be an integer."})
        return super().to_internal_value(data)

    def validate_layout(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Must be an object keyed by widget ID.")
        for widget_id, widget in value.items():
            if not widget_id or not isinstance(widget, dict):
                raise serializers.ValidationError("Each widget must be an object with a nonempty ID.")
            for field in ("x", "y", "w", "h"):
                number = widget.get(field)
                minimum = 1 if field in ("w", "h") else 0
                if type(number) is not int or number < minimum:
                    raise serializers.ValidationError(
                        f"{widget_id}.{field} must be an integer >= {minimum}."
                    )
            if type(widget.get("visible")) is not bool:
                raise serializers.ValidationError(f"{widget_id}.visible must be a boolean.")
        return value


class WidgetLayoutSerializer(serializers.Serializer):
    layout = serializers.JSONField()
    version = serializers.IntegerField()
    updated_at = serializers.DateTimeField()
    previous_layout = serializers.JSONField(allow_null=True)
