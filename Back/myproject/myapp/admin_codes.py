"""Generate six-digit account login codes, preserving leading zeros."""
import secrets


def generate_admin_code():
    return f"{secrets.randbelow(1_000_000):06d}"
