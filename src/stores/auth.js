// // stores/auth.js
// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import axios from 'axios'

// export const useAuthStore = defineStore('auth', () => {
//   // Initialize from localStorage immediately
//   const token = ref(localStorage.getItem('token') || null)
//   const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
//   const permissions = ref([])
//   const loading = ref(false)

//   // Inactivity timer
//   let inactivityTimer = null
//   const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes in milliseconds
//   const lastActivity = ref(Date.now())

//   // Configure axios
//   const api = axios.create({
//     // baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
//     baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       'X-Requested-With': 'XMLHttpRequest',
//     },
//     withCredentials: true,
//     timeout: 30000,
//   })

//   ////online

//   // Set authorization header if token exists
//   if (token.value) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
//   }

//   // Request interceptor
//   api.interceptors.request.use(
//     (config) => {
//       // For non-login requests, ensure token is present
//       if (config.url !== '/login') {
//         const currentToken = token.value || localStorage.getItem('token')
//         if (currentToken) {
//           config.headers.Authorization = `Bearer ${currentToken}`
//         }
//       }
//       return config
//     },
//     (error) => Promise.reject(error),
//   )

//   // Response interceptor with token refresh
//   api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config

//       // Don't retry login requests
//       if (originalRequest?.url === '/login') {
//         return Promise.reject(error)
//       }

//       // If error is 401 and we haven't tried to refresh yet
//       if (error.response?.status === 401 && !originalRequest?._retry) {
//         originalRequest._retry = true

//         try {
//           // Attempt to refresh token
//           const newToken = await refreshToken()
//           originalRequest.headers['Authorization'] = `Bearer ${newToken}`
//           return api(originalRequest)
//         } catch (refreshError) {
//           // Refresh failed - logout
//           await handleLogout('token_refresh_failed')
//           return Promise.reject(refreshError)
//         }
//       }

//       return Promise.reject(error)
//     },
//   )

//   // Reset inactivity timer
//   const resetInactivityTimer = () => {
//     lastActivity.value = Date.now()

//     if (inactivityTimer) {
//       clearTimeout(inactivityTimer)
//     }

//     if (isAuthenticated.value) {
//       inactivityTimer = setTimeout(() => {
//         // Check if still inactive
//         const inactiveTime = Date.now() - lastActivity.value
//         if (inactiveTime >= INACTIVITY_LIMIT) {
//           handleLogout('inactivity')
//         }
//       }, INACTIVITY_LIMIT)
//     }
//   }

//   // Track user activity
//   const trackActivity = () => {
//     if (isAuthenticated.value) {
//       resetInactivityTimer()
//     }
//   }

//   // Setup activity listeners
//   const setupActivityTracking = () => {
//     if (typeof window !== 'undefined') {
//       const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
//       events.forEach((event) => {
//         window.addEventListener(event, trackActivity)
//       })
//       resetInactivityTimer()
//     }
//   }

//   // Clear activity tracking
//   const clearActivityTracking = () => {
//     if (inactivityTimer) {
//       clearTimeout(inactivityTimer)
//     }
//     if (typeof window !== 'undefined') {
//       const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
//       events.forEach((event) => {
//         window.removeEventListener(event, trackActivity)
//       })
//     }
//   }

//   // Handle logout with redirect
//   const handleLogout = async (reason = '') => {
//     console.log(`Logging out: ${reason}`)
//     await logout()
//     if (typeof window !== 'undefined') {
//       const currentPath = window.location.pathname
//       if (currentPath !== '/login') {
//         window.location.href = `/login?reason=${reason}`
//       }
//     }
//   }

//   // Login method
//   const login = async (credentials) => {
//     loading.value = true
//     try {
//       const response = await api.post('/login', credentials)
//       const responseData = response.data

//       let userData = null
//       let tokenData = null

//       if (responseData.data?.token) {
//         tokenData = responseData.data.token
//         userData = responseData.data.user
//         permissions.value = responseData.data.user.permissions?.flat || []
//       } else if (responseData.token) {
//         tokenData = responseData.token
//         userData = responseData.user
//       } else {
//         throw new Error('Invalid response format')
//       }

//       // Store token and user
//       token.value = tokenData
//       user.value = userData

