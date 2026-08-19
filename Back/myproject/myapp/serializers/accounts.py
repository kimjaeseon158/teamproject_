# 사용자 계정 생성과 조회 serializer

from django.db import transaction
from rest_framework import serializers
from ..encryption.crypto import normalize_resident_number, resident_number_blind_index
from ..models import User_Login_Info, WorkPlaceRate


DEFAULT_WORK_PLACE = "\ubbf8\uc9c0\uc815"


class User_Login_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ("resident_number_hash",)

    def validate_resident_number(self, value):
        normalized = normalize_resident_number(value)
        if len(normalized) != 13:
            raise serializers.ValidationError(
                "Resident number must contain exactly 13 digits."
            )
        resident_hash = resident_number_blind_index(value)
        queryset = User_Login_Info.objects.filter(resident_number_hash=resident_hash)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this resident number already exists."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        resident_number = validated_data["resident_number"]
        validated_data["password"] = normalize_resident_number(resident_number)[:6]
        validated_data["must_change_password"] = True
        user = super().create(validated_data)
        WorkPlaceRate.objects.get_or_create(
            user=user,
            work_place=DEFAULT_WORK_PLACE,
        )
        return user

    def update(self, instance, validated_data):
        if validated_data.get("password"):
            validated_data["must_change_password"] = True

        return super().update(instance, validated_data)


class User_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ("user_id", "password", "resident_number_hash")
