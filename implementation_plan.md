# Reporting and Journal History Migration

This plan covers the migration of all remaining reporting components and the enhancement of the Journal Entry system to support historical balance tracking.

## User Review Required

> [!IMPORTANT]
> I will be adding a `balance_after` field to the `JournalEntry` model. This is necessary to show the "Running Balance" in the Journal List, similar to how it worked in Google Sheets.

## Proposed Changes

### Backend

#### [MODIFY] [models.py](file:///c:/Users/PC/money-transfer-main/backend/accounting/models.py)
- Add `balance_after` field to `JournalEntry` model.
- Add `category` and `sub_category` to `ChartOfAccount` if needed, or rely on `AccountType` mapping.

#### [MODIFY] [services.py](file:///c:/Users/PC/money-transfer-main/backend/accounting/services.py)
- Update `update_coa_balance` to save the account's balance into the `JournalEntry.balance_after` field.

#### [MODIFY] [serializers.py](file:///c:/Users/PC/money-transfer-main/backend/accounting/serializers.py)
- Include `balance_after` in `JournalEntrySerializer`.
- Add nested data or helpers for reporting if required.

---

### Frontend

#### [MODIFY] [JournalList.vue](file:///c:/Users/PC/money-transfer-main/src/components/JournalList.vue)
- Refactor to use `api.get('/journals/')`.
- Map fields: `created_at`, `account_name`, `description`, `amount`, `balance_after`, `journal_batch`.

#### [MODIFY] [BalanceSheet.vue](file:///c:/Users/PC/money-transfer-main/src/components/BalanceSheet.vue)
- Refactor to use `api.get('/accounts/')`.
- Implement grouping logic based on `AccountType` or new category fields.

#### [MODIFY] [Profit.vue](file:///c:/Users/PC/money-transfer-main/src/components/Profit.vue)
- Refactor to fetch data from transaction endpoints and account balances.
- Calculate net profit based on revenue (commissions) minus expenses.

#### [MODIFY] [Other Reports]
- Migrate `CashFlow.vue`, `TrialBalance.vue`, and `Report.vue`.

## Verification Plan

### Automated Tests
- Script to verify that `JournalEntry` records the correct `balance_after` after a transaction.
- Check API responses for reporting endpoints.

### Manual Verification
- Verify that the Journal List shows the correct running balance.
- Verify that the Balance Sheet balances (Assets = Liabilities + Equity).
- Verify that Profit calculation matches manual calculation from transactions.
