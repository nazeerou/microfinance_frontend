import { defineStore } from 'pinia'
import axios from 'axios'
import offlineStorage from '@/services/offlineStorage'
import syncService from '@/services/syncService'

// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

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

      this.offlineCustomers = await offlineStorage.getCustomers()
      this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length

      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)

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
        // Return offline customers with pagination structure
        const offlineCustomers = this.offlineCustomers || []
        const page = params.page || 1
        const perPage = params.per_page || 10
        const start = (page - 1) * perPage
        const end = start + perPage

        return {
          success: true,
          data: {
            data: offlineCustomers.slice(start, end),
            current_page: page,
            last_page: Math.ceil(offlineCustomers.length / perPage),
            per_page: perPage,
            total: offlineCustomers.length,
            from: start + 1,
            to: Math.min(end, offlineCustomers.length),
          },
        }
      }

      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/customers`, { params })

        if (response.data.success) {
          // Store the customers
          this.customers = response.data.data.data || response.data.data || []

          // Return the full response with pagination
          return {
            success: true,
            data: response.data.data,
          }
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
      const customerData = {}
      for (let [key, value] of formData.entries()) {
        customerData[key] = value
      }

      if (!this.isOnline) {
        const savedCustomer = await offlineStorage.saveCustomer(customerData)
        this.offlineCustomers.push(savedCustomer)
        this.pendingSync++

        return {
          success: true,
          message: 'Customer saved offline. Will sync when online.',
          data: savedCustomer,
        }
      }

      try {
        const response = await axios.post(`${API_URL}/customers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data.success) {
          await this.fetchCustomers()
        }

        return response.data
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message?.includes('network')) {
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
      const customerData = {}
      for (let [key, value] of formData.entries()) {
        if (key !== '_method') {
          customerData[key] = value
        }
      }
      customerData.id = id

      if (!this.isOnline) {
        const localCustomer = this.offlineCustomers.find((c) => c.id === id || c.localId === id)
        if (localCustomer) {
          const updated = await offlineStorage.updateCustomer(
            localCustomer.localId || id,
            customerData,
          )

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
        if (error.code === 'ERR_NETWORK' || error.message?.includes('network')) {
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

    // ADD THIS DELETE CUSTOMER METHOD
    async deleteCustomer(id) {
      console.log('Deleting customer with ID:', id)

      if (!this.isOnline) {
        // Handle offline deletion
        const offlineCustomer = this.offlineCustomers.find((c) => c.id === id || c.localId === id)
        if (offlineCustomer) {
          await offlineStorage.deleteCustomer(offlineCustomer.localId || id)
          this.offlineCustomers = this.offlineCustomers.filter(
            (c) => c.localId !== (offlineCustomer.localId || id) && c.id !== id,
          )
          this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length

          return {
            success: true,
            message: 'Customer marked for deletion offline. Will sync when online.',
          }
        }
        throw new Error('Customer not found offline')
      }

      // Online - delete from API
      try {
        const response = await axios.delete(`${API_URL}/customers/${id}`)

        if (response.data.success || response.data.status === 'success') {
          // Remove from local customers array
          this.customers = this.customers.filter((c) => c.id !== id)

          // Also remove from offline customers if exists
          this.offlineCustomers = this.offlineCustomers.filter((c) => c.id !== id)

          console.log('Customer deleted successfully')
          return response.data
        }

        throw new Error(response.data.message || 'Failed to delete customer')
      } catch (error) {
        console.error('Delete customer error:', error)

        // Handle network errors - mark for deletion offline
        if (error.code === 'ERR_NETWORK' || error.message?.includes('network')) {
          const offlineCustomer = this.offlineCustomers.find((c) => c.id === id)
          if (offlineCustomer) {
            await offlineStorage.markForDeletion(id, 'customer')
            this.offlineCustomers = this.offlineCustomers.filter((c) => c.id !== id)
            this.pendingSync = (await offlineStorage.getUnsyncedCustomers()).length

            return {
              success: true,
              message: 'Customer marked for deletion. Will delete when online.',
            }
          }
        }

        // Extract error message from response
        let errorMessage = 'Failed to delete customer'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }

        // Handle specific status codes
        if (error.response?.status === 409) {
          errorMessage = 'Cannot delete customer with active loans'
        } else if (error.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this customer'
        } else if (error.response?.status === 404) {
          errorMessage = 'Customer not found'
        }

        const customError = new Error(errorMessage)
        customError.response = error.response
        throw customError
      }
    },

    async fetchCustomer(id) {
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
          this.currentCustomer = response.data.data
          return this.currentCustomer
        }

        throw new Error('Customer not found')
      } catch (error) {
        if (offlineCustomer) {
          return offlineCustomer
        }
        throw error
      }
    },

    async syncOfflineData() {
      await syncService.syncData()
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
