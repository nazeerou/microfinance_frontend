// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const token = ref(null) // Added for compatibility

  // Configure axios
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  })

  // Simple login - no localStorage
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      // Check if login successful
      if (response.status === 200) {
        isAuthenticated.value = true

        // Store user data if returned
        if (response.data.user) {
          user.value = response.data.user
        }

        // Store token if returned (optional)
        if (response.data.token) {
          token.value = response.data.token
        }

        return { success: true }
      }
    } catch (err) {
      console.error('Login failed:', err)
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Simple logout
  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
  }

  // Add initAuth for compatibility (does nothing in simple mode)
  const initAuth = async () => {
    console.log('initAuth called - no persistence in simple mode')
    return false // Not authenticated on page load
  }

  // Add checkAuth for compatibility
  const checkAuth = () => {
    console.log('checkAuth called')
    return isAuthenticated.value
  }

  // Add fetchUser for compatibility
  const fetchUser = async () => {
    if (isAuthenticated.value && user.value) {
      return user.value
    }
    return null
  }

  // Add refreshToken for compatibility (does nothing)
  const refreshToken = async () => {
    console.log('refreshToken called - not implemented in simple mode')
    return null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    initAuth, // Added for compatibility
    checkAuth, // Added for compatibility
    fetchUser, // Added for compatibility
    refreshToken, // Added for compatibility
    api, // Added for compatibility
  }
})
