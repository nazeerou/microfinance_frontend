// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
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

  // Login method with better error handling
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    console.log('Attempting login with:', {
      username: credentials.username,
      password: credentials.password ? '[PROVIDED]' : '[MISSING]',
    })

    try {
      const response = await api.post('/login', credentials)

      console.log('Login response:', {
        status: response.status,
        data: response.data,
      })

      if (response.status === 200) {
        isAuthenticated.value = true
        user.value = response.data.user || null
        return { success: true }
      }
    } catch (err) {
      console.error('Full error object:', err)

      // Detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data)
        console.error('Error response status:', err.response.status)
        console.error('Error response headers:', err.response.headers)

        error.value =
          err.response.data?.message ||
          err.response.data?.error ||
          `Login failed (${err.response.status})`

        // Check for specific status codes
        if (err.response.status === 401) {
          error.value = 'Invalid username or password'
        } else if (err.response.status === 422) {
          error.value = 'Validation error: ' + JSON.stringify(err.response.data.errors)
        } else if (err.response.status === 403) {
          error.value = 'Account locked or disabled'
        } else if (err.response.status === 500) {
          error.value = 'Server error. Please try again later.'
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request)
        error.value = 'No response from server. Check your network connection.'
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message)
        error.value = 'Request failed: ' + err.message
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
  }

  // Stub methods for compatibility
  const initAuth = async () => isAuthenticated.value
  const checkAuth = () => isAuthenticated.value
  const fetchUser = async () => user.value
  const refreshToken = async () => null

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    initAuth,
    checkAuth,
    fetchUser,
    refreshToken,
    api,
  }
})
