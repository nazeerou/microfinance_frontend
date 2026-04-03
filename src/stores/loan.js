import { defineStore } from 'pinia'
import axios from 'axios'

// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

export const useLoanStore = defineStore('loan', {
  state: () => ({
    loans: [],
    currentLoan: null,
    loading: false,
    error: null,
    statistics: {
      pending: 0,
      approved: 0,
      active: 0,
      paid: 0,
      defaulted: 0,
      rejected: 0,
    },
    summary: {
      total_amount: 0,
      outstanding: 0,
      collected: 0,
      interest: 0,
    },
    monthlySummary: [],
  }),

  getters: {
    totalLoans: (state) => state.loans.length,
    activeLoans: (state) => state.loans.filter((loan) => loan.status === 'active'),
    totalLoanAmount: (state) => {
      return state.loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0)
    },
  },

  actions: {
    async fetchLoans(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/loans`, { params })

        if (response.data.success) {
          this.loans = response.data.data.data || response.data.data || []
          return response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch loans'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLoanStatistics(filters = {}) {
      try {
        const response = await axios.get(`${API_URL}/loans/statistics`, { params: filters })

        if (response.data.success) {
          this.statistics = response.data.data.statistics
          this.summary = response.data.data.summary
          return response.data.data
        }

        return null
      } catch (error) {
        console.error('Error fetching loan statistics:', error)
        this.error = error.response?.data?.message || 'Failed to fetch statistics'
        throw error
      }
    },

    async fetchCustomerLoanStatistics(customerId) {
      try {
        const response = await axios.get(`${API_URL}/loans/customers/${customerId}/loan-statistics`)

        if (response.data.success) {
          return response.data.data
        }

        return null
      } catch (error) {
        console.error('Error fetching customer loan statistics:', error)
        throw error
      }
    },

    async fetchStatusDistribution(filters = {}) {
      try {
        const response = await axios.get(`${API_URL}/loans/status-distribution`, {
          params: filters,
        })

        if (response.data.success) {
          return response.data.data
        }

        return null
      } catch (error) {
        console.error('Error fetching status distribution:', error)
        throw error
      }
    },

    async fetchMonthlySummary(year = null) {
      try {
        const params = year ? { year } : {}
        const response = await axios.get(`${API_URL}/loans/monthly-summary`, { params })

        if (response.data.success) {
          this.monthlySummary = response.data.data
          return response.data
        }

        return null
      } catch (error) {
        console.error('Error fetching monthly summary:', error)
        throw error
      }
    },

    async fetchCustomerLoans(customerId, params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/customers/${customerId}/loans`, { params })

        if (response.data.success) {
          return response.data
        }

        return { data: [] }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch customer loans'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLoan(loanData) {
      try {
        const response = await axios.post(`${API_URL}/loans`, loanData)

        if (response.data.success) {
          await this.fetchLoans()
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create loan'
        throw error
      }
    },

    async updateLoan(id, loanData) {
      try {
        const response = await axios.put(`${API_URL}/loans/${id}`, loanData)

        if (response.data.success) {
          await this.fetchLoans()
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update loan'
        throw error
      }
    },

    async deleteLoan(id) {
      try {
        const response = await axios.delete(`${API_URL}/loans/${id}`)

        if (response.data.success) {
          await this.fetchLoans()
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete loan'
        throw error
      }
    },
  },
})
