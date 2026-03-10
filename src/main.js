// // main.js
// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'
// import router from './router'

// // Import Font Awesome

// // Import your custom CSS
// // import './assets/css/main.css'

// const app = createApp(App)
// const pinia = createPinia()

// app.use(pinia)
// app.use(router)

// app.mount('#app')

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
syncService.init(authStore)

app.mount('#app')
