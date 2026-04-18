import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import GoogleSignInPlugin from 'vue3-google-signin'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(GoogleSignInPlugin, {
  clientId: '258872748942-e9b0bei00dj9psg8bfln1deubusdaaig.apps.googleusercontent.com', // သင်ရလာတဲ့ ID ကိုဒီမှာထည့်ပါ
})

app.mount('#app')
