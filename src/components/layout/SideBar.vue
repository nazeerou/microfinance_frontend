<template>
  <!-- Mobile Overlay - only shows when sidebar is open -->
  <div v-if="isMobile && isOpen" class="sidebar-overlay" @click="closeSidebar"></div>

  <!-- Sidebar - hidden by default on mobile -->
  <aside
    class="sidebar"
    :class="{
      'sidebar-open': isOpen,
      'sidebar-closed': !isOpen && isMobile,
      'sidebar-desktop': !isMobile,
    }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="logo">
        <img v-if="collapsedLogo" :src="collapsedLogo" alt="Logo" class="logo-img" />
        <h2 v-else>TAMARA</h2>
      </div>
      <!-- Close button only on mobile when sidebar is open -->
      <button class="close-sidebar" @click="closeSidebar" v-if="isMobile && isOpen">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- User Info (Mobile) - only show when sidebar is open -->
    <div class="mobile-user-info" v-if="isMobile && isOpen && authStore.user">
      <img :src="userAvatar" alt="User" class="user-avatar" />
      <div class="user-details">
        <img :src="userAvatar" alt="User" class="avatar" />
        <div class="user-details" v-if="!isMobile">
          <span class="user-name">{{ userDisplayName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <div class="debug-info" style="font-size: 10px; color: #999; padding: 5px">
          <div>Auth: {{ authStore.isAuthenticated }}</div>
          <div>User: {{ authStore.user ? 'Yes' : 'No' }}</div>
          <div>Name: {{ userDisplayName }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav-menu">
      <!-- Dashboard -->
      <router-link
        to="/dashboard"
        class="nav-item"
        active-class="active"
        @click="closeSidebarOnMobile"
      >
        <i class="fas fa-chart-pie"></i>
        <span>Dashboard</span>
      </router-link>

      <!-- Customers Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('customers')">
          <div class="section-title">
            <i class="fas fa-users"></i>
            <span>Wateja</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.customers }"></i>
        </div>
        <div class="submenu" v-show="openSections.customers">
          <router-link
            to="/customers"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-list"></i>
            <span>Wateja Wote</span>
          </router-link>
          <router-link
            to="/customers/create"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-user-plus"></i>
            <span>Sajili Mteja</span>
          </router-link>
        </div>
      </div>

      <!-- Loans Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('loans')">
          <div class="section-title">
            <i class="fas fa-hand-holding-usd"></i>
            <span>Mikopo</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.loans }"></i>
        </div>
        <div class="submenu" v-show="openSections.loans">
          <router-link to="/loans" class="submenu-item" @click="closeSidebarOnMobile">
            <i class="fas fa-list"></i>
            <span>Mikopo Yote</span>
          </router-link>
          <router-link to="/loans/create" class="submenu-item" @click="closeSidebarOnMobile">
            <i class="fas fa-plus-circle"></i>
            <span>Ombi la Mkopo</span>
          </router-link>
          <router-link to="/loans/pending" class="submenu-item" @click="closeSidebarOnMobile">
            <i class="fas fa-clock"></i>
            <span>Mikopo Yetu</span>
            <span v-if="pendingLoansCount" class="badge">{{ pendingLoansCount }}</span>
          </router-link>
          <router-link to="/loans/penalty" class="submenu-item" @click="closeSidebarOnMobile">
            <i class="fas fa-clock"></i>
            <span>Mikopo Iliyopitiliza (Penalty)</span>
            <span v-if="pendingLoansCount" class="badge">{{ pendingLoansPenalty }}</span>
          </router-link>
        </div>
      </div>

      <!-- Payments Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('payments')">
          <div class="section-title">
            <i class="fas fa-money-bill-wave"></i>
            <span>Malipo</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.payments }"></i>
        </div>
        <div class="submenu" v-show="openSections.payments">
          <router-link
            to="/payments"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-list"></i>
            <span>Malipo Yote</span>
          </router-link>
          <router-link
            to="/payments/create"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-cash-register"></i>
            <span>Rekodi Malipo</span>
          </router-link>
        </div>
      </div>

      <!-- Collateral Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('collateral')">
          <div class="section-title">
            <i class="fas fa-gem"></i>
            <span>Dhamana</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.collateral }"></i>
        </div>
        <div class="submenu" v-show="openSections.collateral">
          <router-link
            to="/collateral"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-list"></i>
            <span>Dhamana Zote</span>
          </router-link>
        </div>
      </div>

      <!-- Reports Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('reports')">
          <div class="section-title">
            <i class="fas fa-chart-bar"></i>
            <span>Ripoti</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.reports }"></i>
        </div>
        <div class="submenu" v-show="openSections.reports">
          <router-link
            to="/reports"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-calendar-day"></i>
            <span>Ripoti Zote</span>
          </router-link>
          <router-link
            to="/reports/outstanding"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-chart-line"></i>
            <span>Mikopo Inayodaiwa</span>
          </router-link>
          <router-link
            to="/reports/defaulted"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-exclamation-triangle"></i>
            <span>Mikopo Iliyochelewa</span>
          </router-link>
          <router-link
            to="/reports/profit"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-chart-pie"></i>
            <span>Ripoti ya Faida</span>
          </router-link>
        </div>
      </div>

      <!-- Admin Section (conditional) -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('admin')">
          <div class="section-title">
            <i class="fas fa-user-cog"></i>
            <span>Usimamizi</span>
          </div>
          <i class="fas fa-chevron-down" :class="{ rotated: openSections.admin }"></i>
        </div>
        <div class="submenu" v-show="openSections.admin">
          <router-link
            to="/users"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-users-cog"></i>
            <span>Watumiaji</span>
          </router-link>
          <router-link
            to="/audit-trails"
            class="submenu-item"
            active-class="active"
            @click="closeSidebarOnMobile"
          >
            <i class="fas fa-history"></i>
            <span>Audit Trail</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Sidebar Footer - hide on mobile when sidebar is closed -->
    <div class="sidebar-footer" v-if="!isMobile || (isMobile && isOpen)">
      <div class="user-info" @click="toggleUserMenu">
        <img :src="userAvatar" alt="User" class="avatar" />
        <div class="user-details" v-if="!isMobile">
          <span class="user-name">{{ userDisplayName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <i class="fas fa-chevron-up" v-if="showUserMenu"></i>
        <i class="fas fa-chevron-down" v-else></i>
      </div>

      <!-- User Menu Dropdown -->
      <div v-if="showUserMenu" class="user-menu-dropdown">
        <router-link to="/profile" class="dropdown-item" @click="closeSidebarOnMobile">
          <i class="fas fa-user-circle"></i>
          <span>Wasifu Wangu</span>
        </router-link>
        <router-link to="/settings" class="dropdown-item" @click="closeSidebarOnMobile">
          <i class="fas fa-cog"></i>
          <span>Mipangilio</span>
        </router-link>
        <div class="dropdown-divider"></div>
        <button @click="handleLogout" class="dropdown-item text-danger">
          <i class="fas fa-sign-out-alt"></i>
          <span>Toka</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Hamburger Menu Button - Always visible on mobile -->
  <button v-if="isMobile" class="hamburger-btn" @click="toggleSidebar">
    <i class="fas" :class="isOpen ? 'fa-times' : 'fa-bars'"></i>
  </button>

  <!-- Logout Confirmation Modal -->
  <div v-if="showLogoutModal" class="modal-overlay" @click="closeLogoutModal">
    <div class="modal-content logout-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-icon warning">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <h3>Toka kwenye Mfumo</h3>
        <button class="close-btn" @click="closeLogoutModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="logout-icon">
          <i class="fas fa-question-circle"></i>
        </div>
        <p class="confirmation-text">Je, una uhakika unataka kutoka kwenye mfumo?</p>
        <p class="warning-text-small">
          <i class="fas fa-info-circle"></i>
          Utahitaji kuingia tena kufikia akaunti yako.
        </p>
      </div>
      <div class="modal-footer">
        <button @click="closeLogoutModal" class="btn-secondary" :disabled="logoutLoading">
          <i class="fas fa-times"></i>
          Ghairi
        </button>
        <button @click="confirmLogout" class="btn-danger" :disabled="logoutLoading">
          <span v-if="logoutLoading" class="spinner-small"></span>
          <span v-else>
            <i class="fas fa-sign-out-alt"></i>
            Toka
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoanStore } from '@/stores/loan'

const router = useRouter()
const authStore = useAuthStore()
const loanStore = useLoanStore()

// State
const isOpen = ref(false)
const isMobile = ref(false)
const openSections = ref({
  customers: false,
  loans: false,
  payments: false,
  collateral: false,
  reports: false,
  admin: false,
})
const showUserMenu = ref(false)
const collapsedLogo = ref(null)
const showLogoutModal = ref(false)
const logoutLoading = ref(false)
const isLoading = ref(true)

// Computed
const pendingLoansCount = computed(() => loanStore.pendingCount || 0)

// User display name from API - with better fallbacks
const userDisplayName = computed(() => {
  // Check if we have user data
  if (authStore.user) {
    const firstName = authStore.user.first_name || ''
    const lastName = authStore.user.last_name || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    if (authStore.user.name) {
      return authStore.user.name
    }
    if (authStore.user.email) {
      return authStore.user.email.split('@')[0]
    }
    if (authStore.user.username) {
      return authStore.user.username
    }
  }

  // Try to get from localStorage directly as fallback
  const userData = localStorage.getItem('user_data')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      const firstName = user.first_name || ''
      const lastName = user.last_name || ''
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim()
      }
      if (user.name) return user.name
      if (user.email) return user.email.split('@')[0]
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }

  return 'Mgeni'
})

