<template>
  <div class="layout">
    <!-- Desktop Sidebar - visible on larger screens -->
    <Sidebar v-if="!isMobile" />

    <!-- Mobile Sidebar (slide-out) -->
    <div v-if="isMobile && isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>

    <div v-if="isMobile && isMobileMenuOpen" class="mobile-sidebar">
      <div class="mobile-sidebar-header">
        <div class="logo">
          <h2>TAMARA</h2>
        </div>
        <button class="close-menu" @click="closeMobileMenu">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Mobile User Info -->
      <div class="mobile-user-info">
        <img :src="userAvatar" alt="User" class="mobile-avatar" />
        <div class="mobile-user-details">
          <span class="mobile-user-name">{{ authStore.user?.name || 'Guest' }}</span>
          <span class="mobile-user-role">{{ formatRole(authStore.user?.role) }}</span>
        </div>
      </div>

      <!-- Mobile Navigation - All links will close the sidebar -->
      <nav class="mobile-nav">
        <router-link
          to="/dashboard"
          class="mobile-nav-item"
          active-class="active"
          @click="closeMobileMenu"
        >
          <i class="fas fa-chart-pie"></i>
          <span>Dashboard</span>
        </router-link>

        <!-- Customers Section -->
        <div class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('customers')">
            <span>
              <i class="fas fa-users"></i>
              Wateja
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.customers }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.customers">
            <router-link
              to="/customers"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-list"></i>
              <span>Wateja Wote</span>
            </router-link>
            <router-link
              to="/customers/create"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-user-plus"></i>
              <span>Sajili Mteja</span>
            </router-link>
          </div>
        </div>

        <!-- Loans Section -->
        <div class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('loans')">
            <span>
              <i class="fas fa-hand-holding-usd"></i>
              Mikopo
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.loans }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.loans">
            <router-link
              to="/loans"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-list"></i>
              <span>Mikopo Yote</span>
            </router-link>
            <router-link
              to="/loans/create"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-plus-circle"></i>
              <span>Ombi la Mkopo</span>
            </router-link>
            <router-link
              to="/loans/pending"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-clock"></i>
              <span>Mikopo Inangojas</span>
              <span v-if="pendingLoansCount" class="badge">{{ pendingLoansCount }}</span>
            </router-link>
          </div>
        </div>

        <!-- Payments Section -->
        <div class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('payments')">
            <span>
              <i class="fas fa-money-bill-wave"></i>
              Malipo
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.payments }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.payments">
            <router-link
              to="/payments"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-list"></i>
              <span>Malipo Yote</span>
            </router-link>
            <router-link
              to="/payments/create"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-cash-register"></i>
              <span>Rekodi Malipo</span>
            </router-link>
          </div>
        </div>

        <!-- Collateral Section -->
        <div class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('collateral')">
            <span>
              <i class="fas fa-gem"></i>
              Dhamana
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.collateral }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.collateral">
            <router-link
              to="/collateral"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-list"></i>
              <span>Dhamana Zote</span>
            </router-link>
          </div>
        </div>

        <!-- Reports Section -->
        <div class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('reports')">
            <span>
              <i class="fas fa-chart-bar"></i>
              Ripoti
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.reports }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.reports">
            <router-link
              to="/reports/daily"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-calendar-day"></i>
              <span>Ripoti ya Siku</span>
            </router-link>
            <router-link
              to="/reports/outstanding"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-chart-line"></i>
              <span>Mikopo Inayodaiwa</span>
            </router-link>
            <router-link
              to="/reports/defaulted"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-exclamation-triangle"></i>
              <span>Mikopo Iliyochelewa</span>
            </router-link>
            <router-link
              to="/reports/profit"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-chart-pie"></i>
              <span>Ripoti ya Faida</span>
            </router-link>
          </div>
        </div>

        <!-- Admin Section -->
        <div v-if="authStore.user?.role === 'admin'" class="mobile-nav-section">
          <div class="mobile-section-header" @click="toggleMobileSection('admin')">
            <span>
              <i class="fas fa-user-cog"></i>
              Usimamizi
            </span>
            <i class="fas fa-chevron-down" :class="{ rotated: mobileOpenSections.admin }"></i>
          </div>
          <div class="mobile-submenu" v-show="mobileOpenSections.admin">
            <router-link
              to="/users"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-users-cog"></i>
              <span>Watumiaji</span>
            </router-link>
            <router-link
              to="/audit-trails"
              class="mobile-submenu-item"
              active-class="active"
              @click="closeMobileMenu"
            >
              <i class="fas fa-history"></i>
              <span>Audit Trail</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Mobile Logout -->
      <div class="mobile-sidebar-footer">
        <button @click="logout" class="mobile-logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Toka kwenye Mfumo</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'with-sidebar': !isMobile }">
      <!-- Header with hamburger menu -->
      <Header @toggle-sidebar="toggleMobileMenu" />

      <!-- Branch Info Bar - NEW SECTION -->
      <div class="branch-info-bar">
        <div class="branch-info-container">
          <div class="branch-info-left">
            <i class="fas fa-map-marker-alt branch-icon"></i>
            <div class="branch-details">
              <span class="branch-label">Tawi Linalotumika:</span>
              <span class="branch-name">{{ branchStore.currentBranchName }}</span>
              <span class="branch-location" v-if="branchStore.currentBranchLocation">
                ({{ branchStore.currentBranchLocation }})
              </span>
            </div>
          </div>

          <div class="branch-info-right">
            <!-- Add Branch Button (Admin only)  v-if="authStore.user?.role === 'admin'"-->

            <!-- Branch Switcher Dropdown -->
            <div class="branch-switcher" ref="branchSwitcherRef">
              <button class="btn-switch-branch" @click.stop="toggleBranchDropdown">
                <i class="fas fa-exchange-alt"></i>
                <span>Badilisha Tawi</span>
                <i class="fas fa-chevron-down" :class="{ rotated: showBranchDropdown }"></i>
              </button>

              <!-- Branch Dropdown -->
              <div v-if="showBranchDropdown" class="branch-dropdown">
                <div class="dropdown-header">
                  <h4>Chagua Tawi</h4>
                  <button class="close-dropdown" @click="showBranchDropdown = false">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="branches-list">
                  <div
                    v-for="branch in branchStore.branches"
                    :key="branch.id"
                    class="branch-item"
                    :class="{ active: branchStore.currentBranch?.id === branch.id }"
                    @click="selectBranch(branch)"
                  >
                    <div class="branch-item-info">
                      <span class="branch-item-name">{{ branch.name }}</span>
                      <span class="branch-item-location">{{ branch.location }}</span>
                    </div>
                    <i v-if="branchStore.currentBranch?.id === branch.id" class="fas fa-check"></i>
                  </div>
                  <hr />
                  <button
                    class="btn-add-branch"
                    @click="openAddBranchModal"
                    title="Ongeza Tawi Jipya"
                  >
                    <i class="fas fa-plus-circle"></i>
                    <span>Tawi Jipya</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="content">
        <router-view />
      </div>

      <Footer />
    </div>

    <!-- Add Branch Modal -->
    <div v-if="showAddBranchModal" class="modal-overlay" @click="closeAddBranchModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Ongeza Tawi Jipya</h3>
          <button class="close-btn" @click="closeAddBranchModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="branchName">Jina la Tawi</label>
            <input
              type="text"
              id="branchName"
              v-model="newBranch.name"
              class="form-control"
              placeholder="Mfano: Tawi la Kinondoni"
              :class="{ 'is-invalid': branchErrors.name }"
            />
            <span v-if="branchErrors.name" class="error-text">{{ branchErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="branchLocation">Eneo</label>
            <input
              type="text"
              id="branchLocation"
              v-model="newBranch.location"
              class="form-control"
              placeholder="Mfano: Dar es Salaam, Kinondoni"
              :class="{ 'is-invalid': branchErrors.location }"
            />
            <span v-if="branchErrors.location" class="error-text">{{ branchErrors.location }}</span>
          </div>

          <div class="form-group">
            <label for="branchCode">Msimbo wa Tawi</label>
            <input
              type="text"
              id="branchCode"
              v-model="newBranch.code"
              class="form-control"
              placeholder="Mfano: KND"
              :class="{ 'is-invalid': branchErrors.code }"
            />
            <span v-if="branchErrors.code" class="error-text">{{ branchErrors.code }}</span>
          </div>

          <div class="form-group">
            <label for="branchPhone">Namba ya Simu</label>
            <input
              type="text"
              id="branchPhone"
              v-model="newBranch.phone"
              class="form-control"
              placeholder="Mfano: 0712345678"
              :class="{ 'is-invalid': branchErrors.phone }"
            />
            <span v-if="branchErrors.phone" class="error-text">{{ branchErrors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="branchEmail">Barua Pepe</label>
            <input
              type="email"
              id="branchEmail"
              v-model="newBranch.email"
              class="form-control"
              placeholder="Mfano: kinondoni@tamara.co.tz"
              :class="{ 'is-invalid': branchErrors.email }"
            />
            <span v-if="branchErrors.email" class="error-text">{{ branchErrors.email }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeAddBranchModal" class="btn-secondary">Ghairi</button>
          <button @click="addBranch" class="btn-primary" :disabled="branchSaving">
            <span v-if="branchSaving" class="spinner"></span>
            <span v-else>
              <i class="fas fa-save"></i>
              Hifadhi Tawi
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <SessionWarning />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './SideBar.vue'
import Header from './AppHeader.vue'
import Footer from './AppFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useLoanStore } from '@/stores/loan'
import { useBranchStore } from '@/stores/branch'
import SessionWarning from '@/components/SessionWarning.vue'

const router = useRouter()
const authStore = useAuthStore()
const loanStore = useLoanStore()
const branchStore = useBranchStore()

onMounted(async () => {
  isMobile.value = window.innerWidth <= 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('toggle-sidebar', handleToggleSidebar)
  loadPendingCount()

  // Load branches
  await branchStore.fetchBranches()
})

// State
const isMobile = ref(false)
const isMobileMenuOpen = ref(false)
const mobileOpenSections = ref({
  customers: false,
  loans: false,
  payments: false,
  collateral: false,
  reports: false,
  admin: false,
})

// Branch state
const showBranchDropdown = ref(false)
const showAddBranchModal = ref(false)
const branchSaving = ref(false)
const branchErrors = ref({})
const branchSwitcherRef = ref(null)

const newBranch = ref({
  name: '',
  location: '',
  code: '',
  phone: '',
  email: '',
})

// Branch methods
const toggleBranchDropdown = () => {
  showBranchDropdown.value = !showBranchDropdown.value
}

const selectBranch = (branch) => {
  branchStore.setCurrentBranch(branch)
  showBranchDropdown.value = false
}

const openAddBranchModal = () => {
  showAddBranchModal.value = true
  showBranchDropdown.value = false
  resetBranchForm()
}

const closeAddBranchModal = () => {
  showAddBranchModal.value = false
  resetBranchForm()
}

const resetBranchForm = () => {
  newBranch.value = {
    name: '',
    location: '',
    code: '',
    phone: '',
    email: '',
  }
  branchErrors.value = {}
}

const addBranch = async () => {
  branchSaving.value = true
  branchErrors.value = {}

  try {
    const response = await axios.post(`${API_URL}/branches`, newBranch.value)

    if (response.data.success) {
      await branchStore.fetchBranches()
      closeAddBranchModal()
    }
  } catch (error) {
    if (error.response?.status === 422) {
      branchErrors.value = error.response.data.errors || {}
    }
    console.error('Error adding branch:', error)
  } finally {
    branchSaving.value = false
  }
}

// Handle click outside for branch dropdown
const handleClickOutside = (event) => {
  if (
    branchSwitcherRef.value &&
    !branchSwitcherRef.value.contains(event.target) &&
    showBranchDropdown.value
  ) {
    showBranchDropdown.value = false
  }
}
// Computed
const userAvatar = computed(() => {
  return authStore.user?.avatar || '/default-avatar.png'
})

const pendingLoansCount = computed(() => loanStore.pendingCount || 0)

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const toggleMobileSection = (section) => {
  mobileOpenSections.value[section] = !mobileOpenSections.value[section]
}

const formatRole = (role) => {
  const roles = {
    admin: 'Msimamizi',
    loan_officer: 'Afisa Mkopo',
    accountant: 'Mhasibu',
  }
  return roles[role] || role || 'Guest'
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  closeMobileMenu()
}

// Watch for route changes to close mobile menu
watch(
  () => router.currentRoute.value,
  () => {
    if (isMobile.value && isMobileMenuOpen.value) {
      closeMobileMenu()
    }
  },
)

// Handle window resize
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 1024

  if (!wasMobile && isMobile.value) {
    // Switching to mobile - close menu if open
    closeMobileMenu()
  }

  if (wasMobile && !isMobile.value && isMobileMenuOpen.value) {
    // Switching to desktop - close mobile menu
    closeMobileMenu()
  }
}

// Listen for toggle-sidebar event from header
const handleToggleSidebar = () => {
  if (isMobile.value) {
    toggleMobileMenu()
  }
}

// Load pending loans count
const loadPendingCount = async () => {
  if (loanStore.fetchPendingCount) {
    await loanStore.fetchPendingCount()
  }
}

// Lifecycle
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('toggle-sidebar', handleToggleSidebar)
  loadPendingCount()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('toggle-sidebar', handleToggleSidebar)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  transition: margin-left 0.3s ease;
  width: 100%;
}

.with-sidebar {
  margin-left: 280px;
}

.content {
  flex: 1;
  padding: 20px;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

/* Mobile Sidebar */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1a2639 0%, #2c3e50 100%);
  color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  overflow-y: auto;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile Sidebar Header */
.mobile-sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
}

.mobile-sidebar-header .logo h2 {
  color: white;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.close-menu {
  background: #8a9bb5;
  border: 1px solid #3498db;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px 12px;
  margin: 0 20px;
  border-radius: 5px;
  transition: background 0.3s;
}

.close-menu:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile User Info */
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.mobile-user-details {
  display: flex;
  flex-direction: column;
}

.mobile-user-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.mobile-user-role {
  font-size: 0.8rem;
  color: #8a9bb5;
}

/* Mobile Navigation */
.mobile-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #b7c0cd;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.mobile-nav-item i {
  width: 24px;
  font-size: 1.1rem;
  margin-right: 10px;
  color: #8a9bb5;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.mobile-nav-item:hover i {
  color: white;
}

.mobile-nav-item.active {
  background: #3498db;
  color: white;
}

.mobile-nav-item.active i {
  color: white;
}

.mobile-nav-section {
  margin-bottom: 5px;
}

.mobile-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  color: #b7c0cd;
  transition: background 0.3s;
}

.mobile-section-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mobile-section-header span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-section-header span i {
  width: 20px;
  color: #8a9bb5;
}

.mobile-section-header i.fa-chevron-down {
  font-size: 0.8rem;
  transition: transform 0.3s;
  color: #8a9bb5;
}

.mobile-section-header i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.mobile-submenu {
  background: rgba(0, 0, 0, 0.2);
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

.mobile-submenu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 54px;
  color: #b7c0cd;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.mobile-submenu-item i {
  width: 20px;
  font-size: 0.9rem;
  margin-right: 10px;
  color: #8a9bb5;
}

.mobile-submenu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.mobile-submenu-item:hover i {
  color: white;
}

.mobile-submenu-item.active {
  background: #3498db;
  color: white;
}

.mobile-submenu-item.active i {
  color: white;
}

.badge {
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: 5px;
}

/* Mobile Sidebar Footer */
.mobile-sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.mobile-logout-btn {
  width: 100%;
  padding: 12px;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  border-radius: 5px;
  color: #e74c3c;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.mobile-logout-btn:hover {
  background: #e74c3c;
  color: white;
}

.mobile-logout-btn i {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .with-sidebar {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 10px;
  }

  .mobile-sidebar {
    width: 100%;
  }
}

/* Branch Info Bar - NEW STYLES */
.branch-info-bar {
  background: white;
  border-bottom: 1px solid #eef2f6;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.branch-info-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.branch-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.branch-icon {
  font-size: 1.2rem;
  color: #3498db;
  background: #e3f2fd;
  padding: 8px;
  border-radius: 50%;
}

.branch-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.branch-label {
  color: #666;
  font-size: 0.9rem;
}

.branch-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.branch-location {
  color: #999;
  font-size: 0.85rem;
}

.branch-info-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-add-branch {
  padding: 6px 12px;
  background: #e3f2fd;
  border: 1px solid #3498db;
  border-radius: 6px;
  color: #1976d2;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-add-branch:hover {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.btn-add-branch i {
  font-size: 0.9rem;
}

.btn-switch-branch {
  padding: 6px 62px;
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 6px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-switch-branch:hover {
  border-color: #3498db;
  color: #3498db;
}

.btn-switch-branch i.fa-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.3s;
}

.btn-switch-branch i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

/* Branch Dropdown */
.branch-switcher {
  position: relative;
}

.branch-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 1000;
  animation: slideDown 0.2s ease;
  border: 1px solid #eef2f6;
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

.dropdown-header {
  padding: 15px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-header h4 {
  margin: 0;
  color: #333;
  font-size: 0.95rem;
  font-weight: 600;
}

.close-dropdown {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
}

.close-dropdown:hover {
  color: #e74c3c;
}

.branches-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.branch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 5px;
}

.branch-item:hover {
  background: #f8fafc;
}

.branch-item.active {
  background: #e3f2fd;
  border: 1px solid #3498db;
}

.branch-item-info {
  display: flex;
  flex-direction: column;
}

.branch-item-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.branch-item-location {
  font-size: 0.75rem;
  color: #999;
}

.branch-item i {
  color: #27ae60;
  font-size: 0.9rem;
}
</style>
