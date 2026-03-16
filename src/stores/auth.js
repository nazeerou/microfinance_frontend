// // stores/auth.js
// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import axios from 'axios'

// export const useAuthStore = defineStore('auth', () => {
//   // Initialize from localStorage immediately
//   const token = ref(localStorage.getItem('token'))
//   const user = ref(JSON.parse(localStorage.getItem('user')))
//   const permissions = ref([])
//   const loading = ref(false)

//   // Inactivity timer
//   let inactivityTimer = 30 * 60 * 1000
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

//   // Response interceptor with token refresh - FIXED circular dependency
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
//           // Attempt to refresh token - use api directly not refreshToken to avoid circular dependency
//           const currentToken = token.value || localStorage.getItem('token')
//           if (!currentToken) {
//             throw new Error('No token to refresh')
//           }

//           const response = await api.get('/refresh')
//           const responseData = response.data

//           let newToken = null
//           if (responseData.data?.token) {
//             newToken = responseData.data.token
//           } else if (responseData.token) {
//             newToken = responseData.token
//           } else {
//             throw new Error('Invalid refresh response format')
//           }

//           token.value = newToken
//           localStorage.setItem('token', newToken)
//           localStorage.setItem('login_time', Date.now().toString())
//           api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

//           originalRequest.headers['Authorization'] = `Bearer ${newToken}`
//           return api(originalRequest)
//         } catch (refreshError) {
//           console.error('Token refresh failed:', refreshError)
//           // Don't auto logout, just reject
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
//           console.log('Inactivity timeout reached')
//           // Don't auto logout, just log
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

//   // Handle logout with redirect - FIXED circular dependency
//   const handleLogout = async (reason = '') => {
//     console.log(`Logging out: ${reason}`)

//     // Clear local data first
//     clearAuth()
//     clearActivityTracking()

//     // Try to call logout endpoint but don't wait for it
//     try {
//       const currentToken = token.value || localStorage.getItem('token')
//       if (currentToken) {
//         api.post('/logout').catch(() => {})
//       }
//     } catch (error) {
//       console.error('Logout error:', error)
//     }

//     // Redirect to login
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

//   // Refresh token - SIMPLIFIED to avoid circular dependency
//   const refreshToken = async () => {
//     const currentToken = token.value || localStorage.getItem('token')
//     if (!currentToken) {
//       throw new Error('No token to refresh')
//     }

//     try {
//       const response = await api.get('/refresh')
//       const responseData = response.data

//       let newToken = null
//       if (responseData.data?.token) {
//         newToken = responseData.data.token
//       } else if (responseData.token) {
//         newToken = responseData.token
//       } else {
//         throw new Error('Invalid refresh response format')
//       }

//       token.value = newToken
//       localStorage.setItem('token', newToken)
//       localStorage.setItem('login_time', Date.now().toString())
//       api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

//       // Reset activity on token refresh
//       resetInactivityTimer()

//       return newToken
//     } catch (error) {
//       console.error('Refresh token error:', error)
//       throw error
//     }
//   }

