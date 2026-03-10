// import { defineStore } from 'pinia'
// import api from '@/services/api'

// export const useCustomerStore = defineStore('customer', {
//   state: () => ({
//     customers: [],
//     currentCustomer: null,
//     loading: false,
//     error: null,
//   }),

//   actions: {
//     // Fetch all customers with pagination
//     async fetchCustomers(params = {}) {
//       this.loading = true
//       try {
//         const response = await api.get('/customers', { params })
//         this.customers = response.data.data || response.data
//         console.log('hi', response.data)
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to fetch customers'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Fetch single customer
//     async fetchCustomer(id) {
//       this.loading = true
//       try {
//         const response = await api.get(`/customers/${id}`)
//         this.currentCustomer = response.data.data || response.data
//         return this.currentCustomer
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to fetch customer'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Create new customer
//     async createCustomer(formData) {
//       this.loading = true
//       try {
//         const response = await api.post('/customers', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         })
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to create customer'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Update customer
//     async updateCustomer(id, formData) {
//       this.loading = true
//       try {
//         // Laravel requires POST with _method PUT for file uploads
//         formData.append('_method', 'PUT')
//         const response = await api.post(`/customers/${id}`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         })
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to update customer'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Delete customer
//     async deleteCustomer(id) {
//       this.loading = true
//       try {
//         const response = await api.delete(`/customers/${id}`)
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to delete customer'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Update customer status
//     async updateCustomerStatus(id, status) {
//       this.loading = true
//       try {
//         const response = await api.patch(`/customers/${id}/status`, { status })
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to update status'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Export customers
//     async exportCustomers(params = {}) {
//       try {
//         const response = await api.get('/customers/export', {
//           params,
//           responseType: 'blob',
//         })

//         // Create download link
//         const url = window.URL.createObjectURL(new Blob([response.data]))
//         const link = document.createElement('a')
//         link.href = url
//         link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.xlsx`)
//         document.body.appendChild(link)
//         link.click()
//         link.remove()
//       } catch (error) {
//         console.error('Export error:', error)
//         throw error
//       }
//     },

//     // Import customers
//     async importCustomers(file) {
//       this.loading = true
//       try {
//         const formData = new FormData()
//         formData.append('file', file)

//         const response = await api.post('/customers/import', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         })
//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to import customers'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Clear current customer
//     clearCurrentCustomer() {
//       this.currentCustomer = null
//     },
//   },
// })

import { defineStore } from 'pinia'
import axios from 'axios'
import offlineStorage from '@/services/offlineStorage'
import syncService from '@/services/syncService'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    offlineCustomers: [],
    currentCustomer: null,
    loading: false,
    error: null,
    isOnline: navigator.onLine,
    pendingSync: 0,
  }),

  getters: {
    hasPendingSync: (state) => state.pendingSync > 0,
    totalCustomers: (state) => {
      return state.isOnline ? state.customers.length : state.offlineCustomers.length
    },
  },

  actions: {
    async init() {
      await offlineStorage.init()

      // Load offline customers
      this.offlineCustomers = await offlineStorage.getCustomers()
      this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length

      // Set up online/offline listeners
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)

      // Initial sync if online
      if (this.isOnline) {
        await this.fetchCustomers()
      }
    },

    handleOnline() {
      this.isOnline = true
      syncService.syncData()
    },

    handleOffline() {
      this.isOnline = false
    },

    async fetchCustomers(params = {}) {
      if (!this.isOnline) {
        // Return offline customers
        this.customers = this.offlineCustomers
        return { data: this.offlineCustomers }
      }

      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/customers`, { params })

        if (response.data.success) {
          this.customers = response.data.data.data || []
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch customers'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCustomer(formData) {
      // Convert FormData to object for offline storage
      const customerData = {}
      for (let [key, value] of formData.entries()) {
        customerData[key] = value
      }

      if (!this.isOnline) {
        // Save offline
        const savedCustomer = await offlineStorage.saveCustomer(customerData)
        this.offlineCustomers.push(savedCustomer)
        this.pendingSync++

        return {
          success: true,
          message: 'Customer saved offline. Will sync when online.',
          data: savedCustomer,
        }
      }

      // Online - try API first
      try {
        const response = await axios.post(`${API_URL}/customers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data.success) {
          // Refresh customer list
          await this.fetchCustomers()
        }

        return response.data
      } catch (error) {
        // If online fails due to network, save offline
        if (error.code === 'ERR_NETWORK' || error.message.includes('network')) {
          const savedCustomer = await offlineStorage.saveCustomer(customerData)
          this.offlineCustomers.push(savedCustomer)
          this.pendingSync++

          return {
            success: true,
            message: 'Network error. Customer saved offline.',
            data: savedCustomer,
          }
        }
        throw error
      }
    },

    async updateCustomer(id, formData) {
      // Convert FormData to object for offline storage
      const customerData = {}
      for (let [key, value] of formData.entries()) {
        if (key !== '_method') {
          customerData[key] = value
        }
      }
      customerData.id = id

      if (!this.isOnline) {
        // Find local customer
        const localCustomer = this.offlineCustomers.find((c) => c.id === id || c.localId === id)
        if (localCustomer) {
          const updated = await offlineStorage.updateCustomer(
            localCustomer.localId || id,
            customerData,
          )

          // Update local array
          const index = this.offlineCustomers.findIndex(
            (c) => c.localId === (localCustomer.localId || id),
          )
          if (index !== -1) {
            this.offlineCustomers[index] = updated
          }

          this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length
        }

        return {
          success: true,
          message: 'Customer updated offline. Will sync when online.',
          data: customerData,
        }
      }

      try {
        formData.append('_method', 'PUT')
        const response = await axios.post(`${API_URL}/customers/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data.success) {
          await this.fetchCustomers()
        }

        return response.data
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('network')) {
          // Save offline
          const localCustomer = this.offlineCustomers.find((c) => c.id === id)
          const updated = await offlineStorage.updateCustomer(
            localCustomer?.localId || id,
            customerData,
          )

          if (localCustomer) {
            const index = this.offlineCustomers.findIndex((c) => c.id === id)
            this.offlineCustomers[index] = updated
          } else {
            this.offlineCustomers.push(updated)
          }

          this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length

          return {
            success: true,
            message: 'Network error. Customer updated offline.',
            data: updated,
          }
        }
        throw error
      }
    },

    async fetchCustomer(id) {
      // Check offline first
      const offlineCustomer = this.offlineCustomers.find((c) => c.id === id || c.localId === id)

      if (!this.isOnline) {
        if (offlineCustomer) {
          return offlineCustomer
        }
        throw new Error('Customer not found offline')
      }

      try {
        const response = await axios.get(`${API_URL}/customers/${id}`)

        if (response.data.success) {
          return response.data.data
        }

        throw new Error('Customer not found')
      } catch (error) {
        // If offline and have customer, return it
        if (offlineCustomer) {
          return offlineCustomer
        }
        throw error
      }
    },

    async syncOfflineData() {
      await syncService.syncData()

      // Update pending count and refresh customers
      this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length
      this.offlineCustomers = await offlineStorage.getCustomers()

      if (this.isOnline) {
        await this.fetchCustomers()
      }
    },

    async saveFormDraft(draftId, data) {
      await offlineStorage.saveFormDraft(draftId, data)
    },

    async getFormDraft(draftId) {
      return await offlineStorage.getFormDraft(draftId)
    },

    async clearFormDraft(draftId) {
      await offlineStorage.clearFormDraft(draftId)
    },

    cleanup() {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    },
  },
})
