<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="date">{{ currentDate }}</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in statistics" :key="stat.title">
        <div class="stat-icon" :style="{ background: stat.bgColor }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-details">
          <h3>{{ formatNumber(stat.value) }}</h3>
          <p>{{ stat.title }}</p>
          <span class="stat-change" :class="stat.changeType">
            <i :class="stat.changeIcon"></i> {{ stat.change }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Mikopo kwa Mwezi</h3>
          <select v-model="loanChartPeriod" class="chart-select">
            <option value="week">Wiki hii</option>
            <option value="month">Mwezi huu</option>
            <option value="year">Mwaka huu</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="loanChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>Malipo kwa Mwezi</h3>
          <select v-model="paymentChartPeriod" class="chart-select">
            <option value="week">Wiki hii</option>
            <option value="month">Mwezi huu</option>
            <option value="year">Mwaka huu</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas ref="paymentChart"></canvas>
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
        <router-link to="/payments" class="view-all">Ona Yote</router-link>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Mteja</th>
              <th>Namba ya Mkopo</th>
              <th>Kiasi</th>
              <th>Tarehe ya Malipo</th>
              <th>Siku Zilizobaki</th>
              <th>Hatua</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="upcomingPayments.length === 0">
              <td colspan="6" class="text-center">Hakuna malipo yanayokaribia</td>
            </tr>
            <tr v-for="payment in upcomingPayments" :key="payment.id">
              <td>
                <div class="customer-info">
                  <img
                    :src="payment.customer?.avatar || '/default-avatar.png'"
                    alt=""
                    class="customer-avatar"
                  />
                  <span>{{ payment.customer?.name || 'N/A' }}</span>
                </div>
              </td>
              <td>{{ payment.loan_number || 'N/A' }}</td>
              <td>{{ formatCurrency(payment.amount) }}</td>
              <td>{{ formatDate(payment.due_date) }}</td>
              <td>
                <span class="days-badge" :class="getDaysClass(payment.days_remaining)">
                  {{ payment.days_remaining }} siku
                </span>
              </td>
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
</template>

<script setup>
// ✅ FIX: Import all necessary Vue functions
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { useDashboardStore } from '@/stores/dashboard'
// Import formatters
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters'

const router = useRouter()
const dashboardStore = useDashboardStore()

// Refs
const loanChart = ref(null)
const paymentChart = ref(null)
let loanChartInstance = null
let paymentChartInstance = null

const loanChartPeriod = ref('month')
const paymentChartPeriod = ref('month')
const error = ref(null)

// Data
const statistics = ref([
  {
    title: 'Wateja',
    value: 0,
    icon: 'fas fa-users',
    bgColor: '#4CAF50',
    change: '+12',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
  },
  {
    title: 'Mikopo Inayoendelea',
    value: 0,
    icon: 'fas fa-hand-holding-usd',
    bgColor: '#2196F3',
    change: '+5',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
  },
  {
    title: 'Mikopo Iliyolipwa',
    value: 0,
    icon: 'fas fa-check-circle',
    bgColor: '#FF9800',
    change: '+8',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
  },
  {
    title: 'Mikopo Iliyochelewa',
    value: 0,
    icon: 'fas fa-exclamation-triangle',
    bgColor: '#f44336',
    change: '-2',
    changeType: 'negative',
    changeIcon: 'fas fa-arrow-down',
  },
  {
    title: 'Jumla ya Mikopo',
    value: 0,
    icon: 'fas fa-money-bill-wave',
    bgColor: '#9C27B0',
    change: '+15%',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
  },
  {
    title: 'Faida',
    value: 0,
    icon: 'fas fa-chart-line',
    bgColor: '#009688',
    change: '+20%',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
  },
])

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

// ✅ Computed property - now properly imported and defined
const isLoading = computed(() => dashboardStore.loading)

// ✅ Another computed property example (you can add more as needed)
const totalActiveLoans = computed(() => {
  const activeStat = statistics.value.find((s) => s.title === 'Mikopo Inayoendelea')
  return activeStat ? activeStat.value : 0
})

// Methods
const loadDashboardData = async () => {
  try {
    error.value = null
    const data = await dashboardStore.fetchDashboardData()

    // Update statistics
    statistics.value = statistics.value.map((stat) => {
      switch (stat.title) {
        case 'Wateja':
          stat.value = data.statistics?.customers?.total || 0
          break
        case 'Mikopo Inayoendelea':
          stat.value = data.statistics?.loans?.by_status?.active || 0
          break
        case 'Mikopo Iliyolipwa':
          stat.value = data.statistics?.loans?.by_status?.paid || 0
          break
        case 'Mikopo Iliyochelewa':
          stat.value = data.statistics?.loans?.by_status?.defaulted || 0
          break
        case 'Jumla ya Mikopo':
          stat.value = data.statistics?.loans?.total_amount || 0
          break
        case 'Faida':
          stat.value = data.statistics?.payments?.total_collected || 0
          break
      }
      return stat
    })

    recentActivities.value = data.recent_activities || []
    upcomingPayments.value = data.upcoming_payments || []

    // Update charts after data is loaded
    setTimeout(() => {
      updateCharts()
    }, 100)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    error.value = 'Imeshindwa kupakia data. Tafadhali jaribu tena.'
  }
}

const updateCharts = async () => {
  try {
    // Update Loan Chart
    const loanData = await dashboardStore.fetchLoanChartData(loanChartPeriod.value)
    if (loanChartInstance) {
      loanChartInstance.destroy()
    }

    if (loanChart.value) {
      loanChartInstance = new Chart(loanChart.value, {
        type: 'line',
        data: {
          labels: loanData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
          datasets: [
            {
              label: 'Mikopo',
              data: loanData.datasets?.[0]?.data || loanData.values || [0, 0, 0, 0, 0, 0],
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
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

    // Update Payment Chart
    const paymentData = await dashboardStore.fetchPaymentChartData(paymentChartPeriod.value)
    if (paymentChartInstance) {
      paymentChartInstance.destroy()
    }

    if (paymentChart.value) {
      paymentChartInstance = new Chart(paymentChart.value, {
        type: 'bar',
        data: {
          labels: paymentData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
          datasets: [
            {
              label: 'Malipo',
              data: paymentData.datasets?.[0]?.data || paymentData.values || [0, 0, 0, 0, 0, 0],
              backgroundColor: '#4CAF50',
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
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
    console.error('Error updating charts:', error)
  }
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
  return formatDate(date)
}

const recordPayment = (payment) => {
  router.push(`/app/payments/create?loan_id=${payment.loan_id}`)
}

// Watches
watch(loanChartPeriod, () => {
  updateCharts()
})

watch(paymentChartPeriod, () => {
  updateCharts()
})

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 10px; */
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
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

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
}

.chart-container {
  height: 300px;
  position: relative;
}

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

.customer-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
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

@media (max-width: 768px) {
  .stats-grid {
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
  }
}
</style>
