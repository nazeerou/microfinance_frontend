<template>
  <div class="customer-list-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Wateja</h1>
        <p class="customer-count" v-if="!loading">
          <!-- Jumla ya wateja: <strong>{{ pagination.total }}</strong> -->
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportCustomers">
          <i class="fas fa-download"></i>
          <span>Pakua</span>
        </button>
        <button class="btn-import" @click="importCustomers">
          <i class="fas fa-upload"></i>
          <span>Ingiza </span>
        </button>
        <router-link to="/customers/create" class="btn-primary">
          <i class="fas fa-user-plus"></i>
          <span>Sajili Mteja</span>
        </router-link>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="filters-grid">
        <!-- Search -->
        <div class="filter-group search-group">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="filters.search"
              @input="debouncedSearch"
              placeholder="Tafuta kwa jina, simu, au kitambulisho..."
              class="form-control search-input"
            />
            <button v-if="filters.search" class="clear-search" @click="clearSearch">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <label>
            <i class="fas fa-filter"></i>
            Hali
          </label>
          <select v-model="filters.status" @change="loadCustomers" class="form-control">
            <option value="">Wote</option>
            <option value="active">Wanaofanya kazi</option>
            <option value="inactive">Hawafanyi kazi</option>
            <option value="blacklisted">Wamepigwa marufuku</option>
          </select>
        </div>

        <!-- Sort By -->
        <div class="filter-group">
          <label>
            <i class="fas fa-sort"></i>
            Panga kwa
          </label>
          <select v-model="filters.sortBy" @change="loadCustomers" class="form-control">
            <option value="created_at">Tarehe ya Kujiunga</option>
            <option value="first_name">Jina</option>
            <option value="monthly_income">Kipato</option>
          </select>
        </div>

        <!-- Sort Order -->
        <div class="filter-group">
          <label>
            <i class="fas fa-sort-amount-down"></i>
            Mpango
          </label>
          <select v-model="filters.sortOrder" @change="loadCustomers" class="form-control">
            <option value="desc">Kushuka (Zinazoanza)</option>
            <option value="asc">Kupanda (Zinazomaliza)</option>
          </select>
        </div>

        <!-- Items Per Page -->
        <div class="filter-group">
          <label>
            <i class="fas fa-list"></i>
            Idadi kwa Ukurasa
          </label>
          <select v-model="filters.perPage" @change="loadCustomers" class="form-control">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="active-filters-label">
          <i class="fas fa-filter"></i>
          Vichujio vilivyowekwa:
        </span>
        <div class="filter-tags">
          <span v-if="filters.search" class="filter-tag">
            <i class="fas fa-search"></i>
            "{{ filters.search }}"
            <i @click="clearFilter('search')" class="fas fa-times remove-filter"></i>
          </span>
          <span v-if="filters.status" class="filter-tag">
            <i class="fas fa-tag"></i>
            {{ getStatusText(filters.status) }}
            <i @click="clearFilter('status')" class="fas fa-times remove-filter"></i>
          </span>
          <button @click="clearAllFilters" class="clear-all-btn">
            <i class="fas fa-trash-alt"></i>
            Futa yote
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3498db, #2980b9)">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.total }}</span>
          <span class="stat-label">Jumla ya Wateja</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f39c12, #e67e22)">
          <i class="fas fa-hand-holding-usd"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.withLoans }}</span>
          <span class="stat-label">Wenye Mikopo</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b)">
          <i class="fas fa-ban"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.blacklisted }}</span>
          <span class="stat-label">Wamepigwa Marufuku</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #9b59b6, #8e44ad)">
          <i class="fas fa-coins"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ formatCurrency(statistics.totalLoans) }}</span>
          <span class="stat-label">Jumla ya Mikopo</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Inapakia wateja...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Hitilafu imetokea</h3>
      <p>{{ error }}</p>
      <button @click="loadCustomers" class="btn-retry">
        <i class="fas fa-redo"></i>
        Jaribu Tena
      </button>
    </div>

    <!-- Customers Table -->
    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="customers-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              </th>
              <th>Mteja</th>
              <th>Mawasiliano</th>
              <th>Kitambulisho</th>
              <th>Kazi / Kipato</th>
              <th>Hali</th>
              <th>Tarehe</th>
              <th>Vitendo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in customers"
              :key="customer.id"
              :class="{ 'row-selected': selectedCustomers.includes(customer.id) }"
            >
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  v-model="selectedCustomers"
                  :value="customer.id"
                  @change="updateSelectAll"
                />
              </td>
              <td>
                <div class="customer-cell">
                  <div class="customer-avatar-wrapper">
                    <img
                      :src="getCustomerProfilePhoto(customer)"
                      :alt="customer.first_name"
                      class="customer-avatar"
                      @error="handleImageError"
                    />
                    <span class="status-indicator" :class="customer.status"></span>
                  </div>
                  <div class="customer-info">
                    <span class="customer-name">
                      {{ customer.first_name }} {{ customer.last_name }}
                    </span>
                    <span class="customer-number">#{{ customer.customer_number }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <span class="contact-item">
                    <i class="fas fa-phone-alt"></i>
                    {{ customer.phone }}
                  </span>
                </div>
              </td>
              <td>
                <div class="id-info">
                  <span class="id-type">{{ customer.id_type || 'NIDA' }}</span>
                </div>
              </td>
              <td>
                <div class="income-info">
                  <span class="occupation">{{ customer.occupation }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="customer.status">
                  {{ getStatusText(customer.status) }}
                </span>
              </td>
              <td>
                <div class="date-info">
                  <span class="date">{{ formatDate(customer.created_at) }}</span>
                  <span class="time">{{ formatTime(customer.created_at) }}</span>
                </div>
              </td>
              <td>
                <div class="action-dropdown" ref="actionDropdownRef">
                  <button class="action-menu-btn" @click.stop="toggleActionMenu(customer.id)">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <div v-if="activeActionMenu === customer.id" class="action-menu">
                    <router-link
                      :to="`/customers/${customer.id}`"
                      class="action-menu-item"
                      @click="closeActionMenu"
                    >
                      <i class="fas fa-eye"></i>
                      <span>Angalia</span>
                    </router-link>
                    <router-link
                      :to="`/customers/${customer.id}/edit`"
                      class="action-menu-item"
                      @click="closeActionMenu"
                    >
                      <i class="fas fa-edit"></i>
                      <span>Hariri</span>
                    </router-link>
                    <button @click="viewCustomerLoans(customer)" class="action-menu-item">
                      <i class="fas fa-hand-holding-usd"></i>
                      <span>Mikopo yake</span>
                    </button>
                    <button
                      @click="toggleCustomerStatus(customer)"
                      class="action-menu-item"
                      :class="{ 'text-danger': customer.status === 'active' }"
                    >
                      <i
                        :class="customer.status === 'active' ? 'fas fa-ban' : 'fas fa-check-circle'"
                      ></i>
                      <span>{{ customer.status === 'active' ? 'Zima' : 'Washa' }}</span>
                    </button>
                    <button @click="confirmDelete(customer)" class="action-menu-item text-danger">
                      <i class="fas fa-trash-alt"></i>
                      <span>Futa</span>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="customers.length === 0">
              <td colspan="9" class="text-center">
                <div class="empty-state-small">
                  <i class="fas fa-users"></i>
                  <p>Hakuna wateja waliopatikana</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedCustomers.length > 0" class="bulk-actions">
        <div class="bulk-info">
          <i class="fas fa-check-circle"></i>
          <span
            >Umechagua <strong>{{ selectedCustomers.length }}</strong> wateja</span
          >
        </div>
        <div class="bulk-buttons">
          <button class="btn-bulk" @click="bulkActivate">
            <i class="fas fa-check"></i>
            Washa
          </button>
          <button class="btn-bulk" @click="bulkDeactivate">
            <i class="fas fa-ban"></i>
            Zima
          </button>
          <button class="btn-bulk text-danger" @click="confirmBulkDelete">
            <i class="fas fa-trash-alt"></i>
            Futa
          </button>
          <button class="btn-bulk" @click="clearSelection">
            <i class="fas fa-times"></i>
            Ghairi
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.lastPage > 1">
        <div class="pagination-info">
          Showing {{ pagination.from }} - {{ pagination.to }} of {{ pagination.total }} entries
        </div>
        <div class="pagination-buttons">
          <button
            @click="changePage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
            v-for="page in paginationPages"
            :key="page"
            @click="changePage(page)"
            class="pagination-btn"
            :class="{ active: page === pagination.currentPage }"
          >
            {{ page }}
          </button>

          <button
            @click="changePage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage === pagination.lastPage"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Loans Modal -->
    <div v-if="showLoansModal" class="modal-overlay" @click="closeLoansModal">
      <div class="modal-content loans-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-header-left">
            <i class="fas fa-hand-holding-usd"></i>
            <h3>Mikopo ya {{ selectedCustomer?.first_name }} {{ selectedCustomer?.last_name }}</h3>
          </div>
          <div class="modal-header-actions">
            <button class="btn-refresh" @click="refreshCustomerLoans" title="Onyesha upya">
              <i class="fas fa-sync-alt" :class="{ rotating: customerLoansLoading }"></i>
            </button>
            <button class="close-btn" @click="closeLoansModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="modal-body loans-modal-body">
          <!-- Summary Cards -->
          <div class="loans-summary-cards">
            <div class="summary-card-mini total">
              <div class="summary-icon">
                <i class="fas fa-coins"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Jumla ya Mikopo</span>
                <span class="summary-value">{{ customerLoansSummary.total }}</span>
              </div>
            </div>
            <div class="summary-card-mini active">
              <div class="summary-icon">
                <i class="fas fa-play-circle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Inayoendelea</span>
                <span class="summary-value">{{ customerLoansSummary.active }}</span>
              </div>
            </div>
            <div class="summary-card-mini completed">
              <div class="summary-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Imekamilika</span>
                <span class="summary-value">{{ customerLoansSummary.completed }}</span>
              </div>
            </div>
            <div class="summary-card-mini defaulted">
              <div class="summary-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Imechelewa</span>
                <span class="summary-value">{{ customerLoansSummary.defaulted }}</span>
              </div>
            </div>
          </div>

          <!-- Amount Summary -->
          <div class="amount-summary">
            <div class="amount-item">
              <span class="amount-label">Jumla ya Kiasi:</span>
              <span class="amount-value">{{
                formatCurrency(customerLoansSummary.total_amount)
              }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Imelipwa:</span>
              <span class="amount-value success">{{
                formatCurrency(customerLoansSummary.paid_amount)
              }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Inayodaiwa:</span>
              <span class="amount-value warning">{{
                formatCurrency(customerLoansSummary.outstanding)
              }}</span>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="customerLoansLoading" class="loading-state">
            <div class="spinner"></div>
            <span>Inapakia mikopo...</span>
          </div>

          <!-- Loans Grid -->
          <div v-else-if="customerLoans.length > 0" class="loans-grid">
            <div
              v-for="loan in customerLoans"
              :key="loan.id"
              class="loan-card"
              @click="viewLoanDetails(loan)"
            >
              <div class="loan-card-header">
                <div class="loan-title">
                  <span class="loan-number">#{{ loan.loan_number }}</span>
                  <span class="loan-status-badge" :class="loan.status">
                    {{ getLoanStatusText(loan.status) }}
                  </span>
                </div>
                <span class="loan-date">{{ formatDate(loan.created_at) }}</span>
              </div>

              <div class="loan-card-body">
                <div class="loan-amounts">
                  <div class="amount-row">
                    <span class="label">Kiasi:</span>
                    <span class="value">{{ formatCurrency(loan.amount) }}</span>
                  </div>
                  <div class="amount-row">
                    <span class="label">Imelipwa:</span>
                    <span class="value success">{{ formatCurrency(loan.paid_amount || 0) }}</span>
                  </div>
                  <div class="amount-row">
                    <span class="label">Imebaki:</span>
                    <span class="value" :class="{ 'text-danger': loan.balance > 0 }">
                      {{ formatCurrency(loan.balance) }}
                    </span>
                  </div>
                </div>

                <!-- Payment Status -->
                <div class="payment-status-section">
                  <div class="status-header">
                    <i class="fas fa-credit-card"></i>
                    <span>Hali ya Malipo</span>
                  </div>
                  <div class="payment-progress">
                    <div class="progress-bar-mini">
                      <div
                        class="progress-fill-mini"
                        :style="{ width: loan.payment_progress + '%' }"
                        :class="{
                          success: loan.payment_progress === 100,
                          warning: loan.payment_progress > 0 && loan.payment_progress < 100,
                          danger: loan.payment_progress === 0 && loan.balance > 0,
                        }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ loan.payment_progress }}%</span>
                  </div>
                </div>

                <!-- Payment Schedule Summary -->
                <div class="payment-schedule-summary" v-if="loan.next_payment">
                  <div class="next-payment">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Malipo yajayo: {{ formatDate(loan.next_payment.due_date) }}</span>
                  </div>
                  <div class="payment-amount-mini">
                    <span>{{ formatCurrency(loan.next_payment.amount) }}</span>
                    <span class="status-dot" :class="loan.next_payment.status"></span>
                  </div>
                </div>

                <!-- Overdue Warning -->
                <div v-if="loan.overdue_count > 0" class="overdue-warning">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>Imechelewa kwa awamu {{ loan.overdue_count }}</span>
                </div>
              </div>

              <div class="loan-card-footer">
                <div class="loan-terms">
                  <span><i class="fas fa-clock"></i> {{ loan.duration_months }} miezi</span>
                  <span><i class="fas fa-percent"></i> {{ loan.interest_rate }}%</span>
                </div>
                <button class="btn-view-loan" @click.stop="viewLoanDetails(loan)">
                  <i class="fas fa-eye"></i>
                  <span>Angalia</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="fas fa-hand-holding-usd"></i>
            <p>Hakuna mikopo kwa mteja huyu</p>
            <router-link
              :to="`/loans/create?customer_id=${selectedCustomer?.id}`"
              class="btn-primary"
            >
              <i class="fas fa-plus-circle"></i>
              Omba Mkopo
            </router-link>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeLoansModal" class="btn-secondary">Funga</button>
          <router-link
            v-if="selectedCustomer"
            :to="`/loans/create?customer_id=${selectedCustomer.id}`"
            class="btn-primary"
          >
            <i class="fas fa-plus-circle"></i>
            Omba Mkopo Mpya
          </router-link>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon warning">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Futa Mteja</h3>
          <button class="close-btn" @click="closeDeleteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Una uhakika unataka kumfuta mteja huyu?</p>
          <p class="warning-text" v-if="customerToDelete">
            <strong>{{ customerToDelete.first_name }} {{ customerToDelete.last_name }}</strong>
          </p>
          <p class="warning-note">
            <i class="fas fa-info-circle"></i>
            Hatua hii haiwezi kutenguliwa. Mteja atafutwa kabisa kwenye mfumo.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">
            <i class="fas fa-times"></i>
            Ghairi
          </button>
          <button @click="deleteCustomer" class="btn-danger" :disabled="deleteLoading">
            <span v-if="deleteLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-trash-alt"></i>
              Futa Mteja
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteModal" class="modal-overlay" @click="closeBulkDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon warning">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Futa Wateja Wengi</h3>
          <button class="close-btn" @click="closeBulkDeleteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Una uhakika unataka kufuta wateja <strong>{{ selectedCustomers.length }}</strong
            >?
          </p>
          <div class="selected-list">
            <div v-for="id in selectedCustomers.slice(0, 5)" :key="id" class="selected-item">
              <i class="fas fa-user"></i>
              <span>{{ getCustomerName(id) }}</span>
            </div>
            <div v-if="selectedCustomers.length > 5" class="more-items">
              ... na wengine {{ selectedCustomers.length - 5 }}
            </div>
          </div>
          <p class="warning-note">
            <i class="fas fa-info-circle"></i>
            Hatua hii haiwezi kutenguliwa. Wateja watafutwa kabisa kwenye mfumo.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeBulkDeleteModal" class="btn-secondary">
            <i class="fas fa-times"></i>
            Ghairi
          </button>
          <button @click="bulkDelete" class="btn-danger" :disabled="deleteLoading">
            <span v-if="deleteLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-trash-alt"></i>
              Futa Wote
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification" :class="toastType">
      <i :class="toastIcon"></i>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import debounce from 'lodash/debounce'

