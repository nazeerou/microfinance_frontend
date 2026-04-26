<template>
  <div class="customer-list-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Wateja</h1>
        <p class="customer-count" v-if="!loading">
          Jumla ya wateja: <strong>{{ formatNumber(pagination.total) }}</strong>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportCustomers">
          <i class="fas fa-download"></i>
          <span>Pakua</span>
        </button>
        <button class="btn-import" @click="importCustomers">
          <i class="fas fa-upload"></i>
          <span>Ingiza</span>
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
          <select v-model="filters.perPage" @change="changePerPage" class="form-control">
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
          <span class="stat-value">{{ formatNumber(statistics.total) }}</span>
          <span class="stat-label">Jumla ya Wateja</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f39c12, #e67e22)">
          <i class="fas fa-hand-holding-usd"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ formatNumber(statistics.withLoans) }}</span>
          <span class="stat-label">Wenye Mikopo</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b)">
          <i class="fas fa-ban"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ formatNumber(statistics.blacklisted) }}</span>
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
                    />
                    <!--  @error="handleImageError" -->
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
                  <!-- <span v-if="customer.email" class="contact-item">
                    <i class="fas fa-envelope"></i>
                    {{ customer.email }}
                  </span> -->
                </div>
              </td>
              <td>
                <div class="id-info">
                  <span class="id-number">{{ customer.id_number }}</span>
                  <span class="id-type">{{ getIdTypeText(customer.id_type) }}</span>
                </div>
              </td>
              <td>
                <div class="income-info">
                  <span class="occupation">{{ customer.occupation || '-' }}</span>
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
                <div class="action-dropdown" :ref="(el) => setActionRef(el, customer.id)">
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
                    <!-- <button @click="viewCustomerLoans(customer)" class="action-menu-item">
                      <i class="fas fa-hand-holding-usd"></i>
                      <span>Mikopo yake</span>
                    </button> -->
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
              <td colspan="8" class="text-center">
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
            >Umechagua <strong>{{ formatNumber(selectedCustomers.length) }}</strong> wateja</span
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
      <div class="pagination-section" v-if="pagination.lastPage > 1">
        <div class="pagination-info">
          <i class="fas fa-info-circle"></i>
          Inaonyesha <strong>{{ formatNumber(pagination.from) }}</strong> -
          <strong>{{ formatNumber(pagination.to) }}</strong> kati ya
          <strong>{{ formatNumber(pagination.total) }}</strong> wateja
        </div>

        <div class="pagination-controls">
          <div class="pagination-buttons">
            <!-- First Page -->
            <button
              @click="changePage(1)"
              :disabled="pagination.currentPage === 1"
              class="pagination-btn"
              title="Ukurasa wa Kwanza"
            >
              <i class="fas fa-angle-double-left"></i>
            </button>

            <!-- Previous Page -->
            <button
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1"
              class="pagination-btn"
              title="Ukurasa Ulio Nyuma"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <!-- Page Numbers -->
            <button
              v-for="page in paginationPages"
              :key="page"
              @click="changePage(page)"
              class="pagination-btn"
              :class="{ active: page === pagination.currentPage }"
            >
              {{ formatNumber(page) }}
            </button>

            <!-- Next Page -->
            <button
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.lastPage"
              class="pagination-btn"
              title="Ukurasa Unaofuata"
            >
              <i class="fas fa-chevron-right"></i>
            </button>

            <!-- Last Page -->
            <button
              @click="changePage(pagination.lastPage)"
              :disabled="pagination.currentPage === pagination.lastPage"
              class="pagination-btn"
              title="Ukurasa wa Mwisho"
            >
              <i class="fas fa-angle-double-right"></i>
            </button>
          </div>

          <!-- Page Size Selector -->
          <div class="page-size-selector">
            <label>Onyesha:</label>
            <select v-model="filters.perPage" @change="changePerPage" class="per-page-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Page Indicator -->
        <div class="page-indicator">
          Ukurasa <strong>{{ formatNumber(pagination.currentPage) }}</strong> kati ya
          <strong>{{ formatNumber(pagination.lastPage) }}</strong>
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
                <span class="summary-value">{{ formatNumber(customerLoansSummary.total) }}</span>
              </div>
            </div>
            <div class="summary-card-mini active">
              <div class="summary-icon">
                <i class="fas fa-play-circle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Inayoendelea</span>
                <span class="summary-value">{{ formatNumber(customerLoansSummary.active) }}</span>
              </div>
            </div>
            <div class="summary-card-mini completed">
              <div class="summary-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Imekamilika</span>
                <span class="summary-value">{{
                  formatNumber(customerLoansSummary.completed)
                }}</span>
              </div>
            </div>
            <div class="summary-card-mini defaulted">
              <div class="summary-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Imechelewa</span>
                <span class="summary-value">{{
                  formatNumber(customerLoansSummary.defaulted)
                }}</span>
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

                <!-- Payment Progress -->
                <div class="payment-progress" v-if="loan.payment_progress !== undefined">
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

              <div class="loan-card-footer">
                <div class="loan-terms">
                  <span
                    ><i class="fas fa-clock"></i>
                    {{ loan.duration_months || loan.term_months || '-' }} miezi</span
                  >
                  <span><i class="fas fa-percent"></i> {{ loan.interest_rate || '-' }}%</span>
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
            Una uhakika unataka kufuta wateja
            <strong>{{ formatNumber(selectedCustomers.length) }}</strong
            >?
          </p>
          <div class="selected-list">
            <div v-for="id in selectedCustomers.slice(0, 5)" :key="id" class="selected-item">
              <i class="fas fa-user"></i>
              <span>{{ getCustomerName(id) }}</span>
            </div>
            <div v-if="selectedCustomers.length > 5" class="more-items">
              ... na wengine {{ formatNumber(selectedCustomers.length - 5) }}
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import { useLoanStore } from '@/stores/loan'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import debounce from 'lodash/debounce'

