<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const waveList = ref([]);
const trueList = ref([]);
const bankList = ref([]);
const accounts = ref([]);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [waveData, trueData, bankData, accountData] = await Promise.all([
      api.get('/transactions/wave/'),
      api.get('/transactions/true/'),
      api.get('/transactions/bank/'),
      api.get('/accounts/')
    ]);

    waveList.value = waveData;
    trueList.value = trueData;
    bankList.value = bankData;
    accounts.value = accountData;
  } catch (error) {
    console.error('Error fetching profit data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

// Wave Profit: Sum of all com fields
const waveProfit = computed(() => {
  return waveList.value.reduce((sum, tx) => {
    return sum + (parseFloat(tx.transfer_com) || 0) + (parseFloat(tx.cash_out_com) || 0) + (parseFloat(tx.cash_in_com) || 0);
  }, 0);
});

// True Profit: Sum of all com fields
const trueProfit = computed(() => {
  return trueList.value.reduce((sum, tx) => {
    return sum + (parseFloat(tx.transfer_com) || 0) + (parseFloat(tx.cash_out_com) || 0) + (parseFloat(tx.inter_cash_out_com) || 0);
  }, 0);
});

// Bank Profit: Sum of commissions
const bankProfit = computed(() => {
  return bankList.value.reduce((sum, tx) => {
    return sum + (parseFloat(tx.commission) || 0);
  }, 0);
});

const totalRevenue = computed(() => waveProfit.value + trueProfit.value + bankProfit.value);

const expensesAmount = computed(() => {
  return accounts.value.reduce((sum, acc) => {
    const primary = String(acc.primary_category || '').toLowerCase();
    if (primary === 'expense') {
      return sum + (parseFloat(acc.balance) || 0);
    }
    return sum;
  }, 0);
});

const capitalAmount = computed(() => {
  return accounts.value.reduce((sum, acc) => {
    const primary = String(acc.primary_category || '').toLowerCase();
    if (primary === 'equity' || primary === 'capital') {
      return sum + Math.abs(parseFloat(acc.balance) || 0);
    }
    return sum;
  }, 0);
});

const totalProfit = computed(() => totalRevenue.value - expensesAmount.value);
const netWorth = computed(() => capitalAmount.value + totalProfit.value);

const formatNum = (num) => new Intl.NumberFormat().format(num);
</script>

<template>
  <div class="profit-container">
    <div class="header-section">
      <h2>💰 PROFIT REPORT</h2>
      <button class="refresh-btn" @click="fetchData" :disabled="isLoading">
        {{ isLoading ? '⌛ Loading...' : '🔄 Refresh Data' }}
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card capital">
        <span class="label">ရင်းနှီးမြှုပ်နှံမှု (Capital)</span>
        <span class="value">{{ formatNum(capitalAmount) }}</span>
      </div>

      <div class="summary-card total-profit" :class="{ 'negative': totalProfit < 0 }">
        <span class="label">အသားတင် အမြတ် (Net Profit)</span>
        <span class="value">{{ formatNum(totalProfit) }}</span>
      </div>

      <div class="summary-card net-worth">
        <span class="label">စုစုပေါင်း လက်ကျန် (Net Worth)</span>
        <span class="value">{{ formatNum(netWorth) }}</span>
      </div>
    </div>

    <div class="details-section">
      <div class="detail-item">
        <div class="detail-icon wave">💸</div>
        <div class="detail-info">
          <span class="detail-label">Wave Money Commissions</span>
          <span class="detail-value">+ {{ formatNum(waveProfit) }}</span>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon true">📱</div>
        <div class="detail-info">
          <span class="detail-label">True Money Commissions</span>
          <span class="detail-value">+ {{ formatNum(trueProfit) }}</span>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon bank">🏦</div>
        <div class="detail-info">
          <span class="detail-label">Bank Commissions</span>
          <span class="detail-value">+ {{ formatNum(bankProfit) }}</span>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon expense">💸</div>
        <div class="detail-info">
          <span class="detail-label">Total Expenses (အထွေထွေ အသုံးစရိတ်)</span>
          <span class="detail-value text-red">- {{ formatNum(expensesAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profit-container { max-width: 800px; margin: 0 auto; padding: 20px; width: 100%; box-sizing: border-box; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.refresh-btn { padding: 8px 16px; background-color: #2c3e50; color: white; border: none; border-radius: 6px; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
.summary-card { padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); color: white; }
.capital { background: linear-gradient(135deg, #34495e, #2c3e50); }
.total-profit { background: linear-gradient(135deg, #27ae60, #2ecc71); }
.total-profit.negative { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.net-worth { background: linear-gradient(135deg, #2980b9, #3498db); }
.label { font-size: 0.85rem; opacity: 0.9; }
.value { font-size: 1.5rem; font-weight: bold; }
.text-red { color: #e74c3c !important; }
.details-section { background: white; border-radius: 12px; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.detail-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; gap: 15px; }
.detail-item:last-child { border-bottom: none; }
.detail-icon { font-size: 1.5rem; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 50%; }
.detail-info { display: flex; flex-direction: column; }
.detail-label { font-size: 0.9rem; color: #7f8c8d; }
.detail-value { font-weight: bold; color: #27ae60; font-size: 1.1rem; }
</style>