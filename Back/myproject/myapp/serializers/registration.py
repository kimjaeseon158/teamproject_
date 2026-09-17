from django.contrib.auth.models import User
from django.contrib.auth.password_validation import (
    CommonPasswordValidator,
    MinimumLengthValidator,
    NumericPasswordValidator,
    UserAttributeSimilarityValidator,
    validate_password,
)
from django.core.exceptions import ValidationError
from rest_framework import serializers


class AdminRegistrationSerializer(serializers.Serializer):
    admin_name = serializers.CharField(max_length=50)
    admin_id = serializers.CharField(max_length=50)
    password = serializers.CharField(min_length=8, max_length=1024, trim_whitespace=False, write_only=True)
    registration_password = serializers.CharField(max_length=1024, trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        if 'admin_code' in self.initial_data:
            raise serializers.ValidationError({'admin_code': 'The server generates the login code.'})
        try:
            validate_password(
                attrs['password'],
                user=User(username=attrs['admin_id'], first_name=attrs['admin_name']),
                password_validators=[MinimumLengthValidator(8), UserAttributeSimilarityValidator(),
                                     CommonPasswordValidator(), NumericPasswordValidator()],
            )
        except ValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages}) from exc
        return attrs
