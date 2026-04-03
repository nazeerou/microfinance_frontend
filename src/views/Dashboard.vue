<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Inapakia data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="btn-primary">Jaribu Tena</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="date">{{ currentDate }}</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <!-- Customers Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #4caf50">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatNumber(statisticsData?.customers?.total || 0) }}</h3>
            <p>Wateja</p>
            <span class="stat-change" :class="getGrowthClass(statisticsData?.customers?.growth)">
              <i :class="getGrowthIcon(statisticsData?.customers?.growth)"></i>
              {{ Math.abs(statisticsData?.customers?.growth || 0) }}%
              <span class="change-direction">
                {{ (statisticsData?.customers?.growth || 0) > 0 ? 'ongezeko' : 'punguzo' }}
              </span>
            </span>
          </div>
        </div>

        <!-- Active Loans Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #2196f3">
            <i class="fas fa-hand-holding-usd"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatNumber(statisticsData?.loans?.by_status?.active || 0) }}</h3>
            <p>Mikopo Inayoendelea</p>
            <span class="stat-change" :class="getGrowthClass(statisticsData?.loans?.growth)">
              <i :class="getGrowthIcon(statisticsData?.loans?.growth)"></i>
              {{ Math.abs(statisticsData?.loans?.growth || 0) }}%
              <span class="change-direction">
                {{ (statisticsData?.loans?.growth || 0) > 0 ? 'ongezeko' : 'punguzo' }}
              </span>
            </span>
          </div>
        </div>

        <!-- Paid Loans Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff9800">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatNumber(statisticsData?.loans?.by_status?.paid || 0) }}</h3>
            <p>Mikopo Iliyolipwa</p>
            <span class="stat-change positive"> <i class="fas fa-arrow-up"></i> 0% </span>
          </div>
        </div>

        <!-- Overdue Loans Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #f44336">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatNumber(statisticsData?.loans?.by_status?.defaulted || 0) }}</h3>
            <p>Mikopo Iliyochelewa</p>
            <span class="stat-change neutral"> <i class="fas fa-minus"></i> 0% </span>
          </div>
        </div>

        <!-- Total Loans Amount Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #9c27b0">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatCurrency(statisticsData?.loans?.total_amount || 0) }}</h3>
            <p>Jumla ya Mikopo</p>
            <span class="stat-change" :class="getGrowthClass(statisticsData?.loans?.growth)">
              <i :class="getGrowthIcon(statisticsData?.loans?.growth)"></i>
              {{ Math.abs(statisticsData?.loans?.growth || 0) }}%
            </span>
          </div>
        </div>

        <!-- Total Collected Card -->
        <div class="stat-card">
          <div class="stat-icon" style="background: #009688">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-details">
            <h3>{{ formatCurrency(statisticsData?.payments?.total_collected || 0) }}</h3>
            <p>Malipo Yaliyokusanywa</p>
            <span class="stat-change" :class="getGrowthClass(statisticsData?.payments?.growth)">
              <i :class="getGrowthIcon(statisticsData?.payments?.growth)"></i>
              {{ Math.abs(statisticsData?.payments?.growth || 0) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon" style="background: #2196f3">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatNumber(activeLoanPercentage) }}%</div>
            <div class="metric-label">Mikopo Inayoendelea</div>
            <div class="metric-detail">
              {{ formatNumber(statisticsData?.loans?.by_status?.active || 0) }} /
              {{ formatNumber(statisticsData?.loans?.total || 0) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background: #ff9800">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatCurrency(averageLoanAmount) }}</div>
            <div class="metric-label">Wastani wa Mkopo</div>
            <div class="metric-detail">Kwa mkopo mmoja</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background: #4caf50">
            <i class="fas fa-percent"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ collectionRate }}%</div>
            <div class="metric-label">Kiwango cha Ukusanyaji</div>
            <div class="metric-detail">
              {{ formatCurrency(statisticsData?.payments?.total_collected || 0) }} /
              {{ formatCurrency(statisticsData?.loans?.total_amount || 0) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background: #f44336">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatNumber(statisticsData?.overdue?.total || 0) }}</div>
            <div class="metric-label">Malipo Yaliyochelewa</div>
            <div class="metric-detail">
              Jumla: {{ formatCurrency(statisticsData?.overdue?.total_amount || 0) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Status Distribution -->
      <div class="status-distribution">
        <h3>Usambazaji wa Mikopo</h3>
        <div class="status-bars">
          <div class="status-bar-item">
            <div class="status-label">
              <span class="status-color active"></span>
              <span>Inayoendelea</span>
              <span class="status-count">{{
                formatNumber(statisticsData?.loans?.by_status?.active || 0)
              }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill active"
                :style="{ width: activeLoanPercentage + '%' }"
              ></div>
            </div>
          </div>
          <div class="status-bar-item">
            <div class="status-label">
              <span class="status-color paid"></span>
              <span>Iliyolipwa</span>
              <span class="status-count">{{
                formatNumber(statisticsData?.loans?.by_status?.paid || 0)
              }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill paid" :style="{ width: paidLoanPercentage + '%' }"></div>
            </div>
          </div>
          <div class="status-bar-item">
            <div class="status-label">
              <span class="status-color pending"></span>
              <span>Inasubiri</span>
              <span class="status-count">{{
                formatNumber(statisticsData?.loans?.by_status?.pending || 0)
              }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill pending"
                :style="{ width: pendingLoanPercentage + '%' }"
              ></div>
            </div>
          </div>
          <div class="status-bar-item">
            <div class="status-label">
              <span class="status-color defaulted"></span>
              <span>Iliyochelewa</span>
              <span class="status-count">{{
                formatNumber(statisticsData?.loans?.by_status?.defaulted || 0)
              }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill defaulted"
                :style="{ width: defaultedLoanPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Mikopo kwa Mwezi</h3>
            <select v-model="loanChartPeriod" class="chart-select" @change="updateLoanChart">
              <option value="week">Wiki hii</option>
              <option value="month">Mwezi huu</option>
              <option value="quarter">Robo mwaka</option>
              <option value="year">Mwaka huu</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas ref="loanChartCanvas"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>Malipo kwa Mwezi</h3>
            <select v-model="paymentChartPeriod" class="chart-select" @change="updatePaymentChart">
              <option value="week">Wiki hii</option>
              <option value="month">Mwezi huu</option>
              <option value="quarter">Robo mwaka</option>
              <option value="year">Mwaka huu</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas ref="paymentChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <div class="activity-header">
          <h3>Shughuli za Hivi Karibuni</h3>
          <router-link to="/audit-trails" class="view-all">Ona Zote</router-link>
        </div>

        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-details">
              <p class="activity-description">{{ activity.description }}</p>
              <p class="activity-time">{{ formatTime(activity.created_at) }}</p>
            </div>
            <div class="activity-user">
              <img
                :src="activity.user?.avatar || '/default-avatar.png'"
                alt=""
                class="activity-avatar"
              />
              <span>{{ activity.user?.name || 'System' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Payments -->
      <div class="upcoming-payments">
        <div class="section-header">
          <h3>Malipo Yanayokaribia</h3>
          <div class="header-actions">
            <select v-model="upcomingDays" @change="loadUpcomingPayments" class="days-select">
              <option :value="7">Wiki 1</option>
              <option :value="14">Wiki 2</option>
              <option :value="30">Mwezi 1</option>
              <option :value="60">Miezi 2</option>
            </select>
            <router-link to="/payments" class="view-all">Ona Zote</router-link>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Mteja</th>
                <th>Namba ya Mkopo</th>
                <th>Namba ya Awamu</th>
                <th>Kiasi</th>
                <th>Tarehe ya Malipo</th>
                <th>Siku Zilizobaki</th>
                <th>Adhabu</th>
                <th>Hatua</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="upcomingPayments.length === 0">
                <td colspan="8" class="text-center">Hakuna malipo yanayokaribia</td>
              </tr>
              <tr v-for="payment in upcomingPayments" :key="payment.id">
                <td>
                  <div class="customer-info">
                    <img
                      :src="payment.customer?.avatar || '/default-avatar.png'"
                      alt=""
                      class="customer-avatar"
                    />
                    <div>
                      <div class="customer-name">{{ payment.customer?.name || 'N/A' }}</div>
                      <div class="customer-phone" v-if="payment.customer?.phone">
                        {{ payment.customer.phone }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ payment.loan_number || 'N/A' }}</td>
                <td>{{ payment.installment_number || 'N/A' }}</td>
                <td class="amount">{{ formatCurrency(payment.amount) }}</td>
                <td>{{ formatDate(payment.due_date) }}</td>
                <td>
                  <span class="days-badge" :class="getDaysClass(payment.days_remaining)">
                    {{ payment.days_remaining }} siku
                  </span>
                </td>
                <td class="penalty" v-if="payment.penalty > 0">
                  {{ formatCurrency(payment.penalty) }}
                </td>
                <td v-else>-</td>
                <td>
                  <button @click="recordPayment(payment)" class="btn-sm btn-primary">
                    Rekodi Malipo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { useDashboardStore } from '@/stores/dashboard'
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters'

const router = useRouter()
const dashboardStore = useDashboardStore()

// Refs
const loanChartCanvas = ref(null)
const paymentChartCanvas = ref(null)
let loanChartInstance = null
let paymentChartInstance = null

const loanChartPeriod = ref('month')
const paymentChartPeriod = ref('month')
const upcomingDays = ref(7)
const error = ref(null)

// Data from API
const statisticsData = ref(null)
const recentActivities = ref([])
const upcomingPayments = ref([])

const currentDate = ref(
  new Date().toLocaleDateString('sw-TZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

// Computed
const isLoading = computed(() => dashboardStore.loading)

// Loan percentage calculations
const activeLoanPercentage = computed(() => {
  if (!statisticsData.value?.loans?.total) return 0
  const active = statisticsData.value.loans.by_status.active || 0
  const total = statisticsData.value.loans.total
  return Math.round((active / total) * 100)
})

const paidLoanPercentage = computed(() => {
  if (!statisticsData.value?.loans?.total) return 0
  const paid = statisticsData.value.loans.by_status.paid || 0
  const total = statisticsData.value.loans.total
  return Math.round((paid / total) * 100)
})

const pendingLoanPercentage = computed(() => {
  if (!statisticsData.value?.loans?.total) return 0
  const pending = statisticsData.value.loans.by_status.pending || 0
  const total = statisticsData.value.loans.total
  return Math.round((pending / total) * 100)
})

const defaultedLoanPercentage = computed(() => {
  if (!statisticsData.value?.loans?.total) return 0
  const defaulted = statisticsData.value.loans.by_status.defaulted || 0
  const total = statisticsData.value.loans.total
  return Math.round((defaulted / total) * 100)
})

const averageLoanAmount = computed(() => {
  if (!statisticsData.value?.loans?.average_amount) return 0
  return statisticsData.value.loans.average_amount
})

const collectionRate = computed(() => {
  if (!statisticsData.value?.collection_rate) return 0
  return statisticsData.value.collection_rate
})

// Methods
const loadDashboardData = async () => {
  try {
    error.value = null
    await loadStatistics()
    await loadRecentActivities()
    await loadUpcomingPayments()

    await Promise.all([updateLoanChart(), updatePaymentChart()])
  } catch (err) {
    console.error('Error loading dashboard:', err)
    error.value = 'Imeshindwa kupakia data. Tafadhali jaribu tena.'
  }
}

const loadStatistics = async () => {
  try {
    const response = await dashboardStore.fetchStatistics()
    statisticsData.value = response.data
    console.log('Statistics loaded:', statisticsData.value)
  } catch (error) {
    console.error('Error loading statistics:', error)
  }
}

const loadRecentActivities = async () => {
  try {
    const response = await dashboardStore.fetchRecentActivities(10)
    recentActivities.value = response.data || []
  } catch (error) {
    console.error('Error loading recent activities:', error)
    recentActivities.value = []
  }
}

const loadUpcomingPayments = async () => {
  try {
    const response = await dashboardStore.fetchUpcomingPayments(upcomingDays.value, 20)
    upcomingPayments.value = response.data || []
  } catch (error) {
    console.error('Error loading upcoming payments:', error)
    upcomingPayments.value = []
  }
}

const updateLoanChart = async () => {
  try {
    const response = await dashboardStore.fetchLoanChartData(loanChartPeriod.value)
    const chartData = response.data

    if (loanChartInstance) {
      loanChartInstance.destroy()
    }

    if (loanChartCanvas.value && chartData) {
      loanChartInstance = new Chart(loanChartCanvas.value, {
        type: 'line',
        data: {
          labels: chartData.labels || [],
          datasets: chartData.datasets || [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return 'Mikopo: ' + context.parsed.y
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString()
                },
              },
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Error updating loan chart:', error)
  }
}

const updatePaymentChart = async () => {
  try {
    const response = await dashboardStore.fetchPaymentChartData(paymentChartPeriod.value)
    const chartData = response.data

    if (paymentChartInstance) {
      paymentChartInstance.destroy()
    }

    if (paymentChartCanvas.value && chartData) {
      paymentChartInstance = new Chart(paymentChartCanvas.value, {
        type: 'bar',
        data: {
          labels: chartData.labels || [],
          datasets: chartData.datasets || [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return 'TZS ' + context.parsed.y.toLocaleString()
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return 'TZS ' + value.toLocaleString()
                },
              },
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Error updating payment chart:', error)
  }
}

const getGrowthClass = (growth) => {
  if (growth > 0) return 'positive'
  if (growth < 0) return 'negative'
  return 'neutral'
}

const getGrowthIcon = (growth) => {
  if (growth > 0) return 'fas fa-arrow-up'
  if (growth < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const getActivityIcon = (type) => {
  const icons = {
    CREATE: 'fas fa-plus-circle',
    UPDATE: 'fas fa-edit',
    DELETE: 'fas fa-trash',
    PAYMENT: 'fas fa-money-bill',
    LOAN: 'fas fa-hand-holding-usd',
    CUSTOMER: 'fas fa-user',
    LOGIN: 'fas fa-sign-in-alt',
    LOGOUT: 'fas fa-sign-out-alt',
  }
  return icons[type] || 'fas fa-clock'
}

const getDaysClass = (days) => {
  if (days <= 0) return 'badge-danger'
  if (days <= 3) return 'badge-warning'
  if (days <= 7) return 'badge-info'
  return 'badge-success'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Dakika hizi'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dakika zilizopita`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} saa zilizopita`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} siku zilizopita`
  return formatDate(date)
}

const recordPayment = (payment) => {
  router.push(`/app/payments/create?loan_id=${payment.loan_id}&schedule_id=${payment.id}`)
}

// Watches
watch(loanChartPeriod, () => {
  updateLoanChart()
})

watch(paymentChartPeriod, () => {
  updatePaymentChart()
})

watch(upcomingDays, () => {
  loadUpcomingPayments()
})

// Lifecycle
onMounted(() => {
  loadDashboardData()
})

onUnmounted(() => {
  if (loanChartInstance) {
    loanChartInstance.destroy()
  }
  if (paymentChartInstance) {
    paymentChartInstance.destroy()
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.page-header .date {
  color: #666;
  font-size: 1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-state i {
  font-size: 48px;
  color: #f44336;
  margin-bottom: 20px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 24px;
  color: white;
}

.stat-details {
  flex: 1;
}

.stat-details h3 {
  font-size: 24px;
  margin: 0 0 5px;
  color: #333;
}

.stat-details p {
  color: #666;
  margin: 0 0 5px;
  font-size: 14px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.stat-change.positive {
  color: #4caf50;
}

.stat-change.negative {
  color: #f44336;
}

.stat-change.neutral {
  color: #999;
}

.change-direction {
  font-size: 11px;
  text-transform: lowercase;
}

/* Metrics Cards */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.metric-icon i {
  font-size: 24px;
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.metric-detail {
  font-size: 12px;
  color: #999;
}

/* Status Distribution */
.status-distribution {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-distribution h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.1rem;
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-bar-item {
  width: 100%;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 14px;
}

.status-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.status-color.active {
  background: #2196f3;
}

.status-color.paid {
  background: #4caf50;
}

.status-color.pending {
  background: #ff9800;
}

.status-color.defaulted {
  background: #f44336;
}

.status-count {
  margin-left: auto;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.active {
  background: #2196f3;
}

.progress-fill.paid {
  background: #4caf50;
}

.progress-fill.pending {
  background: #ff9800;
}

.progress-fill.defaulted {
  background: #f44336;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.chart-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Recent Activity */
.recent-activity,
.upcoming-payments {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.activity-header,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3,
.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.days-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
}

.view-all {
  color: #2196f3;
  text-decoration: none;
  font-size: 0.9rem;
}

.view-all:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.3s;
}

.activity-item:hover {
  background: #f1f3f5;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.activity-icon.CREATE {
  background: #4caf50;
}

.activity-icon.UPDATE {
  background: #ff9800;
}

.activity-icon.DELETE {
  background: #f44336;
}

.activity-icon.PAYMENT {
  background: #2196f3;
}

.activity-icon.LOAN {
  background: #9c27b0;
}

.activity-icon.CUSTOMER {
  background: #009688;
}

.activity-icon i {
  color: white;
  font-size: 18px;
}

.activity-details {
  flex: 1;
}

.activity-description {
  margin: 0 0 5px;
  color: #333;
  font-size: 0.95rem;
}

.activity-time {
  margin: 0;
  color: #999;
  font-size: 0.8rem;
}

.activity-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.activity-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 12px;
  background: #f8f9fa;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #666;
}

.text-center {
  text-align: center;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-name {
  font-weight: 500;
  color: #333;
}

.customer-phone {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.customer-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.amount {
  font-weight: 500;
  color: #4caf50;
}

.penalty {
  color: #f44336;
  font-weight: 500;
}

.days-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

/* Loading state */
.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .activity-item {
    flex-wrap: wrap;
  }

  .activity-user {
    margin-left: 55px;
    margin-top: 10px;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .table th,
  .table td {
    padding: 8px;
    font-size: 0.85rem;
  }

  .customer-info {
    min-width: 120px;
  }
}
</style>
