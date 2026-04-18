<script setup>
import { useAuthStore } from '../stores/auth';

const props = defineProps({ isOpen: Boolean, currentPage: String });
const emit = defineEmits(['close', 'navigate']);
const authStore = useAuthStore();

const appName = import.meta.env.VITE_APP_NAME || 'Money Transfer MS';

const menuItems = [
  { name: 'COA Register', icon: '📝' },
  { name: 'Wave Money', icon: '💸' },
  { name: 'True Money', icon: '📱' },
  { name: 'Bank', icon: '🏦' },
  { name: 'Report', icon: '📊' },
  { name: 'Profit', icon: '💰' },
  { name: 'Journal', icon: '📔' },
  { name: 'Balance Sheet', icon: '📈' },
  { name: 'Cash Flow', icon: '🌊' },
  { name: 'Wallet Limit', icon: '💳' },
  { name: 'Trial Balance', icon: '⚖️' },
  { name: 'Customer', icon: '👥' }
];

const handleNavClick = (name) => {
  emit('navigate', name);
  emit('close');
};
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <h3>{{ appName }}</h3>
      <button class="close-sidebar" @click="emit('close')">✕</button>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.name" class="nav-item" :class="{ 'is-active': item.name === props.currentPage }" @click="handleNavClick(item.name)">
          <span class="icon">{{ item.icon }}</span>
          <span class="name">{{ item.name }}</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button @click="authStore.logout()" class="logout-btn-mini">
        🚪 Logout
      </button>
    </div>
  </aside>
  
  <!-- Overlay for mobile when sidebar is open -->
  <div 
    v-if="isOpen" 
    class="sidebar-overlay" 
    @click="emit('close')"
  ></div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  top: 0;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #34495e;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar.is-open {
  transform: translateX(0);
}

.close-sidebar {
  display: block;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto; /* Menu များလာပါက Scroll ဆွဲနိုင်ရန် */
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-item:hover {
  background-color: #34495e;
}

.nav-item.is-active {
  background-color: #42b883; /* Active item အတွက် အရောင် */
  font-weight: bold;
}

.icon {
  margin-right: 12px;
  font-size: 1.2rem;
  transition: transform 0.2s ease-in-out;
  display: inline-block; /* transform အလုပ်လုပ်စေရန် */
}

.nav-item:hover .icon {
  transform: scale(1.3);
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #34495e;
}

.logout-btn-mini {
  width: 100%;
  background: transparent;
  color: #ecf0f1;
  border: 1px solid #e74c3c;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>