const router = useRouter()
const customerStore = useCustomerStore()

const defaultAvatar = ref('/default-avatar.png')

// State
const customers = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCustomers = ref([])
const selectAll = ref(false)
const showDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const customerToDelete = ref(null)
const deleteLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const activeActionMenu = ref(null)

// Refs
const actionDropdownRef = ref([])

const filters = reactive({
  search: '',
  status: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  perPage: 10,
  page: 1,
})

const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
  from: 0,
  to: 0,
})

const statistics = ref({
  total: 0,
  active: 0,
  withLoans: 0,
  blacklisted: 0,
  totalLoans: 0,
})

// Computed
const hasActiveFilters = computed(() => {
  return filters.search || filters.status
})

const paginationPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(pagination.lastPage, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const toastIcon = computed(() => {
  return toastType.value === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
})

// Methods
const loadCustomers = async () => {
  loading.value = true
  error.value = null

  try {
    const params = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
      per_page: filters.perPage,
      page: filters.page,
    }

    const response = await customerStore.fetchCustomers(params)

    console.log('API Response:', response) // Helpful for debugging

    // Check if response has the expected structure
    if (response && response.success && response.data) {
      // The customers are in response.data.data
      const responseData = response.data

      // Set customers array
      customers.value = responseData.data || []

      // Set pagination data from the nested structure
      pagination.currentPage = responseData.current_page || 1
      pagination.lastPage = responseData.last_page || 1
      pagination.perPage = responseData.per_page || filters.perPage
      pagination.total = responseData.total || 0
      pagination.from = responseData.from || 0
      pagination.to = responseData.to || 0

      console.log('Customers loaded:', customers.value)
    } else {
      // Fallback for different response structures
      console.warn('Unexpected response structure:', response)
      customers.value = response.data?.data || response.data || []
    }

    // Update statistics
    await loadStatistics()
  } catch (err) {
    console.error('Error loading customers:', err)
    error.value = err.response?.data?.message || 'Imeshindwa kupakia wateja. Tafadhali jaribu tena.'
  } finally {
    loading.value = false
  }
}

