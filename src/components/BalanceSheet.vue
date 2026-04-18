<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const accounts = ref([]);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const data = await api.get('/accounts/');
    if (Array.isArray(data)) {
      accounts.value = data;
    }
  } catch (error) {
    console.error('Error fetching Balance Sheet data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const assetsGrouped = computed(() => {
  const groups = {};
  accounts.value.forEach(acc => {
    const primary = String(acc.primary_category || '').toLowerCase();
    const balance = parseFloat(acc.balance) || 0;

    if (primary.includes('asset') && balance >= 0) {
      const sub = acc.sub_category || 'Other';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push({
        name: acc.name,
        balance: balance
      });
    }
  });
  return groups;
});

const liabilities = computed(() => {
  return accounts.value.filter(acc => {
    const primary = String(acc.primary_category || '').toLowerCase();
    const balance = parseFloat(acc.balance) || 0;
    return primary.includes('liability') && balance < 0;
  }).map(acc => ({
    name: acc.name,
    balance: Math.abs(parseFloat(acc.balance) || 0)
  }));
});

const equity = computed(() => {
  return accounts.value.filter(acc => {
    const primary = String(acc.primary_category || '').toLowerCase();
    const balance = parseFloat(acc.balance) || 0;
    return (primary.includes('equity') || primary.includes('capital')) && balance < 0;
  }).map(acc => ({
    name: acc.name,
    balance: Math.abs(parseFloat(acc.balance) || 0)
  }));
});

const totalAssets = computed(() => {
  let total = 0;
  Object.values(assetsGrouped.value).forEach(group => {
    total += group.reduce((sum, item) => sum + item.balance, 0);
  });
  return total;
});
const totalLiabilities = computed(() => liabilities.value.reduce((sum, item) => sum + item.balance, 0));
const totalEquity = computed(() => equity.value.reduce((sum, item) => sum + item.balance, 0));

const currentPeriodProfit = ref(0); 

const totalLiabilitiesAndEquity = computed(() => totalLiabilities.value + totalEquity.value + currentPeriodProfit.value);

const isBalanced = computed(() => Math.abs(totalAssets.value - totalLiabilitiesAndEquity.value) < 0.01);

const formatNum = (num) => new Intl.NumberFormat().format(num);
</script>

<template>
  <div class="container">
    <div class="report-card">
      <div class="header">
        <span>📈 BALANCE SHEET (လက်ကျန်ရှင်းတမ်း)</span>
        <button class="refresh-btn" @click="fetchData" :disabled="isLoading">🔄 Refresh</button>
      </div>
      
      <div class="table-container">
        <!-- Assets Section -->
        <div class="section-title">Assets (ပိုင်ဆိုင်မှုများ)</div>
        
        <div v-for="(items, subCategory) in assetsGrouped" :key="subCategory" class="sub-section">
          <h4 class="sub-cat-title">{{ subCategory }}</h4>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatNum(item.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table class="total-table" v-if="Object.keys(assetsGrouped).length > 0">
          <tfoot>
            <tr class="total-row asset-total">
              <td>Total Assets</td>
              <td class="text-right">{{ formatNum(totalAssets) }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Liabilities Section -->
        <h3 class="mt-4">Liabilities (ပေးရန်တာဝန်များ)</h3>
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th class="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in liabilities" :key="index">
              <td>{{ item.name }}</td>
              <td class="text-right">{{ formatNum(item.balance) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>Total Liabilities</td>
              <td class="text-right">{{ formatNum(totalLiabilities) }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Equity Section -->
        <h3 class="mt-4">Equity (ပိုင်ရှင်ပိုင်ဆိုင်မှု)</h3>
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th class="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in equity" :key="index">
              <td>{{ item.name }}</td>
              <td class="text-right">{{ formatNum(item.balance) }}</td>
            </tr>
            <tr>
              <td>Current Period Profit</td>
              <td class="text-right">{{ formatNum(currentPeriodProfit) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>Total Equity</td>
              <td class="text-right">{{ formatNum(totalEquity + currentPeriodProfit) }}</td>
            </tr>
          </tfoot>
        </table>

        <h3 class="mt-4">Total Liabilities & Equity</h3>
        <div class="total-summary">
          <span class="label">Total Liabilities + Equity</span>
          <span class="value">{{ formatNum(totalLiabilitiesAndEquity) }}</span>
        </div>
      </div>

      <div v-if="!isLoading" class="balance-status" :class="isBalanced ? 'success' : 'warning'">
        {{ isBalanced ? '✅ Balance Sheet ကိုက်ညီမှုရှိပါသည် (Balanced)' : '⚠️ Balance Sheet ကွာဟချက်ရှိနေပါသည် (Not Balanced)' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 20px; display: flex; justify-content: center; width: 100%; box-sizing: border-box; }
.report-card { width: 100%; max-width: 900px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
.header { background: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.refresh-btn { background: #42b883; border: none; color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
.table-container { padding: 20px; overflow-x: auto; }
h3 { margin-top: 20px; margin-bottom: 10px; color: #2c3e50; }
.section-title { font-size: 1.2rem; font-weight: bold; color: #2c3e50; margin: 20px 0 10px; border-bottom: 2px solid #2c3e50; padding-bottom: 5px; }
.sub-cat-title { font-size: 1rem; color: #34495e; margin: 15px 0 5px 10px; font-style: italic; }
table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 0.9rem; }
th { background: #f8f9fa; }
.text-right { text-align: right; }
.total-table { margin-top: 0; margin-bottom: 30px; }
.asset-total { background: #e8f5e9 !important; }
.total-row { background: #fdf2f2; font-weight: bold; border-top: 2px solid #2c3e50; }
.total-row td { border-bottom: none; }
.total-summary { display: flex; justify-content: space-between; padding: 15px; background: #e0f2f7; border-radius: 8px; font-weight: bold; font-size: 1.1rem; color: #2c3e50; }
.balance-status { margin: 0 20px 20px; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; }
.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.warning { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
.mt-4 { margin-top: 2rem; }
</style>