// User role from API
const userRole = computed(() => {
  if (authStore.user) {
    return formatRole(authStore.user.role)
  }

  // Try to get from localStorage
  const userData = localStorage.getItem('user_data')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user.role) return formatRole(user.role)
    } catch (e) {}
  }

  return 'Mtumiaji'
})

// User avatar
const userAvatar = computed(() => {
  // Check auth store first
  if (authStore.user?.avatar) {
    return authStore.user.avatar
  }
  if (authStore.user?.profile_photo_url) {
    return authStore.user.profile_photo_url
  }

  // Try to get from localStorage
  const userData = localStorage.getItem('user_data')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user.avatar) return user.avatar
      if (user.profile_photo_url) return user.profile_photo_url
    } catch (e) {}
  }

  // Generate avatar with user's initials
  const name = userDisplayName.value
  if (name && name !== 'Mgeni') {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3498db&color=fff&size=100&bold=true`
  }
  return '/assets/images/avator_.png'
})

// Methods
const toggleSection = (section) => {
  openSections.value[section] = !openSections.value[section]
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    showUserMenu.value = false
  }
}

const openSidebar = () => {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeSidebar = () => {
  if (isMobile.value) {
    isOpen.value = false
    document.body.style.overflow = ''
    showUserMenu.value = false
  }
}

const closeSidebarOnMobile = () => {
  if (isMobile.value) {
    closeSidebar()
  }
}

const formatRole = (role) => {
  const roles = {
    admin: 'Msimamizi Mkuu',
    manager: 'Meneja',
    officer: 'Afisa Mikopo',
    cashier: 'Keshia',
    viewer: 'Mtazamaji',
    accountant: 'Mhasibu',
    loan_officer: 'Afisa Mikopo',
  }
  return roles[role] || 'Afisa Mikopo'
}

// Fetch user data
const fetchUserData = async () => {
  isLoading.value = true

  // First check if we already have user in auth store
  if (authStore.user && (authStore.user.first_name || authStore.user.last_name)) {
    isLoading.value = false
    return
  }

  // Try to restore from localStorage via auth store
  authStore.initAuth()

  // If still no user but authenticated, fetch from API
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.checkAuthStatus()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  isLoading.value = false
}

// Logout methods
const handleLogout = () => {
  showLogoutModal.value = true
  showUserMenu.value = false
}

const closeLogoutModal = () => {
  showLogoutModal.value = false
  logoutLoading.value = false
}

const confirmLogout = async () => {
  logoutLoading.value = true

  try {
    // Call logout with API and page refresh
    await authStore.logout(true)
    // The page will automatically refresh and redirect to /login
  } catch (error) {
    console.error('Logout error:', error)
    // Fallback: force logout if API fails
    authStore.forceLogout(true)
    closeLogoutModal()
  }
}

// Handle window resize
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 1024

  if (!wasMobile && isMobile.value) {
    // Switching to mobile - close sidebar
    isOpen.value = false
    document.body.style.overflow = ''
  }

  if (wasMobile && !isMobile.value) {
    // Switching to desktop - open sidebar
    isOpen.value = true
    document.body.style.overflow = ''
  }
}

// stores/auth.js - Make sure these methods exist

// Login method should save user data
const login = async (credentials) => {
  loading.value = true
  error.value = null

  try {
    const response = await api.post('/login', credentials)

    if (response.data.success) {
      isAuthenticated.value = true

      let userData = null
      if (response.data.data?.user) {
        userData = response.data.data.user
        user.value = userData
      } else if (response.data.user) {
        userData = response.data.user
        user.value = userData
      }

      // Store token
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token)
        setAuthToken(response.data.data.token)
      } else if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        setAuthToken(response.data.token)
      }

      // Store user data
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData))
      }

      return { success: true }
    }
    return { success: false, error: 'Login failed' }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
    return { success: false, error: error.value }
  } finally {
    loading.value = false
  }
}

// Add this method to check auth status from API
const checkAuthStatus = async () => {
  const token = localStorage.getItem('auth_token')

  if (!token) {
    isAuthenticated.value = false
    user.value = null
    return false
  }

  setAuthToken(token)

  try {
    const response = await api.get('/user')

    if (response.data && (response.data.success || response.data.data)) {
      const userData = response.data.data || response.data
      isAuthenticated.value = true
      user.value = userData
      localStorage.setItem('user_data', JSON.stringify(userData))
      return true
    }
  } catch (err) {
    console.error('Auth check failed:', err)
    // Token might be expired, clear it
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setAuthToken(null)
    isAuthenticated.value = false
    user.value = null
    return false
  }

  return false
}

// Handle click outside
const handleClickOutside = (event) => {
  if (showUserMenu.value) {
    const sidebar = document.querySelector('.sidebar')
    const userInfo = document.querySelector('.user-info')

    if (
      sidebar &&
      !sidebar.contains(event.target) &&
      userInfo &&
      !userInfo.contains(event.target)
    ) {
      showUserMenu.value = false
    }
  }
}

// Watch for auth changes to update user display
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      console.log('User data updated in sidebar:', newUser)
      isLoading.value = false
    }
  },
  { deep: true, immediate: true },
)

// Lifecycle
onMounted(async () => {
  isMobile.value = window.innerWidth <= 1024
  isOpen.value = !isMobile.value // Open on desktop, closed on mobile

  // Fetch user data
  await fetchUserData()

  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)

  if (loanStore.fetchPendingCount && typeof loanStore.fetchPendingCount === 'function') {
    loanStore
      .fetchPendingCount()
      .catch((err) => console.error('Failed to fetch pending count:', err))
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1a2639 0%, #2c3e50 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Desktop Styles */
.sidebar.sidebar-desktop {
  transform: translateX(0);
}

/* Mobile Styles - Sidebar hidden by default */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
    width: 280px;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  }

  .sidebar.sidebar-closed {
    transform: translateX(-100%);
  }

  /* Main content adjustment for mobile */
  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }
}

/* Sidebar Overlay (Mobile) */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
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

/* Sidebar Header */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
}

.logo h2 {
  color: white;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, #3498db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-img {
  max-width: 120px;
  max-height: 40px;
  object-fit: contain;
}

.close-sidebar {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
}

.close-sidebar:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 1024px) {
  .close-sidebar {
    display: block;
  }
}

/* Mobile User Info */
.mobile-user-info {
  display: none;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  gap: 15px;
}

@media (max-width: 1024px) {
  .mobile-user-info {
    display: flex;
  }
}

.mobile-user-info .user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.mobile-user-info .user-details {
  display: flex;
  flex-direction: column;
}

.mobile-user-info .user-name {
  font-size: 1rem;
  font-weight: 600;
}

.mobile-user-info .user-role {
  font-size: 0.8rem;
  color: #8a9bb5;
}

/* Navigation Menu */
.nav-menu {
  flex: 1;
  padding: 20px 0;
}

/* Section Styles */
.nav-section {
  margin-bottom: 5px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s;
  color: #b7c0cd;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8a9bb5;
}

.section-title i {
  width: 20px;
  font-size: 1rem;
  color: #8a9bb5;
}

.section-header i.fa-chevron-down {
  font-size: 0.8rem;
  transition: transform 0.3s;
  color: #8a9bb5;
}

.section-header i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

/* Submenu Styles */
.submenu {
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

.submenu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 50px;
  color: #b7c0cd;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
  position: relative;
}

.submenu-item i {
  width: 20px;
  font-size: 0.9rem;
  margin-right: 10px;
  color: #8a9bb5;
}

.submenu-item span {
  flex: 1;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding-left: 55px;
}

.submenu-item:hover i {
  color: white;
}

.submenu-item.active {
  background: #3498db;
  color: white;
}

.submenu-item.active i {
  color: white;
}

.submenu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: white;
}

/* Regular Nav Items (non-section) */
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #b7c0cd;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.nav-item i {
  width: 24px;
  font-size: 1.1rem;
  margin-right: 10px;
  color: #8a9bb5;
}

.nav-item span {
  flex: 1;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding-left: 25px;
}

.nav-item:hover i {
  color: white;
}

.nav-item.active {
  color: white;
  box-shadow: 0 1px 1px rgba(52, 152, 219, 0.3);
}

.nav-item.active i {
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

/* Sidebar Footer */
.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
  color: white;
}

.user-role {
  font-size: 0.7rem;
  color: #8a9bb5;
}

.user-info i {
  color: #8a9bb5;
  font-size: 0.8rem;
}

/* User Menu Dropdown */
.user-menu-dropdown {
  position: absolute;
  bottom: 100%;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
  overflow: hidden;
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
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

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.text-danger {
  color: #e74c3c;
}

.dropdown-item i {
  width: 20px;
  font-size: 1rem;
  color: #666;
}

.dropdown-divider {
  height: 1px;
  background: #eef2f6;
  margin: 5px 0;
}

/* Hamburger Button */
.hamburger-btn {
  position: fixed;
  top: 15px;
  left: 15px;
  width: 45px;
  height: 45px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  transition: all 0.3s;
  border: 2px solid white;
}

.hamburger-btn:hover {
  background: #2980b9;
  transform: scale(1.05);
}

/* Hide hamburger on desktop */
@media (min-width: 1025px) {
  .hamburger-btn {
    display: none !important;
  }
}

/* Logout Modal Styles */
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.logout-modal {
  text-align: center;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.modal-icon.warning {
  background: #fee;
  color: #e74c3c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  padding: 5px;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 25px;
}

.logout-icon {
  margin-bottom: 20px;
}

.logout-icon i {
  font-size: 60px;
  color: #f39c12;
}

.confirmation-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 500;
}

.warning-text-small {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f8fafc;
  color: #666;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #eef2f6;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Small mobile devices */
@media (max-width: 360px) {
  .hamburger-btn {
    top: 10px;
    left: 10px;
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .sidebar {
    width: 50%;
  }

  .modal-content {
    width: 95%;
  }
}

/* Medium mobile devices */
@media (min-width: 361px) and (max-width: 480px) {
  .hamburger-btn {
    top: 12px;
    left: 12px;
    width: 40px;
    height: 40px;
  }

  .sidebar {
    width: 280px;
  }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 768px) {
  .hamburger-btn {
    top: 15px;
    left: 15px;
  }

  .sidebar {
    width: 280px;
  }
}

/* Active section highlight */
.nav-section:has(.submenu-item.active) > .section-header {
  color: white;
  background: rgba(52, 152, 219, 0.2);
}

.nav-section:has(.submenu-item.active) > .section-header .section-title {
  color: #3498db;
}

.nav-section:has(.submenu-item.active) > .section-header i {
  color: #3498db;
}
</style>
