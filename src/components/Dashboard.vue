<script setup>
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

const appName = import.meta.env.VITE_APP_NAME || 'Money Transfer MS';
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-banner">
      <h1>မင်္ဂလာပါ၊ {{ authStore.user?.name }} 👋</h1>
      <p>{{ appName }} မှ ကြိုဆိုပါသည်။</p>
    </div>

    <div class="manual-section">
      <h2 class="section-title">📖 အသုံးပြုပုံ လမ်းညွှန် (User Manual)</h2>
      
      <div class="manual-grid">
        <!-- Step 1 -->
        <div class="manual-card">
          <div class="card-icon">1️⃣</div>
          <h3>COA Register (စာရင်းဖွင့်ခြင်း)</h3>
          <ul>
            <li>အသုံးမပြုမီ <strong>COA Register</strong> မှာ အကောင့်များ အရင်ဖွင့်ပါ။</li>
            <li><strong>Capital (အရင်း):</strong> သိန်း ၁၀၀ ဆိုလျှင် <code>10,000,000</code> ဟု ရိုက်ထည့်ပါ။ စနစ်က <code>-10,000,000</code> အဖြစ် အလိုအလျောက် ပြောင်းလဲမှတ်တမ်းတင်ပေးပါမည်။</li>
            <li><strong>Cash/Bank:</strong> လက်ကျန်ငွေများကို အပေါင်းကိန်းအတိုင်း ရိုက်သွင်းပါ။</li>
          </ul>
        </div>

        <!-- Step 2 -->
        <div class="manual-card">
          <div class="card-icon">2️⃣</div>
          <h3>Money Transfer (ငွေလွှဲ/ထုတ်)</h3>
          <ul>
            <li><strong>Wave/True Money:</strong> ငွေလွှဲ၊ ငွေထုတ်၊ ငွေသွင်း အမျိုးအစားအလိုက် ရွေးချယ်ပါ။ ကော်မရှင်များကို စနစ်က အလိုလို တွက်ချက်ပေးပါမည်။</li>
            <li><strong>Bank:</strong> ဘဏ်မှ ငွေထုတ်ပေးခြင်း (Cash Out) အတွက် အဓိက သုံးသည်။</li>
            <li><strong>IN:</strong> ဘဏ်ထဲငွေဝင်၊ <strong>OUT:</strong> လက်ငင်းငွေသားထွက်။</li>
          </ul>
        </div>

        <!-- Step 3 -->
        <div class="manual-card">
          <div class="card-icon">3️⃣</div>
          <h3>Special Features (ဘဏ်လုပ်ငန်း)</h3>
          <ul>
            <li><strong>ပိုလွဲ:</strong> ON ထားပါက ကော်မရှင်ကို IN အကောင့်ထဲ ပေါင်းထည့်ပြီး OUT အကောင့်မှ အရင်းအတိုင်း နုတ်ပါမည်။</li>
            <li><strong>အခမဲ့:</strong> ကော်မရှင် လုံးဝမယူလိုပါက (Zero Com) ဤ Toggle ကို သုံးပါ။</li>
            <li><strong>Commission Logic:</strong> IN မှာ Cash ဖြစ်ပြီး OUT မှာ တခြားအကောင့်ဆိုလျှင် (Cash In logic) ကော်မရှင် တွက်မည်မဟုတ်ပါ။</li>
          </ul>
        </div>

        <!-- Step 4 -->
        <div class="manual-card">
          <div class="card-icon">4️⃣</div>
          <h3>Reports (အစီရင်ခံစာများ)</h3>
          <ul>
            <li><strong>Profit:</strong> ရရှိသည့် ကော်မရှင်စုစုပေါင်းမှ အထွေထွေအသုံးစရိတ်များကို နုတ်ပြီး အသားတင်အမြတ်ကို ပြပေးသည်။</li>
            <li><strong>Wallet Limit:</strong> Mobile Wallets တစ်ခုချင်းစီ၏ တစ်နေ့တာ ၅,၀၀၀,၀၀၀ limit အသုံးပြုမှုကို စောင့်ကြည့်နိုင်သည်။</li>
            <li><strong>Balance Sheet:</strong> ပိုင်ဆိုင်မှု (Assets) နှင့် အရင်းအနှီး (Equity) ကိုက်ညီမှု ရှိမရှိ စစ်ဆေးနိုင်သည်။</li>
          </ul>
        </div>
      </div>

      <div class="pro-tips">
        <h4>💡 Pro Tips:</h4>
        <p>• ဒေတာများ မတွေ့ရပါက 🔄 <strong>Refresh</strong> ခလုတ်ကို နှိပ်ပါ။</p>
        <p>• အကောင့်အမည်များ ထပ်မနေစေရန် သတိပြုပါ။ (ဥပမာ - KBZ-1, KBZ-2 စသဖြင့် ခွဲပေးပါ)</p>
        <p>• ငွေစာရင်းမှားသွင်းမိပါက 🗑️ <strong>Delete</strong> ကို နှိပ်ပါ။ စနစ်က Balance များကို အလိုအလျောက် ပြန်လည်ညှိပေးပါမည်။</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #2c3e50, #42b883);
  color: white;
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 40px;
  box-shadow: 0 10px 20px rgba(66, 184, 131, 0.2);
}

.welcome-banner h1 { margin: 0; font-size: 2rem; }
.welcome-banner p { margin: 10px 0 0; opacity: 0.9; }

.section-title {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-left: 5px solid #42b883;
  padding-left: 15px;
}

.manual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.manual-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  transition: transform 0.3s ease;
}

.manual-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

.manual-card h3 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.manual-card ul {
  padding-left: 20px;
  margin: 0;
}

.manual-card li {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e74c3c;
  font-family: monospace;
  font-weight: bold;
}

.pro-tips {
  margin-top: 40px;
  background-color: #fff9db;
  border: 1px solid #ffe066;
  padding: 20px;
  border-radius: 12px;
}

.pro-tips h4 {
  margin: 0 0 10px;
  color: #856404;
}

.pro-tips p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #664d03;
}

@media (max-width: 600px) {
  .welcome-banner {
    padding: 20px;
    margin-bottom: 20px;
  }
  .welcome-banner h1 {
    font-size: 1.3rem;
  }
  .section-title {
    font-size: 1.2rem;
  }
}
</style>