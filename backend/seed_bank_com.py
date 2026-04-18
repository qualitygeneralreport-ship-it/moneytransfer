import os
import django
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounting.models import CommissionSetting

CommissionSetting.objects.filter(provider='BANK').delete()

data = [
    (1, 1990000, 0.5),
    (2000000, 9900000, 0.4),
    (10000000, 20000000, 0.35),
]

for row in data:
    CommissionSetting.objects.create(
        provider='BANK',
        min_amount=Decimal(row[0]),
        max_amount=Decimal(row[1]),
        fee=Decimal(row[2])  # This will be used as the percentage rate in Bank.vue
    )

print("Bank commission data inserted successfully!")