// Method to get customer profile photo
const getCustomerProfilePhoto = (customer) => {
  if (!customer) return defaultAvatar.value

  // Use profile_photo_url if available (from API)
  if (customer.profile_photo_url) {
    return customer.profile_photo_url
  }

  // If profile_photo exists but no URL, construct it
  if (customer.profile_photo) {
    // const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
    const baseUrl = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

    return `${baseUrl}/storage/${customer.profile_photo}`
  }

  return defaultAvatar.value
}

const loadStatistics = async () => {
  try {
    // Calculate statistics from the loaded customers
    const activeCount = customers.value.filter((c) => c.status === 'active').length
    const blacklistedCount = customers.value.filter((c) => c.status === 'blacklisted').length
    const withLoansCount = customers.value.filter((c) => (c.loans_count || 0) > 0).length
    const totalLoansAmount = customers.value.reduce(
      (sum, c) => sum + (parseFloat(c.total_loans) || 0),
      0,
    )

    statistics.value = {
      total: pagination.total || customers.value.length,
      active: activeCount,
      withLoans: withLoansCount,
      blacklisted: blacklistedCount,
      totalLoans: totalLoansAmount,
    }

    console.log('Statistics updated:', statistics.value)
  } catch (err) {
    console.error('Error loading statistics:', err)
  }
}

