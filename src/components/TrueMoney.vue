<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../api';

const authStore = useAuthStore();
const emit = defineEmits(['navigate']);

const form = ref({
  cardSelect: '',
  accountName: '',
  customer: '',
  phone: '',
  transfer: '',
  transferPercent: '',
  cashOut: '',
  interCashOut: '',
  transferCom: 0,
  cashOutCom: 0,
  interCashOutCom: 0,
  balance: '',
  fee: '',
  note: '',
  shopName: authStore.user?.name || 'VISITOR'
});

const isSubmitting = ref(false);
const today = new Date().toLocaleDateString();
const transactionType = ref('transfer');
const trueComList = ref([]);
const accounts = ref([]);
const customers = ref([]);
const trueList = ref([]);

const fetchTrueCom = async () => {
  try {
    const data = await api.get('/commissions/');
    trueComList.value = data.filter(c => c.provider === 'TRUE');
  } catch (error) {
    console.error('Error fetching TrueCom:', error);
  }
};

const fetchAccounts = async () => {
  try {
    const data = await api.get('/accounts/');
    if (Array.isArray(data)) {
      accounts.value = data.map(acc => [acc.account_type, acc.name, acc.id]);
      if (truePartnerAccounts.value.length > 0) form.value.cardSelect = truePartnerAccounts.value[0];
      if (otherAccounts.value.length > 0) form.value.accountName = otherAccounts.value[0];
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const fetchCustomers = async () => {
  try {
    const data = await api.get('/customers/');
    if (Array.isArray(data)) {
      customers.value = data.map(c => [c.name, c.phone, c.id]);
      if (customers.value.length > 0) form.value.customer = customers.value[0][0];
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

const fetchTrueList = async () => {
  try {
    const data = await api.get('/transactions/true/');
    if (Array.isArray(data)) {
      trueList.value = data;
    }
  } catch (error) {
    console.error('Error fetching true list:', error);
  }
};

onMounted(() => {
  fetchTrueCom();
  fetchAccounts();
  fetchCustomers();
  fetchTrueList();
});

const forceRefreshData = async () => {
  isSubmitting.value = true;
  await Promise.all([
    fetchTrueCom(),
    fetchAccounts(),
    fetchCustomers(),
    fetchTrueList()
  ]);
  isSubmitting.value = false;
  alert('Data အသစ်များကို အောင်မြင်စွာ ရယူပြီးပါပြီ။');
};

const truePartnerAccounts = computed(() => 
  accounts.value.filter(acc => acc[0] === 'TruePartner').map(acc => acc[1])
);

const otherAccounts = computed(() => 
  accounts.value.filter(acc => acc[0] !== 'TruePartner' && acc[0] !== 'WavePartner').map(acc => acc[1])
);

const reversedTrueList = computed(() => {
  return [...trueList.value].reverse();
});

const transferCommission = computed(() => {
  const amount = parseFloat(form.value.transfer);
  if (!amount || isNaN(amount)) return 0;
  const range = trueComList.value.find(item => amount >= item.min_amount && amount <= item.max_amount);
  if (range) {
    form.value.transferPercent = range.fee;
    return range.transfer_com;
  }
  return 0;
});

const cashOutCommission = computed(() => {
  const amount = parseFloat(form.value.cashOut);
  if (!amount || isNaN(amount)) return 0;
  const range = trueComList.value.find(item => amount >= item.min_amount && amount <= item.max_amount);
  return range ? range.cash_out_com : 0;
});

const interCashOutCommission = computed(() => {
  const amount = parseFloat(form.value.interCashOut);
  if (!amount || isNaN(amount)) return 0;
  const range = trueComList.value.find(item => amount >= item.min_amount && amount <= item.max_amount);
  return range ? range.inter_cash_out_com : 0;
});

watch(transferCommission, (val) => { form.value.transferCom = val; });
watch(cashOutCommission, (val) => { form.value.cashOutCom = val; });
watch(interCashOutCommission, (val) => { form.value.interCashOutCom = val; });

watch(() => form.value.customer, (newCustomerName) => {
  const selectedCustomer = customers.value.find(cust => cust[0] === newCustomerName);
  form.value.phone = selectedCustomer ? selectedCustomer[1] : '';
});

watch(transactionType, () => {
  form.value.transfer = '';
  form.value.transferPercent = '';
  form.value.cashOut = '';
  form.value.interCashOut = '';
  form.value.balance = '';
  form.value.fee = '';
});

const resetForm = () => {
  const defaultCust = customers.value[0];
  form.value = {
    cardSelect: truePartnerAccounts.value[0] || '',
    accountName: otherAccounts.value[0] || '',
    customer: defaultCust ? defaultCust[0] : '',
    phone: defaultCust ? defaultCust[1] : '',
    transfer: '',
    transferPercent: '',
    cashOut: '',
    interCashOut: '',
    transferCom: 0,
    cashOutCom: 0,
    interCashOutCom: 0,
    balance: '',
    fee: '',
    note: '',
    shopName: authStore.user?.name || 'VISITOR'
  };
};

const saveData = async () => {
  if (!form.value.phone) {
    alert('ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ');
    return;
  }
  isSubmitting.value = true;
  try {
    const cardId = accounts.value.find(a => a[1] === form.value.cardSelect)?.[2];
    const accountId = accounts.value.find(a => a[1] === form.value.accountName)?.[2];
    const customerId = customers.value.find(c => c[0] === form.value.customer)?.[2];
    
    await api.post('/transactions/true/', {
      transaction_type: transactionType.value,
      agent_card_account: cardId,
      cash_account: accountId,
      customer: customerId,
      transfer_amount: form.value.transfer || '0.00',
      provider_fee: form.value.transferPercent || '0.00',
      transfer_com: form.value.transferCom || '0.00',
      cash_out_amount: form.value.cashOut || '0.00',
      cash_out_com: form.value.cashOutCom || '0.00',
      inter_cash_out_amount: form.value.interCashOut || '0.00',
      inter_cash_out_com: form.value.interCashOutCom || '0.00',
      balance_amount: form.value.balance || '0.00',
      service_fee: form.value.fee || '0.00',
      note: form.value.note
    });
    alert('True Money transaction saved successfully!');
    resetForm();
    fetchTrueList();
  } catch (error) {
    console.error("Error Detail:", error);
    const detail = error.data ? JSON.stringify(error.data) : (error.message || JSON.stringify(error));
    alert('Error saving data: ' + detail);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteTransaction = async (tx) => {
  if (!confirm('ဤ Transaction ကို Reverse (ပြန်နှိုက်) လုပ်ရန် သေချာပါသလား?')) return;
  isSubmitting.value = true;
  try {
    await api.delete(`/transactions/true/${tx.id}/`);
    await fetchTrueList();
    alert('Transaction reversed successfully!');
  } catch (error) { 
    console.error(error);
    alert('Error deleting transaction.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="form-card">
      <div class="header">
        <span class="icon" @click="resetForm" style="cursor: pointer">🗑️</span>
        <span class="header-title">TRUE MONEY TRANSACTION</span>
        <span class="icon" @click="forceRefreshData" style="cursor: pointer" :class="{ 'spinning': isSubmitting }">🔄</span>
      </div>
      <div class="content">
        <div class="top-row">
          <div class="info-box status">New</div>
          <div class="info-box date">{{ today }}</div>
        </div>
        <div class="top-row">
          <div class="input-row no-margin flex-1">
            <label>ကတ် ရွေးရန်</label>
            <select v-model="form.cardSelect">
              <option v-for="name in truePartnerAccounts" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="input-row no-margin flex-1">
            <label>အကောင့်အမည်</label>
            <select v-model="form.accountName">
              <option v-for="name in otherAccounts" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
        </div>
        <div class="top-row">
          <div class="input-row no-margin flex-1">
            <label>ကာစတန်မာ</label>
            <div class="input-with-btn">
              <select v-model="form.customer">
                <option v-for="(cust, index) in customers" :key="index" :value="cust[0]">{{ cust[0] }}</option>
              </select>
              <button type="button" class="mini-add-btn" @click="emit('navigate', 'Customer')">+</button>
            </div>
          </div>
          <div class="input-row no-margin flex-1">
            <label>ဖုန်းနံပါတ်</label>
            <input type="text" class="white-bg" v-model="form.phone">
          </div>
        </div>
        <div class="transaction-selector">
          <label class="radio-label"><input type="radio" v-model="transactionType" value="transfer"> ငွေလွှဲ</label>
          <label class="radio-label"><input type="radio" v-model="transactionType" value="cashOut"> ငွေထုတ်</label>
          <label class="radio-label"><input type="radio" v-model="transactionType" value="interCashOut"> ပြည်ပ ငွေထုတ်</label>
          <label class="radio-label"><input type="radio" v-model="transactionType" value="balance"> ပိုငွေလိုငွေ</label>
        </div>
        <div v-if="transactionType === 'transfer'" class="input-row">
          <label>ငွေလွှဲ</label>
          <div class="split-inputs">
            <input type="number" class="white-bg" v-model="form.transfer" placeholder="ပမာဏ">
            <input type="number" class="white-bg percent-input" v-model="form.transferPercent" placeholder="Fee" readonly>
            <input type="number" v-model="form.transferCom" class="red-border-input" placeholder="Com">
          </div>
        </div>
        <div v-if="transactionType === 'cashOut'" class="input-row">
          <label>ငွေထုတ်</label>
          <div class="split-inputs">
            <input type="number" class="white-bg" v-model="form.cashOut" placeholder="ပမာဏ">
            <input type="number" v-model="form.cashOutCom" class="red-border-input" placeholder="Com">
          </div>
        </div>
        <div v-if="transactionType === 'interCashOut'" class="input-row">
          <label>ပြည်ပ ငွေထုတ်</label>
          <div class="split-inputs">
            <input type="number" class="white-bg" v-model="form.interCashOut" placeholder="ပမာဏ">
            <input type="number" v-model="form.interCashOutCom" class="red-border-input" placeholder="Com">
          </div>
        </div>
        <div v-if="transactionType === 'balance'" class="input-row">
          <label>ပိုငွေလိုငွေ</label>
          <input type="number" class="white-bg" v-model="form.balance">
        </div>
        <div class="input-row"><label>ဝန်ဆောင်ခ</label><input type="number" class="white-bg" v-model="form.fee"></div>
        <div class="input-row"><label>မှတ်ချက်</label><input type="text" class="white-bg" v-model="form.note"></div>
        <div class="action-buttons">
          <button class="btn add-btn" @click="saveData" :disabled="isSubmitting">{{ isSubmitting ? 'SAVING...' : 'ADD' }}</button>
        </div>
      </div>
    </div>
    <div class="list-card">
      <div class="header">TRUE MONEY TRANSACTION LIST</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th><th>Customer</th><th>Phone</th><th>Transfer</th><th>Cash Out</th><th>Inter Cash Out</th><th>Fee</th><th>Time</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in reversedTrueList" :key="index">
              <td>{{ row.transaction_type }}</td>
              <td>{{ customers.find(c => c[2] === row.customer)?.[0] || 'Unknown' }}</td>
              <td>{{ customers.find(c => c[2] === row.customer)?.[1] || '' }}</td>
              <td>{{ row.transfer_amount }}</td>
              <td>{{ row.cash_out_amount }}</td>
              <td>{{ row.inter_cash_out_amount }}</td>
              <td>{{ row.service_fee }}</td>
              <td>{{ row.created_at ? new Date(row.created_at).toLocaleTimeString() : '' }}</td>
              <td class="action-cell">
                <button class="delete-icon-btn" @click="deleteTransaction(row)" :disabled="isSubmitting">{{ isSubmitting ? '⏳' : '↩️' }}</button>
              </td>
            </tr>
            <tr v-if="trueList.length === 0"><td colspan="9" style="text-align: center;">No transactions found.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List View -->
      <div class="mobile-card-list">
        <div v-for="(row, index) in reversedTrueList" :key="index" class="mobile-card">
          <div class="card-header">
            <span class="type-badge">{{ row.transaction_type }}</span>
            <span class="time">{{ row.created_at ? new Date(row.created_at).toLocaleTimeString() : '' }}</span>
          </div>
          <div class="card-body">
            <p class="customer-info"><strong>👤 {{ customers.find(c => c[2] === row.customer)?.[0] || 'Unknown' }}</strong> ({{ customers.find(c => c[2] === row.customer)?.[1] || '' }})</p>
            <div class="card-grid">
              <div><span>Card:</span> {{ accounts.find(a => a[2] === row.agent_card_account)?.[1] }}</div>
              <div><span>Acc:</span> {{ accounts.find(a => a[2] === row.cash_account)?.[1] }}</div>
              <div v-if="row.transfer_amount && parseFloat(row.transfer_amount) != 0"><span>လွှဲငွေ:</span> {{ row.transfer_amount }}</div>
              <div v-if="row.cash_out_amount && parseFloat(row.cash_out_amount) != 0"><span>ငွေထုတ်:</span> {{ row.cash_out_amount }}</div>
              <div v-if="row.inter_cash_out_amount && parseFloat(row.inter_cash_out_amount) != 0"><span>ပြည်ပ:</span> {{ row.inter_cash_out_amount }}</div>
              <div><span>ဝန်ဆောင်ခ:</span> {{ row.service_fee }}</div>
            </div>
          </div>
          <button class="card-delete-btn" @click="deleteTransaction(row)" :disabled="isSubmitting">
            {{ isSubmitting ? '⏳' : '↩️ Reverse (ပြန်နှိုက်မည်)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { display: flex; flex-direction: column; align-items: center; padding: 10px; gap: 20px; width: 100%; box-sizing: border-box; }
.form-card, .list-card { width: 100%; max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
.list-card { max-width: 950px; }
.header { background-color: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.content { padding: 20px; }
.top-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.info-box { flex: 1; background: #f8f9fa; border: 1px solid #ddd; border-radius: 6px; padding: 8px; text-align: center; font-weight: bold; }
.flex-1 { flex: 1; min-width: 200px; }
.input-row { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
.input-row label { font-weight: 600; font-size: 0.9rem; color: #555; }
.input-row select, .input-row input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.transaction-selector { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd; }
.radio-label { font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.split-inputs { display: flex; gap: 5px; }
.percent-input { width: 80px !important; background-color: #fffde7; }
.red-border-input { width: 90px; border: 1px solid #e74c3c; border-radius: 6px; text-align: center; color: #e74c3c; font-weight: bold; background: #fdf2f2; outline: none; padding: 10px 0; }
.action-buttons { display: flex; gap: 20px; justify-content: center; }
.btn { flex: 1; padding: 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.add-btn { background-color: #42b883; color: white; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }

.mobile-card-list { display: none; }
@media (max-width: 600px) {
  .table-container { display: none; }
  .mobile-card-list { display: block; padding: 15px; background: #f8f9fa; }
  .mobile-card { background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
  .card-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f1f1f1; padding-bottom: 8px; }
  .type-badge { background: #2c3e50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
  .time { font-size: 0.75rem; color: #888; }
  .customer-info { margin: 5px 0; color: #2c3e50; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #666; margin-top: 10px; }
  .card-grid span { font-weight: 600; color: #444; }
  .card-delete-btn { width: 100%; margin-top: 15px; padding: 10px; background: #fff5f5; color: #e74c3c; border: 1px solid #ffdada; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
}

th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
th { background-color: #f8f9fa; }
.delete-icon-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinning { animation: spin 1s linear infinite; }
</style>