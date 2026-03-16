<!-- App.vue -->
<template>
  <div
    id="app"
    @mousemove="trackActivity"
    @keydown="trackActivity"
    @click="trackActivity"
    @scroll="trackActivity"
  >
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// This function now exists in your store
const trackActivity = () => {
  authStore.trackActivity()
}

onMounted(() => {
  // Restore auth state from localStorage
  authStore.initAuth()
  console.log('App mounted, auth restored:', authStore.isAuthenticated)
})
</script>
