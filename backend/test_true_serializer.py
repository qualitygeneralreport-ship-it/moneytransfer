from accounting.models import ChartOfAccount, Customer, Branch
from accounting.serializers import TrueMoneyTransactionSerializer
from django.contrib.auth.models import User
b = Branch.objects.first()
u = User.objects.first()
c = ChartOfAccount.objects.filter(account_type='TruePartner').first()
c2 = ChartOfAccount.objects.filter(account_type='Cash').first()
cust = Customer.objects.first()
payload = {
    'transaction_type': 'interCashOut', 'agent_card_account': str(c.id) if c else None, 'cash_account': str(c2.id) if c2 else None, 'customer': str(cust.id) if cust else None, 'transfer_amount': '0', 'provider_fee': '0', 'transfer_com': '0', 'cash_out_amount': '0', 'cash_out_com': '0', 'inter_cash_out_amount': '100000', 'inter_cash_out_com': '400', 'balance_amount': '0', 'service_fee': '0', 'note': ''
}
s = TrueMoneyTransactionSerializer(data=payload)
if not s.is_valid():
    print("Serializer errors:", s.errors)
else:
    tx = s.save(branch=b, user=u)
    from accounting.services import process_true_transaction
    try:
        process_true_transaction(tx)
        print("Success")
    except Exception as e:
        print("Service error:", str(e))
