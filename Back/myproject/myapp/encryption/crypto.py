import base64
import binascii
import hashlib
import hmac
import json
import os
import re
from functools import lru_cache

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


ENCRYPTED_VALUE_PREFIX = "v1:"
_AAD = b"myapp-field-encryption:v1"


class FieldDecryptionError(ValueError):
    """Raised when encrypted data cannot be authenticated and decrypted."""


def _decode_secret(value, setting_name, expected_length=None):
    try:
        decoded = base64.urlsafe_b64decode(value.encode("ascii"))
    except (AttributeError, UnicodeEncodeError, binascii.Error, ValueError) as exc:
        raise ImproperlyConfigured(
            f"{setting_name} must contain URL-safe Base64 encoded bytes."
        ) from exc
    if expected_length is not None and len(decoded) != expected_length:
        raise ImproperlyConfigured(
            f"{setting_name} entries must decode to exactly {expected_length} bytes."
        )
    if expected_length is None and len(decoded) < 32:
        raise ImproperlyConfigured(f"{setting_name} must decode to at least 32 bytes.")
    return decoded


@lru_cache(maxsize=8)
def _parse_keyring(serialized_keyring):
    try:
        raw_keyring = json.loads(serialized_keyring)
    except (TypeError, json.JSONDecodeError) as exc:
        raise ImproperlyConfigured(
            "FIELD_ENCRYPTION_KEYS must be a JSON object mapping key IDs to Base64 keys."
        ) from exc
    if not isinstance(raw_keyring, dict) or not raw_keyring:
        raise ImproperlyConfigured("FIELD_ENCRYPTION_KEYS must contain at least one key.")
    return {
        str(key_id): _decode_secret(key, "FIELD_ENCRYPTION_KEYS", expected_length=32)
        for key_id, key in raw_keyring.items()
    }


def _keyring():
    configured = settings.FIELD_ENCRYPTION_KEYS
    serialized = configured if isinstance(configured, str) else json.dumps(configured, sort_keys=True)
    return _parse_keyring(serialized)


def is_encrypted(value):
    return isinstance(value, str) and value.startswith(ENCRYPTED_VALUE_PREFIX)


def encrypt_value(value):
    if value is None or value == "" or is_encrypted(value):
        return value
    key_id = str(settings.FIELD_ENCRYPTION_KEY_ID)
    key = _keyring().get(key_id)
    if key is None:
        raise ImproperlyConfigured(
            "FIELD_ENCRYPTION_KEY_ID is not present in FIELD_ENCRYPTION_KEYS."
        )
    nonce = os.urandom(12)
    ciphertext = AESGCM(key).encrypt(nonce, str(value).encode("utf-8"), _AAD)
    return ":".join(
        (
            "v1",
            key_id,
            base64.urlsafe_b64encode(nonce).decode("ascii"),
            base64.urlsafe_b64encode(ciphertext).decode("ascii"),
        )
    )


def decrypt_value(value):
    if value is None or value == "" or not is_encrypted(value):
        return value
    try:
        version, key_id, encoded_nonce, encoded_ciphertext = value.split(":", 3)
        if version != "v1":
            raise ValueError
        key = _keyring()[key_id]
        nonce = base64.urlsafe_b64decode(encoded_nonce.encode("ascii"))
        ciphertext = base64.urlsafe_b64decode(encoded_ciphertext.encode("ascii"))
        return AESGCM(key).decrypt(nonce, ciphertext, _AAD).decode("utf-8")
    except (KeyError, ValueError, UnicodeError, binascii.Error, InvalidTag) as exc:
        raise FieldDecryptionError("Encrypted field could not be decrypted.") from exc


def normalize_resident_number(value):
    return re.sub(r"\D", "", value or "")


def resident_number_blind_index(value):
    normalized = normalize_resident_number(value)
    if not normalized:
        return ""
    key = _decode_secret(settings.FIELD_BLIND_INDEX_KEY, "FIELD_BLIND_INDEX_KEY")
    return hmac.new(key, normalized.encode("ascii"), hashlib.sha256).hexdigest()