//       // Store in localStorage
//       localStorage.setItem('token', tokenData)
//       localStorage.setItem('user', JSON.stringify(userData))
//       localStorage.setItem('login_time', Date.now().toString())

//       // Set default header
//       api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

//       // Setup activity tracking
//       setupActivityTracking()

//       return responseData
//     } catch (error) {
//       console.error('Login error:', error)
//       throw error
//     } finally {
//       loading.value = false
//     }
//   }

//   // Refresh token
//   const refreshToken = async () => {
//     const currentToken = token.value || localStorage.getItem('token')
//     if (!currentToken) {
//       throw new Error('No token to refresh')
//     }

//     try {
//       const response = await api.get('/refresh')
//       const { data } = response.data

//       token.value = data.token
//       localStorage.setItem('token', data.token)
//       api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

//       // Update login time on refresh
//       localStorage.setItem('login_time', Date.now().toString())

//       // Reset activity on token refresh
//       resetInactivityTimer()

//       return data.token
//     } catch (error) {
//       console.error('Refresh token error:', error)
//       throw error
//     }
//   }

//   // Logout method
//   const logout = async () => {
//     try {
//       const currentToken = token.value || localStorage.getItem('token')
//       if (currentToken) {
//         await api.post('/logout').catch(() => {})
//       }
//     } catch (error) {
//       console.error('Logout error:', error)
//     } finally {
//       clearAuth()
//       clearActivityTracking()
//     }
//   }

//   // Clear auth data
//   const clearAuth = () => {
//     token.value = null
//     user.value = null
//     permissions.value = []
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//     localStorage.removeItem('login_time')
//     delete api.defaults.headers.common['Authorization']
//   }

//   // Fetch current user
//   const fetchUser = async () => {
//     const currentToken = token.value || localStorage.getItem('token')
//     if (!currentToken) {
//       throw new Error('No token')
//     }

//     try {
//       const response = await api.get('/user')
//       const userData = response.data.data?.user || response.data.user

//       user.value = userData
//       permissions.value = userData.permissions?.flat || []

//       localStorage.setItem('user', JSON.stringify(userData))

//       return userData
//     } catch (error) {
//       if (error.response?.status === 401) {
//         await handleLogout('token_invalid')
//       }
//       throw error
//     }
//   }

//   // Check authentication with token validation
//   const checkAuth = async () => {
//     // Check if we have token in localStorage but not in memory
//     const storedToken = localStorage.getItem('token')
//     const storedUser = localStorage.getItem('user')

//     // Restore from localStorage if needed
//     if (!token.value && storedToken) {
//       token.value = storedToken
//       api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
//     }

//     if (!user.value && storedUser) {
//       try {
//         user.value = JSON.parse(storedUser)
//       } catch (e) {
//         console.error('Failed to parse stored user:', e)
//       }
//     }

//     // If no token at all, not authenticated
//     if (!token.value && !storedToken) {
//       return false
//     }

//     // Check if token is expired based on login time
//     const loginTime = localStorage.getItem('login_time')
//     if (loginTime) {
//       const elapsed = Date.now() - parseInt(loginTime)
//       const TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000 // 7 days

//       if (elapsed > TOKEN_LIFETIME) {
//         console.log('Token expired based on login time')
//         await handleLogout('token_expired')
//         return false
//       }
//     }

//     // If we have user data from localStorage, consider authenticated
//     if (user.value) {
//       setupActivityTracking()
//       return true
//     }

//     // Try to fetch user to validate token
//     try {
//       await fetchUser()
//       setupActivityTracking()
//       return true
//     } catch (error) {
//       console.log('Token validation failed:', error.message)
//       return false
//     }
//   }

//   // Initialize auth state - call this on app start
//   const initAuth = async () => {
//     // Restore from localStorage immediately
//     const storedToken = localStorage.getItem('token')
//     const storedUser = localStorage.getItem('user')

//     if (storedToken) {
//       token.value = storedToken
//       api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
//     }

//     if (storedUser) {
//       try {
//         user.value = JSON.parse(storedUser)
//       } catch (e) {
//         console.error('Failed to parse stored user:', e)
//       }
//     }

//     // Validate the token
//     return await checkAuth()
//   }