const debouncedSearch = debounce(() => {
  filters.page = 1
  loadCustomers()
}, 500)

const clearSearch = () => {
  filters.search = ''
  filters.page = 1
  loadCustomers()
}

const clearFilter = (filter) => {
  filters[filter] = ''
  filters.page = 1
  loadCustomers()
}

const clearAllFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.sortBy = 'created_at'
  filters.sortOrder = 'desc'
  filters.perPage = 10
  filters.page = 1
  loadCustomers()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.lastPage) {
    filters.page = page
    loadCustomers()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getStatusText = (status) => {
  const statusMap = {
    active: 'Anafanya kazi',
    inactive: 'Hafanyi kazi',
    blacklisted: 'Amepigwa marufuku',
  }
  return statusMap[status] || status
}

const getCustomerName = (id) => {
  const customer = customers.value.find((c) => c.id === id)
  return customer ? `${customer.first_name} ${customer.last_name}` : ''
}

// Action Menu methods
const toggleActionMenu = (customerId) => {
  if (activeActionMenu.value === customerId) {
    activeActionMenu.value = null
  } else {
    activeActionMenu.value = customerId
  }
}

const closeActionMenu = () => {
  activeActionMenu.value = null
}

// Handle click outside to close action menu
const handleClickOutside = (event) => {
  if (!event.target.closest('.action-dropdown')) {
    closeActionMenu()
  }
}

// Selection methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedCustomers.value = customers.value.map((c) => c.id)
  } else {
    selectedCustomers.value = []
  }
}

