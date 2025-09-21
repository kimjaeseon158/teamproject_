import random



def generate_unique_serial(model_class):
    while True:
        number = random.randint(100000, 999999)
        if not model_class.objects.filter(serial_number=number).exists():
            return number