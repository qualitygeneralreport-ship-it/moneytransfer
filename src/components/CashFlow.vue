<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const journalEntries = ref([]);
const accounts = ref([]);

const filterType = ref('all'); // all, daily, monthly
const selectedDate = ref(new Date().toISOString().substr(0, 10));
const selectedMonth = ref(new Date().toISOString().substr(0, 7));

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [journalData, accountData] = await Promise.all([
      api.get('/journals/'),
      api.get('/accounts/')
    ]);
    journalEntries.value = journalData;
    accounts.value = accountData;
  } catch (error) {
    console.error('Error fetching Cash Flow:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

// Check if account is an Asset
const isAssetAccount = (accName) => {
  const account = accounts.value.find(a => a.name === accName);
  if (!account) return false;
  return String(account.primary_category || '').toLowerCase().includes('asset');
};

// Filtered Journal Entries
const filteredEntries = computed(() => {
  if (filterType.value === 'all') return journalEntries.value;

  return journalEntries.value.filter(entry => {
    const entryDate = new Date(entry.created_at);
    if (isNaN(entryDate)) return false;

    if (filterType.value === 'daily') {
      const targetDate = new Date(selectedDate.value);
      return entryDate.toDateString() === targetDate.toDateString();
    }
    if (filterType.value === 'monthly') {
      const [year, month] = selectedMonth.value.split('-').map(Number);
      return entryDate.getFullYear() === year && (entryDate.getMonth() + 1) === month;
    }
    return true;
  });
});

// Cash Flow Logic
const flowSummary = computed(() => {
  let inflow = 0;
  let outflow = 0;
  const categories = {};

  filteredEntries.value.forEach(entry => {
    const accountName = entry.account_name;
    const description = entry.description;
    const amount = parseFloat(entry.amount) || 0;
    const type = entry.account_type; // DEBIT or CREDIT

    if (isAssetAccount(accountName)) {
      // For Assets: DEBIT is inflow (+), CREDIT is outflow (-)
      const change = type === 'DEBIT' ? amount : -amount;
      
      if (change > 0) inflow += change;
      else outflow += Math.abs(change);

      if (!categories[description]) categories[description] = 0;
      categories[description] += change;
    }
  });

  return { inflow, outflow, netFlow: inflow - outflow, categories };
});

const formatNum = (num) => new Intl.NumberFormat().format(num);
</script>

<template>
  <div class="container">
    <div class="report-card">
      <div class="header">
        <span>🌊 CASH FLOW REPORT (ငွေသားစီးဆင်းမှု)</span>
        <button class="refresh-btn" @click="fetchData" :disabled="isLoading">🔄 Refresh</button>
      </div>

      <div class="filter-section">
        <div class="filter-group">
          <label class="radio-label"><input type="radio" v-model="filterType" value="all"> အားလုံး</label>
          <label class="radio-label"><input type="radio" v-model="filterType" value="daily"> နေ့အလိုက်</label>
          <label class="radio-label"><input type="radio" v-model="filterType" value="monthly"> လအလိုက်</label>
        </div>
        
        <div class="filter-inputs">
          <div v-if="filterType === 'daily'" class="date-input">
            <label>နေ့စွဲ ရွေးရန်:</label>
            <input type="date" v-model="selectedDate">
          </div>
          <div v-if="filterType === 'monthly'" class="date-input">
            <label>လ ရွေးရန်:</label>
            <input type="month" v-model="selectedMonth">
          </div>
        </div>
      </div>

      <div class="summary-stats">
        <div class="stat-box inflow">
          <span class="label">စုစုပေါင်း အဝင် (Inflow)</span>
          <span class="value">+ {{ formatNum(flowSummary.inflow) }}</span>
        </div>
        <div class="stat-box outflow">
          <span class="label">စုစုပေါင်း အထွက် (Outflow)</span>
          <span class="value">- {{ formatNum(flowSummary.outflow) }}</span>
        </div>
        <div class="stat-box net" :class="flowSummary.netFlow >= 0 ? 'pos' : 'neg'">
          <span class="label">အသားတင် စီးဆင်းမှု (Net Flow)</span>
          <span class="value">{{ formatNum(flowSummary.netFlow) }}</span>
        </div>
      </div>

      <div class="details-section">
        <h3>Activities Summary (လုပ်ဆောင်ချက်အလိုက် အကျဉ်းချုပ်)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Net Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(amount, desc) in flowSummary.categories" :key="desc">
                <td>{{ desc }}</td>
                <td class="text-right" :class="amount >= 0 ? 'text-pos' : 'text-neg'">
                  {{ amount >= 0 ? '+' : '' }}{{ formatNum(amount) }}
                </td>
              </tr>
              <tr v-if="Object.keys(flowSummary.categories).length === 0">
                <td colspan="2" style="text-align: center; color: #888; padding: 20px;">No cash flow activities found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 20px; display: flex; justify-content: center; width: 100%; box-sizing: border-box; }
.report-card { width: 100%; max-width: 800px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
.header { background: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.refresh-btn { background: #42b883; border: none; color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; }

.filter-section { padding: 15px 20px; background: #fff; border-bottom: 1px solid #eee; display: flex; flex-direction: column; gap: 10px; }
.filter-group { display: flex; gap: 20px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: bold; cursor: pointer; color: #444; }
.filter-inputs { min-height: 40px; }
.date-input { display: flex; align-items: center; gap: 10px; }
.date-input label { font-size: 0.85rem; color: #666; font-weight: bold; }
.date-input input { 
  padding: 8px 12px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  outline: none; 
  font-family: inherit;
  color: #2c3e50;
}

.summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px; background: #f8f9fa; }
.stat-box { padding: 15px; border-radius: 8px; display: flex; flex-direction: column; gap: 5px; color: white; }
.inflow { background: #10b981; }
.outflow { background: #ef4444; }
.net.pos { background: #3b82f6; }
.net.neg { background: #f59e0b; }
.label { font-size: 0.8rem; opacity: 0.9; }
.value { font-size: 1.2rem; font-weight: bold; }

.details-section { padding: 20px; }
h3 { color: #2c3e50; margin-bottom: 15px; font-size: 1rem; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
th { background: #f1f5f9; font-size: 0.85rem; }
.text-right { text-align: right; }
.text-pos { color: #10b981; font-weight: bold; }
.text-neg { color: #ef4444; font-weight: bold; }
</style>