const updateSelectAll = () => {
  selectAll.value = selectedCustomers.value.length === customers.value.length
}

const clearSelection = () => {
  selectedCustomers.value = []
  selectAll.value = false
}

// Action methods
const viewLoans = (customer) => {
  router.push(`/loans?customer_id=${customer.id}`)
  showToastMessage(`Unaangalia mikopo ya ${customer.first_name} ${customer.last_name}`, 'info')
  closeActionMenu()
}

const toggleCustomerStatus = async (customer) => {
  const newStatus = customer.status === 'active' ? 'inactive' : 'active'
  const action = customer.status === 'active' ? 'kumzuia' : 'kumwezesha'

  if (confirm(`Una uhakika unataka ${action} mteja huyu?`)) {
    try {
      await customerStore.updateCustomerStatus(customer.id, newStatus)
      customer.status = newStatus
      showToastMessage(`Mteja ame${action}wa kwa mafanikio`, 'success')
      await loadStatistics()
      closeActionMenu()
    } catch (error) {
      showToastMessage('Hitilafu imetokea. Tafadhali jaribu tena.', 'error')
    }
  }
}

// Delete methods
const confirmDelete = (customer) => {
  customerToDelete.value = customer
  showDeleteModal.value = true
  closeActionMenu()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  customerToDelete.value = null
}

