// main.js or App.vue
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import syncService from './services/syncService'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize sync service with auth store
const authStore = useAuthStore()
authStore.initAuth() // IMPORTANT

syncService.init(authStore)

app.mount('#app')
