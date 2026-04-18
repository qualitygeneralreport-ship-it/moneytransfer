from accounting.models import ChartOfAccount, Customer, Branch
from accounting.serializers import WaveTransactionSerializer
from django.contrib.auth.models import User
b = Branch.objects.first()
u = User.objects.first()
c = ChartOfAccount.objects.filter(account_type='WavePartner').first()
c2 = ChartOfAccount.objects.filter(account_type='Cash').first()
cust = Customer.objects.first()
payload = {
    'transaction_type': 'transfer', 'agent_card_account': str(c.id) if c else None, 'cash_account': str(c2.id) if c2 else None, 'customer': str(cust.id) if cust else None, 'transfer_amount': '100000', 'provider_fee': '1500', 'transfer_com': '196', 'cash_out_amount': '0', 'cash_out_com': '0', 'cash_in_amount': '0', 'cash_in_com': '0', 'balance_amount': '0', 'service_fee': '0', 'note': ''
}
s = WaveTransactionSerializer(data=payload)
if not s.is_valid():
    print("Serializer errors:", s.errors)
else:
    tx = s.save(branch=b, user=u)
    from accounting.services import process_wave_transaction
    try:
        process_wave_transaction(tx)
        print("Success")
    except Exception as e:
        print("Service error:", str(e))
