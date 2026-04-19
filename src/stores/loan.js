// import { defineStore } from 'pinia'
// import axios from 'axios'

// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
// // const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

// export const useLoanStore = defineStore('loan', {
//   state: () => ({
//     loans: [],
//     currentLoan: null,
//     loading: false,
//     error: null,
//     statistics: {
//       pending: 0,
//       approved: 0,
//       active: 0,
//       paid: 0,
//       defaulted: 0,
//       rejected: 0,
//     },
//     summary: {
//       total_amount: 0,
//       outstanding: 0,
//       collected: 0,
//       interest: 0,
//     },
//     monthlySummary: [],
//   }),

//   getters: {
//     totalLoans: (state) => state.loans.length,
//     activeLoans: (state) => state.loans.filter((loan) => loan.status === 'active'),
//     totalLoanAmount: (state) => {
//       return state.loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0)
//     },
//   },

//   actions: {
//     async fetchLoans(params = {}) {
//       this.loading = true
//       this.error = null

//       try {
//         const response = await axios.get(`${API_URL}/loans`, { params })

//         if (response.data.success) {
//           this.loans = response.data.data.data || response.data.data || []
//           return response.data
//         }

//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to fetch loans'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     async fetchLoanStatistics(filters = {}) {
//       try {
//         const response = await axios.get(`${API_URL}/loans/statistics`, { params: filters })

//         if (response.data.success) {
//           this.statistics = response.data.data.statistics
//           this.summary = response.data.data.summary
//           return response.data.data
//         }

//         return null
//       } catch (error) {
//         console.error('Error fetching loan statistics:', error)
//         this.error = error.response?.data?.message || 'Failed to fetch statistics'
//         throw error
//       }
//     },

//     async fetchCustomerLoanStatistics(customerId) {
//       try {
//         const response = await axios.get(`${API_URL}/loans/customers/${customerId}/loan-statistics`)

//         if (response.data.success) {
//           return response.data.data
//         }

//         return null
//       } catch (error) {
//         console.error('Error fetching customer loan statistics:', error)
//         throw error
//       }
//     },

//     async fetchStatusDistribution(filters = {}) {
//       try {
//         const response = await axios.get(`${API_URL}/loans/status-distribution`, {
//           params: filters,
//         })

//         if (response.data.success) {
//           return response.data.data
//         }

//         return null
//       } catch (error) {
//         console.error('Error fetching status distribution:', error)
//         throw error
//       }
//     },

//     async fetchMonthlySummary(year = null) {
//       try {
//         const params = year ? { year } : {}
//         const response = await axios.get(`${API_URL}/loans/monthly-summary`, { params })

//         if (response.data.success) {
//           this.monthlySummary = response.data.data
//           return response.data
//         }

//         return null
//       } catch (error) {
//         console.error('Error fetching monthly summary:', error)
//         throw error
//       }
//     },

//     async fetchCustomerLoans(customerId, params = {}) {
//       this.loading = true
//       this.error = null

//       try {
//         const response = await axios.get(`${API_URL}/customers/${customerId}/loans`, { params })

//         if (response.data.success) {
//           return response.data
//         }