//   // Computed
//   const isAuthenticated = computed(() => {
//     // Check both memory and localStorage
//     const hasToken = !!(token.value || localStorage.getItem('token'))
//     const hasUser = !!(user.value || localStorage.getItem('user'))
//     return hasToken && hasUser
//   })

//   const userRole = computed(() => user.value?.role || null)
//   const userName = computed(() => user.value?.name || 'Guest')

//   return {
//     user,
//     token,
//     permissions,
//     loading,
//     isAuthenticated,
//     userRole,
//     userName,
//     login,
//     logout,
//     refreshToken,
//     fetchUser,
//     checkAuth,
//     initAuth,
//     trackActivity,
//     api,
//     handleLogout,
//   }
// })

// stores/auth.js
// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import axios from 'axios'

// export const useAuthStore = defineStore('auth', () => {
//   // Initialize from localStorage immediately
//   const token = ref(localStorage.getItem('token') || null)
//   const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
//   const permissions = ref([])
//   const loading = ref(false)

//   // Inactivity timer
//   let inactivityTimer = null
//   const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes in milliseconds
//   const lastActivity = ref(Date.now())

//   // Configure axios
//   const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       'X-Requested-With': 'XMLHttpRequest',
//     },
//     withCredentials: true,
//     timeout: 30000,
//   })

//   // Set authorization header if token exists
//   if (token.value) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
//   }

//   // Request interceptor
//   api.interceptors.request.use(
//     (config) => {
//       // For non-login requests, ensure token is present
//       if (config.url !== '/login') {
//         const currentToken = token.value || localStorage.getItem('token')
//         if (currentToken) {
//           config.headers.Authorization = `Bearer ${currentToken}`
//         }
//       }
//       return config
//     },
//     (error) => Promise.reject(error),
//   )

//   // Response interceptor with token refresh - NO AUTO LOGOUT
//   api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config

//       // Don't retry login requests
//       if (originalRequest?.url === '/login') {
//         return Promise.reject(error)
//       }

//       // If error is 401 and we haven't tried to refresh yet
//       if (error.response?.status === 401 && !originalRequest?._retry) {
//         originalRequest._retry = true

//         try {
//           // Attempt to refresh token
//           const newToken = await refreshToken()
//           originalRequest.headers['Authorization'] = `Bearer ${newToken}`
//           return api(originalRequest)
//         } catch (refreshError) {
//           // ❌ REMOVED: Auto logout on refresh failure
//           // Just log the error and reject
//           console.error('Token refresh failed:', refreshError)
//           return Promise.reject(refreshError)
//         }
//       }

//       return Promise.reject(error)
//     },
//   )

//   // Reset inactivity timer
//   const resetInactivityTimer = () => {
//     lastActivity.value = Date.now()

//     if (inactivityTimer) {
//       clearTimeout(inactivityTimer)
//     }

//     if (isAuthenticated.value) {
//       inactivityTimer = setTimeout(() => {
//         // Check if still inactive
//         const inactiveTime = Date.now() - lastActivity.value
//         if (inactiveTime >= INACTIVITY_LIMIT) {
//           // ❌ REMOVED: Auto logout on inactivity
//           console.log('Inactivity timeout reached, but not logging out automatically')
//           // Just clear the timer, don't logout
//         }
//       }, INACTIVITY_LIMIT)
//     }
//   }

//   // Track user activity
//   const trackActivity = () => {
//     if (isAuthenticated.value) {
//       resetInactivityTimer()
//     }
//   }

//   // Setup activity listeners
//   const setupActivityTracking = () => {
//     if (typeof window !== 'undefined') {
//       const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
//       events.forEach((event) => {
//         window.addEventListener(event, trackActivity)
//       })
//       resetInactivityTimer()
//     }
//   }

//   // Clear activity tracking
//   const clearActivityTracking = () => {
//     if (inactivityTimer) {
//       clearTimeout(inactivityTimer)
//     }
//     if (typeof window !== 'undefined') {
//       const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
//       events.forEach((event) => {
//         window.removeEventListener(event, trackActivity)
//       })
//     }
//   }

//   // ❌ REMOVED: handleLogout function entirely

//   // Login method
//   const login = async (credentials) => {
//     loading.value = true
//     try {
//       const response = await api.post('/login', credentials)
//       const responseData = response.data

