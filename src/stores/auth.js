import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api';

export const useAuthStore = defineStore('auth', () => {
  // State: User information
  // Initialize state from localStorage to persist after refresh
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  // Getters: Login ဝင်ထားသလားဆိုတာကို စစ်ဆေးရန်
  const isAuthenticated = computed(() => !!user.value);

  // Actions: Login ဝင်တဲ့အခါ user data သိမ်းရန်
  function setUser(userData) {
    user.value = userData;
    // Save to localStorage as a string
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Actions: Logout လုပ်ရန်
  function logout() {
    user.value = null;
    // Clean up localStorage
    localStorage.removeItem('user');
    api.logout();
  }

  return { user, isAuthenticated, setUser, logout };
});
