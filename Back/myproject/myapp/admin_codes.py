"""Generate account-specific login codes that fit the existing 20-character field."""
import secrets


def generate_admin_code():
    # 16 characters, 80 bits of randomness, without ambiguous I/O/0/1 characters.
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return '-'.join(''.join(secrets.choice(alphabet) for _ in range(4)) for _ in range(4))
