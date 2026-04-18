from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Branch, UserProfile, Customer, ChartOfAccount, CommissionSetting,
    JournalEntry, WaveTransaction, TrueMoneyTransaction, BankTransaction
)

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['role', 'branch', 'branch_name', 'picture']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['branch']

class ChartOfAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccount
        fields = '__all__'
        read_only_fields = ['branch']

class CommissionSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionSetting
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = '__all__'

class WaveTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaveTransaction
        fields = '__all__'
        read_only_fields = ['branch', 'user', 'is_reversed']

class TrueMoneyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrueMoneyTransaction
        fields = '__all__'
        read_only_fields = ['branch', 'user', 'is_reversed']

class BankTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankTransaction
        fields = '__all__'
        read_only_fields = ['branch', 'user', 'is_reversed']
