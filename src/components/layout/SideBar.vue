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
        <span class="user-name">{{ authStore.user.name }}</span>
        <span class="user-role">{{ formatRole(authStore.user.role) }}</span>
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
            <span>Mikopo Inangoja</span>
            <span v-if="pendingLoansCount" class="badge">{{ pendingLoansCount }}</span>
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
      <div v-if="authStore.user?.role === 'admin'" class="nav-section">
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
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role">{{ formatRole(authStore.user.role) }}</span>
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
        <button @click="logout" class="dropdown-item text-danger">
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Computed
const pendingLoansCount = computed(() => loanStore.pendingCount || 0)

// authStore.user?.avatar ||
const userAvatar = computed(() => {
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
    admin: 'Msimamizi',
    loan_officer: 'Afisa Mkopo',
    accountant: 'Mhasibu',
  }
  return roles[role] || 'Afisa Mikopo'
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  closeSidebarOnMobile()
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

// Lifecycle
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024
  isOpen.value = !isMobile.value // Open on desktop, closed on mobile

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
  /* background: #3498db; */
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
  background: rgb(33, 124, 160);
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

/* Hamburger Button - Always visible on mobile, toggles between bars and times */
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

/* Small mobile devices (360px and below) */
@media (max-width: 360px) {
  .hamburger-btn {
    top: 10px;
    left: 10px;
    width: 38px;
    height: 38px;
    font-size: 1rem;
    background-color: #2980b9;
  }

  .sidebar {
    width: 50%;
  }

  .submenu-item {
    padding-left: 45px;
    font-size: 0.85rem;
  }

  .submenu-item i {
    width: 18px;
    font-size: 0.85rem;
  }

  .nav-item {
    padding: 10px 15px;
  }

  .nav-item i {
    width: 20px;
    font-size: 1rem;
  }
}

/* Medium mobile devices (361px - 480px) */
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

  .submenu-item {
    padding-left: 50px;
  }
}

/* Tablets (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .hamburger-btn {
    top: 15px;
    left: 15px;
  }

  .sidebar {
    width: 280px;
  }
}

/* Large tablets (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
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
