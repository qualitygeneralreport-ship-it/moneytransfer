from decimal import Decimal
from django.db import transaction
from .models import JournalEntry, ChartOfAccount

@transaction.atomic
def update_coa_balance(transaction_record, account, amount_change, description, provider_type, branch):
    """
    Core double entry tracking method that updates Account Balance and creates Journal Entires.
    equivalent to Google Script's updateCOABalance function.
    """
    if amount_change == 0 or not account:
        return

    # Update balance
    current_balance = account.balance
    new_balance = current_balance + amount_change
    account.balance = new_balance
    account.save()

    # Determine debit/credit logic (simplified relative to cash impact)
    # usually: Assets increase via Debit. We'll simply use DEBIT if amount > 0 for cash, else CREDIT
    account_type = 'DEBIT' if amount_change > 0 else 'CREDIT'

    # Create Journal Entry
    journal = JournalEntry.objects.create(
        branch=branch,
        journal_batch=f"{provider_type}-{transaction_record.id}",
        account=account,
        amount=round(abs(amount_change), 2),
        account_type=account_type,
        description=description,
        balance_after=round(new_balance, 2),
    )

    # Link back to specific transaction model based on provider type
    if provider_type == 'WAVE':
        journal.wave_transaction = transaction_record
    elif provider_type == 'TRUE':
        journal.true_transaction = transaction_record
    elif provider_type == 'BANK':
        journal.bank_transaction = transaction_record
    
    journal.save()


@transaction.atomic
def process_wave_transaction(wave_tx):
    branch = wave_tx.branch
    customer_info = f"Customer: {wave_tx.customer.name} ({wave_tx.customer.phone})" if wave_tx.customer else "Unknown"

    cash_book_change = Decimal('0.00')
    agent_card_change = Decimal('0.00')
    desc = ""

    amt_transfer = wave_tx.transfer_amount
    amt_cash_out = wave_tx.cash_out_amount
    amt_cash_in = wave_tx.cash_in_amount
    wave_fee = wave_tx.provider_fee
    service_fee = wave_tx.service_fee
    t_com = wave_tx.transfer_com
    o_com = wave_tx.cash_out_com
    i_com = wave_tx.cash_in_com
    bal_adj = wave_tx.balance_amount

    if amt_transfer > 0:
        cash_book_change = amt_transfer + wave_fee + service_fee
        agent_card_change = -(amt_transfer + wave_fee) + t_com
        desc = f"Wave Transfer - {customer_info}"
    elif amt_cash_out > 0:
        cash_book_change = -(amt_cash_out - service_fee)
        agent_card_change = amt_cash_out + o_com
        desc = f"Wave Cash Out - {customer_info}"
    elif amt_cash_in > 0:
        cash_book_change = amt_cash_in + service_fee
        agent_card_change = -amt_cash_in + i_com
        desc = f"Wave Cash In - {customer_info}"
    elif bal_adj != 0:
        agent_card_change = bal_adj
        desc = "Wave Balance Adjustment"

    if cash_book_change != 0 and wave_tx.cash_account:
        update_coa_balance(wave_tx, wave_tx.cash_account, cash_book_change, desc, 'WAVE', branch)
        
    if agent_card_change != 0 and wave_tx.agent_card_account:
        update_coa_balance(wave_tx, wave_tx.agent_card_account, agent_card_change, desc, 'WAVE', branch)


@transaction.atomic
def process_true_transaction(true_tx):
    branch = true_tx.branch
    customer_info = f"Customer: {true_tx.customer.name} ({true_tx.customer.phone})" if true_tx.customer else "Unknown"

    cash_book_change = Decimal('0.00')
    agent_card_change = Decimal('0.00')
    desc = ""

    amt_transfer = true_tx.transfer_amount
    amt_cash_out = true_tx.cash_out_amount
    amt_inter_cash_out = true_tx.inter_cash_out_amount
    true_fee = true_tx.provider_fee
    service_fee = true_tx.service_fee
    t_com = true_tx.transfer_com
    o_com = true_tx.cash_out_com
    io_com = true_tx.inter_cash_out_com
    bal_adj = true_tx.balance_amount

    if amt_transfer > 0:
        cash_book_change = amt_transfer + true_fee + service_fee
        agent_card_change = -(amt_transfer + true_fee) + t_com
        desc = f"True Transfer - {customer_info}"
    elif amt_cash_out > 0:
        cash_book_change = -(amt_cash_out - service_fee)
        agent_card_change = amt_cash_out + o_com
        desc = f"True Cash Out - {customer_info}"
    elif amt_inter_cash_out > 0:
        cash_book_change = -(amt_inter_cash_out - service_fee)
        agent_card_change = amt_inter_cash_out + io_com
        desc = f"True Inter Cash Out - {customer_info}"
    elif bal_adj != 0:
        agent_card_change = bal_adj
        desc = "True Balance Adjustment"

    if cash_book_change != 0 and true_tx.cash_account:
        update_coa_balance(true_tx, true_tx.cash_account, cash_book_change, desc, 'TRUE', branch)
        
    if agent_card_change != 0 and true_tx.agent_card_account:
        update_coa_balance(true_tx, true_tx.agent_card_account, agent_card_change, desc, 'TRUE', branch)


@transaction.atomic
def process_bank_transaction(bank_tx):
    branch = bank_tx.branch
    customer_info = f"Bank Cash Out: {bank_tx.customer.name} ({bank_tx.customer.phone})" if bank_tx.customer else "Unknown"

    amt = bank_tx.amount
    comm = bank_tx.commission
    is_extra = bank_tx.is_extra_transfer
    
    if is_extra:
        # Extra rule: In Account gets amt + comm, Out gets -amt
        update_coa_balance(bank_tx, bank_tx.bank_account, amt + comm, "Bank Cash Out (Extra)", 'BANK', branch)
        update_coa_balance(bank_tx, bank_tx.cash_account, -amt, "Bank Cash Out (Extra)", 'BANK', branch)
    else:
        # Normal rule: In account gets amt, Out gets -(amt - comm)
        update_coa_balance(bank_tx, bank_tx.bank_account, amt, "Bank Cash Out", 'BANK', branch)
        update_coa_balance(bank_tx, bank_tx.cash_account, -(amt - comm), "Bank Cash Out", 'BANK', branch)
