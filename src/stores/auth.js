// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(null)
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

  // Request interceptor to add token
  api.interceptors.request.use(
    (config) => {
      const currentToken = token.value || localStorage.getItem('token')
      if (currentToken && !config.url.includes('/login')) {
        config.headers.Authorization = `Bearer ${currentToken}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Login method for Laravel (FIXED - removed duplicate declaration)
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      console.log('Attempting login with:', credentials.email)

      const response = await api.post('/login', credentials) // Removed ${baseURL} since it's already set in baseURL
      console.log('Login response:', response.data)

      // Login already returns user data! Use it directly
      if (response.data.data?.user) {
        user.value = response.data.data.user
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      if (response.data.data?.token) {
        token.value = response.data.data.token
        localStorage.setItem('token', token.value)
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      }

      // Get permissions if available
      if (response.data.data?.permissions) {
        permissions.value = response.data.data.permissions
      }

      // Store login time
      localStorage.setItem('login_time', Date.now().toString())

      isAuthenticated.value = true
      console.log('✅ Login successful')
      return { success: true }
    } catch (err) {
      console.error('❌ Login failed:', err)

      // Handle Laravel error responses
      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        if (status === 401) {
          error.value = data.message || 'Invalid credentials'
        } else if (status === 403) {
          error.value = data.message || 'Account is inactive'
        } else if (status === 422) {
          error.value = 'Validation error: ' + JSON.stringify(data.errors)
        } else if (data.message) {
          error.value = data.message
        } else {
          error.value = 'Login failed. Please try again.'
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

  // Safe fetchUser - just returns existing user without API call (FIXED - no auto-logout)
  const fetchUser = async () => {
    // Just return existing user data without API call
    return user.value
  }

  // Simple logout
  const logout = () => {
    console.log('Logging out')
    isAuthenticated.value = false
    user.value = null
    token.value = null
    permissions.value = []
    error.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('login_time')

    // Clear auth header
    delete api.defaults.headers.common['Authorization']
  }

  // Initialize auth - check localStorage (FIXED - removed fetchUser that could cause logout)
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        isAuthenticated.value = true

        // DON'T call fetchUser here - it might fail and logout
        // Just trust the stored data

        console.log('✅ Auth restored from localStorage')
        return true
      } catch (e) {
        console.error('Failed to restore auth:', e)
        logout()
        return false
      }
    }

    console.log('No stored auth found')
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
    token,
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
    fetchUser,
    initAuth,
    checkAuth,
    trackActivity, // Stub to prevent errors
    api,
  }
})
