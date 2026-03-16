import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // This sends cookies with requests
  timeout: 30000, // Increased from 3000 to 30000 (30 seconds)
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - FIXED to prevent automatic logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log CORS errors specifically
    if (error.message === 'Network Error') {
      console.error('CORS Error or Network Issue. Check backend configuration.')
    }

    // DON'T automatically logout on 401 - let the app handle it
    // Just return the error
    return Promise.reject(error)
  },
)

export default api
