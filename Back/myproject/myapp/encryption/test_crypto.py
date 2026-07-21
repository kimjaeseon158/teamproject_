import base64

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, override_settings

from .crypto import (
    FieldDecryptionError,
    decrypt_value,
    encrypt_value,
    resident_number_blind_index,
)
from .fields import EncryptedTextField


KEY_1 = base64.urlsafe_b64encode(b"1" * 32).decode("ascii")
KEY_2 = base64.urlsafe_b64encode(b"2" * 32).decode("ascii")
INDEX_KEY = base64.urlsafe_b64encode(b"i" * 32).decode("ascii")


@override_settings(
    FIELD_ENCRYPTION_KEY_ID="key-1",
    FIELD_ENCRYPTION_KEYS={"key-1": KEY_1},
    FIELD_BLIND_INDEX_KEY=INDEX_KEY,
)
class FieldCryptoTests(SimpleTestCase):
    def test_encrypts_and_decrypts_without_exposing_plaintext(self):
        plaintext = "900101-1234567"
        encrypted = encrypt_value(plaintext)

        self.assertTrue(encrypted.startswith("v1:key-1:"))
        self.assertNotIn(plaintext, encrypted)
        self.assertEqual(decrypt_value(encrypted), plaintext)

    def test_encryption_uses_a_random_nonce(self):
        self.assertNotEqual(encrypt_value("same"), encrypt_value("same"))

    def test_tampering_fails_without_including_sensitive_value(self):
        encrypted = encrypt_value("sensitive")
        tampered = encrypted[:-1] + ("A" if encrypted[-1] != "A" else "B")

        with self.assertRaisesRegex(FieldDecryptionError, "could not be decrypted") as error:
            decrypt_value(tampered)
        self.assertNotIn("sensitive", str(error.exception))

    def test_blind_index_normalizes_resident_number_format(self):
        self.assertEqual(
            resident_number_blind_index("900101-1234567"),
            resident_number_blind_index("9001011234567"),
        )

    def test_old_key_remains_available_after_rotation(self):
        old_ciphertext = encrypt_value("old value")
        with override_settings(
            FIELD_ENCRYPTION_KEY_ID="key-2",
            FIELD_ENCRYPTION_KEYS={"key-1": KEY_1, "key-2": KEY_2},
        ):
            self.assertEqual(decrypt_value(old_ciphertext), "old value")
            self.assertTrue(encrypt_value("new value").startswith("v1:key-2:"))

    def test_encrypted_model_field_persists_ciphertext_and_reads_plaintext(self):
        field = EncryptedTextField()
        stored = field.get_prep_value("Seoul address")

        self.assertNotIn("Seoul address", stored)
        self.assertEqual(field.from_db_value(stored, None, None), "Seoul address")

    @override_settings(FIELD_ENCRYPTION_KEY_ID="missing")
    def test_current_key_must_exist_in_keyring(self):
        with self.assertRaises(ImproperlyConfigured):
            encrypt_value("value")