//       let userData = null
//       let tokenData = null

//       if (responseData.data?.token) {
//         tokenData = responseData.data.token
//         userData = responseData.data.user
//         permissions.value = responseData.data.user.permissions?.flat || []
//       } else if (responseData.token) {
//         tokenData = responseData.token
//         userData = responseData.user
//       } else {
//         throw new Error('Invalid response format')
//       }

//       // Store token and user
//       token.value = tokenData
//       user.value = userData

//       // Store in localStorage
//       localStorage.setItem('token', tokenData)
//       localStorage.setItem('user', JSON.stringify(userData))
//       localStorage.setItem('login_time', Date.now().toString())

//       // Set default header
//       api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

//       // Setup activity tracking
//       setupActivityTracking()

//       return responseData
//     } catch (error) {
//       console.error('Login error:', error)
//       throw error
//     } finally {
//       loading.value = false
//     }
//   }

//   // Refresh token
//   const refreshToken = async () => {
//     const currentToken = token.value || localStorage.getItem('token')
//     if (!currentToken) {
//       throw new Error('No token to refresh')
//     }

//     try {
//       const response = await api.get('/refresh')
//       const { data } = response.data

//       token.value = data.token
//       localStorage.setItem('token', data.token)
//       api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

//       // Update login time on refresh
//       localStorage.setItem('login_time', Date.now().toString())

//       // Reset activity on token refresh
//       resetInactivityTimer()

//       return data.token
//     } catch (error) {
//       console.error('Refresh token error:', error)
//       throw error
//     }
//   }

//   // Logout method - MANUAL ONLY
//   const logout = async () => {
//     try {
//       const currentToken = token.value || localStorage.getItem('token')
//       if (currentToken) {
//         await api.post('/logout').catch(() => {})
//       }
//     } catch (error) {
//       console.error('Logout error:', error)
//     } finally {
//       clearAuth()
//       clearActivityTracking()
//     }
//   }

//   // Clear auth data
//   const clearAuth = () => {
//     token.value = null
//     user.value = null
//     permissions.value = []
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//     localStorage.removeItem('login_time')
//     delete api.defaults.headers.common['Authorization']
//   }

//   // Fetch current user
//   const fetchUser = async () => {
//     const currentToken = token.value || localStorage.getItem('token')
//     if (!currentToken) {
//       throw new Error('No token')
//     }

//     try {
//       const response = await api.get('/user')
//       const userData = response.data.data?.user || response.data.user

//       user.value = userData
//       permissions.value = userData.permissions?.flat || []

//       localStorage.setItem('user', JSON.stringify(userData))

//       return userData
//     } catch (error) {
//       // ❌ REMOVED: Auto logout on 401
//       if (error.response?.status === 401) {
//         console.warn('User fetch returned 401, but not logging out automatically')
//       }
//       throw error
//     }
//   }

//   // Check authentication with token validation
//   const checkAuth = async () => {
//     // Check if we have token in localStorage but not in memory
//     const storedToken = localStorage.getItem('token')
//     const storedUser = localStorage.getItem('user')

//     // Restore from localStorage if needed
//     if (!token.value && storedToken) {
//       token.value = storedToken
//       api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
//     }

//     if (!user.value && storedUser) {
//       try {
//         user.value = JSON.parse(storedUser)
//       } catch (e) {
//         console.error('Failed to parse stored user:', e)
//       }
//     }

//     // If no token at all, not authenticated
//     if (!token.value && !storedToken) {
//       return false
//     }

//     // Check if token is expired based on login time
//     const loginTime = localStorage.getItem('login_time')
//     if (loginTime) {
//       const elapsed = Date.now() - parseInt(loginTime)
//       const TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000 // 7 days

//       if (elapsed > TOKEN_LIFETIME) {
//         console.log('Token expired based on login time')
//         // ❌ REMOVED: Auto logout on expiration
//         // Just return false, don't logout automatically
//         return false
//       }
//     }

//     // If we have user data from localStorage, consider authenticated
//     if (user.value) {
//       setupActivityTracking()
//       return true
//     }

//     // Try to fetch user to validate token
//     try {
//       await fetchUser()
//       setupActivityTracking()
//       return true
//     } catch (error) {
//       console.log('Token validation failed:', error.message)
//       return false
//     }
//   }

