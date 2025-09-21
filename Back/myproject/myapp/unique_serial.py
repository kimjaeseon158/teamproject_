import random
from .models import Expense, Income



def generate_unique_serial():
    while True:
        number = random.randint(100000, 999999)
        if not Expense.objects.filter(serial_number=number).exists():
            return number