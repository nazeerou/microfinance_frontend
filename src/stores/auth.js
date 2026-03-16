// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Configure axios for Laravel API
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  })

  // Simple login - just validate credentials
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // Send login request
      const response = await api.post('/login', credentials)

      // If we get here, login was successful (2xx response)
      isAuthenticated.value = true

      // Store user data if returned
      if (response.data.user) {
        user.value = response.data.user
      } else if (response.data.data?.user) {
        user.value = response.data.data.user
      }

      return { success: true }
    } catch (err) {
      console.error('Login failed:', err)

      // Handle different error responses
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          error.value = 'Invalid username or password'
        } else if (err.response.status === 422) {
          error.value = 'Validation error: Please check your input'
        } else if (err.response.status === 403) {
          error.value = 'Account is locked or disabled'
        } else if (err.response.data?.message) {
          error.value = err.response.data.message
        } else {
          error.value = 'Login failed. Please try again.'
        }
      } else if (err.request) {
        // Request made but no response
        error.value = 'No response from server. Check your connection.'
      } else {
        // Something else went wrong
        error.value = 'An error occurred. Please try again.'
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Simple logout
  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    error.value = null
  }

  // Initialize auth - simple check
  const initAuth = () => {
    // In simple mode, we're not authenticated on page load
    // User must log in again
    isAuthenticated.value = false
    user.value = null
    return false
  }

  // Check auth - simple boolean
  const checkAuth = () => {
    return isAuthenticated.value
  }

  // Computed
  const userRole = computed(() => user.value?.role || user.value?.roles?.[0] || null)
  const userName = computed(() => user.value?.name || user.value?.email || 'Guest')

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Computed
    userRole,
    userName,

    // Methods
    login,
    logout,
    initAuth,
    checkAuth,
    api,
  }
})