//   // Logout method - SIMPLIFIED
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
//         console.warn('User fetch returned 401')
//         // Don't auto logout
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
//         // Don't auto logout, just return false
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
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage immediately
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user')))
  const permissions = ref([])
  const loading = ref(false)
  const isRefreshing = ref(false) // Add flag to prevent multiple refresh attempts

  // Inactivity timer
  let inactivityTimer = 30 * 60 * 1000
  const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes in milliseconds
  const lastActivity = ref(Date.now())

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

  // Request interceptor
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

  // Response interceptor with token refresh - FIXED
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // Don't retry login requests or refresh requests
      if (originalRequest?.url === '/login' || originalRequest?.url === '/refresh') {
        return Promise.reject(error)
      }

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest?._retry) {
        // Prevent multiple refresh attempts
        if (isRefreshing.value) {
          // If already refreshing, wait and retry
          return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
              if (!isRefreshing.value) {
                clearInterval(checkInterval)
                if (token.value) {
                  originalRequest.headers['Authorization'] = `Bearer ${token.value}`
                  resolve(api(originalRequest))
                } else {
                  reject(new Error('Refresh failed'))
                }
              }
            }, 100)
          })
        }

        originalRequest._retry = true
        isRefreshing.value = true

        try {
          // Attempt to refresh token
          const currentToken = token.value || localStorage.getItem('token')
          if (!currentToken) {
            throw new Error('No token to refresh')
          }

          const response = await api.get('/refresh')
          const responseData = response.data

          let newToken = null
          if (responseData.data?.token) {
            newToken = responseData.data.token
          } else if (responseData.token) {
            newToken = responseData.token
          } else {
            throw new Error('Invalid refresh response format')
          }

          token.value = newToken
          localStorage.setItem('token', newToken)
          localStorage.setItem('login_time', Date.now().toString())
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          isRefreshing.value = false
          return api(originalRequest)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          isRefreshing.value = false

          // Don't auto logout, just clear the current request's auth
          // The user will need to login again for new requests
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    lastActivity.value = Date.now()

    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    if (isAuthenticated.value) {
      inactivityTimer = setTimeout(() => {
        // Check if still inactive
        const inactiveTime = Date.now() - lastActivity.value
        if (inactiveTime >= INACTIVITY_LIMIT) {
          console.log('Inactivity timeout reached')
          // Don't auto logout, just log
        }
      }, INACTIVITY_LIMIT)
    }
  }

  // Track user activity
  const trackActivity = () => {
    if (isAuthenticated.value) {
      resetInactivityTimer()
    }
  }

  // Setup activity listeners
  const setupActivityTracking = () => {
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
      events.forEach((event) => {
        window.addEventListener(event, trackActivity)
      })
      resetInactivityTimer()
    }
  }

  // Clear activity tracking
  const clearActivityTracking = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
      events.forEach((event) => {
        window.removeEventListener(event, trackActivity)
      })
    }
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
      localStorage.setItem('login_time', Date.now().toString())

      // Set default header
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

      // Setup activity tracking
      setupActivityTracking()

      return responseData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Refresh token - SIMPLIFIED
  const refreshToken = async () => {
    const currentToken = token.value || localStorage.getItem('token')
    if (!currentToken) {
      throw new Error('No token to refresh')
    }

    try {
      const response = await api.get('/refresh')
      const responseData = response.data

      let newToken = null
      if (responseData.data?.token) {
        newToken = responseData.data.token
      } else if (responseData.token) {
        newToken = responseData.token
      } else {
        throw new Error('Invalid refresh response format')
      }

      token.value = newToken
      localStorage.setItem('token', newToken)
      localStorage.setItem('login_time', Date.now().toString())
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      // Reset activity on token refresh
      resetInactivityTimer()

      return newToken
    } catch (error) {
      console.error('Refresh token error:', error)
      throw error
    }
  }

  // Logout method
  const logout = async () => {
    try {
      const currentToken = token.value || localStorage.getItem('token')
      if (currentToken) {
        await api.post('/logout').catch(() => {})
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      clearActivityTracking()
    }
  }

  // Clear auth data
  const clearAuth = () => {
    token.value = null
    user.value = null
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('login_time')
    delete api.defaults.headers.common['Authorization']
  }

  // Fetch current user
  const fetchUser = async () => {
    const currentToken = token.value || localStorage.getItem('token')
    if (!currentToken) {
      throw new Error('No token')
    }

    try {
      const response = await api.get('/user')
      const userData = response.data.data?.user || response.data.user

      user.value = userData
      permissions.value = userData.permissions?.flat || []

      localStorage.setItem('user', JSON.stringify(userData))

      return userData
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn('User fetch returned 401')
        // Don't auto logout
      }
      throw error
    }
  }

  // Check authentication with token validation
  const checkAuth = async () => {
    // Check if we have token in localStorage but not in memory
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

    // Check if token is expired based on login time
    const loginTime = localStorage.getItem('login_time')
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime)
      const TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000 // 7 days

      if (elapsed > TOKEN_LIFETIME) {
        console.log('Token expired based on login time')
        // Clear expired token but don't auto logout
        clearAuth()
        return false
      }
    }

    // If we have user data from localStorage, consider authenticated
    if (user.value) {
      setupActivityTracking()
      return true
    }

    // Try to fetch user to validate token
    try {
      await fetchUser()
      setupActivityTracking()
      return true
    } catch (error) {
      console.log('Token validation failed:', error.message)
      // Don't clear auth on validation failure - let the next request handle it
      return false
    }
  }

  // Initialize auth state - call this on app start
  const initAuth = async () => {
    // Restore from localStorage immediately
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

    // Validate the token
    return await checkAuth()
  }

  // Computed
  const isAuthenticated = computed(() => {
    // Check both memory and localStorage
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
    refreshToken,
    fetchUser,
    checkAuth,
    initAuth,
    trackActivity,
    api,
  }
})
