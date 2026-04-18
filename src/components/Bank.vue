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
  amount: '',
  isExtraTransfer: false,
  isZeroCommission: false,
  commission: 0,
  note: '',
  shopName: authStore.user?.name || 'VISITOR'
});

const isSubmitting = ref(false);
const today = new Date().toLocaleDateString();
const bankComList = ref([]);
const searchQuery = ref('');
const accounts = ref([]);
const customers = ref([]);
const bankList = ref([]);

const fetchBankCom = async () => {
  try {
    const data = await api.get('/commissions/');
    bankComList.value = data.filter(c => c.provider === 'BANK');
  } catch (error) { console.error('Error fetching BankCom:', error); }
};

const fetchAccounts = async () => {
  try {
    const data = await api.get('/accounts/');
    if (Array.isArray(data)) {
      accounts.value = data.map(acc => [acc.account_type, acc.name, acc.id]);
      if (primaryAccounts.value.length > 0) form.value.cardSelect = primaryAccounts.value[0];
      if (secondaryAccounts.value.length > 0) form.value.accountName = secondaryAccounts.value[0];
    }
  } catch (error) { console.error('Error fetching accounts:', error); }
};

const fetchCustomers = async () => {
  try {
    const data = await api.get('/customers/');
    if (Array.isArray(data)) {
      customers.value = data.map(c => [c.name, c.phone, c.id]);
      if (customers.value.length > 0) form.value.customer = customers.value[0][0];
    }
  } catch (error) { console.error('Error fetching customers:', error); }
};

const fetchBankList = async () => {
  try {
    const data = await api.get('/transactions/bank/');
    if (Array.isArray(data)) bankList.value = data;
  } catch (error) { console.error('Error fetching bank list:', error); }
};

onMounted(() => {
  fetchBankCom(); fetchAccounts(); fetchCustomers(); fetchBankList();
});

const primaryAccounts = computed(() => 
  accounts.value.filter(acc => acc[0] === 'Bank').map(acc => acc[1])
);

const secondaryAccounts = computed(() => 
  accounts.value
    .filter(acc => acc[0] === 'Cash' || acc[0] === 'Bank')
    .map(acc => acc[1])
    .filter(name => name !== form.value.cardSelect)
);

const reversedBankList = computed(() => {
  return [...bankList.value].reverse();
});

const filteredBankList = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return reversedBankList.value;
  return reversedBankList.value.filter(tx => {
    const cust = customers.value.find(c => c[2] === tx.customer);
    const bankAcc = accounts.value.find(a => a[2] === tx.bank_account);
    const cashAcc = accounts.value.find(a => a[2] === tx.cash_account);
    
    return String(bankAcc?.[1] || '').toLowerCase().includes(query) ||
           String(cashAcc?.[1] || '').toLowerCase().includes(query) ||
           String(cust?.[0] || '').toLowerCase().includes(query) ||
           String(cust?.[1] || '').toLowerCase().includes(query) ||
           String(tx.note || '').toLowerCase().includes(query);
  });
});

const calculatedCommission = computed(() => {
  const amt = parseFloat(form.value.amount);
  if (!amt || isNaN(amt)) return 0;

  if (form.value.isZeroCommission) return 0;

  // Assuming BANK provider in CommissionSetting uses 'fee' as percentage rate
  // If not found, default logic can be implemented.
  const range = bankComList.value.find(item => amt >= item.min_amount && amt <= item.max_amount);
  if (range && range.fee) {
      return Math.round((amt * range.fee) / 100);
  }
  return 0;
});

function highlightText(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return String(text).replace(regex, '<mark>$1</mark>');
}

watch(calculatedCommission, (newVal) => {
  form.value.commission = newVal;
});

watch(() => form.value.customer, (newVal) => {
  const selected = customers.value.find(cust => cust[0] === newVal);
  form.value.phone = selected ? selected[1] : '';
});

const resetForm = () => {
  const defaultCust = customers.value[0];
  form.value = {
    cardSelect: primaryAccounts.value[0] || '',
    accountName: secondaryAccounts.value[0] || '',
    customer: defaultCust ? defaultCust[0] : '',
    phone: defaultCust ? defaultCust[1] : '',
    amount: '', isExtraTransfer: false, isZeroCommission: false,
    commission: 0,
    note: '', 
    shopName: authStore.user?.name || 'VISITOR'
  };
};

const saveData = async () => {
  if (!form.value.amount || !form.value.phone) return alert('လိုအပ်သော အချက်အလက်များ ဖြည့်ပေးပါ');
  isSubmitting.value = true;
  try {
    const bankId = accounts.value.find(a => a[1] === form.value.cardSelect)?.[2];
    const cashId = accounts.value.find(a => a[1] === form.value.accountName)?.[2];
    const customerId = customers.value.find(c => c[0] === form.value.customer)?.[2];

    await api.post('/transactions/bank/', {
      bank_account: bankId,
      cash_account: cashId,
      customer: customerId,
      amount: form.value.amount,
      commission: form.value.commission,
      is_extra_transfer: form.value.isExtraTransfer,
      is_zero_commission: form.value.isZeroCommission,
      note: form.value.note
    });
    alert('Bank transaction saved!');
    resetForm(); fetchBankList();
  } catch (error) { 
    console.error("Error Detail:", error);
    const detail = error.data ? JSON.stringify(error.data) : (error.message || JSON.stringify(error));
    alert('Error saving data: ' + detail);
  } finally { isSubmitting.value = false; }
};

