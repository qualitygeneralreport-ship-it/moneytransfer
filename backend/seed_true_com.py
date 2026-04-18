import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounting.models import CommissionSetting

CommissionSetting.objects.filter(provider='TRUE').delete()

data = [
    (1, 10000, 300, 100, 100, 90),
    (10001, 25000, 500, 200, 200, 175),
    (25001, 50000, 1000, 300, 300, 250),
    (50001, 100000, 1200, 400, 400, 400),
    (100001, 150000, 2000, 600, 600, 500),
    (150001, 200000, 2500, 700, 700, 600),
    (200001, 300000, 3000, 900, 900, 750),
    (300001, 400000, 4000, 1000, 1000, 1000),
    (400001, 500000, 4500, 1300, 1300, 1050),
    (500001, 600000, 5400, 1400, 1400, 1100),
    (600001, 700000, 6000, 1500, 1500, 1100),
    (700001, 800000, 6700, 1600, 1600, 1200),
    (800001, 900000, 7000, 1700, 1700, 1200),
    (900001, 1000000, 8000, 2100, 2100, 1200),
    (1000001, 2000000, 0, 0, 0, 1400),
]

for row in data:
    CommissionSetting.objects.create(
        provider='TRUE',
        min_amount=row[0],
        max_amount=row[1],
        fee=row[2],
        transfer_com=row[3],
        cash_out_com=row[4],
        inter_cash_out_com=row[5]
    )

print("True Money commission data inserted successfully!")
