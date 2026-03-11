<template>
  <div class="loan-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Inapakia taarifa za mkopo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Hitilafu imetokea</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="loadLoan" class="btn-retry">
          <i class="fas fa-redo"></i>
          Jaribu Tena
        </button>
        <router-link to="/loans" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Rudi Kwenye Orodha
        </router-link>
      </div>
    </div>

    <!-- Loan Details -->
    <div v-else-if="loan" class="loan-detail">
      <!-- Header with Actions -->
      <div class="detail-header">
        <div class="header-left">
          <router-link to="/loans" class="back-btn">
            <i class="fas fa-arrow-left"></i>
            <span>Rudi</span>
          </router-link>
          <div class="header-title">
            <h1>Mkopo #{{ loan.loan_number }}</h1>
            <span class="loan-status-badge" :class="loan.status">
              {{ getStatusText(loan.status) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="canRecordPayment" class="btn-payment" @click="recordPayment">
            <i class="fas fa-money-bill"></i>
            <span>Rekodi Malipo</span>
          </button>
          <div class="action-dropdown" ref="actionDropdownRef">
            <button class="btn-more" @click.stop="toggleActionMenu">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div v-if="showActionMenu" class="action-menu">
              <router-link :to="`/loans/${loan.id}/edit`" v-if="canEdit" class="action-menu-item">
                <i class="fas fa-edit"></i>
                <span>Hariri Mkopo</span>
              </router-link>
              <button v-if="canApprove" @click="approveLoan" class="action-menu-item success">
                <i class="fas fa-check-circle"></i>
                <span>Idhinisha Mkopo</span>
              </button>
              <button v-if="canDisburse" @click="disburseLoan" class="action-menu-item warning">
                <i class="fas fa-hand-holding-usd"></i>
                <span>Toa Mkopo</span>
              </button>
              <button v-if="canReject" @click="rejectLoan" class="action-menu-item danger">
                <i class="fas fa-times-circle"></i>
                <span>Kataa Mkopo</span>
              </button>
              <router-link to="/payments/create" class="action-menu-item">
                <i class="fas fa-money-bill"></i>
                <span>Rekodi Malipo</span>
              </router-link>
              <router-link :to="`/loans/${loan.id}/schedule`" class="action-menu-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Ratiba ya Malipo</span>
              </router-link>
              <div class="action-menu-divider"></div>
              <button v-if="canDelete" @click="confirmDelete" class="action-menu-item danger">
                <i class="fas fa-trash-alt"></i>
                <span>Futa Mkopo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Warning Banner -->
      <div v-if="isOverdue" class="overdue-banner">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="banner-content">
          <h3>Mkopo Umechelewa!</h3>
          <p>
            Tarehe ya kukamilisha ilikuwa {{ formatDate(loan.end_date) }}. Tafadhali chukua hatua.
          </p>
        </div>
        <button class="btn-contact" @click="contactCustomer">
          <i class="fas fa-phone-alt"></i>
          Wasiliana na Mteja
        </button>
      </div>

      <!-- Risk Score Card (for pending loans) -->
      <div
        v-if="loan.status === 'pending' && loan.risk_score"
        class="risk-score-card"
        :class="loan.risk_score.level"
      >
        <div class="risk-score-header">
          <i class="fas fa-shield-alt"></i>
          <h3>
            Risk Score: {{ loan.risk_score.score }}/100 ({{
              getRiskLevelText(loan.risk_score.level)
            }})
          </h3>
        </div>
        <div class="risk-factors">
          <span v-for="(factor, index) in loan.risk_score.factors" :key="index" class="risk-factor">
            <i class="fas fa-circle"></i>
            {{ factor }}
          </span>
        </div>
        <div
          v-if="loan.approval_recommendation"
          class="recommendation"
          :class="loan.approval_recommendation.action"
        >
          <i class="fas" :class="getRecommendationIcon(loan.approval_recommendation.action)"></i>
          <span>{{ loan.approval_recommendation.message }}</span>
        </div>
        <div v-if="loan.can_auto_approve" class="auto-approve-badge">
          <i class="fas fa-robot"></i>
          Inaweza kuidhinishwa kiotomatiki
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="detail-grid">
        <!-- Left Column - Loan Summary -->
        <div class="left-column">
          <!-- Loan Summary Card -->
          <div class="summary-card">
            <h3>Muhtasari wa Mkopo</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">Kiasi cha Mkopo</span>
                <span class="stat-value large">{{ formatCurrency(loan.amount) }}</span>
              </div>
              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-label">Riba</span>
                  <span class="stat-value">{{ loan.interest_rate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Jumla ya Kurejesha</span>
                  <span class="stat-value">{{ formatCurrency(loan.total_amount) }}</span>
                </div>
              </div>
              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-label">Imelipwa</span>
                  <span class="stat-value success">{{
                    formatCurrency(loan.paid_amount || 0)
                  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Imebaki</span>
                  <span class="stat-value" :class="{ 'text-danger': loan.balance > 0 }">
                    {{ formatCurrency(loan.balance) }}
                  </span>
                </div>
              </div>
              <div v-if="loan.status === 'pending'" class="stat-item">
                <span class="stat-label">Siku Zilizopita Tangu Kuombwa</span>
                <span class="stat-value">{{ loan.days_pending || 0 }} siku</span>
              </div>
              <div v-if="loan.progress_percentage !== undefined" class="progress-bar">
                <div class="progress-fill" :style="{ width: loan.progress_percentage + '%' }"></div>
                <span class="progress-text">{{ loan.progress_percentage }}% imelipwa</span>
              </div>
            </div>
          </div>

          <!-- Customer Information Card -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-user"></i>
              <h3>Taarifa za Mteja</h3>
              <router-link :to="`/customers/${loan.customer?.id}`" class="btn-view">
                <i class="fas fa-external-link-alt"></i>
                Angalia
              </router-link>
            </div>

            <div v-if="loan.customer" class="customer-details">
              <div class="customer-profile">
                <img
                  :src="loan.customer.profile_photo_url || '/default-avatar.png'"
                  :alt="loan.customer.full_name"
                  class="customer-avatar"
                />
                <div class="customer-info">
                  <span class="customer-name">
                    {{ loan.customer.first_name }} {{ loan.customer.last_name }}
                  </span>
                  <span class="customer-occupation">{{ loan.customer.occupation }}</span>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-row">
                  <i class="fas fa-phone-alt"></i>
                  <span>{{ loan.customer.phone }}</span>
                </div>
                <div class="info-row" v-if="loan.customer.email">
                  <i class="fas fa-envelope"></i>
                  <span>{{ loan.customer.email }}</span>
                </div>
                <div class="info-row">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ loan.customer.address }}</span>
                </div>
                <div class="info-row">
                  <i class="fas fa-id-card"></i>
                  <span>{{ loan.customer.id_number }} ({{ loan.customer.id_type || 'NIDA' }})</span>
                </div>
              </div>

              <!-- Customer Loan History -->
              <div v-if="loan.customer_loan_history" class="customer-history">
                <h4>Historia ya Mikopo</h4>
                <div class="history-stats">
                  <div class="history-stat">
                    <span class="stat-number">{{ loan.customer_loan_history.total_loans }}</span>
                    <span class="stat-label">Jumla ya Mikopo</span>
                  </div>
                  <div class="history-stat">
                    <span class="stat-number">{{ loan.customer_loan_history.active_loans }}</span>
                    <span class="stat-label">Inayoendelea</span>
                  </div>
                  <div class="history-stat">
                    <span class="stat-number">{{
                      loan.customer_loan_history.previous_defaults
                    }}</span>
                    <span class="stat-label">Mikopo Iliyochelewa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Schedule Preview -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-calendar-alt"></i>
              <h3>Ratiba ya Malipo</h3>
              <router-link :to="`/loans/${loan.id}/schedule`" class="btn-view">
                <i class="fas fa-eye"></i>
                Angalia Zote
              </router-link>
            </div>

            <div v-if="paymentScheduleLoading" class="loading-small">
              <div class="spinner-small"></div>
              <span>Inapakia ratiba...</span>
            </div>
            <div v-else class="schedule-preview">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tarehe ya Malipo</th>
                    <th>Kiasi</th>
                    <th>Hali</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment, index) in paymentSchedule.slice(0, 3)" :key="index">
                    <td>{{ payment.installment }}</td>
                    <td>{{ formatDate(payment.due_date) }}</td>
                    <td>{{ formatCurrency(payment.amount) }}</td>
                    <td>
                      <span class="status-badge small" :class="payment.status">
                        {{ getPaymentStatus(payment.status) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="paymentSchedule.length > 3">
                    <td colspan="4" class="text-center">
                      <router-link :to="`/loans/${loan.id}/schedule`" class="view-more-link">
                        Na mingine {{ paymentSchedule.length - 3 }}...
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column - Loan Details -->
        <div class="right-column">
          <!-- Loan Details Card -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-info-circle"></i>
              <h3>Maelezo ya Mkopo</h3>
            </div>

            <div class="details-grid">
              <div class="detail-row">
                <span class="detail-label">Namba ya Mkopo:</span>
                <span class="detail-value">#{{ loan.loan_number }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tarehe ya Kuombwa:</span>
                <span class="detail-value">{{ formatDate(loan.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tarehe ya Kuanza:</span>
                <span class="detail-value">{{ formatDate(loan.start_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tarehe ya Kukamilisha:</span>
                <span class="detail-value">{{ formatDate(loan.end_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Muda wa Mkopo:</span>
                <span class="detail-value">{{ loan.duration_months }} miezi</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Muda wa Malipo:</span>
                <span class="detail-value">{{ getFrequencyText(loan.payment_frequency) }}</span>
              </div>
              <div class="detail-row" v-if="loan.payment_days">
                <span class="detail-label">Siku za Malipo:</span>
                <span class="detail-value">{{ getPaymentDaysText(loan.payment_days) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Riba:</span>
                <span class="detail-value"
                  >{{ loan.interest_rate }}% ({{ formatCurrency(loan.interest_amount) }})</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Malipo kwa Mwezi:</span>
                <span class="detail-value">{{ formatCurrency(loan.installment_amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Purpose Card -->
          <div v-if="loan.purpose" class="info-card">
            <div class="card-header">
              <i class="fas fa-bullseye"></i>
              <h3>Madhumuni ya Mkopo</h3>
            </div>
            <p class="purpose-text">{{ loan.purpose }}</p>
          </div>

          <!-- Collateral Card - Supporting both formats -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-gem"></i>
              <h3>Dhamana</h3>
              <button v-if="canAddCollateral" class="btn-add" @click="showAddCollateral = true">
                <i class="fas fa-plus"></i>
                Ongeza
              </button>
            </div>

            <!-- Check for multiple collaterals first -->
            <div v-if="loan.collaterals && loan.collaterals.length > 0" class="collaterals-list">
              <div
                v-for="collateralItem in loan.collaterals"
                :key="collateralItem.id"
                class="collateral-item"
              >
                <div class="collateral-icon" :class="collateralItem.type">
                  <i :class="getCollateralIcon(collateralItem.type)"></i>
                </div>
                <div class="collateral-info">
                  <span class="collateral-name">{{ collateralItem.name || 'Dhamana' }}</span>
                  <span class="collateral-type">{{ collateralItem.type }}</span>
                  <span class="collateral-value">{{
                    formatCurrency(collateralItem.estimated_value)
                  }}</span>
                </div>
                <button class="btn-view-small" @click="viewCollateral(collateralItem)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <!-- Fallback to single collateral -->
            <div v-else-if="loan.collateral" class="collateral-item">
              <div class="collateral-icon" :class="loan.collateral.type">
                <i :class="getCollateralIcon(loan.collateral.type)"></i>
              </div>
              <div class="collateral-info">
                <span class="collateral-name">{{ loan.collateral.description || 'Dhamana' }}</span>
                <span class="collateral-type">{{ loan.collateral.type }}</span>
                <span class="collateral-value">{{
                  formatCurrency(loan.collateral.estimated_value)
                }}</span>
              </div>
              <button class="btn-view-small" @click="viewCollateral(loan.collateral)">
                <i class="fas fa-eye"></i>
              </button>
            </div>

            <!-- No collateral -->
            <div v-else class="empty-state-small">
              <i class="fas fa-gem"></i>
              <p>Hakuna dhamana kwa mkopo huu</p>
            </div>

            <!-- Collateral Summary -->
            <div
              v-if="loan.collaterals_summary && loan.collaterals.length > 0"
              class="collateral-summary"
            >
              <div class="summary-row">
                <span class="summary-label">Jumla ya Thamani:</span>
                <span class="summary-value">{{
                  formatCurrency(loan.collaterals_summary.total_value)
                }}</span>
              </div>
            </div>
          </div>
          <!-- Guarantors Card -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-users"></i>
              <h3>Wadhamini</h3>
              <button v-if="canAddGuarantor" class="btn-add" @click="showAddGuarantor = true">
                <i class="fas fa-plus"></i>
                Ongeza
              </button>
            </div>

            <div v-if="loan.guarantors && loan.guarantors.length > 0" class="guarantors-list">
              <div v-for="guarantor in loan.guarantors" :key="guarantor.id" class="guarantor-item">
                <img
                  :src="guarantor.photo || '/default-avatar.png'"
                  :alt="guarantor.name"
                  class="guarantor-avatar"
                />
                <div class="guarantor-info">
                  <span class="guarantor-name">{{ guarantor.name }}</span>
                  <span class="guarantor-relation">{{ guarantor.relationship }}</span>
                  <span class="guarantor-phone">{{ guarantor.phone }}</span>
                </div>
                <button class="btn-view-small" @click="viewGuarantor(guarantor)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <i class="fas fa-users"></i>
              <p>Hakuna wadhamini kwa mkopo huu</p>
            </div>
          </div>

          <!-- Approval/Rejection History -->
          <div class="info-card" v-if="loan.approved_by || loan.rejection_reason">
            <div class="card-header">
              <i class="fas fa-history"></i>
              <h3>Historia ya Uidhinishaji</h3>
            </div>

            <div v-if="loan.approved_by" class="history-item">
              <i class="fas fa-check-circle success"></i>
              <div class="history-details">
                <span class="history-title">Imeidhinishwa na {{ loan.approved_by.name }}</span>
                <span class="history-date">{{ formatDate(loan.approval_date) }}</span>
                <p v-if="loan.approved_notes" class="history-notes">{{ loan.approved_notes }}</p>
              </div>
            </div>

            <div v-if="loan.rejection_reason" class="history-item">
              <i class="fas fa-times-circle danger"></i>
              <div class="history-details">
                <span class="history-title">Imekataliwa</span>
                <span class="history-date">{{ formatDate(loan.updated_at) }}</span>
                <p class="history-notes">{{ loan.rejection_reason }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Payments -->
        <div class="recent-payments-card">
          <div class="card-header">
            <i class="fas fa-money-bill-wave"></i>
            <h3>Malipo ya Hivi Karibuni</h3>
            <router-link :to="`/loans/${loan.id}/payments`" class="btn-view">
              <i class="fas fa-eye"></i>
              Angalia Yote
            </router-link>
          </div>

          <div v-if="paymentsLoading" class="loading-small">
            <div class="spinner-small"></div>
            <span>Inapakia malipo...</span>
          </div>
          <div v-else class="table-responsive">
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Namba ya Malipo</th>
                  <th>Tarehe</th>
                  <th>Kiasi</th>
                  <th>Aina</th>
                  <th>Njia</th>
                  <th>Imehakikiwa</th>
                  <th>Vitendo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in recentPayments" :key="payment.id">
                  <td>#{{ payment.payment_number }}</td>
                  <td>{{ formatDate(payment.payment_date) }}</td>
                  <td>{{ formatCurrency(payment.amount) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="payment.payment_type === 'full' ? 'full' : 'partial'"
                    >
                      {{ payment.payment_type === 'full' ? 'Kamilifu' : 'Sehemu' }}
                    </span>
                  </td>
                  <td>
                    <span class="payment-method">
                      <i :class="getPaymentMethodIcon(payment.payment_method)"></i>
                      {{ getPaymentMethodText(payment.payment_method) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="payment.verified ? 'verified' : 'unverified'">
                      {{ payment.verified ? 'Ndiyo' : 'Hapana' }}
                    </span>
                  </td>
                  <td>
                    <button @click="viewPayment(payment)" class="btn-icon-small" title="Angalia">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      @click="printReceipt(payment)"
                      class="btn-icon-small"
                      title="Chapisha risiti"
                    >
                      <i class="fas fa-print"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="recentPayments.length === 0">
                  <td colspan="7" class="text-center">
                    <div class="empty-state-small">
                      <i class="fas fa-money-bill"></i>
                      <p>Hakuna malipo bado</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Modals (same as before) -->
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
            <div class="loan-summary">
              <p><strong>Kiasi:</strong> {{ formatCurrency(loan.amount) }}</p>
              <p>
                <strong>Mteja:</strong> {{ loan.customer?.first_name }}
                {{ loan.customer?.last_name }}
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
        <div class="modal-content delete-modal" @click.stop>
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
            <p class="warning-text">
              <strong>Mkopo #{{ loan?.loan_number }}</strong>
            </p>
            <p class="warning-note">
              <i class="fas fa-info-circle"></i>
              Hatua hii haiwezi kutenguliwa. Mkopo utafutwa kabisa kwenye mfumo pamoja na taarifa
              zake zote.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary">Ghairi</button>
            <button @click="confirmDelete" class="btn-danger" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner"></span>
              <span v-else>
                <i class="fas fa-trash-alt"></i>
                Futa Mkopo
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Collateral Modal -->
      <div v-if="showAddCollateral" class="modal-overlay" @click="showAddCollateral = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Ongeza Dhamana</h3>
            <button class="close-btn" @click="showAddCollateral = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-center text-muted">
              <i class="fas fa-info-circle"></i>
              Kipengele hiki kitaongezwa hivi karibuni
            </p>
          </div>
          <div class="modal-footer">
            <button @click="showAddCollateral = false" class="btn-primary">Sawa</button>
          </div>
        </div>
      </div>

      <!-- Add Guarantor Modal -->
      <div v-if="showAddGuarantor" class="modal-overlay" @click="showAddGuarantor = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Ongeza Mdhamini</h3>
            <button class="close-btn" @click="showAddGuarantor = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-center text-muted">
              <i class="fas fa-info-circle"></i>
              Kipengele hiki kitaongezwa hivi karibuni
            </p>
          </div>
          <div class="modal-footer">
            <button @click="showAddGuarantor = false" class="btn-primary">Sawa</button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="showToast" class="toast-notification" :class="toastType">
        <i :class="toastIcon"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCurrency, formatDate } from '@/utils/formatters'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// API base URL
// const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const API_URL = import.meta.env.VITE_API_URL || 'https://web.bas.co.tz/api/v1'

// State
const loan = ref(null)
const loading = ref(false)
const error = ref(null)
const showActionMenu = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showDisburseModal = ref(false)
const showDeleteModal = ref(false)
const showAddCollateral = ref(false)
const showAddGuarantor = ref(false)
const actionLoading = ref(false)
const deleteLoading = ref(false)
const approvalNotes = ref('')
const rejectionReason = ref('')
const disbursementNotes = ref('')
const paymentSchedule = ref([])
const paymentScheduleLoading = ref(false)
const recentPayments = ref([])
const paymentsLoading = ref(false)

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Refs
const actionDropdownRef = ref(null)

// Computed
const isOverdue = computed(() => {
  if (!loan.value) return false
  return loan.value.is_overdue || false
})

const paymentProgress = computed(() => {
  if (!loan.value) return 0
  return loan.value.progress_percentage || 0
})

const canEdit = computed(() => {
  return ['pending', 'rejected'].includes(loan.value?.status)
})

const canApprove = computed(() => {
  return loan.value?.status === 'pending'
})

const canDisburse = computed(() => {
  return loan.value?.status === 'approved'
})

const canReject = computed(() => {
  return ['pending', 'approved'].includes(loan.value?.status)
})

const canRecordPayment = computed(() => {
  return ['active', 'defaulted'].includes(loan.value?.status) && loan.value?.balance > 0
})

const canDelete = computed(() => {
  return ['pending', 'rejected'].includes(loan.value?.status)
})

const canAddCollateral = computed(() => {
  return ['pending', 'approved'].includes(loan.value?.status)
})

const canAddGuarantor = computed(() => {
  return ['pending', 'approved'].includes(loan.value?.status)
})

const toastIcon = computed(() => {
  return toastType.value === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
})

// Methods
const loadLoan = async () => {
  const loanId = route.params.id ?? 'loan'

  loading.value = true
  error.value = null

  try {
    // Try to load from pending endpoint first, fallback to regular loan endpoint
    let response
    try {
      response = await axios.get(`${API_URL}/loans/pending/${loanId}`)
    } catch (err) {
      response = await axios.get(`${API_URL}/loans/${loanId}`)
    }

    if (response.data.success) {
      loan.value = response.data.data

      // Load additional data
      await loadPaymentSchedule(loanId)
      await loadRecentPayments(loanId)
    } else {
      error.value = 'Mkopo haukupatikana'
    }
  } catch (err) {
    console.error('Error loading loan:', err)
    error.value =
      err.response?.data?.message || 'Imeshindwa kupakia taarifa za mkopo. Tafadhali jaribu tena.'
  } finally {
    loading.value = false
  }
}

const loadPaymentSchedule = async (loanId) => {
  paymentScheduleLoading.value = true
  try {
    const response = await axios.get(`${API_URL}/loans/${loanId}/payment-schedule`)
    if (response.data.success) {
      paymentSchedule.value = response.data.data || []
    }
  } catch (err) {
    console.error('Error loading payment schedule:', err)
  } finally {
    paymentScheduleLoading.value = false
  }
}

const loadRecentPayments = async (loanId) => {
  paymentsLoading.value = true
  try {
    const response = await axios.get(`${API_URL}/loans/${loanId}/payments`, {
      params: { per_page: 5 },
    })
    if (response.data.success) {
      recentPayments.value = response.data.data.data || []
    }
  } catch (err) {
    console.error('Error loading recent payments:', err)
  } finally {
    paymentsLoading.value = false
  }
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

const getPaymentStatus = (status) => {
  const statusMap = {
    paid: 'Imelipwa',
    pending: 'Inasubiri',
    overdue: 'Imechelewa',
  }
  return statusMap[status] || status
}

const getFrequencyText = (frequency) => {
  const texts = {
    daily: 'Kila Siku',
    weekly: 'Kila Wiki',
    monthly: 'Kila Mwezi',
  }
  return texts[frequency] || frequency
}

const getPaymentDaysText = (paymentDays) => {
  if (!paymentDays) return ''
  try {
    const days = JSON.parse(paymentDays)
    return days.days ? days.days.join(', ') : ''
  } catch {
    return paymentDays
  }
}

const getRiskLevelText = (level) => {
  const texts = {
    low: 'Chini',
    medium: 'Wastani',
    high: 'Juu',
    very_high: 'Juu Sana',
  }
  return texts[level] || level
}

const getRecommendationIcon = (action) => {
  const icons = {
    approve: 'fa-check-circle',
    review: 'fa-exclamation-circle',
    review_carefully: 'fa-exclamation-triangle',
    reject: 'fa-times-circle',
  }
  return icons[action] || 'fa-question-circle'
}

const getCollateralIcon = (type) => {
  const icons = {
    land: 'fas fa-tree',
    vehicle: 'fas fa-car',
    equipment: 'fas fa-tools',
    building: 'fas fa-building',
    title_deed: 'fas fa-file-alt',
    other: 'fas fa-box',
  }
  return icons[type] || 'fas fa-gem'
}

const getPaymentMethodIcon = (method) => {
  const icons = {
    cash: 'fas fa-money-bill',
    bank_transfer: 'fas fa-university',
    mobile_money: 'fas fa-mobile-alt',
    cheque: 'fas fa-money-check',
  }
  return icons[method] || 'fas fa-money-bill'
}

const getPaymentMethodText = (method) => {
  const texts = {
    cash: 'Cash',
    bank_transfer: 'Benki',
    mobile_money: 'M-Pesa/TigoPesa',
    cheque: 'Cheque',
  }
  return texts[method] || method
}

// Action Menu
const toggleActionMenu = () => {
  showActionMenu.value = !showActionMenu.value
}

const closeActionMenu = () => {
  showActionMenu.value = false
}

// Handle click outside
const handleClickOutside = (event) => {
  if (actionDropdownRef.value && !actionDropdownRef.value.contains(event.target)) {
    closeActionMenu()
  }
}

// Actions
const recordPayment = () => {
  router.push(`/payments/create?loan_id=${loan.value.id}`)
  closeActionMenu()
}

const contactCustomer = () => {
  if (loan.value?.customer?.phone) {
    window.location.href = `tel:${loan.value.customer.phone}`
  }
}

// Approve modal
const approveLoan = () => {
  showApproveModal.value = true
  closeActionMenu()
}

const closeApproveModal = () => {
  showApproveModal.value = false
  approvalNotes.value = ''
}

const confirmApprove = async () => {
  if (!loan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${loan.value.id}/approve`, {
      approved_notes: approvalNotes.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umeidhinishwa kwa mafanikio', 'success')
      closeApproveModal()
      await loadLoan()
    }
  } catch (err) {
    console.error('Error approving loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Reject modal
const rejectLoan = () => {
  showRejectModal.value = true
  closeActionMenu()
}

const closeRejectModal = () => {
  showRejectModal.value = false
  rejectionReason.value = ''
}

const confirmReject = async () => {
  if (!rejectionReason.value || !loan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${loan.value.id}/reject`, {
      rejection_reason: rejectionReason.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umekataliwa', 'info')
      closeRejectModal()
      await loadLoan()
    }
  } catch (err) {
    console.error('Error rejecting loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Disburse modal
const disburseLoan = () => {
  showDisburseModal.value = true
  closeActionMenu()
}

const closeDisburseModal = () => {
  showDisburseModal.value = false
  disbursementNotes.value = ''
}

const confirmDisburse = async () => {
  if (!loan.value) return

  actionLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/loans/${loan.value.id}/disburse`, {
      start_date: new Date().toISOString().split('T')[0],
      disbursed_notes: disbursementNotes.value,
    })

    if (response.data.success) {
      showToastMessage('Mkopo umetolewa kwa mafanikio', 'success')
      closeDisburseModal()
      await loadLoan()
    }
  } catch (err) {
    console.error('Error disbursing loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Delete modal
const confirmDelete = () => {
  showDeleteModal.value = true
  closeActionMenu()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const deleteLoan = async () => {
  if (!loan.value) return

  deleteLoading.value = true

  try {
    const response = await axios.delete(`${API_URL}/loans/${loan.value.id}`)

    if (response.data.success) {
      showToastMessage('Mkopo umefutwa kwa mafanikio', 'success')
      setTimeout(() => {
        router.push('/loans')
      }, 1500)
    }
  } catch (err) {
    console.error('Error deleting loan:', err)
    showToastMessage(err.response?.data?.message || 'Hitilafu imetokea', 'error')
    closeDeleteModal()
  } finally {
    deleteLoading.value = false
  }
}

// View related items
const viewCollateral = (collateralItem) => {
  if (collateralItem?.id) {
    router.push(`/collateral/${collateralItem.id}`)
  }
}

const viewGuarantor = (guarantor) => {
  router.push(`/guarantors/${guarantor.id}`)
}

const viewPayment = (payment) => {
  router.push(`/payments/${payment.id}`)
}

const printReceipt = (payment) => {
  showToastMessage('Kipengele cha kuchapisha risiti kitaongezwa hivi karibuni', 'info')
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
  loadLoan()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Add these additional styles for risk score and pending loan specific elements */

.risk-score-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  border-left: 4px solid;
}

.risk-score-card.low {
  border-left-color: #27ae60;
}

.risk-score-card.medium {
  border-left-color: #f39c12;
}

.risk-score-card.high {
  border-left-color: #e74c3c;
}

.risk-score-card.very_high {
  border-left-color: #c0392b;
}

.risk-score-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.risk-score-header i {
  font-size: 1.2rem;
  color: #3498db;
}

.risk-score-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.risk-factors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.risk-factor {
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.risk-factor i {
  font-size: 0.5rem;
  color: #3498db;
}

.recommendation {
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.recommendation.approve {
  background: #d4edda;
  color: #155724;
}

.recommendation.review {
  background: #fff3cd;
  color: #856404;
}

.recommendation.review_carefully {
  background: #ffe5d0;
  color: #e67e22;
}

.recommendation.reject {
  background: #f8d7da;
  color: #721c24;
}

.recommendation i {
  font-size: 1rem;
}

.auto-approve-badge {
  margin-top: 15px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.customer-history {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eef2f6;
}

.customer-history h4 {
  margin: 0 0 15px;
  color: #333;
  font-size: 0.95rem;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.history-stat {
  text-align: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.history-stat .stat-label {
  font-size: 0.75rem;
  color: #666;
}

.loading-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px;
  color: #999;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #eef2f6;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loan-detail-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
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
  margin-bottom: 25px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
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

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.header-title h1 {
  font-size: 1.8rem;
  color: #1a2639;
  margin: 0;
}

.loan-status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.loan-status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.loan-status-badge.approved {
  background: #cce5ff;
  color: #004085;
}

.loan-status-badge.active {
  background: #d4edda;
  color: #155724;
}

.loan-status-badge.paid {
  background: #d1d8e0;
  color: #2c3e50;
}

.loan-status-badge.defaulted {
  background: #f8d7da;
  color: #721c24;
}

.loan-status-badge.rejected {
  background: #e2e3e5;
  color: #383d41;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-payment {
  padding: 10px 20px;
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-payment:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.btn-more {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-more:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

/* Action Dropdown */
.action-dropdown {
  position: relative;
}

.action-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
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

/* Overdue Banner */
.overdue-banner {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border-radius: 10px;
  padding: 15px 25px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.overdue-banner i {
  font-size: 2rem;
}

.banner-content {
  flex: 1;
}

.banner-content h3 {
  margin: 0 0 5px;
  font-size: 1.2rem;
}

.banner-content p {
  margin: 0;
  opacity: 0.9;
}

.btn-contact {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-contact:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Main Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

@media (max-width: 992px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Left Column */
.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Summary Card */
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

.summary-card h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 1.1rem;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.stat-value.large {
  font-size: 1.8rem;
  color: #3498db;
}

.stat-value.success {
  color: #27ae60;
}

.stat-value.text-danger {
  color: #e74c3c;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.progress-bar {
  position: relative;
  height: 30px;
  background: #eef2f6;
  border-radius: 15px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 15px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eef2f6;
}

.card-header i {
  font-size: 1.2rem;
  color: #3498db;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  flex: 1;
}

.btn-view {
  padding: 5px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-view:hover {
  background: #1976d2;
  color: white;
}

.btn-add {
  padding: 5px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.btn-add:hover {
  background: #1976d2;
  color: white;
}

.btn-view-small {
  width: 30px;
  height: 30px;
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

.btn-view-small:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

/* Customer Details */
.customer-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.customer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.customer-occupation {
  font-size: 0.9rem;
  color: #666;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 0.95rem;
}

.info-row i {
  width: 18px;
  color: #3498db;
}

/* Schedule Preview */
.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th {
  text-align: left;
  padding: 8px;
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.preview-table td {
  padding: 8px;
  font-size: 0.9rem;
  color: #333;
  border-bottom: 1px solid #eef2f6;
}

.status-badge.small {
  padding: 2px 8px;
  font-size: 0.75rem;
  display: inline-block;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.view-more-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.85rem;
}

.view-more-link:hover {
  text-decoration: underline;
}

/* Details Grid */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.detail-label {
  min-width: 140px;
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

/* Purpose Text */
.purpose-text {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* Collateral Details */
.collateral-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}

.collateral-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.collateral-icon.land {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.collateral-icon.vehicle {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.collateral-icon.equipment {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.collateral-icon.title_deed {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.collateral-icon.other {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.collateral-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.collateral-name {
  font-weight: 600;
  color: #333;
}

.collateral-type {
  font-size: 0.8rem;
  color: #3498db;
}

.collateral-value {
  font-size: 0.85rem;
  color: #27ae60;
  font-weight: 500;
}

/* Guarantors List */
.guarantors-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guarantor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}

.guarantor-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.guarantor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guarantor-name {
  font-weight: 600;
  color: #333;
}

.guarantor-relation {
  font-size: 0.8rem;
  color: #3498db;
}

.guarantor-phone {
  font-size: 0.8rem;
  color: #666;
}

/* History Item */
.history-item {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f6;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item i {
  font-size: 1.2rem;
  margin-top: 2px;
}

.history-item i.success {
  color: #27ae60;
}

.history-item i.danger {
  color: #e74c3c;
}

.history-details {
  flex: 1;
}

.history-title {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 3px;
}

.history-date {
  font-size: 0.8rem;
  color: #999;
  display: block;
  margin-bottom: 5px;
}

.history-notes {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #666;
  background: #f8fafc;
  padding: 8px;
  border-radius: 5px;
}

/* Recent Payments Card */
.recent-payments-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  margin-top: 25px;
}

.table-responsive {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th {
  text-align: left;
  padding: 12px 10px;
  background: #f8fafc;
  color: #1a2639;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #eef2f6;
}

.payments-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #eef2f6;
  color: #666;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.full {
  background: #cce5ff;
  color: #004085;
}

.badge.partial {
  background: #fff3cd;
  color: #856404;
}

.badge.verified {
  background: #d4edda;
  color: #155724;
}

.badge.unverified {
  background: #f8d7da;
  color: #721c24;
}

.payment-method i {
  margin-right: 5px;
  color: #3498db;
}

.btn-icon-small {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #eef2f6;
  background: white;
  color: #666;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.3s;
}

.btn-icon-small:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
}

/* Empty State Small */
.empty-state-small {
  text-align: center;
  padding: 30px 20px;
  color: #999;
}

.empty-state-small i {
  font-size: 2rem;
  color: #cbd5e0;
  margin-bottom: 10px;
}

.empty-state-small p {
  margin: 0;
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

.loan-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.loan-summary p {
  margin: 5px 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.required label::after {
  content: '*';
  color: #e74c3c;
  margin-left: 4px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
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

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-secondary,
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

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
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

.btn-secondary {
  background: #f8fafc;
  color: #666;
  border: 1px solid #eef2f6;
}

.btn-secondary:hover {
  background: #eef2f6;
  color: #333;
}

.btn-primary:disabled,
.btn-success:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Text Utilities */
.text-center {
  text-align: center;
}

.text-muted {
  color: #999;
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

.toast-notification i {
  font-size: 1.2rem;
}

.toast-notification.success i {
  color: #27ae60;
}

.toast-notification.error i {
  color: #e74c3c;
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
  .loan-detail-container {
    padding: 15px;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
  }

  .header-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-payment {
    flex: 1;
  }

  .overdue-banner {
    flex-direction: column;
    text-align: center;
  }

  .stat-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .detail-row {
    flex-direction: column;
    gap: 5px;
  }

  .detail-label {
    min-width: auto;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-success,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }

  .toast-notification {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}

.collaterals-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.collateral-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f6;
  transition: all 0.3s;
}

.collateral-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.collateral-description {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.collateral-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eef2f6;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  color: #333;
}

.badge-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.pending {
  background: #fff3cd;
  color: #856404;
}

.badge.verified {
  background: #d4edda;
  color: #155724;
}
</style>
