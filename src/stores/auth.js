// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const token = ref(null)
  const permissions = ref([]) // Added for compatibility

  // Configure axios
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  })

  // Login method
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      if (response.status === 200) {
        isAuthenticated.value = true

        // Store user data if returned
        if (response.data.user) {
          user.value = response.data.user
        }

        // Store token if returned
        if (response.data.token) {
          token.value = response.data.token
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        }

        return { success: true }
      }
    } catch (err) {
      console.error('Login failed:', err)
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Logout method
  const logout = async () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    permissions.value = []
    delete api.defaults.headers.common['Authorization']
  }

  // ============= STUB METHODS FOR COMPATIBILITY =============

  // initAuth - called on app start
  const initAuth = async () => {
    console.log('initAuth called - no persistence in simple mode')
    return isAuthenticated.value
  }

  // checkAuth - checks if user is authenticated
  const checkAuth = async () => {
    console.log('checkAuth called')
    return isAuthenticated.value
  }

  // trackActivity - tracks user activity for session timeout
  const trackActivity = () => {
    console.log('trackActivity called - no-op in simple mode')
    // Do nothing in simple mode
  }

  // fetchUser - fetches current user data
  const fetchUser = async () => {
    console.log('fetchUser called')
    if (isAuthenticated.value && user.value) {
      return user.value
    }
    return null
  }

  // refreshToken - refreshes the auth token
  const refreshToken = async () => {
    console.log('refreshToken called - not implemented in simple mode')
    return token.value
  }

  // resetInactivityTimer - resets the inactivity timer
  const resetInactivityTimer = () => {
    console.log('resetInactivityTimer called - no-op in simple mode')
  }

  // clearAuth - clears auth data
  const clearAuth = () => {
    console.log('clearAuth called')
    logout()
  }

  // handleLogout - handles logout with redirect
  const handleLogout = async (reason = '') => {
    console.log(`handleLogout called: ${reason}`)
    await logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // setupActivityTracking - sets up activity tracking
  const setupActivityTracking = () => {
    console.log('setupActivityTracking called - no-op in simple mode')
  }

  // clearActivityTracking - clears activity tracking
  const clearActivityTracking = () => {
    console.log('clearActivityTracking called - no-op in simple mode')
  }

  // ============= COMPUTED PROPERTIES =============

  // Computed property for authentication status
  const isAuthenticatedComputed = computed(() => isAuthenticated.value)

  const userRole = computed(() => user.value?.role || null)

  const userName = computed(() => user.value?.name || 'Guest')

  // Return ALL methods and properties your app expects
  return {
    // State
    user,
    token,
    permissions,
    loading,
    error,

    // Computed
    isAuthenticated: isAuthenticatedComputed,
    userRole,
    userName,

    // Core methods
    login,
    logout,

    // Stub methods for compatibility
    initAuth,
    checkAuth,
    trackActivity,
    fetchUser,
    refreshToken,
    resetInactivityTimer,
    clearAuth,
    handleLogout,
    setupActivityTracking,
    clearActivityTracking,

    // API instance
    api,
  }
})
