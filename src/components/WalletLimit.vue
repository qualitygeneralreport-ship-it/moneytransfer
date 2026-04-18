<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const journalEntries = ref([]);
const accounts = ref([]);
const DAILY_LIMIT = 5000000; // တစ်နေ့စာ Limit ၅,၀၀၀,၀၀၀

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
    console.error('Error fetching Wallet Limits:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const currentDayWallets = computed(() => {
  const todayStr = new Date().toDateString();

  // ၁။ Mobile Wallets အုပ်စုဝင် Account များ ရှာဖွေခြင်း
  const walletAccountNames = accounts.value
    .filter(a => String(a.sub_category).trim() === 'Mobile Wallets')
    .map(a => a.name);

  const results = {};
  walletAccountNames.forEach(name => {
    results[name] = { inflow: 0, outflow: 0 };
  });

  // ၂။ Journal မှ ယနေ့အတွက် ငွေဝင်/ထွက် တွက်ချက်ခြင်း
  journalEntries.value.forEach(entry => {
    const entryDate = new Date(entry.created_at);
    const accName = entry.account_name;
    const amount = parseFloat(entry.amount) || 0;
    const type = entry.account_type;

    if (entryDate.toDateString() === todayStr && walletAccountNames.includes(accName)) {
      if (type === 'DEBIT') results[accName].inflow += amount;
      else results[accName].outflow += amount;
    }
  });

  return results;
});

const formatNum = (num) => new Intl.NumberFormat().format(num);
const getPercent = (val) => Math.min(Math.round((val / DAILY_LIMIT) * 100), 100);
const getStatusClass = (val) => val >= DAILY_LIMIT ? 'danger' : (val >= DAILY_LIMIT * 0.8 ? 'warning' : 'safe');
</script>

<template>
  <div class="container">
    <div class="report-card">
      <div class="header">
        <span>💳 DAILY WALLET LIMITS (5,000,000)</span>
        <button class="refresh-btn" @click="fetchData" :disabled="isLoading">🔄 Refresh</button>
      </div>

      <div class="content">
        <p class="helper-text">ယနေ့အတွက် Wallet တစ်ခုချင်းစီ၏ ငွေအဝင်/အထွက် အသုံးပြုမှုများ</p>
        
        <div v-if="isLoading" class="loading">Data များ ရယူနေပါသည်...</div>
        
        <div v-else-if="Object.keys(currentDayWallets).length === 0" class="loading">No Mobile Wallets found. Register accounts with 'Mobile Wallets' sub-category to track limits.</div>

        <div v-else v-for="(data, name) in currentDayWallets" :key="name" class="wallet-box">
          <div class="wallet-name">{{ name }}</div>
          
          <!-- Inflow Usage -->
          <div class="limit-row">
            <div class="limit-info">
              <span>Inflow (အဝင်)</span>
              <span :class="getStatusClass(data.inflow)">{{ formatNum(data.inflow) }} / {{ formatNum(DAILY_LIMIT) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill inflow-fill" :style="{ width: getPercent(data.inflow) + '%' }" :class="getStatusClass(data.inflow)"></div>
            </div>
          </div>

          <!-- Outflow Usage -->
          <div class="limit-row">
            <div class="limit-info">
              <span>Outflow (အထွက်)</span>
              <span :class="getStatusClass(data.outflow)">{{ formatNum(data.outflow) }} / {{ formatNum(DAILY_LIMIT) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill outflow-fill" :style="{ width: getPercent(data.outflow) + '%' }" :class="getStatusClass(data.outflow)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 20px; display: flex; justify-content: center; width: 100%; box-sizing: border-box; }
.report-card { width: 100%; max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.header { background: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; border-radius: 12px 12px 0 0; }
.refresh-btn { background: #42b883; border: none; color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; }

.content { padding: 20px; }
.helper-text { font-size: 0.85rem; color: #666; margin-bottom: 20px; text-align: center; }
.loading { text-align: center; padding: 20px; color: #888; }

.wallet-box { 
  background: #f8f9fa; 
  border: 1px solid #eee; 
  border-radius: 10px; 
  padding: 15px; 
  margin-bottom: 20px; 
}
.wallet-name { font-weight: bold; color: #2c3e50; margin-bottom: 15px; font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 5px; }

.limit-row { margin-bottom: 15px; }
.limit-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600; }

.progress-bar { width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.5s ease; }

.inflow-fill { background: #10b981; }
.outflow-fill { background: #3b82f6; }

.danger { color: #ef4444 !important; background-color: #ef4444 !important; }
.warning { color: #f59e0b !important; background-color: #f59e0b !important; }
.safe { color: #10b981; }

span.danger, span.warning { font-weight: bold; }
</style>