const router = useRouter()
const customerStore = useCustomerStore()
const loanStore = useLoanStore()

// Helper function to format numbers
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('sw-TZ').format(num)
}

// Helper function to get ID type text
const getIdTypeText = (idType) => {
  const types = {
    NIDA: 'NIDA',
    ZANZIBAR_ID: 'Zanzibar ID',
    PASSPORT: 'Passport',
    DRIVERS: 'Leseni',
  }
  return types[idType] || idType || '-'
}

const defaultAvatar = ref('/default-avatar.png')

// State
const customers = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCustomers = ref([])
const selectAll = ref(false)
const showBulkDeleteModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const activeActionMenu = ref(null)

// Delete customer state
const customerToDelete = ref(null)
const showDeleteModal = ref(false)
const deleteLoading = ref(false)

// Loans modal state
const showLoansModal = ref(false)
const selectedCustomer = ref(null)
const customerLoans = ref([])
const customerLoansLoading = ref(false)
const customerLoansSummary = ref({
  total: 0,
  active: 0,
  completed: 0,
  defaulted: 0,
  total_amount: 0,
  paid_amount: 0,
  outstanding: 0,
})

// Refs storage
const actionRefs = ref({})

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
const setActionRef = (el, id) => {
  if (el) {
    actionRefs.value[id] = el
  }
}

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

    console.log('API Response:', response) // Debug log

    // Handle different response structures
    let responseData = null

    if (response && response.success && response.data) {
      responseData = response.data
    } else if (response && response.data) {
      responseData = response.data
    } else {
      responseData = response
    }

    // Extract customers data
    if (responseData) {
      // Check if data is paginated
      if (responseData.data && Array.isArray(responseData.data)) {
        customers.value = responseData.data
      } else if (Array.isArray(responseData)) {
        customers.value = responseData
      } else {
        customers.value = []
      }

      // Set pagination data
      pagination.currentPage =
        responseData.current_page || responseData.currentPage || filters.page || 1
      pagination.lastPage =
        responseData.last_page || responseData.lastPage || responseData.lastPage || 1
      pagination.perPage = responseData.per_page || responseData.perPage || filters.perPage || 10
      pagination.total = responseData.total || 0
      pagination.from = responseData.from || 0
      pagination.to = responseData.to || 0

      // If pagination data is missing but we have customers, calculate manually
      if (pagination.total === 0 && customers.value.length > 0) {
        pagination.total = customers.value.length
        pagination.lastPage = Math.ceil(pagination.total / pagination.perPage)
        pagination.from = (pagination.currentPage - 1) * pagination.perPage + 1
        pagination.to = Math.min(pagination.currentPage * pagination.perPage, pagination.total)
      }

      console.log('Pagination:', {
        currentPage: pagination.currentPage,
        lastPage: pagination.lastPage,
        total: pagination.total,
        from: pagination.from,
        to: pagination.to,
        customersCount: customers.value.length,
      })
    } else {
      customers.value = []
    }

    await loadStatistics()
  } catch (err) {
    console.error('Error loading customers:', err)
    error.value = err.response?.data?.message || 'Imeshindwa kupakia wateja. Tafadhali jaribu tena.'
    showToastMessage(error.value, 'error')
  } finally {
    loading.value = false
  }
}

