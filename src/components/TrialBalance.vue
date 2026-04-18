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
    console.error('Error fetching Trial Balance:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const trialData = computed(() => {
  return accounts.value.map(acc => {
    const balance = parseFloat(acc.balance) || 0;
    return {
      type: acc.account_type,
      name: acc.name,
      debit: balance > 0 ? balance : 0,
      credit: balance < 0 ? Math.abs(balance) : 0
    };
  });
});

const totalDebit = computed(() => trialData.value.reduce((sum, item) => sum + item.debit, 0));
const totalCredit = computed(() => trialData.value.reduce((sum, item) => sum + item.credit, 0));
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01);

const formatNum = (num) => new Intl.NumberFormat().format(num);
</script>

<template>
  <div class="container">
    <div class="report-card">
      <div class="header">
        <span>⚖️ TRIAL BALANCE (စမ်းသပ်ရှင်းတမ်း)</span>
        <button class="refresh-btn" @click="fetchData" :disabled="isLoading">🔄 Refresh</button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Type</th>
              <th class="text-right">Debit (Dr.)</th>
              <th class="text-right">Credit (Cr.)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in trialData" :key="index">
              <td>{{ row.name }}</td>
              <td><span class="badge">{{ row.type }}</span></td>
              <td class="text-right">{{ row.debit !== 0 ? formatNum(row.debit) : '-' }}</td>
              <td class="text-right credit-text">{{ row.credit !== 0 ? formatNum(row.credit) : '-' }}</td>
            </tr>
            <tr v-if="trialData.length === 0">
              <td colspan="4" style="text-align: center; padding: 20px; color: #888;">No accounts found.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td class="text-right">{{ formatNum(totalDebit) }}</td>
              <td class="text-right">{{ formatNum(totalCredit) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="!isLoading" class="balance-status" :class="isBalanced ? 'success' : 'warning'">
        {{ isBalanced ? '✅ စာရင်းကိုက်ညီမှုရှိပါသည် (Balanced)' : '⚠️ စာရင်းကွာဟချက်ရှိနေပါသည် (Not Balanced)' }}
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
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 0.9rem; }
th { background: #f8f9fa; }
.text-right { text-align: right; }
.credit-text { color: #e74c3c; }
.badge { background: #ebf5ff; color: #007bff; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }

.total-row { background: #fdf2f2; font-weight: bold; border-top: 2px solid #2c3e50; }
.total-row td { border-bottom: none; }

.balance-status { margin: 0 20px 20px; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; }
.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.warning { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
</style>