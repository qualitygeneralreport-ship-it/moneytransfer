<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoginForm from './components/LoginForm.vue';
import Sidebar from './components/Sidebar.vue';
import COARegister from './components/COARegister.vue';
import Dashboard from './components/Dashboard.vue';
import WaveMoney from './components/WaveMoney.vue';
import Bank from './components/Bank.vue';
import Profit from './components/Profit.vue';
import Report from './components/Report.vue';
import TrialBalance from './components/TrialBalance.vue';
import BalanceSheet from './components/BalanceSheet.vue';
import CashFlow from './components/CashFlow.vue';
import JournalList from './components/JournalList.vue';
import WalletLimit from './components/WalletLimit.vue';
import TrueMoney from './components/TrueMoney.vue';
import Customer from './components/Customer.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const isSidebarOpen = ref(false);
const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;

const isOffline = ref(!navigator.onLine);
const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

const currentPage = ref('Dashboard');
const navigateTo = (page) => {
  currentPage.value = page;
};

const onLoginSuccess = (userData) => {
  // Pinia Store ထဲသို့ User Data သိမ်းဆည်းခြင်း
  authStore.setUser(userData);
  console.log('Stored in Pinia:', authStore.user);

  // User Data တွေကို Backend Server ဆီပို့ပြီး Google Sheet မှာ သိမ်းဆည်းရန်
  sendUserDataToGoogleSheet(userData);
};

const sendUserDataToGoogleSheet = async (userData) => {
  try {
    await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Script ၏ CORS issue ကို ကျော်လွှားရန် လိုအပ်သည်
      headers: {
        'Content-Type': 'text/plain', // Preflight OPTIONS request ကို ရှောင်ရှားရန် text/plain သုံးရပါမည်
      },
      body: JSON.stringify({
        action: 'USER_LOGIN',
        ...userData
      }),
    });
    
    // no-cors mode တွင် response ကို ဖတ်၍မရသော်လည်း data မှာ Sheet ထဲသို့ ရောက်ရှိသွားမည်ဖြစ်သည်
    console.log('Request sent to Google Sheet successfully');
  } catch (error) {
    console.error('Error saving data to Google Sheet:', error);
  }
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }

  // Dynamic Manifest Generation using .env variable
  const appName = import.meta.env.VITE_APP_NAME || 'Money Transfer MS';
  const origin = window.location.origin;
  
  const manifestObj = {
    "name": appName,
    "short_name": appName,
    "description": `Management System for ${appName}`,
    "theme_color": "#2c3e50",
    "background_color": "#f0f2f5",
    "display": "standalone",
    "orientation": "portrait",
    "scope": origin + "/",
    "start_url": origin + "/",
    "icons": [
      { "src": origin + "/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
      { "src": origin + "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
    ]
  };

  const stringManifest = JSON.stringify(manifestObj);
  const blob = new Blob([stringManifest], {type: 'application/json'});
  const manifestURL = URL.createObjectURL(blob);

  let manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    document.head.appendChild(manifestLink);
  }
  manifestLink.href = manifestURL;
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<template>
  <div v-if="isOffline" class="offline-bar">
    ⚠️ သင်သည် အော့ဖ်လိုင်းဖြစ်နေပါသည်။ ဒေတာသိမ်းဆည်းရန် အင်တာနက်ပြန်တက်သည်အထိ စောင့်ဆိုင်းပေးပါ။
  </div>

  <div class="login-wrapper">
    <!-- Login မဝင်ရသေးရင် LoginForm ပြမယ် -->
    <LoginForm v-if="!authStore.isAuthenticated" @login-success="onLoginSuccess" />

    <!-- Login ဝင်ပြီးသားဆိုရင် Dashboard Layout ပြမယ် -->
    <div v-else class="dashboard-layout">
      <Sidebar 
        :isOpen="isSidebarOpen" 
        @close="isSidebarOpen = false" 
        @navigate="navigateTo"
        :currentPage="currentPage"
      />
      
      <div class="main-content">
        <header class="top-navbar">
          <button class="mobile-toggle" @click="toggleSidebar">☰</button>
          <div class="user-badge">
            <span>{{ authStore.user.name }}</span>
            <img 
              v-if="authStore.user.picture" 
              :src="authStore.user.picture" 
              class="avatar-mini" 
              @error="(e) => e.target.style.display = 'none'"
            />
          </div>
        </header>

        <main class="page-content">
          <!-- Dashboard (Home) Page -->
          <Dashboard v-if="currentPage === 'Dashboard'" />
          
          <!-- COA Register Page -->
          <COARegister v-else-if="currentPage === 'COA Register'" />
          
          <!-- Wave Money Page -->
          <WaveMoney v-else-if="currentPage === 'Wave Money'" @navigate="navigateTo" />
          
          <!-- Bank Page -->
          <Bank v-else-if="currentPage === 'Bank'" @navigate="navigateTo" />
          
          <!-- Profit Page -->
          <Profit v-else-if="currentPage === 'Profit'" />
          
          <!-- Trial Balance Page -->
          <TrialBalance v-else-if="currentPage === 'Trial Balance'" />
          
          <!-- Balance Sheet Page -->
          <BalanceSheet v-else-if="currentPage === 'Balance Sheet'" />
          
          <!-- Cash Flow Page -->
          <CashFlow v-else-if="currentPage === 'Cash Flow'" />
          
          <!-- Journal Page -->
          <JournalList v-else-if="currentPage === 'Journal'" />
          
          <!-- Wallet Limit Page -->
          <WalletLimit v-else-if="currentPage === 'Wallet Limit'" />
          
          <!-- True Money Page -->
          <TrueMoney v-else-if="currentPage === 'True Money'" @navigate="navigateTo" />
          
          <!-- Report Page -->
          <Report v-else-if="currentPage === 'Report'" />
          
          <!-- Customer Page -->
          <Customer v-else-if="currentPage === 'Customer'" />
          
          <!-- အခြား Page များအတွက် Placeholder -->
          <div v-else>
            <h1>{{ currentPage }} Page</h1>
            <p>ဤစာမျက်နှာအတွက် အချက်အလက်များ မရှိသေးပါ။</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offline-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #e74c3c;
  color: white;
  text-align: center;
  padding: 10px 0;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 3000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top-navbar {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.mobile-toggle {
  display: block;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #2c3e50;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.page-content {
  padding: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  .page-content {
    padding: 1rem 0.5rem;
  }
  .top-navbar {
    padding: 0 1rem;
  }
}
</style>