const changePerPage = () => {
  filters.page = 1
  loadCustomers()
}

const getCustomerProfilePhoto = (customer) => {
  if (!customer) return defaultAvatar.value
  if (customer.profile_photo_url) return customer.profile_photo_url
  if (customer.profile_photo) {
    // const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
    const baseUrl = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'
    return `${baseUrl}/storage/${customer.profile_photo}`
  }
  return defaultAvatar.value
}

const handleImageError = (event) => {
  event.target.src = defaultAvatar.value
}

const loadStatistics = async () => {
  try {
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
  } catch (err) {
    console.error('Error loading statistics:', err)
  }
}

const debouncedSearch = debounce(() => {
  filters.page = 1
  loadCustomers()
}, 500)

// Watch for search changes
watch(
  () => filters.search,
  () => {
    debouncedSearch()
  },
)

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

const getLoanStatusText = (status) => {
  const statusMap = {
    pending: 'Inasubiri',
    approved: 'Imeidhinishwa',
    active: 'Inaendelea',
    paid: 'Imelipwa',
    defaulted: 'Imechelewa',
    rejected: 'Imekataliwa',
  }
  return statusMap[status?.toLowerCase()] || status
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

// View Customer Loans
const viewCustomerLoans = async (customer) => {
  selectedCustomer.value = customer
  showLoansModal.value = true
  closeActionMenu()
  await loadCustomerLoans(customer.id)
}

const loadCustomerLoans = async (customerId) => {
  customerLoansLoading.value = true
  try {
    const response = await loanStore.fetchCustomerLoans(customerId)

    if (response && response.success) {
      const loans = response.data || []
      customerLoans.value = loans

      // Calculate summary
      let total = loans.length
      let active = loans.filter((l) => l.status === 'active').length
      let completed = loans.filter((l) => l.status === 'paid').length
      let defaulted = loans.filter((l) => l.status === 'defaulted').length
      let totalAmount = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
      let paidAmount = loans.reduce((sum, l) => sum + (parseFloat(l.paid_amount) || 0), 0)
      let outstanding = totalAmount - paidAmount

      customerLoansSummary.value = {
        total,
        active,
        completed,
        defaulted,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        outstanding,
      }
    } else {
      customerLoans.value = []
    }
  } catch (error) {
    console.error('Error loading customer loans:', error)
    customerLoans.value = []
    showToastMessage('Imeshindwa kupakia mikopo ya mteja', 'error')
  } finally {
    customerLoansLoading.value = false
  }
}

const refreshCustomerLoans = () => {
  if (selectedCustomer.value) {
    loadCustomerLoans(selectedCustomer.value.id)
  }
}

const closeLoansModal = () => {
  showLoansModal.value = false
  selectedCustomer.value = null
  customerLoans.value = []
}

const viewLoanDetails = (loan) => {
  closeLoansModal()
  router.push(`/loans/${loan.id}`)
}

// Toggle customer status
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
      const errorMessage =
        error.response?.data?.message || 'Hitilafu imetokea. Tafadhali jaribu tena.'
      showToastMessage(errorMessage, 'error')
    }
  }
}

