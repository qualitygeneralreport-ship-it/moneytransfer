<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

const isLoading = ref(false);
const journalList = ref([]);
const searchQuery = ref('');

const fetchJournalList = async () => {
  isLoading.value = true;
  try {
    const data = await api.get('/journals/');
    if (Array.isArray(data)) {
      journalList.value = data;
    }
  } catch (error) {
    console.error('Error fetching journal list:', error);
    alert('Journal ဒေတာ ရယူ၍ မရပါ။');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchJournalList);

const reversedJournal = computed(() => {
  return [...journalList.value]; // Backend already returns ordered by -created_at
});

const filteredJournal = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return reversedJournal.value;
  
  return reversedJournal.value.filter(row => {
    const account = String(row.account_name).toLowerCase();
    const description = String(row.description).toLowerCase();
    const reference = String(row.journal_batch).toLowerCase();
    return account.includes(query) || description.includes(query) || reference.includes(query);
  });
});

const formatNum = (num) => new Intl.NumberFormat().format(num);
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
</script>

<template>
  <div class="container">
    <div class="list-card">
      <div class="header">
        <span>📔 JOURNAL TRANSACTION LISTS</span>
        <button class="refresh-btn" @click="fetchJournalList" :disabled="isLoading">
          {{ isLoading ? '⌛' : '🔄 Refresh' }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="အကောင့်၊ အမျိုးအစား သို့မဟုတ် မှတ်ချက်ဖြင့် ရှာဖွေရန်..."
          class="search-input"
        />
      </div>

      <!-- Desktop Table View -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Account</th>
              <th>Description</th>
              <th class="text-right">In/Out</th>
              <th class="text-right">Ending Balance</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredJournal" :key="row.id">
              <td class="time-cell">{{ formatDate(row.created_at) }}</td>
              <td class="font-bold">{{ row.account_name }}</td>
              <td><span class="badge">{{ row.description }}</span></td>
              <td class="text-right" :class="row.account_type === 'DEBIT' ? 'text-green' : 'text-red'">
                {{ row.account_type === 'DEBIT' ? '+' : '-' }}{{ formatNum(row.amount) }}
              </td>
              <td class="text-right font-mono">{{ formatNum(row.balance_after) }}</td>
              <td class="ref-text">{{ row.journal_batch }}</td>
            </tr>
            <tr v-if="filteredJournal.length === 0">
              <td colspan="6" class="text-center">{{ searchQuery ? 'ရှာဖွေမှုရလဒ် မရှိပါ။' : 'စာရင်းများ မရှိသေးပါ။' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-card-list">
        <div v-for="(row, index) in filteredJournal" :key="row.id" class="mobile-card">
          <div class="card-header">
            <span class="time">{{ formatDate(row.created_at) }}</span>
            <span class="badge">{{ row.description }}</span>
          </div>
          <div class="card-body">
            <p class="acc-name"><strong>🏦 {{ row.account_name }}</strong></p>
            <div class="card-grid">
              <div><span>In/Out:</span> <b :class="row.account_type === 'DEBIT' ? 'text-green' : 'text-red'">{{ row.account_type === 'DEBIT' ? '+' : '-' }}{{ formatNum(row.amount) }}</b></div>
              <div><span>Balance:</span> {{ formatNum(row.balance_after) }}</div>
            </div>
            <p class="ref-info">📝 {{ row.journal_batch }}</p>
          </div>
        </div>
        <div v-if="filteredJournal.length === 0" class="text-center" style="padding: 20px; color: #888;">
          {{ searchQuery ? 'ရှာဖွေမှုရလဒ် မရှိပါ။' : 'စာရင်းများ မရှိသေးပါ။' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 10px; width: 100%; box-sizing: border-box; }
.list-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; width: 100%; }
.header { background-color: #2c3e50; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.refresh-btn { background: #42b883; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }

.search-section { padding: 10px 15px; background: #f8f9fa; border-bottom: 1px solid #eee; }
.search-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; font-size: 0.9rem; box-sizing: border-box; }
.search-input:focus { border-color: #42b883; box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.1); }

.table-container { overflow-x: auto; display: block; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
th { background-color: #f8f9fa; color: #2c3e50; white-space: nowrap; }

.text-right { text-align: right; }
.text-center { text-align: center; padding: 40px; color: #888; }
.text-green { color: #27ae60; font-weight: bold; }
.text-red { color: #e74c3c; font-weight: bold; }
.font-bold { font-weight: bold; color: #2c3e50; }
.font-mono { font-family: monospace; font-weight: 600; }
.badge { background: #eef2f7; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; color: #555; }
.ref-text { font-size: 0.8rem; color: #666; font-style: italic; }
.time-cell { color: #888; font-size: 0.8rem; }

.mobile-card-list { display: none; }

@media (max-width: 768px) {
  .table-container { display: none; }
  .mobile-card-list { display: block; padding: 10px; background: #f0f2f5; }
  .mobile-card {
    background: white; border-radius: 10px; padding: 15px; margin-bottom: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #eee;
  }
  .card-header { display: flex; justify-content: space-between; border-bottom: 1px solid #f8f8f8; padding-bottom: 8px; margin-bottom: 10px; }
  .time { font-size: 0.75rem; color: #888; }
  .acc-name { margin-bottom: 8px; color: #2c3e50; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; }
  .card-grid span { color: #888; margin-right: 5px; }
  .ref-info { margin-top: 10px; font-size: 0.8rem; color: #7f8c8d; border-top: 1px dashed #eee; padding-top: 8px; }
}
</style>