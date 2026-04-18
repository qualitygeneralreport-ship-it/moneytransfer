<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../api';

const authStore = useAuthStore();
const isSubmitting = ref(false);
const customerList = ref([]);

const formData = ref({
  name: '',
  phone: '',
  address: '',
  remark: '',
  shopName: authStore.user?.name || 'VISITOR'
});

const fetchCustomerList = async () => {
  try {
    const data = await api.get('/customers/');
    if (Array.isArray(data)) {
      customerList.value = data;
    }
  } catch (error) {
    console.error('Error fetching customer list:', error);
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    address: '',
    remark: '',
    shopName: authStore.user?.name || 'VISITOR'
  };
};

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.phone) {
    alert('အမည်နှင့် ဖုန်းနံပါတ် ဖြည့်စွက်ပေးပါ');
    return;
  }

  isSubmitting.value = true;
  try {
    await api.post('/customers/', formData.value);
    alert('Customer registered successfully!');
    resetForm();
    fetchCustomerList();
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving data.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchCustomerList);
</script>

<template>
  <div class="container">
    <div class="form-card">
      <div class="form-header">CUSTOMER REGISTRATION</div>
      <div class="form-body">
        <div class="input-group">
          <label>အမည်</label>
          <input type="text" v-model="formData.name" placeholder="အမည်ရိုက်ထည့်ပါ">
        </div>
        <div class="input-group">
          <label>ဖုန်းနံပါတ်</label>
          <input type="tel" v-model="formData.phone" placeholder="၀၉xxxxxxxxx">
        </div>
        <div class="input-group">
          <label>လိပ်စာ</label>
          <input type="text" v-model="formData.address" placeholder="လိပ်စာရိုက်ထည့်ပါ">
        </div>
        <div class="input-group">
          <label>မှတ်ချက်</label>
          <input type="text" v-model="formData.remark" placeholder="မှတ်ချက်">
        </div>
        <div class="input-group">
          <label>ဆိုင်ခွဲ</label>
          <input type="text" v-model="formData.shopName" readonly class="readonly-input">
        </div>
        <button class="add-btn" @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Add Customer' }}
        </button>
      </div>
    </div>

    <div class="list-card">
      <div class="form-header">CUSTOMER LIST</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Remark</th>
              <th>Shop</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in customerList" :key="index">
              <td>{{ row.name }}</td>
              <td>{{ row.phone }}</td>
              <td>{{ row.address }}</td>
              <td>{{ row.remark }}</td>
              <td>{{ row.created_at ? new Date(row.created_at).toLocaleDateString() : '' }}</td>
            </tr>
            <tr v-if="customerList.length === 0">
              <td colspan="5" style="text-align: center;">No customers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px;
}

.form-card, .list-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
}

.list-card { max-width: 900px; }

.form-header {
  background-color: #2c3e50;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.form-body { padding: 20px; }

.input-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.input-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.readonly-input { background-color: #f8f9fa; color: #888; }

.add-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.table-container { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

th {
  background-color: #f8f9fa;
  color: #2c3e50;
}
</style>