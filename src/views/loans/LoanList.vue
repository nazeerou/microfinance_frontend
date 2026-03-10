<template>
  <div class="loan-list-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Mikopo</h1>
        <p class="loan-count" v-if="!loading">
          <!-- Jumla ya mikopo: <strong>{{ pagination.total }}</strong> -->
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportLoans">
          <i class="fas fa-download"></i>
          <span>Pakua</span>
        </button>
        <button
          class="btn-filter-toggle"
          @click="showFilters = !showFilters"
          :class="{ active: hasActiveFilters }"
        >
          <i class="fas fa-filter"></i>
          <span>Filters</span>
          <span v-if="activeFilterCount" class="filter-badge">{{ activeFilterCount }}</span>
        </button>
        <router-link to="/loans/create" class="btn-primary">
          <i class="fas fa-plus-circle"></i>
          <span>Ombi Jipya</span>
        </router-link>
      </div>
    </div>

    <!-- Filters Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filters-panel">
        <div class="filters-grid">
          <!-- Search -->
          <div class="filter-group">
            <label>
              <i class="fas fa-search"></i>
              Tafuta
            </label>
            <input
              type="text"
              v-model="filters.search"
              @input="debouncedSearch"
              placeholder="Namba ya mkopo, jina la mteja..."
              class="form-control"
            />
          </div>

          <!-- Status Filter -->
          <div class="filter-group">
            <label>
              <i class="fas fa-tag"></i>
              Hali
            </label>
            <select v-model="filters.status" @change="loadLoans" class="form-control">
              <option value="">Zote</option>
              <option value="pending">Inasubiri</option>
              <option value="approved">Imeidhinishwa</option>
              <option value="active">Inaendelea</option>
              <option value="paid">Imelipwa</option>
              <option value="defaulted">Imechelewa</option>
              <option value="rejected">Imekataliwa</option>
            </select>
          </div>

          <!-- Date Range -->
          <div class="filter-group">
            <label>
              <i class="fas fa-calendar-alt"></i>
              Tarehe ya Kuanza (Kutoka)
            </label>
            <input
              type="date"
              v-model="filters.date_from"
              @change="loadLoans"
              class="form-control"
            />
          </div>

          <div class="filter-group">
            <label>
              <i class="fas fa-calendar-alt"></i>
              Tarehe ya Kuanza (Mpaka)
            </label>
            <input type="date" v-model="filters.date_to" @change="loadLoans" class="form-control" />
          </div>

          <!-- Amount Range -->
          <div class="filter-group">
            <label>
              <i class="fas fa-money-bill-wave"></i>
              Kiasi kutoka
            </label>
            <input
              type="number"
              v-model.number="filters.min_amount"
              @input="debouncedSearch"
              placeholder="Kiasi cha chini"
              class="form-control"
            />
          </div>

          <div class="filter-group">
            <label>
              <i class="fas fa-money-bill-wave"></i>
              Kiasi mpaka
            </label>
            <input
              type="number"
              v-model.number="filters.max_amount"
              @input="debouncedSearch"
              placeholder="Kiasi cha juu"
              class="form-control"
            />
          </div>

          <!-- Sort By -->
          <div class="filter-group">
            <label>
              <i class="fas fa-sort"></i>
              Panga kwa
            </label>
            <select v-model="filters.sortBy" @change="loadLoans" class="form-control">
              <option value="created_at">Tarehe ya Kuombwa</option>
              <option value="amount">Kiasi</option>
              <option value="status">Hali</option>
              <option value="start_date">Tarehe ya Kuanza</option>
              <option value="end_date">Tarehe ya Kumaliza</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div class="filter-group">
            <label>
              <i class="fas fa-sort-amount-down"></i>
              Mpango
            </label>
            <select v-model="filters.sortOrder" @change="loadLoans" class="form-control">
              <option value="desc">Kushuka (Zinazoanza)</option>
              <option value="asc">Kupanda (Zinazomaliza)</option>
            </select>
          </div>

          <!-- Per Page -->
          <div class="filter-group">
            <label>
              <i class="fas fa-list"></i>
              Idadi kwa Ukurasa
            </label>
            <select v-model="filters.perPage" @change="loadLoans" class="form-control">
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
            <span v-if="filters.date_from" class="filter-tag">
              <i class="fas fa-calendar"></i>
              Kuanzia: {{ formatDate(filters.date_from) }}
              <i @click="clearFilter('date_from')" class="fas fa-times remove-filter"></i>
            </span>
            <span v-if="filters.date_to" class="filter-tag">
              <i class="fas fa-calendar"></i>
              Mpaka: {{ formatDate(filters.date_to) }}
              <i @click="clearFilter('date_to')" class="fas fa-times remove-filter"></i>
            </span>
            <span v-if="filters.min_amount" class="filter-tag">
              <i class="fas fa-money-bill"></i>
              ≥ {{ formatCurrency(filters.min_amount) }}
              <i @click="clearFilter('min_amount')" class="fas fa-times remove-filter"></i>
            </span>
            <span v-if="filters.max_amount" class="filter-tag">
              <i class="fas fa-money-bill"></i>
              ≤ {{ formatCurrency(filters.max_amount) }}
              <i @click="clearFilter('max_amount')" class="fas fa-times remove-filter"></i>
            </span>
            <button @click="clearAllFilters" class="clear-all-btn">
              <i class="fas fa-trash-alt"></i>
              Futa yote
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Statistics Cards -->
    <div class="stats-cards">
      <div
        class="stat-card"
        @click="filterByStatus('pending')"
        :class="{ 'active-filter': filters.status === 'pending' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #f39c12, #e67e22)">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.pending }}</span>
          <span class="stat-label">Inasubiri</span>
        </div>
      </div>

      <div
        class="stat-card"
        @click="filterByStatus('approved')"
        :class="{ 'active-filter': filters.status === 'approved' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #3498db, #2980b9)">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.approved }}</span>
          <span class="stat-label">Imeidhinishwa</span>
        </div>
      </div>

      <div
        class="stat-card"
        @click="filterByStatus('active')"
        :class="{ 'active-filter': filters.status === 'active' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #27ae60, #229954)">
          <i class="fas fa-play-circle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.active }}</span>
          <span class="stat-label">Inaendelea</span>
        </div>
      </div>

      <div
        class="stat-card"
        @click="filterByStatus('paid')"
        :class="{ 'active-filter': filters.status === 'paid' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #9b59b6, #8e44ad)">
          <i class="fas fa-check-double"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.paid }}</span>
          <span class="stat-label">Imelipwa</span>
        </div>
      </div>

      <div
        class="stat-card"
        @click="filterByStatus('defaulted')"
        :class="{ 'active-filter': filters.status === 'defaulted' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b)">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.defaulted }}</span>
          <span class="stat-label">Imechelewa</span>
        </div>
      </div>

      <div
        class="stat-card"
        @click="filterByStatus('rejected')"
        :class="{ 'active-filter': filters.status === 'rejected' }"
      >
        <div class="stat-icon" style="background: linear-gradient(135deg, #95a5a6, #7f8c8d)">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics.rejected }}</span>
          <span class="stat-label">Imekataliwa</span>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card total">
        <div class="summary-icon">
          <i class="fas fa-coins"></i>
        </div>
        <div class="summary-content">
          <span class="summary-label">Jumla ya Mikopo</span>
          <span class="summary-value">{{ formatCurrency(summary.total_amount) }}</span>
        </div>
      </div>

      <div class="summary-card outstanding">
        <div class="summary-icon">
          <i class="fas fa-hand-holding-usd"></i>
        </div>
        <div class="summary-content">
          <span class="summary-label">Inayodaiwa</span>
          <span class="summary-value">{{ formatCurrency(summary.outstanding) }}</span>
        </div>
      </div>

      <div class="summary-card collected">
        <div class="summary-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="summary-content">
          <span class="summary-label">Imelipwa</span>
          <span class="summary-value">{{ formatCurrency(summary.collected) }}</span>
        </div>
      </div>

      <div class="summary-card interest">
        <div class="summary-icon">
          <i class="fas fa-percent"></i>
        </div>
        <div class="summary-content">
          <span class="summary-label">Riba</span>
          <span class="summary-value">{{ formatCurrency(summary.interest) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Inapakia mikopo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Hitilafu imetokea</h3>
      <p>{{ error }}</p>
      <button @click="loadLoans" class="btn-retry">
        <i class="fas fa-redo"></i>
        Jaribu Tena
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="loans.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-hand-holding-usd"></i>
        <i class="fas fa-question"></i>
      </div>
      <h3>Hakuna mikopo iliyopatikana</h3>
      <p v-if="hasActiveFilters">
        Hakuna mikopo inayolingana na vichujio ulivyoweka. Jaribu kubadilisha vichujio.
      </p>
      <p v-else>Bado hakuna mkopo ulioombwa. Bonyeza kitufe hapa chini kuomba mkopo wa kwanza.</p>
      <div class="empty-actions">
        <button v-if="hasActiveFilters" @click="clearAllFilters" class="btn-secondary">
          <i class="fas fa-times"></i>
          Futa Vichujio
        </button>
        <router-link to="/loans/create" class="btn-primary">
          <i class="fas fa-plus-circle"></i>
          Omba Mkopo
        </router-link>
      </div>
    </div>

    <!-- Loans Table -->
    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="loans-table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Namba ya Mkopo</th>
              <th>Mteja</th>
              <th>Kiasi</th>
              <th>Riba</th>
              <th>Muda</th>
              <th>Imebaki</th>
              <th>Hali</th>
              <th>Vitendo</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="loan in loans" :key="loan.id">
              <!-- Main Row -->
              <tr>
                <td>
                  <button
                    class="expand-btn"
                    @click.stop="toggleLoanDetails(loan.id)"
                    :class="{ expanded: expandedLoan === loan.id }"
                  >
                    <i
                      class="fas"
                      :class="expandedLoan === loan.id ? 'fa-chevron-up' : 'fa-chevron-down'"
                    ></i>
                  </button>
                </td>
                <td>
                  <span class="loan-number">#{{ loan.loan_number }}</span>
                </td>
                <td>
                  <div class="customer-cell">
                    <img
                      :src="loan.customer?.profile_photo || '/default-avatar.png'"
                      :alt="loan.customer?.name"
                      class="customer-avatar"
                    />
                    <div class="customer-info">
                      <span class="customer-name">
                        {{ loan.customer?.first_name }} {{ loan.customer?.last_name }}
                      </span>
                      <span class="customer-phone">{{ loan.customer?.phone }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="amount">{{ formatCurrency(loan.amount) }}</span>
                </td>
                <td>
                  <span class="interest-rate">{{ loan.interest_rate }}%</span>
                </td>
                <td>
                  <span class="duration">{{ loan.duration_months }} miezi</span>
                </td>
                <td>
                  <span
                    class="balance"
                    :class="{
                      'text-success': loan.balance === 0,
                      'text-danger': loan.balance > 0 && loan.is_overdue,
                    }"
                  >
                    {{ formatCurrency(loan.balance) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="loan.status">
                    {{ getStatusText(loan.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-dropdown">
                    <button class="action-menu-btn" @click.stop="toggleActionMenu(loan.id)">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div v-if="activeActionMenu === loan.id" class="action-menu">
                      <button @click="viewLoan(loan)" class="action-menu-item">
                        <i class="fas fa-eye"></i>
                        <span>Angalia</span>
                      </button>

                      <button v-if="canEdit(loan)" @click="editLoan(loan)" class="action-menu-item">
                        <i class="fas fa-edit"></i>
                        <span>Hariri</span>
                      </button>

                      <button
                        v-if="canApprove(loan)"
                        @click="approveLoan(loan)"
                        class="action-menu-item success"
                      >
                        <i class="fas fa-check-circle"></i>
                        <span>Idhinisha</span>
                      </button>

                      <button
                        v-if="canDisburse(loan)"
                        @click="disburseLoan(loan)"
                        class="action-menu-item warning"
                      >
                        <i class="fas fa-hand-holding-usd"></i>
                        <span>Toa Mkopo</span>
                      </button>

                      <button
                        v-if="canRecordPayment(loan)"
                        @click="recordPayment(loan)"
                        class="action-menu-item info"
                      >
                        <i class="fas fa-money-bill"></i>
                        <span>Rekodi Malipo</span>
                      </button>

                      <button @click="viewSchedule(loan)" class="action-menu-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Ratiba ya Malipo</span>
                      </button>

                      <button
                        v-if="canReject(loan)"
                        @click="rejectLoan(loan)"
                        class="action-menu-item danger"
                      >
                        <i class="fas fa-times-circle"></i>
                        <span>Kataa</span>
                      </button>

                      <div class="action-menu-divider"></div>

                      <button
                        v-if="canDelete(loan)"
                        @click="deleteLoan(loan)"
                        class="action-menu-item danger"
                      >
                        <i class="fas fa-trash-alt"></i>
                        <span>Futa</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Expanded Details Row -->
              <tr v-if="expandedLoan === loan.id" class="expanded-details-row">
                <td colspan="9">
                  <div class="expanded-details">
                    <div class="details-grid">
                      <!-- Start Date -->
                      <div class="detail-item">
                        <div class="detail-label">
                          <i class="fas fa-calendar-plus"></i>
                          Tarehe ya Kuanza
                        </div>
                        <div class="detail-value">
                          {{ formatDate(loan.start_date) || 'Haijawekwa' }}
                        </div>
                      </div>

                      <!-- End Date -->
                      <div class="detail-item">
                        <div class="detail-label">
                          <i class="fas fa-calendar-times"></i>
                          Tarehe ya Kumaliza
                        </div>
                        <div class="detail-value">
                          {{ formatDate(loan.end_date) || 'Haijawekwa' }}
                          <span v-if="loan.is_overdue" class="overdue-badge-detail">
                            <i class="fas fa-exclamation-circle"></i>
                            Imechelewa
                          </span>
                        </div>
                      </div>

                      <!-- Payment Frequency -->
                      <div class="detail-item">
                        <div class="detail-label">
                          <i class="fas fa-clock"></i>
                          Muda wa Malipo
                        </div>
                        <div class="detail-value">{{ loan.payment_frequency || 'Kila mwezi' }}</div>
                      </div>

                      <!-- Total Amount -->
                      <div class="detail-item">
                        <div class="detail-label">
                          <i class="fas fa-calculator"></i>
                          Jumla ya Kurejesha
                        </div>
                        <div class="detail-value">{{ formatCurrency(loan.total_amount) }}</div>
                      </div>

                      <!-- Monthly Payment -->
                      <div class="detail-item">
                        <div class="detail-label">
                          <i class="fas fa-money-bill-wave"></i>
                          Malipo kwa Mwezi
                        </div>
                        <div class="detail-value">{{ formatCurrency(loan.monthly_payment) }}</div>
                      </div>

                      <!-- Progress -->
                      <div class="detail-item" v-if="loan.progress_percentage !== undefined">
                        <div class="detail-label">
                          <i class="fas fa-chart-line"></i>
                          Maendeleo ya Malipo
                        </div>
                        <div class="detail-value">
                          <div class="progress-bar">
                            <div
                              class="progress-fill"
                              :style="{ width: loan.progress_percentage + '%' }"
                            ></div>
                            <span class="progress-text">{{ loan.progress_percentage }}%</span>
                          </div>
                        </div>
                      </div>

                      <!-- Next Payment Date -->
                      <div class="detail-item" v-if="loan.next_payment_date">
                        <div class="detail-label">
                          <i class="fas fa-calendar-check"></i>
                          Malipo Yajayo
                        </div>
                        <div class="detail-value">{{ formatDate(loan.next_payment_date) }}</div>
                      </div>

                      <!-- Purpose/Description -->
                      <div class="detail-item full-width" v-if="loan.purpose">
                        <div class="detail-label">
                          <i class="fas fa-file-alt"></i>
                          Maelezo ya Mkopo
                        </div>
                        <div class="detail-value">{{ loan.purpose }}</div>
                      </div>

                      <!-- Approval Info -->
                      <div class="detail-item" v-if="loan.approved_by">
                        <div class="detail-label">
                          <i class="fas fa-user-check"></i>
                          Aliyeidhinisha
                        </div>
                        <div class="detail-value">{{ loan.approved_by }}</div>
                      </div>

                      <!-- Disbursement Info -->
                      <div class="detail-item" v-if="loan.disbursed_by">
                        <div class="detail-label">
                          <i class="fas fa-user-tie"></i>
                          Aliyetoa
                        </div>
                        <div class="detail-value">{{ loan.disbursed_by }}</div>
                      </div>
                    </div>

                    <!-- Payment History Preview -->
                    <div class="payment-history-preview" v-if="loan.recent_payments?.length">
                      <div class="preview-header">
                        <i class="fas fa-history"></i>
                        <span>Malipo ya Hivi Karibuni</span>
                      </div>
                      <div class="preview-list">
                        <div
                          v-for="payment in loan.recent_payments.slice(0, 3)"
                          :key="payment.id"
                          class="preview-item"
                        >
                          <span class="payment-date">{{ formatDate(payment.payment_date) }}</span>
                          <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
                          <span class="payment-status" :class="payment.status">
                            {{ payment.status }}
                          </span>
                        </div>
                        <div v-if="loan.recent_payments.length > 3" class="view-all-link">
                          <button @click="viewSchedule(loan)" class="btn-link">
                            Tazama malipo yote ({{ loan.recent_payments.length }})
                          </button>
                        </div>
                      </div>
                    </div>

                    <div v-else class="no-payments">
                      <i class="fas fa-info-circle"></i>
                      <span>Hakuna malipo bado</span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
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

    <!-- Approve Loan Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click="closeApproveModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Idhinisha Mkopo</h3>
          <button class="close-btn" @click="closeApproveModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Una uhakika unataka kuidhinisha mkopo huu?</p>
          <div class="loan-details-summary" v-if="selectedLoan">
            <p>
              <strong>Mteja:</strong> {{ selectedLoan.customer?.first_name }}
              {{ selectedLoan.customer?.last_name }}
            </p>
            <p><strong>Kiasi:</strong> {{ formatCurrency(selectedLoan.amount) }}</p>
            <p><strong>Muda:</strong> {{ selectedLoan.duration_months }} miezi</p>
          </div>
          <div class="form-group">
            <label for="approval_notes">Maelezo (si lazima)</label>
            <textarea
              id="approval_notes"
              v-model="approvalNotes"
              class="form-control"
              rows="3"
              placeholder="Weka maelezo yoyote kuhusu uidhinishaji huu..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeApproveModal" class="btn-secondary">Ghairi</button>
          <button @click="confirmApprove" class="btn-success" :disabled="actionLoading">
            <span v-if="actionLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-check"></i>
              Ndiyo, Idhinisha
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Loan Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon danger">
            <i class="fas fa-times-circle"></i>
          </div>
          <h3>Kataa Mkopo</h3>
          <button class="close-btn" @click="closeRejectModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Una uhakika unataka kukataa mkopo huu?</p>
          <div class="loan-details-summary" v-if="selectedLoan">
            <p>
              <strong>Mteja:</strong> {{ selectedLoan.customer?.first_name }}
              {{ selectedLoan.customer?.last_name }}
            </p>
            <p><strong>Kiasi:</strong> {{ formatCurrency(selectedLoan.amount) }}</p>
          </div>
          <div class="form-group required">
            <label for="rejection_reason">Sababu ya kukataa</label>
            <textarea
              id="rejection_reason"
              v-model="rejectionReason"
              class="form-control"
              rows="3"
              placeholder="Weka sababu ya kukataa mkopo huu..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeRejectModal" class="btn-secondary">Ghairi</button>
          <button
            @click="confirmReject"
            class="btn-danger"
            :disabled="actionLoading || !rejectionReason"
          >
            <span v-if="actionLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-times"></i>
              Ndiyo, Kataa
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Disburse Loan Modal -->
    <div v-if="showDisburseModal" class="modal-overlay" @click="closeDisburseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon warning">
            <i class="fas fa-hand-holding-usd"></i>
          </div>
          <h3>Toa Mkopo</h3>
          <button class="close-btn" @click="closeDisburseModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Una uhakika unataka kutoa mkopo huu?</p>
          <div class="loan-details-summary" v-if="selectedLoan">
            <p>
              <strong>Mteja:</strong> {{ selectedLoan.customer?.first_name }}
              {{ selectedLoan.customer?.last_name }}
            </p>
            <p><strong>Kiasi:</strong> {{ formatCurrency(selectedLoan.amount) }}</p>
            <p><strong>Riba:</strong> {{ selectedLoan.interest_rate }}%</p>
            <p>
              <strong>Jumla ya kurejesha:</strong> {{ formatCurrency(selectedLoan.total_amount) }}
            </p>
          </div>
          <div class="form-group">
            <label for="disbursement_notes">Maelezo (si lazima)</label>
            <textarea
              id="disbursement_notes"
              v-model="disbursementNotes"
              class="form-control"
              rows="3"
              placeholder="Weka maelezo yoyote kuhusu utoaji huu..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDisburseModal" class="btn-secondary">Ghairi</button>
          <button @click="confirmDisburse" class="btn-primary" :disabled="actionLoading">
            <span v-if="actionLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-check"></i>
              Ndiyo, Toa
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Loan Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon danger">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Futa Mkopo</h3>
          <button class="close-btn" @click="closeDeleteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Una uhakika unataka kufuta mkopo huu?</p>
          <div class="loan-details-summary" v-if="selectedLoan">
            <p>
              <strong>Mteja:</strong> {{ selectedLoan.customer?.first_name }}
              {{ selectedLoan.customer?.last_name }}
            </p>
            <p><strong>Namba ya Mkopo:</strong> #{{ selectedLoan.loan_number }}</p>
            <p><strong>Kiasi:</strong> {{ formatCurrency(selectedLoan.amount) }}</p>
          </div>
          <p class="warning-note">
            <i class="fas fa-info-circle"></i>
            Hatua hii haiwezi kutenguliwa. Mkopo utafutwa kabisa kwenye mfumo.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">Ghairi</button>
          <button @click="confirmDelete" class="btn-danger" :disabled="actionLoading">
            <span v-if="actionLoading" class="spinner"></span>
            <span v-else>
              <i class="fas fa-trash-alt"></i>
              Ndiyo, Futa
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
import debounce from 'lodash/debounce'
import axios from 'axios'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// State
const loans = ref([])
const loading = ref(false)
const error = ref(null)
const showFilters = ref(false)
const selectedLoan = ref(null)
const actionLoading = ref(false)
const activeActionMenu = ref(null)
const expandedLoan = ref(null)

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showDisburseModal = ref(false)
const showDeleteModal = ref(false)
const approvalNotes = ref('')
const rejectionReason = ref('')
const disbursementNotes = ref('')

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Filters
const filters = reactive({
  search: '',
  status: '',
  date_from: '',
  date_to: '',
  min_amount: '',
  max_amount: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  perPage: 10,
  page: 1,
})

// Pagination
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
  from: 0,
  to: 0,
})

// Statistics
const statistics = ref({
  pending: 0,
  approved: 0,
  active: 0,
  paid: 0,
  defaulted: 0,
  rejected: 0,
})

// Summary
const summary = ref({
  total_amount: 0,
  outstanding: 0,
  collected: 0,
  interest: 0,
})

// Computed
const hasActiveFilters = computed(() => {
  return (
    filters.search ||
    filters.status ||
    filters.date_from ||
    filters.date_to ||
    filters.min_amount ||
    filters.max_amount
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.search) count++
  if (filters.status) count++
  if (filters.date_from) count++
  if (filters.date_to) count++
  if (filters.min_amount) count++
  if (filters.max_amount) count++
  return count
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
const toggleLoanDetails = (loanId) => {
  expandedLoan.value = expandedLoan.value === loanId ? null : loanId
}

const loadLoans = async () => {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: filters.page,
      per_page: filters.perPage,
      sort_field: filters.sortBy,
      sort_order: filters.sortOrder,
    }

    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.date_from) params.start_date_from = filters.date_from
    if (filters.date_to) params.start_date_to = filters.date_to
    if (filters.min_amount) params.min_amount = filters.min_amount
    if (filters.max_amount) params.max_amount = filters.max_amount

    const response = await axios.get(`${API_URL}/loans`, { params })

    if (response.data.success) {
      const responseData = response.data.data

      loans.value = (responseData.data || []).map((item) => ({
        id: item.id,
        loan_number: item.loan_number,
        customer: item.customer
          ? {
              id: item.customer.id,
              first_name: item.customer.first_name,
              last_name: item.customer.last_name,
              phone: item.customer.phone,
              profile_photo: item.customer.profile_photo_url || '/default-avatar.png',
            }
          : {
              first_name: 'Unknown',
              last_name: 'Customer',
              phone: '',
              profile_photo: '/default-avatar.png',
            },
        amount: parseFloat(item.amount),
        interest_rate: parseFloat(item.interest_rate),
        total_amount: parseFloat(item.total_amount),
        balance: parseFloat(item.balance),
        monthly_payment: parseFloat(item.monthly_payment),
        duration_months: item.duration_months,
        payment_frequency: item.payment_frequency,
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        is_overdue: item.is_overdue,
        progress_percentage: item.progress_percentage,
        next_payment_date: item.next_payment_date,
        purpose: item.purpose,
        approved_by: item.approved_by,
        disbursed_by: item.disbursed_by,
        recent_payments: item.recent_payments || [],
      }))

      pagination.currentPage = responseData.current_page || 1
      pagination.lastPage = responseData.last_page || 1
      pagination.perPage = responseData.per_page || filters.perPage
      pagination.total = responseData.total || 0
      pagination.from = responseData.from || 0
      pagination.to = responseData.to || 0

      // Load statistics after loans are loaded
      await loadStatistics()
    }
  } catch (err) {
    console.error('Error loading loans:', err)
    error.value = err.response?.data?.message || 'Imeshindwa kupakia mikopo'
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/loans-statistics`)

    if (response.data.success) {
      const stats = response.data.data

      statistics.value = {
        pending: stats.pending || 0,
        approved: stats.approved || 0,
        active: stats.active || 0,
        paid: stats.paid || 0,
        defaulted: stats.defaulted || 0,
        rejected: stats.rejected || 0,
      }

      summary.value = {
        total_amount: stats.total_amount || 0,
        outstanding: stats.outstanding || 0,
        collected: stats.collected || 0,
        interest: stats.interest || 0,
      }
    }
  } catch (err) {
    console.error('Error loading statistics:', err)
  }
}

const debouncedSearch = debounce(() => {
  filters.page = 1
  loadLoans()
}, 500)

const clearFilter = (filter) => {
  filters[filter] = ''
  filters.page = 1
  loadLoans()
}

const clearAllFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.date_from = ''
  filters.date_to = ''
  filters.min_amount = ''
  filters.max_amount = ''
  filters.sortBy = 'created_at'
  filters.sortOrder = 'desc'
  filters.perPage = 10
  filters.page = 1
  loadLoans()
}

const filterByStatus = (status) => {
  if (filters.status === status) {
    filters.status = ''
  } else {
    filters.status = status
  }
  filters.page = 1
  loadLoans()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.lastPage) {
    filters.page = page
    loadLoans()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const toggleActionMenu = (loanId) => {
  activeActionMenu.value = activeActionMenu.value === loanId ? null : loanId
}

const closeActionMenu = () => {
  activeActionMenu.value = null
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.action-dropdown')) {
    closeActionMenu()
  }
}

// Helper functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('sw-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Inasubiri',
    approved: 'Imeidhinishwa',
    active: 'Inaendelea',
    paid: 'Imelipwa',
    defaulted: 'Imechelewa',
    rejected: 'Imekataliwa',
  }
  return statusMap[status] || status
}

// Permission checks
const canEdit = (loan) => ['pending', 'rejected'].includes(loan.status)
const canApprove = (loan) => loan.status === 'pending'
const canDisburse = (loan) => loan.status === 'approved'
const canRecordPayment = (loan) => ['active', 'defaulted'].includes(loan.status) && loan.balance > 0
const canReject = (loan) => ['pending', 'approved'].includes(loan.status)
const canDelete = (loan) => ['pending', 'rejected'].includes(loan.status)

// Navigation
const viewLoan = (loan) => {
  router.push(`/loans/${loan.id}`)
  closeActionMenu()
}

const editLoan = (loan) => {
  router.push(`/loans/${loan.id}/edit`)
  closeActionMenu()
}

const recordPayment = (loan) => {
  router.push(`/payments/create?loan_id=${loan.id}`)
  closeActionMenu()
}

const viewSchedule = (loan) => {
  router.push(`/loans/${loan.id}/schedule`)
  closeActionMenu()
}

// Approve modal
const approveLoan = (loan) => {
  selectedLoan.value = loan
  approvalNotes.value = ''
  showApproveModal.value = true
  closeActionMenu()
}

const closeApproveModal = () => {
  showApproveModal.value = false
  selectedLoan.value = null
  approvalNotes.value = ''
}

const confirmApprove = async () => {
  if (!selectedLoan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${selectedLoan.value.id}/approve`, {
      approved_notes: approvalNotes.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umeidhinishwa kwa mafanikio', 'success')
      closeApproveModal()
      await loadLoans()
    }
  } catch (err) {
    console.error('Error approving loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Reject modal
const rejectLoan = (loan) => {
  selectedLoan.value = loan
  rejectionReason.value = ''
  showRejectModal.value = true
  closeActionMenu()
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedLoan.value = null
  rejectionReason.value = ''
}

const confirmReject = async () => {
  if (!rejectionReason.value || !selectedLoan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${selectedLoan.value.id}/reject`, {
      rejection_reason: rejectionReason.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umekataliwa', 'info')
      closeRejectModal()
      await loadLoans()
    }
  } catch (err) {
    console.error('Error rejecting loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Disburse modal
const disburseLoan = (loan) => {
  selectedLoan.value = loan
  disbursementNotes.value = ''
  showDisburseModal.value = true
  closeActionMenu()
}

const closeDisburseModal = () => {
  showDisburseModal.value = false
  selectedLoan.value = null
  disbursementNotes.value = ''
}

const confirmDisburse = async () => {
  if (!selectedLoan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${selectedLoan.value.id}/disburse`, {
      start_date: new Date().toISOString().split('T')[0],
      disbursed_notes: disbursementNotes.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umetolewa kwa mafanikio', 'success')
      closeDisburseModal()
      await loadLoans()
    }
  } catch (err) {
    console.error('Error disbursing loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Delete modal
const deleteLoan = (loan) => {
  selectedLoan.value = loan
  showDeleteModal.value = true
  closeActionMenu()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedLoan.value = null
}

const confirmDelete = async () => {
  if (!selectedLoan.value) return

  actionLoading.value = true

  try {
    const response = await axios.delete(`${API_URL}/loans/${selectedLoan.value.id}`)

    if (response.data.success) {
      showToastMessage('Mkopo umefutwa kwa mafanikio', 'success')
      closeDeleteModal()
      await loadLoans()
    }
  } catch (err) {
    console.error('Error deleting loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Export
const exportLoans = async () => {
  showToastMessage('Mikopo inahamishwa...', 'info')

  try {
    const params = {
      export: true,
      ...filters,
    }

    const response = await axios.get(`${API_URL}/loans/export`, {
      params,
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `loans_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    showToastMessage('Mikopo imehamishwa kwa mafanikio', 'success')
  } catch (err) {
    console.error('Error exporting loans:', err)
    showToastMessage('Hitilafu wakati wa kuhamisha', 'error')
  }
}

// Toast
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
  loadLoans()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Action Dropdown */
.action-dropdown {
  position: relative;
  display: inline-block;
}

.expand-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.expand-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
  transform: scale(1.1);
}

.expand-btn.expanded {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.expanded-details-row {
  background: #f8fafc;
  border-top: 2px solid #3498db;
  border-bottom: 2px solid #eef2f6;
}

.expanded-details-row:hover {
  background: #f8fafc;
}

.expanded-details {
  padding: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eef2f6;
  transition: all 0.3s;
}

.detail-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.detail-label i {
  color: #3498db;
  font-size: 0.9rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  padding-left: 22px;
}

.overdue-badge-detail {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  font-size: 0.75rem;
  color: #e74c3c;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 20px;
  background: #eef2f6;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #27ae60, #229954);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 0.7rem;
  font-weight: 600;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

/* Payment History Preview */
.payment-history-preview {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

.preview-header i {
  color: #3498db;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.payment-date {
  flex: 1;
  color: #666;
}

.payment-amount {
  font-weight: 600;
  color: #27ae60;
}

.payment-status {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.payment-status.completed {
  background: #d4edda;
  color: #155724;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.view-all-link {
  text-align: center;
  margin-top: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.no-payments {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
}

.no-payments i {
  color: #3498db;
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

.action-menu-item.success:hover {
  color: #27ae60;
}

.action-menu-item.success:hover i {
  color: #27ae60;
}

.action-menu-item.warning:hover {
  color: #f39c12;
}

.action-menu-item.warning:hover i {
  color: #f39c12;
}

.action-menu-item.info:hover {
  color: #3498db;
}

.action-menu-item.info:hover i {
  color: #3498db;
}

.action-menu-item.danger:hover {
  color: #e74c3c;
}

.action-menu-item.danger:hover i {
  color: #e74c3c;
}

.action-menu-divider {
  height: 1px;
  background: #eef2f6;
  margin: 5px 0;
}

.loan-list-container {
  padding: 0px 10px;
  max-width: 1400px;
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

.loan-count {
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
.btn-filter-toggle {
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
  position: relative;
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

.btn-filter-toggle {
  background: white;
  color: #666;
  border: 1px solid #eef2f6;
}

.btn-filter-toggle:hover,
.btn-filter-toggle.active {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.filter-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Filters Panel */
.filters-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
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

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.active-filter {
  border-color: #3498db;
  background: #e3f2fd;
}

.stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
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
  font-size: 0.8rem;
  color: #666;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

.summary-card.total {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.summary-card.outstanding {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.summary-card.collected {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.summary-card.interest {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.summary-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.empty-illustration i:first-child {
  font-size: 4rem;
  color: #cbd5e0;
}

.empty-illustration i:last-child {
  position: absolute;
  bottom: 0;
  right: -10px;
  font-size: 2rem;
  color: #e74c3c;
  background: white;
  border-radius: 50%;
  padding: 5px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  margin-bottom: 25px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-secondary {
  padding: 10px 25px;
  background: #f8fafc;
  color: #666;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-secondary:hover {
  background: #eef2f6;
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

.loans-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.loans-table th {
  text-align: left;
  padding: 15px 10px;
  background: #f8fafc;
  color: #1a2639;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #eef2f6;
}

.loans-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #eef2f6;
  color: #666;
}

.loans-table tbody tr:hover {
  background: #f8fafc;
}

/* Loan Number */
.loan-number {
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

/* Customer Cell */
.customer-cell {
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

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.customer-phone {
  font-size: 0.8rem;
  color: #999;
}

/* Amount and Balance */
.amount {
  font-weight: 600;
  color: #333;
}

.interest-rate {
  font-weight: 500;
  color: #f39c12;
}

.balance {
  font-weight: 600;
}

.balance.text-success {
  color: #27ae60;
}

.balance.text-danger {
  color: #e74c3c;
}

/* End Date Cell */
.end-date-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.overdue-badge {
  font-size: 0.7rem;
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  min-width: 90px;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #cce5ff;
  color: #004085;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.paid {
  background: #d1d8e0;
  color: #2c3e50;
}

.status-badge.defaulted {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.rejected {
  background: #e2e3e5;
  color: #383d41;
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
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.btn-icon.success:hover {
  color: #27ae60;
  border-color: #27ae60;
}

.btn-icon.warning:hover {
  color: #f39c12;
  border-color: #f39c12;
}

.btn-icon.info:hover {
  color: #3498db;
  border-color: #3498db;
}

.btn-icon.danger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
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

.modal-icon.success {
  background: #d4edda;
  color: #27ae60;
}

.modal-icon.danger {
  background: #f8d7da;
  color: #e74c3c;
}

.modal-icon.warning {
  background: #fff3cd;
  color: #f39c12;
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

.loan-details-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.loan-details-summary p {
  margin: 5px 0;
  color: #333;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-success,
.btn-danger {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.3s;
}

.btn-success {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

.btn-success:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .loan-list-container {
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
  .btn-filter-toggle {
    flex: 1;
    justify-content: center;
  }

  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-buttons {
    width: 100%;
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-success,
  .btn-danger,
  .btn-secondary {
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
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-icon {
    width: 100%;
  }
}
</style>
