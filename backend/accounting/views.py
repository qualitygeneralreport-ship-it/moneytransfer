from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import (
    Branch, UserProfile, Customer, ChartOfAccount, CommissionSetting, JournalEntry,
    WaveTransaction, TrueMoneyTransaction, BankTransaction
)
from .serializers import (
    BranchSerializer, CustomerSerializer, ChartOfAccountSerializer,
    CommissionSettingSerializer, JournalEntrySerializer,
    WaveTransactionSerializer, TrueMoneyTransactionSerializer, BankTransactionSerializer
)
from .services import process_wave_transaction, process_true_transaction, process_bank_transaction

class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', 'Unknown User')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        # We'll use the email as the username
        if User.objects.filter(username=email).exists():
            user = User.objects.get(username=email)
            user.set_password(password)
            user.save()
        else:
            user = User.objects.create_user(username=email, email=email, password=password, first_name=name)

        # Get or create Main Branch
        branch, _ = Branch.objects.get_or_create(name='Main Branch', defaults={'address': 'Auto Created', 'phone': '09'})
        # Create profile mapping to Main Branch
        UserProfile.objects.get_or_create(user=user, defaults={'branch': branch, 'role': 'STAFF'})

        # Give them a token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

class BranchIsolatedViewSet(viewsets.ModelViewSet):
    """
    A base viewset that automatically isolates data by the User's Branch.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile') or not user.profile.branch:
            return self.queryset.none()
        return self.queryset.filter(branch=user.profile.branch)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(branch=user.profile.branch)


class BranchViewSet(viewsets.ModelViewSet):
    # Admin only basically, but leaving it open for this demo
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomerViewSet(BranchIsolatedViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class ChartOfAccountViewSet(BranchIsolatedViewSet):
    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer


class CommissionSettingViewSet(viewsets.ModelViewSet):
    # Global settings, shared by all branches
    queryset = CommissionSetting.objects.all()
    serializer_class = CommissionSettingSerializer
    permission_classes = [permissions.IsAuthenticated]


class JournalEntryViewSet(BranchIsolatedViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    

class WaveTransactionViewSet(BranchIsolatedViewSet):
    queryset = WaveTransaction.objects.all()
    serializer_class = WaveTransactionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        tx = serializer.save(branch=user.profile.branch, user=user)
        process_wave_transaction(tx)


class TrueMoneyTransactionViewSet(BranchIsolatedViewSet):
    queryset = TrueMoneyTransaction.objects.all()
    serializer_class = TrueMoneyTransactionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        tx = serializer.save(branch=user.profile.branch, user=user)
        process_true_transaction(tx)


class BankTransactionViewSet(BranchIsolatedViewSet):
    queryset = BankTransaction.objects.all()
    serializer_class = BankTransactionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        tx = serializer.save(branch=user.profile.branch, user=user)
        process_bank_transaction(tx)
