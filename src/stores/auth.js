// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Base URL
  const baseURL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'
  // const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

  // Configure axios
  const api = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })

  // Login
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      // Login successful
      isAuthenticated.value = true

      // Store user data if returned
      if (response.data.data?.user) {
        user.value = response.data.data.user
      } else if (response.data.user) {
        user.value = response.data.user
      }

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      console.log(err.response)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    error.value = null
  }

  // Check auth
  const checkAuth = () => {
    return isAuthenticated.value
  }

  // Computed
  const userName = computed(() => user.value?.name || 'User')

  return {
    isAuthenticated,
    user,
    loading,
    error,
    userName,
    login,
    logout,
    checkAuth,
  }
})
