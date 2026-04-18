<script setup>
import { ref } from 'vue';
import { GoogleSignInButton, decodeCredential } from 'vue3-google-signin';
import { api } from '../api';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoggingIn = ref(false);

const pendingGoogleUser = ref(null);
const isGooglePendingPassword = ref(false);

const emit = defineEmits(['login-success']);

const handleLogin = async () => {
  if (email.value && password.value) {
    isLoggingIn.value = true;
    try {
      // API call to our Django backend for token login
      const result = await api.login(email.value, password.value);
      
      // Since it's token login, user info might not be fully returned yet.
      // But for now, we'll store user email as basic info.
      emit('login-success', { email: email.value, name: email.value });
      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login မအောင်မြင်ပါ။');
    } finally {
      isLoggingIn.value = false;
    }
  }
};

const handleGoogleSuccess = (response) => {
  const { credential } = response;
  const userData = decodeCredential(credential);
  console.log('Google Auth Success:', userData);
  pendingGoogleUser.value = userData;
  isGooglePendingPassword.value = true;
};

const handleGooglePasswordSubmit = async () => {
  if (!password.value) return;
  isLoggingIn.value = true;
  try {
    const payload = {
      email: pendingGoogleUser.value.email,
      name: pendingGoogleUser.value.name,
      password: password.value
    };

    // Send registration to Django
    const response = await api.post('/register/', payload);
    
    // Store the returned token
    if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
    } else {
        throw new Error('Registration failed. No token received.');
    }

    emit('login-success', {
      email: pendingGoogleUser.value.email,
      name: pendingGoogleUser.value.name,
      picture: pendingGoogleUser.value.picture
    });
    
    isGooglePendingPassword.value = false;
    pendingGoogleUser.value = null;
  } catch (error) {
    console.error('Error saving user:', error);
    alert('အချက်အလက်သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်။');
  } finally {
    isLoggingIn.value = false;
  }
};

const handleGoogleError = () => {
  console.error('Google Sign-In failed');
};
</script>

<template>
  <div class="login-card">
    <h2>{{ isGooglePendingPassword ? 'Set Password' : 'Login' }}</h2>
    <form @submit.prevent="isGooglePendingPassword ? handleGooglePasswordSubmit() : handleLogin()">
      
      <div v-if="isGooglePendingPassword" class="user-info-preview">
        <img 
          v-if="pendingGoogleUser.picture" 
          :src="pendingGoogleUser.picture" 
          class="avatar-preview" 
          @error="(e) => e.target.style.display = 'none'"
        />
        <div class="info">
          <p class="name-display">{{ pendingGoogleUser.name }}</p>
          <p class="email-display">{{ pendingGoogleUser.email }}</p>
        </div>
      </div>

      <template v-if="!isGooglePendingPassword">
        <div class="input-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Email ရိုက်ထည့်ပါ" 
            required 
          />
        </div>
      </template>

      <div class="input-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            placeholder="Password ရိုက်ထည့်ပါ" 
            required 
          />
          <button 
            type="button" 
            class="toggle-btn" 
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '👁️' : '🙈' }}
          </button>
        </div>
      </div>
      <button type="submit" class="login-btn" :disabled="isLoggingIn">
        {{ isLoggingIn ? 'စစ်ဆေးနေပါသည်...' : (isGooglePendingPassword ? 'အကောင့်သိမ်းမည်' : 'Login ဝင်မည်') }}
      </button>
      
      <button v-if="isGooglePendingPassword" type="button" class="cancel-btn" @click="isGooglePendingPassword = false">
        မလုပ်တော့ပါ
      </button>

      <template v-if="!isGooglePendingPassword">
        <div class="divider">သို့မဟုတ်</div>
        <div class="google-btn-container">
          <GoogleSignInButton 
            @success="handleGoogleSuccess" 
            @error="handleGoogleError" 
          />
        </div>
      </template>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.input-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.user-info-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.name-display {
  font-weight: 600;
  color: #2c3e50;
}

.email-display {
  font-size: 0.85rem;
  color: #666;
}

.input-group input {
  padding: 0.8rem;
  border: 1.5px solid #eee;
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #42b883;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 45px; /* Button အတွက် နေရာချန်ထားခြင်း */
}

.toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.login-btn {
  width: 100%;
  padding: 0.85rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.cancel-btn {
  width: 100%;
  padding: 0.85rem;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.8rem;
  font-weight: 500;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #888;
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #eee;
}

.divider:not(:empty)::before { margin-right: .5em; }
.divider:not(:empty)::after { margin-left: .5em; }

.google-btn-container {
  display: flex;
  justify-content: center;
}

.login-btn:hover {
  background-color: #3aa876;
}
</style>
