from django.core.management.base import BaseCommand, CommandError
from myapp.admin_codes import generate_admin_code
from myapp.models import Admin_Login_Info


class Command(BaseCommand):
    help = 'Replace a lost admin login code. Run on the backend server only.'

    def add_arguments(self, parser):
        parser.add_argument('admin_id')

    def handle(self, *args, **options):
        code = generate_admin_code()
        changed = Admin_Login_Info.objects.filter(admin_id=options['admin_id']).update(admin_code=code)
        if not changed:
            raise CommandError('Administrator not found.')
        self.stdout.write('New login code: ' + code)
        self.stdout.write('Previous code is now invalid. Deliver this code securely.')
