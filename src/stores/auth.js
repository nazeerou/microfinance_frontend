// src/stores/auth.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const baseURL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/*
|--------------------------------------------------------------------------
| Auth Store
|--------------------------------------------------------------------------
*/

export const useAuthStore = defineStore('auth', () => {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const user = ref(JSON.parse(localStorage.getItem('auth_user')) || null)
  const permissions = ref(JSON.parse(localStorage.getItem('auth_permissions')) || [])
  const loading = ref(false)
  const error = ref(null)

  /*
  |--------------------------------------------------------------------------
  | GETTERS
  |--------------------------------------------------------------------------
  */

  const isAuthenticated = computed(() => !!user.value)

  const userName = computed(() => user.value?.name || user.value?.email || 'Guest')

  const userRole = computed(() => user.value?.role || user.value?.roles?.[0]?.name || null)

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  /**
   * Login user
   */
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // Laravel Sanctum CSRF
      await api.get('/sanctum/csrf-cookie').catch(() => {})

      const response = await api.post('/login', credentials)

      const userData = response.data?.data?.user || response.data?.user || null

      const perms = response.data?.data?.permissions || []

      if (!userData) {
        throw new Error('Authentication failed')
      }

      // Save state
      user.value = userData
      permissions.value = perms

      // Persist session
      localStorage.setItem('auth_user', JSON.stringify(userData))
      localStorage.setItem('auth_permissions', JSON.stringify(perms))

      return { success: true }
    } catch (err) {
      error.value = parseError(err)

      return {
        success: false,
        message: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (e) {
      // ignore API errors
    }

    clearSession()
  }

  /**
   * Restore auth session
   */
  const initAuth = async () => {
    if (user.value) {
      return true
    }

    try {
      const response = await api.get('/user')

      const userData = response.data?.data?.user || response.data?.user || null

      if (userData) {
        user.value = userData

        localStorage.setItem('auth_user', JSON.stringify(userData))

        return true
      }
    } catch (e) {
      clearSession()
    }

    return false
  }

  /**
   * Check auth quickly
   */
  const checkAuth = () => !!user.value

  /**
   * Clear session data
   */
  const clearSession = () => {
    user.value = null
    permissions.value = []

    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
  }

  /**
   * Activity tracker placeholder
   */
  const trackActivity = () => true

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const parseError = (err) => {
    if (!err.response) {
      return 'Unable to reach server'
    }

    const { status, data } = err.response

    if (status === 401) {
      return 'Invalid email or password'
    }

    if (status === 403) {
      return 'Account access denied'
    }

    if (status === 422) {
      return Object.values(data.errors || {})
        .flat()
        .join(', ')
    }

    return data.message || 'Authentication error'
  }

  /*
  |--------------------------------------------------------------------------
  | EXPORTS
  |--------------------------------------------------------------------------
  */

  return {
    // state
    user,
    permissions,
    loading,
    error,

    // getters
    isAuthenticated,
    userName,
    userRole,

    // actions
    login,
    logout,
    initAuth,
    checkAuth,
    trackActivity,

    // axios instance
    api,
  }
})