const deleteCustomer = async () => {
  if (!customerToDelete.value) return

  deleteLoading.value = true

  try {
    await customerStore.deleteCustomer(customerToDelete.value.id)
    showToastMessage('Mteja amefutwa kwa mafanikio', 'success')
    closeDeleteModal()
    await loadCustomers()
    clearSelection()
  } catch (error) {
    showToastMessage('Hitilafu imetokea wakati wa kufuta', 'error')
  } finally {
    deleteLoading.value = false
  }
}

// Bulk actions
const bulkActivate = async () => {
  if (selectedCustomers.value.length === 0) return

  try {
    await Promise.all(
      selectedCustomers.value.map((id) => customerStore.updateCustomerStatus(id, 'active')),
    )
    showToastMessage(`Wateja ${selectedCustomers.value.length} wamewashwa`, 'success')
    await loadCustomers()
    clearSelection()
  } catch (error) {
    showToastMessage('Hitilafu imetokea', 'error')
  }
}

const bulkDeactivate = async () => {
  if (selectedCustomers.value.length === 0) return

  try {
    await Promise.all(
      selectedCustomers.value.map((id) => customerStore.updateCustomerStatus(id, 'inactive')),
    )
    showToastMessage(`Wateja ${selectedCustomers.value.length} wamezimwa`, 'success')
    await loadCustomers()
    clearSelection()
  } catch (error) {
    showToastMessage('Hitilafu imetokea', 'error')
  }
}

