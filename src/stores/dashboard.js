// // stores/dashboard.js
// import { defineStore } from 'pinia'
// import api from '@/services/api'

// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// // const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

// export const useDashboardStore = defineStore('dashboard', {
//   state: () => ({
//     statistics: {
//       totalCustomers: 0,
//       activeLoans: 0,
//       paidLoans: 0,
//       defaultedLoans: 0,
//       totalLoans: 0,
//       totalProfit: 0,
//     },
//     recentActivities: [],
//     upcomingPayments: [],
//     loanChartData: {
//       labels: [],
//       values: [],
//     },
//     paymentChartData: {
//       labels: [],
//       values: [],
//     },
//     loading: false,
//     error: null,
//   }),

//   getters: {
//     isLoading: (state) => state.loading,
//     getError: (state) => state.error,

//     // Formatted statistics
//     formattedStats: (state) => ({
//       totalCustomers: state.statistics.totalCustomers.toLocaleString(),
//       activeLoans: state.statistics.activeLoans.toLocaleString(),
//       paidLoans: state.statistics.paidLoans.toLocaleString(),
//       defaultedLoans: state.statistics.defaultedLoans.toLocaleString(),
//       totalLoans: new Intl.NumberFormat('sw-TZ', {
//         style: 'currency',
//         currency: 'TZS',
//       }).format(state.statistics.totalLoans),
//       totalProfit: new Intl.NumberFormat('sw-TZ', {
//         style: 'currency',
//         currency: 'TZS',
//       }).format(state.statistics.totalProfit),
//     }),
//   },

//   actions: {
//     // Fetch all dashboard data
//     async fetchDashboardData() {
//       this.loading = true
//       this.error = null

//       try {
//         const response = await api.get(`${API_URL}/dashboard/stats`)
//         const data = response.data

//         this.statistics = {
//           totalCustomers: data.total_customers || 0,
//           activeLoans: data.active_loans || 0,
//           paidLoans: data.paid_loans || 0,
//           defaultedLoans: data.defaulted_loans || 0,
//           totalLoans: data.total_loans_amount || 0,
//           totalProfit: data.total_profit || 0,
//         }

//         this.recentActivities = data.recent_activities || []
//         this.upcomingPayments = data.upcoming_payments || []

//         return data
//       } catch (error) {
//         this.error = error.response?.data?.message || 'Failed to fetch dashboard data'
//         console.error('Dashboard data error:', error)
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     // Fetch loan chart data
//     async fetchLoanChartData(period = 'month') {
//       try {
//         const response = await api.get(`${API_URL}/dashboard/loans-chart?period=${period}`)
//         const data = response.data

//         this.loanChartData = {
//           labels: data.labels || [],
//           values: data.values || [],
//         }

//         return this.loanChartData
//       } catch (error) {
//         console.error('Loan chart data error:', error)
//         return { labels: [], values: [] }
//       }
//     },

//     // Fetch payment chart data
//     async fetchPaymentChartData(period = 'month') {
//       try {
//         const response = await api.get(`${API_URL}/dashboard/payments-chart?period=${period}`)
//         const data = response.data

//         this.paymentChartData = {
//           labels: data.labels || [],
//           values: data.values || [],
//         }

//         return this.paymentChartData
//       } catch (error) {
//         console.error('Payment chart data error:', error)
//         return { labels: [], values: [] }
//       }
//     },

//     // Get recent activities
//     async fetchRecentActivities(limit = 10) {
//       try {
//         const response = await api.get(`${API_URL}/dashboard/recent-activities?limit=${limit}`)
//         this.recentActivities = response.data || []
//         return this.recentActivities
//       } catch (error) {
//         console.error('Recent activities error:', error)
//         return []
//       }
//     },

//     // Get upcoming payments
//     async fetchUpcomingPayments(limit = 10) {
//       try {
//         const response = await api.get(`${API_URL}/dashboard/upcoming-payments?limit=${limit}`)
//         this.upcomingPayments = response.data || []
//         return this.upcomingPayments
//       } catch (error) {
//         console.error('Upcoming payments error:', error)
//         return []
//       }
//     },