//   // Initialize auth state - call this on app start
//   const initAuth = async () => {
//     // Restore from localStorage immediately
//     const storedToken = localStorage.getItem('token')
//     const storedUser = localStorage.getItem('user')

//     if (storedToken) {
//       token.value = storedToken
//       api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
//     }

//     if (storedUser) {
//       try {
//         user.value = JSON.parse(storedUser)
//       } catch (e) {
//         console.error('Failed to parse stored user:', e)
//       }
//     }

//     // Validate the token
//     return await checkAuth()
//   }

//   // Computed
//   const isAuthenticated = computed(() => {
//     // Check both memory and localStorage
//     const hasToken = !!(token.value || localStorage.getItem('token'))
//     const hasUser = !!(user.value || localStorage.getItem('user'))
//     return hasToken && hasUser
//   })

//   const userRole = computed(() => user.value?.role || null)
//   const userName = computed(() => user.value?.name || 'Guest')

//   return {
//     user,
//     token,
//     permissions,
//     loading,
//     isAuthenticated,
//     userRole,
//     userName,
//     login,
//     logout, // Manual logout only
//     refreshToken,
//     fetchUser,
//     checkAuth,
//     initAuth,
//     trackActivity,
//     api,
//     // ❌ REMOVED: handleLogout from return
//   }
// })

// stores/auth.js
// stores/auth.js
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage immediately
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const permissions = ref([])
  const loading = ref(false)

  // Configure axios
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    timeout: 30000,
  })

  // Set authorization header if token exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Request interceptor - simple, no refresh logic
  api.interceptors.request.use(
    (config) => {
      // For non-login requests, ensure token is present
      if (config.url !== '/login') {
        const currentToken = token.value || localStorage.getItem('token')
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`
        }
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor - SIMPLIFIED - no refresh, no auto logout
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Just log the error and pass it through
      console.error('API Error:', error.response?.status, error.config?.url)
      return Promise.reject(error)
    },
  )

  // ✅ ADD THIS: Track activity function (simple version)
  const trackActivity = () => {
    // This can be empty or just log if needed
    console.log('Activity tracked')
    // You can add your activity tracking logic here if needed
  }

  // Login method
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await api.post('/login', credentials)
      const responseData = response.data

      let userData = null
      let tokenData = null

      if (responseData.data?.token) {
        tokenData = responseData.data.token
        userData = responseData.data.user
        permissions.value = responseData.data.user.permissions?.flat || []
      } else if (responseData.token) {
        tokenData = responseData.token
        userData = responseData.user
      } else {
        throw new Error('Invalid response format')
      }

      // Store token and user
      token.value = tokenData
      user.value = userData

      // Store in localStorage
      localStorage.setItem('token', tokenData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set default header
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

      return responseData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Logout method
  const logout = async () => {
    try {
      const currentToken = token.value || localStorage.getItem('token')
      if (currentToken) {
        // Try to call logout endpoint, but don't wait for it
        api.post('/logout').catch(() => {})
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local data
      clearAuth()
    }
  }

  // Clear auth data
  const clearAuth = () => {
    token.value = null
    user.value = null
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  // Check authentication with token validation
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    // Restore from localStorage if needed
    if (!token.value && storedToken) {
      token.value = storedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    if (!user.value && storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }

    // If no token at all, not authenticated
    if (!token.value && !storedToken) {
      return false
    }

    // If we have user data from localStorage, consider authenticated
    if (user.value) {
      return true
    }

    return false
  }

  // Simple init - just restore from localStorage, no validation
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      token.value = storedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }

    return isAuthenticated.value
  }

  // Computed
  const isAuthenticated = computed(() => {
    const hasToken = !!(token.value || localStorage.getItem('token'))
    const hasUser = !!(user.value || localStorage.getItem('user'))
    return hasToken && hasUser
  })

  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || 'Guest')

  return {
    user,
    token,
    permissions,
    loading,
    isAuthenticated,
    userRole,
    userName,
    login,
    logout,
    initAuth,
    checkAuth,
    trackActivity, // ✅ ADD THIS - now trackActivity is returned
    api,
  }
})
