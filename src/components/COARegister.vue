<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api';

const emit = defineEmits(['navigate']);

const formData = ref({
  coaType: 'WavePartner',
  accountName: '',
  description: '',
  phone: '',
  openingBalance: 0,
  primary_category: 'Asset',
  sub_category: 'Other'
});

const coaList = ref([]);
const isSubmitting = ref(false);

const primaryCategories = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
const subCategories = ['Bank/Wallet', 'Operating', 'Cash', 'Commission', 'General'];

const fetchCOAList = async () => {
  try {
    const data = await api.get('/accounts/');
    coaList.value = data;
  } catch (error) {
    console.error('Error fetching COA list:', error);
  }
};

onMounted(fetchCOAList);

const registerCOA = async () => {
  if (!formData.value.accountName) {
    alert('Please enter account name.');
    return;
  }

  isSubmitting.value = true;
  try {
    await api.post('/accounts/', {
      account_type: formData.value.coaType,
      name: formData.value.accountName,
      description: formData.value.description,
      phone: formData.value.phone,
      opening_balance: formData.value.openingBalance,
      balance: formData.value.openingBalance, // Initial balance starts with opening
      primary_category: formData.value.primary_category,
      sub_category: formData.value.sub_category
    });
    alert('Account registered successfully!');
    // Reset form
    formData.value = {
      coaType: 'WavePartner',
      accountName: '',
      description: '',
      phone: '',
      openingBalance: 0,
      primary_category: 'Asset',
      sub_category: 'Other'
    };
    fetchCOAList();
  } catch (error) {
    console.error('Registration error:', error);
    alert('Failed to register account.');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteAccount = async (id) => {
  if (!confirm('Are you sure you want to delete this account?')) return;
  try {
    await api.delete(`/accounts/${id}/`);
    fetchCOAList();
  } catch (error) {
    alert('Could not delete. Account might have transactions.');
  }
};
</script>

<template>
  <div class="container">
    <div class="form-card">
      <div class="header">
        <span class="header-title">CHART OF ACCOUNT REGISTRATION</span>
      </div>
      <div class="content">
        <div class="input-row">
          <label>COA Type</label>
          <select v-model="formData.coaType">
            <option value="WavePartner">WavePartner</option>
            <option value="TruePartner">TruePartner</option>
            <option value="Bank">Bank</option>
            <option value="Cash">Cash</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        
        <div class="input-row">
          <label>Account Name</label>
          <input type="text" v-model="formData.accountName" placeholder="e.g. Shop Cash, Wave Card 1">
        </div>

        <div class="top-row">
          <div class="input-row flex-1">
             <label>Primary Category</label>
             <select v-model="formData.primary_category">
               <option v-for="cat in primaryCategories" :key="cat" :value="cat">{{ cat }}</option>
             </select>
          </div>
          <div class="input-row flex-1">
             <label>Sub Category</label>
             <select v-model="formData.sub_category">
               <option v-for="cat in subCategories" :key="cat" :value="cat">{{ cat }}</option>
             </select>
          </div>
        </div>

        <div class="input-row">
          <label>Phone Number (Optional)</label>
          <input type="text" v-model="formData.phone">
        </div>

        <div class="input-row">
          <label>Opening Balance</label>
          <input type="number" v-model="formData.openingBalance">
        </div>

        <div class="input-row">
          <label>Description</label>
          <textarea v-model="formData.description"></textarea>
        </div>

        <div class="action-buttons">
          <button class="btn add-btn" @click="registerCOA" :disabled="isSubmitting">
            {{ isSubmitting ? 'REGISTERING...' : 'REGISTER ACCOUNT' }}
          </button>
        </div>
      </div>
    </div>

    <!-- COA Table -->
    <div class="list-card">
      <div class="header">REGISTERED ACCOUNTS</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Category</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coa in coaList" :key="coa.id">
              <td>{{ coa.account_type }}</td>
              <td>{{ coa.name }}</td>
              <td>{{ coa.primary_category }} / {{ coa.sub_category }}</td>
              <td>{{ coa.balance }}</td>
              <td>
                <button class="delete-btn" @click="deleteAccount(coa.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 20px; width: 100%; box-sizing: border-box; }
.form-card, .list-card { width: 100%; max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
.header { background-color: #2c3e50; color: white; padding: 15px; font-weight: bold; }
.content { padding: 20px; }
.input-row { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
.top-row { display: flex; gap: 10px; }
.flex-1 { flex: 1; }
.input-row label { font-weight: 600; font-size: 0.9rem; color: #555; }
.input-row input, .input-row select, .input-row textarea { padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.btn { width: 100%; padding: 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; background-color: #42b883; color: white; }
.delete-btn { background: #ff4d4f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.table-container { padding: 10px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
</style>