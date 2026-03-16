// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const permissions = ref([])

  // Base URL
  const baseURL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

  // Configure axios for Laravel API
  const api = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    timeout: 30000,
  })

  // Login method - only allows authenticated users
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      console.log('Attempting login with:', credentials.email)

      const response = await api.post('/login', credentials)
      console.log('Login response:', response.data)

      // Check if user is authenticated (has user data)
      let userData = null
      if (response.data.data?.user) {
        userData = response.data.data.user
      } else if (response.data.user) {
        userData = response.data.user
      }

      if (!userData) {
        throw new Error('No user data returned - authentication failed')
      }

      // Store user data
      user.value = userData

      // Get permissions if available
      if (response.data.data?.permissions) {
        permissions.value = response.data.data.permissions
      }

      isAuthenticated.value = true
      console.log('✅ Login successful - authenticated user')
      return { success: true }
    } catch (err) {
      console.error('❌ Login failed:', err)

      // Handle Laravel error responses
      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        if (status === 401) {
          error.value = 'Invalid credentials - access denied'
        } else if (status === 403) {
          error.value = 'Account is inactive - contact administrator'
        } else if (status === 422) {
          error.value = 'Validation error: ' + JSON.stringify(data.errors)
        } else if (data.message) {
          error.value = data.message
        } else {
          error.value = 'Login failed. Access denied.'
        }
      } else if (err.request) {
        error.value = 'No response from server. Check your connection.'
      } else {
        error.value = err.message || 'An error occurred'
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Simple logout
  const logout = () => {
    console.log('Logging out')
    isAuthenticated.value = false
    user.value = null
    permissions.value = []
    error.value = null

    // Call logout endpoint to destroy session
    try {
      api.post('/logout').catch(() => {})
    } catch (e) {
      // Ignore errors
    }
  }

  // Initialize auth - check if session exists
  const initAuth = async () => {
    try {
      const response = await api.get('/user').catch(() => null)

      if (response && response.data) {
        // Extract user data
        let userData = null
        if (response.data.data?.user) {
          userData = response.data.data.user
        } else if (response.data.user) {
          userData = response.data.user
        }

        if (userData) {
          user.value = userData
          isAuthenticated.value = true
          console.log('✅ Authenticated session restored')
          return true
        }
      }
    } catch (e) {
      console.log('No authenticated session')
    }

    isAuthenticated.value = false
    user.value = null
    return false
  }

  // Check auth - simple boolean
  const checkAuth = () => {
    return isAuthenticated.value
  }

  // Dummy trackActivity to prevent errors
  const trackActivity = () => {
    // Do nothing - just a stub
  }

  // Computed
  const userRole = computed(() => user.value?.role || user.value?.roles?.[0]?.name || null)
  const userName = computed(() => user.value?.name || user.value?.email || 'Guest')

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    permissions,

    // Computed
    userRole,
    userName,

    // Methods
    login,
    logout,
    initAuth,
    checkAuth,
    trackActivity,
    api,
  }
})
