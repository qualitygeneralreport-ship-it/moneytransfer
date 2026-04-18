<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const accounts = ref([]);
const waveTrx = ref([]);
const trueTrx = ref([]);
const bankTrx = ref([]);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [accountData, waveData, trueData, bankData] = await Promise.all([
      api.get('/accounts/'),
      api.get('/transactions/wave/'),
      api.get('/transactions/true/'),
      api.get('/transactions/bank/')
    ]);

    accounts.value = accountData;
    waveTrx.value = waveData;
    trueTrx.value = trueData;
    bankTrx.value = bankData;
  } catch (error) {
    console.error('Error fetching report data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const today = new Date().toDateString();

// Helper to check if a transaction date is today
const isToday = (dateVal) => {
  if (!dateVal) return false;
  return new Date(dateVal).toDateString() === today;
};

// Daily Stats
const dailyStats = computed(() => {
  return {
    wave: waveTrx.value.filter(tx => isToday(tx.created_at)).length,
    true: trueTrx.value.filter(tx => isToday(tx.created_at)).length,
    bank: bankTrx.value.filter(tx => isToday(tx.created_at)).length
  };
});

// Daily Commission
const dailyCommission = computed(() => {
  const waveCom = waveTrx.value
    .filter(tx => isToday(tx.created_at))
    .reduce((sum, tx) => sum + (parseFloat(tx.transfer_com) || 0) + (parseFloat(tx.cash_out_com) || 0) + (parseFloat(tx.cash_in_com) || 0), 0);
    
  const trueCom = trueTrx.value
    .filter(tx => isToday(tx.created_at))
    .reduce((sum, tx) => sum + (parseFloat(tx.transfer_com) || 0) + (parseFloat(tx.cash_out_com) || 0) + (parseFloat(tx.inter_cash_out_com) || 0), 0);
    
  const bankCom = bankTrx.value
    .filter(tx => isToday(tx.created_at))
    .reduce((sum, tx) => sum + (parseFloat(tx.commission) || 0), 0);
    
  return waveCom + trueCom + bankCom;
});

// Group by Sub-Category
const subCategorySummary = computed(() => {
  const summary = {};
  accounts.value.forEach(acc => {
    const sub = acc.sub_category || 'Other';
    const bal = parseFloat(acc.balance) || 0;
    if (!summary[sub]) summary[sub] = 0;
    summary[sub] += bal;
  });
  return summary;
});

const totalAssets = computed(() => {
  return Object.values(subCategorySummary.value).reduce((sum, val) => sum + val, 0);
});

const formatNum = (num) => new Intl.NumberFormat().format(num);
</script>

<template>
  <div class="report-container">
    <div class="header-row">
      <h2>📊 Daily Summary Report</h2>
      <button class="refresh-btn" @click="fetchData" :disabled="isLoading">🔄 Refresh</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <span class="stat-label">ယနေ့ Wave Trx</span>
        <span class="stat-value">{{ dailyStats.wave }}</span>
      </div>
      <div class="stat-card green">
        <span class="stat-label">ယနေ့ True Trx</span>
        <span class="stat-value">{{ dailyStats.true }}</span>
      </div>
      <div class="stat-card purple">
        <span class="stat-label">ယနေ့ Bank Trx</span>
        <span class="stat-value">{{ dailyStats.bank }}</span>
      </div>
      <div class="stat-card orange">
        <span class="stat-label">ယနေ့ ကော်မရှင် (Profit)</span>
        <span class="stat-value">{{ formatNum(dailyCommission) }}</span>
      </div>
    </div>

    <div class="balance-section">
      <h3>💰 Current Balances (အနှစ်ချုပ်)</h3>
      <div v-for="(balance, sub) in subCategorySummary" :key="sub" class="balance-item">
        <span>📂 {{ sub }}</span>
        <span class="amount">{{ formatNum(balance) }}</span>
      </div>
      <div class="balance-item total">
        <span>📈 စုစုပေါင်း ပိုင်ဆိုင်မှု (Total Assets)</span>
        <span class="amount">{{ formatNum(totalAssets) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-container { max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box; padding: 10px; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.refresh-btn { padding: 8px 15px; background: #42b883; color: white; border: none; border-radius: 6px; cursor: pointer; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
.stat-card { padding: 20px; border-radius: 12px; color: white; display: flex; flex-direction: column; gap: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.blue { background: linear-gradient(135deg, #3498db, #2980b9); }
.green { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.purple { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.orange { background: linear-gradient(135deg, #f39c12, #d35400); }

.stat-label { font-size: 0.9rem; opacity: 0.9; }
.stat-value { font-size: 1.8rem; font-weight: bold; }

.balance-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.balance-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 500; }
.amount { color: #2c3e50; font-weight: bold; }
.total { border-top: 2px solid #2c3e50; margin-top: 10px; font-size: 1.1rem; color: #2c3e50; }
</style>