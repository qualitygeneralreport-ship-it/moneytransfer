import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import GoogleSignInPlugin from 'vue3-google-signin'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(GoogleSignInPlugin, {
  clientId: '192409255429-3058d3n0nm0d8ltfkoucfigg44etek0m.apps.googleusercontent.com', // သင်ရလာတဲ့ ID ကိုဒီမှာထည့်ပါ
})

app.mount('#app')
