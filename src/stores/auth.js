// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

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

  // Simple login - no localStorage
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      // Check if login successful (status 200)
      if (response.status === 200) {
        isAuthenticated.value = true

        // Store user data if needed (optional)
        if (response.data.user) {
          user.value = response.data.user
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
    // No localStorage to clear
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  }
})
