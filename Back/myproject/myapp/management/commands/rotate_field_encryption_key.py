from django.core.management.base import BaseCommand
from django.db import transaction

from myapp.models import User_Login_Info


class Command(BaseCommand):
    help = "Re-encrypt user resident numbers and addresses with the current field key."

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Number of users read per database iterator batch.",
        )

    def handle(self, *args, **options):
        updated = 0
        with transaction.atomic():
            users = User_Login_Info.objects.all().iterator(
                chunk_size=options["batch_size"]
            )
            for user in users:
                user.save(update_fields=["resident_number", "address"])
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"Re-encrypted {updated} user records."))
