from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Branches'
        ordering = ['name']

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('STAFF', 'Staff'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STAFF')
    picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role} at {self.branch.name if self.branch else 'All'}"

class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    remark = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone})"

class AccountType(models.TextChoices):
    WAVEPARTNER = 'WavePartner', 'WavePartner'
    TRUEPARTNER = 'TruePartner', 'TruePartner'
    BANK = 'Bank', 'Bank'
    CASH = 'Cash', 'Cash'
    EXPENSE = 'Expense', 'Expense'
    INCOME = 'Income', 'Income'
    ASSET = 'ASSET', 'Asset'
    LIABILITY = 'LIABILITY', 'Liability'
    EQUITY = 'EQUITY', 'Equity'

class ChartOfAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='accounts')
    account_code = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50, choices=AccountType.choices, db_index=True)
    description = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Categories for Balance Sheet grouping
    primary_category = models.CharField(max_length=50, default='Asset') # Asset, Liability, Equity, Income, Expense
    sub_category = models.CharField(max_length=100, default='Other')    # Bank/Wallet, Operating, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ('branch', 'name')

    def __str__(self):
        return f"[{self.branch.name}] {self.name}"

    def get_balance(self):
        entries = JournalEntry.objects.filter(account=self)
        balance = self.opening_balance
        for entry in entries:
            if entry.account_type == 'DEBIT':
                balance += entry.amount
            else:
                balance -= entry.amount
        return balance

class CommissionSetting(models.Model):
    PROVIDER_CHOICES = [
        ('WAVE', 'Wave Money'),
        ('TRUE', 'True Money'),
        ('BANK', 'Bank'),
    ]
    provider = models.CharField(max_length=10, choices=PROVIDER_CHOICES)
    min_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    max_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    fee = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    transfer_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    cash_out_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    cash_in_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    inter_cash_out_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['provider', 'min_amount']

    def __str__(self):
        return f"{self.provider} ({self.min_amount} - {self.max_amount})"

class BaseTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, null=True, blank=True)
    
    agent_card_account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name='%(class)s_agent_cards', null=True, blank=True)
    cash_account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name='%(class)s_cash_accounts', null=True, blank=True)
    
    transaction_type = models.CharField(max_length=50, blank=True, null=True)
    
    transfer_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    provider_fee = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    transfer_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    
    cash_out_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    cash_out_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    
    balance_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    service_fee = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reversed = models.BooleanField(default=False)

    class Meta:
        abstract = True

class WaveTransaction(BaseTransaction):
    cash_in_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    cash_in_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))

class TrueMoneyTransaction(BaseTransaction):
    inter_cash_out_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    inter_cash_out_com = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))

class BankTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, null=True, blank=True)
    
    bank_account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name='bank_tx_banks')
    cash_account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name='bank_tx_cash')
    
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    commission = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'))
    
    is_extra_transfer = models.BooleanField(default=False)
    is_zero_commission = models.BooleanField(default=False)
    
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reversed = models.BooleanField(default=False)

class JournalEntry(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('DEBIT', 'Debit'),
        ('CREDIT', 'Credit'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='journal_entries')
    journal_batch = models.CharField(max_length=100, db_index=True)
    account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name='journal_entries')
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES)
    description = models.TextField()
    balance_after = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    wave_transaction = models.ForeignKey(WaveTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='journals')
    true_transaction = models.ForeignKey(TrueMoneyTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='journals')
    bank_transaction = models.ForeignKey(BankTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='journals')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.journal_batch} - {self.account_type} {self.amount}"