// Delete customer
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
    const result = await customerStore.deleteCustomer(customerToDelete.value.id)

    if (result && (result.success || result.status === 'success')) {
      showToastMessage('Mteja amefutwa kwa mafanikio', 'success')
      closeDeleteModal()
      await loadCustomers()
      clearSelection()
    } else {
      throw new Error(result?.message || 'Failed to delete customer')
    }
  } catch (error) {
    console.error('Delete error:', error)

    let errorMessage = 'Hitilafu imetokea wakati wa kufuta'

    if (error.response) {
      const responseData = error.response.data

      if (responseData.message) {
        errorMessage = responseData.message
      } else if (responseData.error) {
        errorMessage = responseData.error
      } else if (responseData.errors) {
        const errors = responseData.errors
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ')
        } else {
          errorMessage = errors
        }
      } else if (typeof responseData === 'string') {
        errorMessage = responseData
      }

      if (error.response.status === 403) {
        errorMessage = 'Hauna ruhusa ya kufuta mteja huyu'
      } else if (error.response.status === 404) {
        errorMessage = 'Mteja hakupatikana'
      } else if (error.response.status === 409) {
        errorMessage = 'Mteja hawezi kufutwa kwa sababu ana mikopo au dhamana inayoendelea'
      }
    } else if (error.request) {
      errorMessage =
        'Hakuna majibu kutoka kwa server. Tafadhali hakikisha una muunganiko wa intaneti.'
    } else if (error.message) {
      errorMessage = error.message
    }

    showToastMessage(errorMessage, 'error')
  } finally {
    deleteLoading.value = false
  }
}

// Bulk actions
const bulkActivate = async () => {
  if (selectedCustomers.value.length === 0) {
    showToastMessage('Tafadhali chagua wateja wa kuwasha', 'warning')
    return
  }

  try {
    await Promise.all(
      selectedCustomers.value.map((id) => customerStore.updateCustomerStatus(id, 'active')),
    )
    showToastMessage(`Wateja ${selectedCustomers.value.length} wamewashwa kwa mafanikio`, 'success')
    await loadCustomers()
    clearSelection()
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Hitilafu imetokea wakati wa kuwasha wateja'
    showToastMessage(errorMessage, 'error')
  }
}

const bulkDeactivate = async () => {
  if (selectedCustomers.value.length === 0) {
    showToastMessage('Tafadhali chagua wateja wa kuzima', 'warning')
    return
  }

  try {
    await Promise.all(
      selectedCustomers.value.map((id) => customerStore.updateCustomerStatus(id, 'inactive')),
    )
    showToastMessage(`Wateja ${selectedCustomers.value.length} wamezimwa kwa mafanikio`, 'success')
    await loadCustomers()
    clearSelection()
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Hitilafu imetokea wakati wa kuzima wateja'
    showToastMessage(errorMessage, 'error')
  }
}

const confirmBulkDelete = () => {
  if (selectedCustomers.value.length === 0) {
    showToastMessage('Tafadhali chagua wateja wa kufuta', 'warning')
    return
  }
  showBulkDeleteModal.value = true
}

const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false
}

const bulkDelete = async () => {
  if (selectedCustomers.value.length === 0) return

  deleteLoading.value = true

  try {
    const results = await Promise.allSettled(
      selectedCustomers.value.map((id) => customerStore.deleteCustomer(id)),
    )

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && (r.value?.success || r.value?.status === 'success'),
    ).length
    const failed = results.length - successful

    if (successful > 0) {
      showToastMessage(
        `${successful} wateja wamefutwa kwa mafanikio${failed > 0 ? `, ${failed} wameshindwa` : ''}`,
        successful > 0 ? 'success' : 'error',
      )
    } else {
      showToastMessage('Imeshindwa kufuta wateja waliopangwa', 'error')
    }

    closeBulkDeleteModal()
    await loadCustomers()
    clearSelection()
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Hitilafu imetokea wakati wa kufuta wateja'
    showToastMessage(errorMessage, 'error')
  } finally {
    deleteLoading.value = false
  }
}

