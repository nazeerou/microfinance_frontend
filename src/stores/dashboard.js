// stores/dashboard.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    statistics: {
      totalCustomers: 0,
      activeLoans: 0,
      paidLoans: 0,
      defaultedLoans: 0,
      totalLoans: 0,
      totalProfit: 0
    },
    recentActivities: [],
    upcomingPayments: [],
    loanChartData: {
      labels: [],
      values: []
    },
    paymentChartData: {
      labels: [],
      values: []
    },
    loading: false,
    error: null
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // Formatted statistics
    formattedStats: (state) => ({
      totalCustomers: state.statistics.totalCustomers.toLocaleString(),
      activeLoans: state.statistics.activeLoans.toLocaleString(),
      paidLoans: state.statistics.paidLoans.toLocaleString(),
      defaultedLoans: state.statistics.defaultedLoans.toLocaleString(),
      totalLoans: new Intl.NumberFormat('sw-TZ', { 
        style: 'currency', 
        currency: 'TZS' 
      }).format(state.statistics.totalLoans),
      totalProfit: new Intl.NumberFormat('sw-TZ', { 
        style: 'currency', 
        currency: 'TZS' 
      }).format(state.statistics.totalProfit)
    })
  },

  actions: {
    // Fetch all dashboard data
    async fetchDashboardData() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/dashboard/stats')
        const data = response.data
        
        this.statistics = {
          totalCustomers: data.total_customers || 0,
          activeLoans: data.active_loans || 0,
          paidLoans: data.paid_loans || 0,
          defaultedLoans: data.defaulted_loans || 0,
          totalLoans: data.total_loans_amount || 0,
          totalProfit: data.total_profit || 0
        }
        
        this.recentActivities = data.recent_activities || []
        this.upcomingPayments = data.upcoming_payments || []
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard data'
        console.error('Dashboard data error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch loan chart data
    async fetchLoanChartData(period = 'month') {
      try {
        const response = await api.get(`/dashboard/loans-chart?period=${period}`)
        const data = response.data
        
        this.loanChartData = {
          labels: data.labels || [],
          values: data.values || []
        }
        
        return this.loanChartData
      } catch (error) {
        console.error('Loan chart data error:', error)
        return { labels: [], values: [] }
      }
    },

    // Fetch payment chart data
    async fetchPaymentChartData(period = 'month') {
      try {
        const response = await api.get(`/dashboard/payments-chart?period=${period}`)
        const data = response.data
        
        this.paymentChartData = {
          labels: data.labels || [],
          values: data.values || []
        }
        
        return this.paymentChartData
      } catch (error) {
        console.error('Payment chart data error:', error)
        return { labels: [], values: [] }
      }
    },

    // Get recent activities
    async fetchRecentActivities(limit = 10) {
      try {
        const response = await api.get(`/dashboard/recent-activities?limit=${limit}`)
        this.recentActivities = response.data || []
        return this.recentActivities
      } catch (error) {
        console.error('Recent activities error:', error)
        return []
      }
    },

    // Get upcoming payments
    async fetchUpcomingPayments(limit = 10) {
      try {
        const response = await api.get(`/dashboard/upcoming-payments?limit=${limit}`)
        this.upcomingPayments = response.data || []
        return this.upcomingPayments
      } catch (error) {
        console.error('Upcoming payments error:', error)
        return []
      }
    },

    // Clear dashboard data
    clearDashboardData() {
      this.statistics = {
        totalCustomers: 0,
        activeLoans: 0,
        paidLoans: 0,
        defaultedLoans: 0,
        totalLoans: 0,
        totalProfit: 0
      }
      this.recentActivities = []
      this.upcomingPayments = []
      this.loanChartData = { labels: [], values: [] }
      this.paymentChartData = { labels: [], values: [] }
      this.error = null
    }
  }
})