const confirmBulkDelete = () => {
  if (selectedCustomers.value.length === 0) return
  showBulkDeleteModal.value = true
}

const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false
}

const bulkDelete = async () => {
  if (selectedCustomers.value.length === 0) return

  deleteLoading.value = true

  try {
    await Promise.all(selectedCustomers.value.map((id) => customerStore.deleteCustomer(id)))
    showToastMessage(`Wateja ${selectedCustomers.value.length} wamefutwa`, 'success')
    closeBulkDeleteModal()
    await loadCustomers()
    clearSelection()
  } catch (error) {
    showToastMessage('Hitilafu imetokea', 'error')
  } finally {
    deleteLoading.value = false
  }
}

// Export/Import
const exportCustomers = async () => {
  try {
    showToastMessage('Wateja wanapakuliwa...', 'info')
    await customerStore.exportCustomers(filters)
    showToastMessage('Wateja wamepakuliwa kwa mafanikio', 'success')
  } catch (error) {
    showToastMessage('Hitilafu wakati wa kupakua', 'error')
  }
}

const importCustomers = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,.xlsx,.xls'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        await customerStore.importCustomers(file)
        showToastMessage('Wateja wameingizwa kwa mafanikio', 'success')
        await loadCustomers()
      } catch (error) {
        showToastMessage('Hitilafu wakati wa kuingiza', 'error')
      }
    }
  }
  input.click()
}

// Toast methods
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loadCustomers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Add all the styles from the previous version here */

/* Action Dropdown */
.action-dropdown {
  position: relative;
  display: inline-block;
}

.action-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-menu-btn:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.action-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.action-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  transition: background 0.3s;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
}

.action-menu-item:hover {
  background: #f8fafc;
}

.action-menu-item i {
  width: 18px;
  color: #666;
}

.action-menu-item.text-danger {
  color: #e74c3c;
}

.action-menu-item.text-danger i {
  color: #e74c3c;
}