// Export/Import
const exportCustomers = async () => {
  try {
    showToastMessage('Wateja wanapakuliwa...', 'info')
    if (customerStore.exportCustomers) {
      await customerStore.exportCustomers(filters)
      showToastMessage('Wateja wamepakuliwa kwa mafanikio', 'success')
    } else {
      showToastMessage('Kipengele cha kuweka nje hakipo', 'warning')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Hitilafu wakati wa kupakua'
    showToastMessage(errorMessage, 'error')
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
        if (customerStore.importCustomers) {
          await customerStore.importCustomers(file)
          showToastMessage('Wateja wameingizwa kwa mafanikio', 'success')
          await loadCustomers()
        } else {
          showToastMessage('Kipengele cha kuingiza nje hakipo', 'warning')
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Hitilafu wakati wa kuingiza'
        showToastMessage(errorMessage, 'error')
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
  debouncedSearch.cancel()
})
</script>

<style scoped>
/* All existing styles remain exactly the same as in your original component */
/* Include all the CSS from your original component here - no changes needed */

/* Additional styles for loans modal that might be missing */
.loans-modal {
  max-width: 800px !important;
  width: 90%;
}

.loans-modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.loans-summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card-mini {
  background: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #eef2f6;
}

.summary-card-mini .summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.summary-card-mini.total .summary-icon {
  background: #3498db;
  color: white;
}

.summary-card-mini.active .summary-icon {
  background: #27ae60;
  color: white;
}

.summary-card-mini.completed .summary-icon {
  background: #9b59b6;
  color: white;
}

.summary-card-mini.defaulted .summary-icon {
  background: #e74c3c;
  color: white;
}

.summary-content {
  flex: 1;
}

.summary-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 3px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.amount-summary {
  background: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.amount-item {
  display: flex;
  flex-direction: column;
}

.amount-label {
  font-size: 0.75rem;
  color: #666;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.amount-value.success {
  color: #27ae60;
}

.amount-value.warning {
  color: #f39c12;
}

.loans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 15px;
}

.loan-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #eef2f6;
  transition: all 0.3s;
  cursor: pointer;
}

.loan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.loan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.loan-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loan-number {
  font-weight: 600;
  color: #3498db;
}

.loan-status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.loan-status-badge.active {
  background: #d4edda;
  color: #155724;
}

.loan-status-badge.paid {
  background: #cce5ff;
  color: #004085;
}

.loan-status-badge.defaulted {
  background: #f8d7da;
  color: #721c24;
}

.loan-date {
  font-size: 0.7rem;
  color: #999;
}

.loan-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.amount-row {
  display: flex;
  flex-direction: column;
}

.amount-row .label {
  font-size: 0.7rem;
  color: #999;
}

.amount-row .value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.amount-row .value.success {
  color: #27ae60;
}

.amount-row .value.text-danger {
  color: #e74c3c;
}

.payment-status-section {
  margin-bottom: 10px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 5px;
}

.payment-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar-mini {
  flex: 1;
  height: 6px;
  background: #eef2f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-fill-mini.success {
  background: #27ae60;
}

.progress-fill-mini.warning {
  background: #f39c12;
}

.progress-fill-mini.danger {
  background: #e74c3c;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #333;
}

.payment-schedule-summary {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-payment {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: #666;
}

.next-payment i {
  color: #f39c12;
}

.payment-amount-mini {
  display: flex;
  align-items: center;
  gap: 5px;
}

.payment-amount-mini span:first-child {
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.paid {
  background: #27ae60;
}

.status-dot.pending {
  background: #f39c12;
}

.status-dot.overdue {
  background: #e74c3c;
}

.overdue-warning {
  background: #fee;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #e74c3c;
  margin-top: 8px;
}

.loan-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eef2f6;
}

.loan-terms {
  display: flex;
  gap: 10px;
  font-size: 0.7rem;
  color: #666;
}

.loan-terms i {
  margin-right: 3px;
}

.btn-view-loan {
  padding: 5px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-loan:hover {
  background: #2980b9;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.modal-header-left i {
  font-size: 1.2rem;
  color: #3498db;
}

.modal-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-refresh {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
}

.btn-refresh i.rotating {
  animation: spin 1s linear infinite;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f8fafc;
  color: #666;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-secondary:hover {
  background: #eef2f6;
}

/* Responsive */
@media (max-width: 768px) {
  .loans-summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .loans-grid {
    grid-template-columns: 1fr;
  }

  .amount-summary {
    flex-direction: column;
  }
}

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

/* Simple, clean avatar styling - no animation */
.customer-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eef2f6;
  transition: transform 0.2s ease;
}

.customer-avatar:hover {
  transform: scale(1.05);
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
.pagination-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eef2f6;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #eef2f6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #666;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3498db;
  color: #3498db;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #2980b9;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-dots {
  padding: 0 5px;
  color: #999;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-size-selector label {
  font-size: 0.9rem;
  color: #666;
}

.per-page-select {
  padding: 8px 12px;
  border: 1px solid #eef2f6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.page-indicator {
  text-align: center;
  font-size: 0.85rem;
  color: #999;
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-buttons {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }
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
