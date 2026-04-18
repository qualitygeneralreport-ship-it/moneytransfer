import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounting.models import CommissionSetting

CommissionSetting.objects.filter(provider='WAVE').delete()

data = [
    (1, 10000, 400, 68.6, 0.001, 88.2),
    (10001, 25000, 700, 122.5, 0.001, 171.5),
    (25001, 50000, 1000, 147, 0.001, 245),
    (50001, 100000, 1500, 196, 0.001, 392),
    (100001, 150000, 2000, 294, 0.001, 490),
    (150001, 200000, 2500, 392, 0.001, 588),
    (200001, 300000, 3000, 490, 0.001, 686),
    (300001, 400000, 4000, 637, 0.001, 882),
    (400001, 500000, 4500, 735, 0.001, 1029.00),
    (500001, 600000, 5400, 882, 0.001, 1234.80),
    (600001, 700000, 6000, 980, 0.001, 1372.00),
    (700001, 800000, 6700, 1094.33, 0.001, 1532.07),
    (800001, 900000, 7400, 1208.66, 0.001, 1692.14),
    (900001, 1000000, 8000, 1306.66, 0.001, 1829.34),
    (1000001, 2000000, 14000, 2286.66, 0.001, 3201.35),
    (2000001, 3000000, 20000, 3266.65, 0.001, 4573.35),
]

for row in data:
    CommissionSetting.objects.create(
        provider='WAVE',
        min_amount=row[0],
        max_amount=row[1],
        fee=row[2],
        transfer_com=row[3],
        cash_in_com=row[4],
        cash_out_com=row[5]
    )

print("Wave commission data inserted successfully!")
