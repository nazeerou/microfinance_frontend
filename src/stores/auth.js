// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // Simple state - only in memory
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Configure axios
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  })

  // SIMPLE LOGIN - only sets state on success
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      // Login successful - just set authenticated to true
      isAuthenticated.value = true

      // Store user data if returned (optional)
      if (response.data.user) {
        user.value = response.data.user
      } else if (response.data.data?.user) {
        user.value = response.data.data.user
      }

      console.log('✅ Login successful', { isAuthenticated: isAuthenticated.value })
      return { success: true }
    } catch (err) {
      console.error('❌ Login failed:', err)

      // Handle error
      if (err.response?.status === 401) {
        error.value = 'Invalid username or password'
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else {
        error.value = 'Login failed. Please try again.'
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // SIMPLE LOGOUT - just clear state
  const logout = () => {
    console.log('Logging out')
    isAuthenticated.value = false
    user.value = null
    error.value = null
  }

  // NO AUTO FETCHING - just return current state
  const checkAuth = () => {
    return isAuthenticated.value
  }

  // NO AUTO FETCHING - just return false (not authenticated on page load)
  const initAuth = () => {
    console.log('initAuth called - not authenticated on page load')
    isAuthenticated.value = false
    user.value = null
    return false
  }

  // STUB FUNCTIONS - to prevent "not a function" errors
  const trackActivity = () => {
    // Do nothing
  }

  const refreshToken = async () => {
    return null
  }

  const fetchUser = async () => {
    return user.value
  }

  // Computed
  const userName = computed(() => user.value?.name || user.value?.email || 'Guest')
  const userRole = computed(() => user.value?.role || null)

  return {
    // State
    isAuthenticated,
    user,
    loading,
    error,

    // Computed
    userName,
    userRole,

    // Core methods
    login,
    logout,
    checkAuth,
    initAuth,

    // Stub methods (to prevent errors)
    trackActivity,
    refreshToken,
    fetchUser,

    // API instance (if needed)
    api,
  }
})
