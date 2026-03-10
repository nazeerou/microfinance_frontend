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
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const trackActivity = () => {
  authStore.trackActivity()
}

onMounted(async () => {
  // Initialize auth state on app start - this will restore from localStorage
  await authStore.initAuth()
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