.customer-list-container {
  padding: 5px 10px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left h1 {
  font-size: 2rem;
  color: #1a2639;
  margin: 0 0 5px;
  font-weight: 600;
}

.customer-count {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-export,
.btn-import {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
}

.btn-export {
  background: white;
  color: #27ae60;
  border: 1px solid #27ae60;
}

.btn-export:hover {
  background: #27ae60;
  color: white;
}

.btn-import {
  background: white;
  color: #f39c12;
  border: 1px solid #f39c12;
}

.btn-import:hover {
  background: #f39c12;
  color: white;
}

/* Filters Card */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 15px;
}

@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .search-group {
    grid-column: span 3;
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .search-group {
    grid-column: span 1;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.filter-group label i {
  color: #3498db;
  font-size: 0.9rem;
}

.search-input-wrapper {
  position: relative;
  width: 80%;
}

.search-icon {
  position: absolute;
  /* left: 2px; */
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 0.9rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 35px 12px 35px;
  border: 2px solid #eef2f6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
}

.clear-search:hover {
  color: #e74c3c;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #eef2f6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Active Filters */
.active-filters {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.active-filters-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.9rem;
}

.filter-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 0.85rem;
}

.filter-tag i:first-child {
  font-size: 0.8rem;
}

.remove-filter {
  cursor: pointer;
  padding: 2px;
}

.remove-filter:hover {
  color: #e74c3c;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
}

.clear-all-btn:hover {
  text-decoration: underline;
}

/* Statistics Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2639;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #eef2f6;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.error-state i {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 15px;
}

.error-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 10px 25px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
  margin: 0 -20px;
  padding: 0 20px;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.customers-table th {
  text-align: left;
  padding: 15px 10px;
  background: #f8fafc;
  color: #1a2639;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #eef2f6;
}

.customers-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #eef2f6;
  color: #666;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.customers-table tbody tr:hover {
  background: #f8fafc;
}

.customers-table tbody tr.row-selected {
  background: #e3f2fd;
}

/* Customer Cell */
.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar-wrapper {
  position: relative;
}

.customer-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eef2f6;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.active {
  background: #27ae60;
}

.status-indicator.inactive {
  background: #f39c12;
}

.status-indicator.blacklisted {
  background: #e74c3c;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.customer-number {
  font-size: 0.8rem;
  color: #999;
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.contact-item i {
  width: 16px;
  color: #3498db;
  font-size: 0.85rem;
}

/* ID Info */
.id-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.id-number {
  font-size: 0.9rem;
  color: #333;
  font-family: monospace;
}

.id-type {
  font-size: 0.75rem;
  color: #999;
  background: #eef2f6;
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

/* Income Info */
.income-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.occupation {
  font-size: 0.9rem;
  color: #333;
}

.income {
  font-size: 0.85rem;
  color: #27ae60;
  font-weight: 500;
}

/* Loans Info */
.loans-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.loans-count {
  font-size: 0.9rem;
  color: #333;
}

.loans-total {
  font-size: 0.85rem;
  color: #f39c12;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #fff3cd;
  color: #856404;
}

.status-badge.blacklisted {
  background: #f8d7da;
  color: #721c24;
}

/* Date Info */
.date-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date {
  font-size: 0.9rem;
  color: #333;
}

.time {
  font-size: 0.75rem;
  color: #999;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.btn-icon.text-danger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}

/* Bulk Actions */
.bulk-actions {
  margin-top: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1976d2;
}

.bulk-info i {
  font-size: 1.2rem;
}

.bulk-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-bulk {
  padding: 8px 15px;
  border-radius: 6px;
  border: none;
  background: white;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-bulk:hover {
  background: #f8fafc;
  color: #333;
}

.btn-bulk.text-danger:hover {
  background: #fee;
  color: #e74c3c;
}

/* Pagination */
.pagination {
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 35px;
  height: 35px;
  border-radius: 6px;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.pagination-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.delete-modal .modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-icon.warning {
  background: #fee;
  color: #e74c3c;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  padding: 5px;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 25px;
}

.warning-text {
  font-size: 1.1rem;
  color: #333;
  margin: 15px 0;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f39c12;
  font-size: 0.9rem;
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 8px;
}

.selected-list {
  margin: 15px 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eef2f6;
  border-radius: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-bottom: 1px solid #eef2f6;
}

.selected-item:last-child {
  border-bottom: none;
}

.selected-item i {
  color: #3498db;
}

.more-items {
  padding: 10px 15px;
  color: #999;
  font-style: italic;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-danger {
  padding: 10px 20px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInRight 0.3s ease;
  z-index: 2100;
  border-left: 4px solid;
}

.toast-notification.success {
  border-left-color: #27ae60;
}

.toast-notification.error {
  border-left-color: #e74c3c;
}

.toast-notification.info {
  border-left-color: #3498db;
}

.toast-notification i {
  font-size: 1.2rem;
}

.toast-notification.success i {
  color: #27ae60;
}

.toast-notification.error i {
  color: #e74c3c;
}

.toast-notification.info i {
  color: #3498db;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .customer-list-container {
    padding: 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary,
  .btn-export,
  .btn-import {
    flex: 1;
    justify-content: center;
  }

  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .bulk-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .bulk-buttons {
    width: 100%;
  }

  .btn-bulk {
    flex: 1;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-buttons {
    width: 100%;
    justify-content: center;
  }

  .toast-notification {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>
