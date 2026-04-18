import urllib.request, urllib.error
import urllib.parse
from accounting.models import ChartOfAccount, Customer
import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

card = ChartOfAccount.objects.filter(account_type='WavePartner').first()
cash = ChartOfAccount.objects.filter(account_type='Cash').first()
cust = Customer.objects.first()

payload = {
    "transaction_type": "transfer",
    "agent_card_account": str(card.id) if card else None,
    "cash_account": str(cash.id) if cash else None,
    "customer": str(cust.id) if cust else None,
    "transfer_amount": "100000",
    "provider_fee": "1500",
    "transfer_com": "196",
    "cash_out_amount": "0",
    "cash_out_com": "0",
    "cash_in_amount": "0",
    "cash_in_com": "0",
    "balance_amount": "0",
    "service_fee": "0",
    "note": ""
}

req = urllib.request.Request('http://localhost:8000/api/transactions/wave/', data=json.dumps(payload).encode(), headers={'Content-Type':'application/json'})
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode('utf-8'))