//         return { data: [] }
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to fetch customer loans'
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     async createLoan(loanData) {
//       try {
//         const response = await axios.post(`${API_URL}/loans`, loanData)

//         if (response.data.success) {
//           await this.fetchLoans()
//         }

//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to create loan'
//         throw error
//       }
//     },

//     async updateLoan(id, loanData) {
//       try {
//         const response = await axios.put(`${API_URL}/loans/${id}`, loanData)

//         if (response.data.success) {
//           await this.fetchLoans()
//         }

//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to update loan'
//         throw error
//       }
//     },

//     async deleteLoan(id) {
//       try {
//         const response = await axios.delete(`${API_URL}/loans/${id}`)

//         if (response.data.success) {
//           await this.fetchLoans()
//         }

//         return response.data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to delete loan'
//         throw error
//       }
//     },
//   },
// })

// stores/loan.js

import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
// const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

export const useLoanStore = defineStore('loan', {
  state: () => ({
    loans: [],
    currentLoan: null,
    overdueLoans: [],
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
    overdueStatistics: {
      total_overdue: 0,
      total_amount: 0,
      total_penalty: 0,
      avg_days_overdue: 0,
    },
  }),

  getters: {
    totalLoans: (state) => state.loans.length,
    activeLoans: (state) => state.loans.filter((loan) => loan.status === 'active'),
    totalLoanAmount: (state) => {
      return state.loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0)
    },
    totalOverdueAmount: (state) => {
      return state.overdueLoans.reduce(
        (sum, loan) => sum + (parseFloat(loan.overdue_amount || 0) || 0),
        0,
      )
    },
    totalPenaltyAmount: (state) => {
      return state.overdueLoans.reduce(
        (sum, loan) => sum + (parseFloat(loan.total_penalty || loan.penalty_amount || 0) || 0),
        0,
      )
    },
    criticalOverdueLoans: (state) => {
      return state.overdueLoans.filter((loan) => (loan.days_overdue || 0) > 90)
    },
    moderateOverdueLoans: (state) => {
      return state.overdueLoans.filter((loan) => {
        const days = loan.days_overdue || 0
        return days > 30 && days <= 90
      })
    },
    mildOverdueLoans: (state) => {
      return state.overdueLoans.filter((loan) => {
        const days = loan.days_overdue || 0
        return days > 0 && days <= 30
      })
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

    // Fetch overdue loans with filters
    async fetchOverdueLoans(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/loans/overdue`, { params })

        if (response.data.success) {
          this.overdueLoans = response.data.data.data || response.data.data || []
          return response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch overdue loans'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch single overdue loan details
    async fetchOverdueLoan(id) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/loans/overdue/${id}`)

        if (response.data.success) {
          this.currentLoan = response.data.data
          return response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch overdue loan details'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch overdue loans summary statistics
    async fetchOverdueStatistics() {
      try {
        const response = await axios.get(`${API_URL}/loans/overdue/summary`)

        if (response.data.success) {
          this.overdueStatistics = response.data.data
          return response.data.data
        }

        return null
      } catch (error) {
        console.error('Error fetching overdue statistics:', error)
        this.error = error.response?.data?.message || 'Failed to fetch overdue statistics'
        throw error
      }
    },

    // Send reminder for overdue loan
    async sendOverdueReminder(loanId, message = null) {
      try {
        const response = await axios.post(`${API_URL}/loans/overdue/${loanId}/send-reminder`, {
          message: message,
        })

        if (response.data.success) {
          // Refresh overdue loans after sending reminder
          await this.fetchOverdueLoans()
          return response.data
        }

        return response.data
      } catch (error) {
        console.error('Error sending reminder:', error)
        this.error = error.response?.data?.message || 'Failed to send reminder'
        throw error
      }
    },

    // Waive penalty for overdue loan
    async waivePenalty(loanId, reason = null) {
      try {
        const response = await axios.post(`${API_URL}/loans/overdue/${loanId}/waive-penalty`, {
          reason: reason,
        })

        if (response.data.success) {
          // Refresh overdue loans and statistics
          await this.fetchOverdueLoans()
          await this.fetchOverdueStatistics()
          return response.data
        }

        return response.data
      } catch (error) {
        console.error('Error waiving penalty:', error)
        this.error = error.response?.data?.message || 'Failed to waive penalty'
        throw error
      }
    },

    // Export overdue loans
    async exportOverdueLoans(filters = {}) {
      try {
        const response = await axios.get(`${API_URL}/loans/overdue/export`, {
          params: filters,
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        const contentDisposition = response.headers['content-disposition']
        let filename = 'overdue_loans.csv'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '')
          }
        }
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return { success: true }
      } catch (error) {
        console.error('Error exporting overdue loans:', error)
        this.error = error.response?.data?.message || 'Failed to export overdue loans'
        throw error
      }
    },

    // Calculate penalties for all overdue loans (admin only)
    async calculatePenalties() {
      try {
        const response = await axios.post(`${API_URL}/cron/calculate-penalties`)

        if (response.data.success) {
          // Refresh overdue loans and statistics
          await this.fetchOverdueLoans()
          await this.fetchOverdueStatistics()
          return response.data
        }

        return response.data
      } catch (error) {
        console.error('Error calculating penalties:', error)
        this.error = error.response?.data?.message || 'Failed to calculate penalties'
        throw error
      }
    },

    // Update overdue status for all loans (admin only)
    async updateOverdueStatus() {
      try {
        const response = await axios.post(`${API_URL}/cron/update-overdue-status`)

        if (response.data.success) {
          // Refresh loans and overdue data
          await this.fetchLoans()
          await this.fetchOverdueLoans()
          await this.fetchOverdueStatistics()
          return response.data
        }

        return response.data
      } catch (error) {
        console.error('Error updating overdue status:', error)
        this.error = error.response?.data?.message || 'Failed to update overdue status'
        throw error
      }
    },

    // Get overdue loans by severity
    async getOverdueLoansBySeverity(severity) {
      let minDays = 0
      let maxDays = null

      switch (severity) {
        case 'mild':
          minDays = 1
          maxDays = 30
          break
        case 'moderate':
          minDays = 31
          maxDays = 90
          break
        case 'critical':
          minDays = 91
          break
        default:
          return this.overdueLoans
      }

      return this.overdueLoans.filter((loan) => {
        const days = loan.days_overdue || 0
        if (maxDays) {
          return days >= minDays && days <= maxDays
        }
        return days >= minDays
      })
    },

    // Get total overdue amount for a specific customer
    async getCustomerOverdueAmount(customerId) {
      try {
        const response = await axios.get(`${API_URL}/customers/${customerId}/overdue-amount`)

        if (response.data.success) {
          return response.data.data
        }

        return { overdue_amount: 0, penalty_amount: 0, days_overdue: 0 }
      } catch (error) {
        console.error('Error fetching customer overdue amount:', error)
        return { overdue_amount: 0, penalty_amount: 0, days_overdue: 0 }
      }
    },

    // Bulk send reminders to all overdue customers
    async sendBulkReminders(severity = null) {
      try {
        const response = await axios.post(`${API_URL}/loans/overdue/bulk-reminders`, {
          severity: severity,
        })

        if (response.data.success) {
          return response.data
        }

        return response.data
      } catch (error) {
        console.error('Error sending bulk reminders:', error)
        this.error = error.response?.data?.message || 'Failed to send bulk reminders'
        throw error
      }
    },

    // Get overdue payment schedule for a loan
    async getOverduePaymentSchedule(loanId) {
      try {
        const response = await axios.get(`${API_URL}/loans/${loanId}/overdue-schedule`)

        if (response.data.success) {
          return response.data.data
        }

        return []
      } catch (error) {
        console.error('Error fetching overdue schedule:', error)
        return []
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
          await this.fetchOverdueLoans() // Also refresh overdue loans
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete loan'
        throw error
      }
    },

    // Clear all overdue data
    clearOverdueData() {
      this.overdueLoans = []
      this.overdueStatistics = {
        total_overdue: 0,
        total_amount: 0,
        total_penalty: 0,
        avg_days_overdue: 0,
      }
    },

    // Clear all loan data
    clearAllData() {
      this.loans = []
      this.currentLoan = null
      this.overdueLoans = []
      this.loading = false
      this.error = null
      this.statistics = {
        pending: 0,
        approved: 0,
        active: 0,
        paid: 0,
        defaulted: 0,
        rejected: 0,
      }
      this.summary = {
        total_amount: 0,
        outstanding: 0,
        collected: 0,
        interest: 0,
      }
      this.monthlySummary = []
      this.overdueStatistics = {
        total_overdue: 0,
        total_amount: 0,
        total_penalty: 0,
        avg_days_overdue: 0,
      }
    },
  },
})
