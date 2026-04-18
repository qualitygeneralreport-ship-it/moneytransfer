from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterUserView, BranchViewSet, CustomerViewSet, ChartOfAccountViewSet,
    CommissionSettingViewSet, JournalEntryViewSet,
    WaveTransactionViewSet, TrueMoneyTransactionViewSet, BankTransactionViewSet
)

router = DefaultRouter()
router.register(r'branches', BranchViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'accounts', ChartOfAccountViewSet)
router.register(r'commissions', CommissionSettingViewSet)
router.register(r'journals', JournalEntryViewSet)
router.register(r'transactions/wave', WaveTransactionViewSet)
router.register(r'transactions/true', TrueMoneyTransactionViewSet)
router.register(r'transactions/bank', BankTransactionViewSet)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='api_register'),
    path('', include(router.urls)),
]
