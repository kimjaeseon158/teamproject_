from django.db import models

from .crypto import decrypt_value, encrypt_value


class EncryptedTextField(models.TextField):
    description = "Text encrypted with the configured application keyring"

    def from_db_value(self, value, expression, connection):
        return decrypt_value(value)

    def to_python(self, value):
        if value is None or isinstance(value, str):
            return decrypt_value(value)
        return decrypt_value(str(value))

    def get_prep_value(self, value):
        return encrypt_value(super().get_prep_value(value))