//     // Clear dashboard data
//     clearDashboardData() {
//       this.statistics = {
//         totalCustomers: 0,
//         activeLoans: 0,
//         paidLoans: 0,
//         defaultedLoans: 0,
//         totalLoans: 0,
//         totalProfit: 0,
//       }
//       this.recentActivities = []
//       this.upcomingPayments = []
//       this.loanChartData = { labels: [], values: [] }
//       this.paymentChartData = { labels: [], values: [] }
//       this.error = null
//     },
//   },
// })

// stores/dashboard.js

import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// // const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    statistics: null,
    summary: null,
    loanChartData: null,
    paymentChartData: null,
    recentActivities: [],
    upcomingPayments: [],
    weeklyPerformance: [],
    loanPerformance: null,
    cashFlowForecast: [],
    notifications: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboardData() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/dashboard`)
        this.dashboardData = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load dashboard data'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      try {
        const response = await axios.get('/dashboard/stats')
        this.statistics = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load statistics:', error)
        throw error
      }
    },

    async fetchSummary() {
      try {
        const response = await axios.get('/dashboard/summary')
        this.summary = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load summary:', error)
        throw error
      }
    },

    async fetchLoanChartData(period = 'month') {
      try {
        const response = await axios.get('/dashboard/chart/loans', {
          params: { period },
        })
        this.loanChartData = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load loan chart:', error)
        return { data: { labels: [], datasets: [] } }
      }
    },

    async fetchPaymentChartData(period = 'month') {
      try {
        const response = await axios.get('/dashboard/chart/payments', {
          params: { period },
        })
        this.paymentChartData = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load payment chart:', error)
        return { data: { labels: [], datasets: [] } }
      }
    },

    async fetchRecentActivities(limit = 10) {
      try {
        const response = await axios.get('/dashboard/recent-activities', {
          params: { limit },
        })
        this.recentActivities = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load recent activities:', error)
        throw error
      }
    },

    async fetchUpcomingPayments(days = 7, limit = 10) {
      try {
        const response = await axios.get('/dashboard/upcoming-payments', {
          params: { days, limit },
        })
        this.upcomingPayments = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load upcoming payments:', error)
        throw error
      }
    },

    async fetchWeeklyPerformance() {
      try {
        const response = await axios.get('/dashboard/weekly-performance')
        this.weeklyPerformance = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load weekly performance:', error)
        throw error
      }
    },

    async fetchLoanPerformance() {
      try {
        const response = await axios.get('/dashboard/loan-performance')
        this.loanPerformance = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load loan performance:', error)
        throw error
      }
    },

    async fetchCashFlowForecast() {
      try {
        const response = await axios.get('/dashboard/cash-flow-forecast')
        this.cashFlowForecast = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load cash flow forecast:', error)
        throw error
      }
    },

    async fetchNotifications() {
      try {
        const response = await axios.get('/dashboard/notifications')
        this.notifications = response.data.data
        return response.data
      } catch (error) {
        console.error('Failed to load notifications:', error)
        throw error
      }
    },

    async refreshAll() {
      await Promise.all([
        this.fetchStatistics(),
        this.fetchSummary(),
        this.fetchLoanChartData(),
        this.fetchPaymentChartData(),
        this.fetchRecentActivities(),
        this.fetchUpcomingPayments(),
        this.fetchWeeklyPerformance(),
        this.fetchLoanPerformance(),
        this.fetchCashFlowForecast(),
        this.fetchNotifications(),
      ])
    },
  },

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,

    totalCustomers: (state) => state.statistics?.customers?.total || 0,
    activeLoans: (state) => state.statistics?.loans?.by_status?.active || 0,
    totalCollected: (state) => state.statistics?.payments?.total_collected || 0,
    collectionRate: (state) => state.statistics?.collection_rate || 0,

    overdueCount: (state) => state.statistics?.overdue?.total || 0,
    overdueAmount: (state) => state.statistics?.overdue?.total_amount || 0,

    monthlyLoanGrowth: (state) => state.statistics?.loans?.growth || 0,
    monthlyPaymentGrowth: (state) => state.statistics?.payments?.growth || 0,

    chartData: (state) => ({
      loans: state.loanChartData,
      payments: state.paymentChartData,
    }),

    recentActivitiesList: (state) => state.recentActivities,
    upcomingPaymentsList: (state) => state.upcomingPayments,

    hasNotifications: (state) => {
      if (!state.notifications) return false
      return (
        state.notifications.overdue_payments > 0 ||
        state.notifications.pending_loans > 0 ||
        state.notifications.upcoming_payments > 0
      )
    },
  },
})
