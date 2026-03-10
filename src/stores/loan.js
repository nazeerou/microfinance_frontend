// stores/loan.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useLoanStore = defineStore('loan', {
  state: () => ({
    loans: [],
    currentLoan: null,
    pendingCount: 0,
    loading: false,
    error: null
  }),

  actions: {
    async fetchLoans(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/loans', { params })
        this.loans = response.data.data || response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLoan(id) {
      this.loading = true
      try {
        const response = await api.get(`/loans/${id}`)
        this.currentLoan = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPendingCount() {
      try {
        const response = await api.get('/loans/pending/count')
        this.pendingCount = response.data.count || 0
        return this.pendingCount
      } catch (error) {
        console.error('Error fetching pending count:', error)
        return 0
      }
    }
  }
})