const deleteTransaction = async (tx) => {
  if (!confirm('ဤ Transaction ကို Reverse (ပြန်နှိုက်) လုပ်ရန် သေချာပါသလား?')) return;
  isSubmitting.value = true;
  try {
    await api.delete(`/transactions/bank/${tx.id}/`);
    alert('Transaction reversed successfully!');
    fetchBankList();
  } catch (error) { 
      console.error(error);
      alert('Error deleting transaction.');
  } finally { isSubmitting.value = false; }
};
</script>

<template>
  <div class="container">
    <div class="form-card">
      <div class="header">
        <span class="icon" @click="resetForm" style="cursor: pointer">🗑️</span>
        <span class="header-title">🏦 BANK CASH OUT</span>
        <span class="icon" @click="fetchBankList" style="cursor: pointer">🔄</span>
      </div>
      <div class="content">
        <div class="top-row">
          <div class="info-box status">New Withdrawal</div>
          <div class="info-box date">{{ today }}</div>
        </div>
        <div class="top-row">
          <div class="input-row no-margin flex-1">
            <label>📥 IN (Bank)</label>
            <select v-model="form.cardSelect">
              <option v-for="name in primaryAccounts" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="input-row no-margin flex-1">
            <label>📤 OUT (Cash/Bank)</label>
            <select v-model="form.accountName">
              <option v-for="name in secondaryAccounts" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
        </div>
        <div class="top-row">
          <div class="input-row no-margin flex-1">
            <label>👤 ကာစတန်မာ</label>
            <div class="input-with-btn">
              <select v-model="form.customer">
                <option v-for="(cust, index) in customers" :key="index" :value="cust[0]">{{ cust[0] }}</option>
              </select>
              <button type="button" class="mini-add-btn" @click="emit('navigate', 'Customer')">+</button>
            </div>
          </div>
          <div class="input-row no-margin flex-1">
            <label>📞 ဖုန်းနံပါတ်</label>
            <input type="text" v-model="form.phone">
          </div>
        </div>
        <div class="input-row">
          <label>💰 ငွေထုတ်ပမာဏ</label>
          <div class="split-inputs">
            <input type="number" v-model="form.amount" placeholder="Amount">
            <input type="number" v-model="form.commission" class="red-border-input" placeholder="Com">
            <div class="toggle-container">
              <label class="toggle-switch" title="ကော်မရှင် မယူပါ">
                <input type="checkbox" v-model="form.isZeroCommission">
                <span class="slider zero-com"></span>
                <span class="toggle-label">အခမဲ့</span>
              </label>
              <label class="toggle-switch" title="ကော်မရှင်ကို IN အကောင့်ထဲပေါင်းထည့်မည်">
                <input type="checkbox" v-model="form.isExtraTransfer">
                <span class="slider"></span>
                <span class="toggle-label">ပိုလွဲ</span>
              </label>
            </div>
          </div>
        </div>
        <div class="input-row"><label>📝 မှတ်ချက်</label><input type="text" v-model="form.note"></div>
        <div class="action-buttons">
          <button class="btn add-btn" @click="saveData" :disabled="isSubmitting">{{ isSubmitting ? '⏳ SAVING...' : '➕ ADD TRANSACTION' }}</button>
        </div>
      </div>
    </div>
    <div class="list-card">
      <div class="header">
        <span>📜 BANK TRANSACTION LIST</span>
      </div>
      <div class="search-section">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="အကောင့်၊ Customer၊ ဖုန်း သို့မဟုတ် မှတ်ချက်ဖြင့် ရှာဖွေရန်..."
          class="search-input"
        />
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>🏦 Bank</th><th>👤 Customer</th><th>📞 Phone</th><th>💰 Amount</th><th>💎 Com</th><th>💵 Net Cash</th><th>🕒 Time</th><th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, index) in filteredBankList" :key="tx.id">
              <td v-html="highlightText(accounts.find(a => a[2] === tx.bank_account)?.[1], searchQuery)"></td>
              <td v-html="highlightText(customers.find(c => c[2] === tx.customer)?.[0], searchQuery)"></td>
              <td v-html="highlightText(customers.find(c => c[2] === tx.customer)?.[1], searchQuery)"></td>
              <td>{{ tx.amount }}</td><td>{{ tx.commission }}</td><td>{{ parseFloat(tx.amount) - parseFloat(tx.commission) }}</td>
              <td>{{ tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : '' }}</td>
              <td>
                <button class="delete-icon-btn" @click="deleteTransaction(tx)" :disabled="isSubmitting" title="Reverse Transaction">↩️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List View -->
      <div class="mobile-card-list">
        <div v-for="(tx, index) in filteredBankList" :key="tx.id" class="mobile-card">
          <div class="card-header">
            <div class="header-left">
              <span class="bank-badge">🏦 {{ accounts.find(a => a[2] === tx.bank_account)?.[1] }}</span>
              <span v-if="tx.is_extra_transfer" class="extra-badge">⚡ ပိုလွဲ</span>
            </div>
            <span class="time">{{ tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : '' }}</span>
          </div>
          <div class="card-body">
            <p class="customer-info"><strong>👤 <span v-html="highlightText(customers.find(c => c[2] === tx.customer)?.[0], searchQuery)"></span></strong> (<span v-html="highlightText(customers.find(c => c[2] === tx.customer)?.[1], searchQuery)"></span>)</p>
            <div class="card-grid">
              <div><span>📥 IN:</span> {{ accounts.find(a => a[2] === tx.bank_account)?.[1] }}</div>
              <div><span>📤 OUT:</span> {{ accounts.find(a => a[2] === tx.cash_account)?.[1] }}</div>
              <div><span>Amount:</span> {{ tx.amount }}</div>
              <div><span>Commission:</span> {{ tx.commission }}</div>
              <div class="net-cash"><span>Net Cash:</span> {{ parseFloat(tx.amount) - parseFloat(tx.commission) }}</div>
            </div>
            <p v-if="tx.note" class="note-text">📝 <span v-html="highlightText(tx.note, searchQuery)"></span></p>
          </div>
          <button class="card-delete-btn" @click="deleteTransaction(tx)" :disabled="isSubmitting">
            {{ isSubmitting ? '⏳' : '↩️ Reverse Transaction' }}
          </button>
        </div>
        <div v-if="filteredBankList.length === 0" style="text-align: center; padding: 20px; color: #888;">
          {{ searchQuery ? 'ရှာဖွေမှုရလဒ် မရှိပါ။' : 'စာရင်းများ မရှိသေးပါ။' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-left { display: flex; align-items: center; gap: 8px; }
.extra-badge { 
  background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;
  padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;
}
.search-section { padding: 10px 15px; background: #f8f9fa; border-bottom: 1px solid #eee; }
.search-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; font-size: 0.9rem; box-sizing: border-box; }
.search-input:focus { border-color: #42b883; box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.1); }
.note-text { font-size: 0.8rem; color: #666; margin-top: 8px; font-style: italic; border-top: 1px dashed #eee; padding-top: 5px; }

.container { display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 30px; }
.form-card, .list-card { width: 100%; max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
.list-card { max-width: 950px; }
.header { background-color: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.content { padding: 20px; }
.top-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.info-box { flex: 1; background: #f8f9fa; border: 1px solid #ddd; border-radius: 6px; padding: 8px; text-align: center; font-weight: bold; }
.flex-1 { flex: 1; min-width: 200px; }
.input-row { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
.input-row label { font-weight: 600; font-size: 0.9rem; color: #555; }
.input-row select, .input-row input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.input-with-btn { display: flex; gap: 5px; }
.mini-add-btn { padding: 0 12px; background: #2c3e50; color: white; border: none; border-radius: 6px; cursor: pointer; }
.split-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.split-inputs input { flex: 1; min-width: 100px; }
.red-border-input { width: 90px; border: 1px solid #e74c3c; border-radius: 6px; text-align: center; color: #e74c3c; font-weight: bold; background: #fdf2f2; outline: none; padding: 10px 0; }

.toggle-container { display: flex; gap: 15px; margin-left: auto; }
.toggle-switch { position: relative; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.8rem; font-weight: bold; color: #2c3e50; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: relative; display: inline-block; width: 34px; height: 20px; background-color: #ccc; border-radius: 20px; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: .4s; }
input:checked + .slider { background-color: #42b883; }
input:checked + .slider.zero-com { background-color: #e74c3c; }
input:checked + .slider:before { transform: translateX(14px); }

.mobile-card-list { display: none; }
@media (max-width: 600px) {
  .table-container { display: none; }
  .mobile-card-list { display: block; padding: 15px; background: #f8f9fa; }
  .mobile-card {
    background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee;
  }
  .card-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f1f1f1; padding-bottom: 8px; }
  .bank-badge { background: #42b883; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
  .time { font-size: 0.75rem; color: #888; }
  .customer-info { margin: 5px 0; color: #2c3e50; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #666; margin-top: 10px; }
  .card-grid span { font-weight: 600; color: #444; }
  .net-cash { color: #2c3e50; font-weight: bold; }
  .card-delete-btn { 
    width: 100%; margin-top: 15px; padding: 10px; background: #fff5f5; color: #e74c3c; 
    border: 1px solid #ffdada; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .container { padding: 10px; gap: 20px; }
  .top-row { gap: 15px; }
  .flex-1 { min-width: 100%; }
  .content { padding: 15px; }
  .toggle-container { width: 100%; margin-left: 0; }
  .action-buttons { flex-direction: column; gap: 10px; }
}

.action-buttons { display: flex; gap: 20px; justify-content: center; }
.btn { flex: 1; padding: 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
.add-btn { background-color: #42b883; color: white; }
.btn:disabled { opacity: 0.5; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
th { background-color: #f8f9fa; }
.delete-icon-btn { background: none; border: none; cursor: pointer; }
</style>