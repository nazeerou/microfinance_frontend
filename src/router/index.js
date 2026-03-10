import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

// Auth pages
import Login from '@/views/auth/Login.vue'
// import ForgotPassword from '@/views/auth/ForgotPassword.vue'
// import ResetPassword from '@/views/auth/ResetPassword.vue'

// Dashboard
import Dashboard from '@/views/Dashboard.vue'

// Customer pages
import CustomerList from '@/views/customers/CustomerList.vue'
import CustomerCreate from '@/views/customers/CustomerForm.vue'
import CustomerDetail from '@/views/customers/CustomerDetail.vue'
import CustomerEdit from '@/views/customers/CustomerEdit.vue'

// Loan pages
import LoanList from '@/views/loans/LoanList.vue'
import LoanForm from '@/views/loans/LoanForm.vue'
import LoanDetail from '@/views/loans/LoanDetail.vue'
import PendingLoan from '@/views/loans/PendingLoan.vue'
// import LoanApproval from '@/views/loans/LoanApproval.vue'

// Payment pages
import PaymentList from '@/views/payments/PaymentList.vue'
import RecordPayment from '@/views/payments/RecordPayment.vue'
// import PaymentDetail from '@/views/payments/PaymentDetail.vue'

// Collateral pages
import CollateralList from '@/views/collaterals/CollateralList.vue'
import CollateralDetail from '@/views/collaterals/CollateralDetail.vue'

// Report pages
import Report from '@/views/reports/Report.vue'
// import OutstandingLoans from '@/views/reports/OutstandingLoans.vue'
// import DefaultedLoans from '@/views/reports/DefaultedLoans.vue'
// import CustomerHistory from '@/views/reports/CustomerHistory.vue'
// import ProfitReport from '@/views/reports/ProfitReport.vue'

// 404 page
import NotFound from '@/views/errors/NotFound.vue'

const routes = [
  // Public routes - no authentication required
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Ingia - TAMARA MicroFinance System',
    },
  },
  // {
  //   path: '/forgot-password',
  //   name: 'ForgotPassword',
  //   component: ForgotPassword,
  //   meta: {
  //     requiresAuth: false,
  //     title: 'Nimesahau Nenosiri - TAMARA MicroFinance'
  //   }
  // },
  // {
  //   path: '/reset-password/:token',
  //   name: 'ResetPassword',
  //   component: ResetPassword,
  //   meta: {
  //     requiresAuth: false,
  //     title: 'Weka Nenosiri Jipya - TAMARA MicroFinance'
  //   }
  // },

  // Root path - redirect to login
  {
    path: '/',
    redirect: '/login',
  },

  // Protected routes - require authentication
  {
    path: '/app',
    component: MainLayout,
    meta: {
      requiresAuth: true, // ✅ FIXED: This should be true for protected routes
    },
    children: [
      // Dashboard - default route for /app
      {
        path: '',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashibodi',
          icon: 'chart-pie',
          permission: 'view_dashboard',
        },
      },

      // Profile
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/UserProfile.vue'),
        meta: {
          title: 'Wasifu Wangu',
          icon: 'user-circle',
          permission: 'view_profile',
        },
      },

      // Customer routes
      {
        path: 'customers',
        name: 'Customers',
        component: CustomerList,
        meta: {
          title: 'Wateja',
          permission: 'view_customers',
          icon: 'users',
        },
      },
      {
        path: 'customers/create',
        name: 'CustomerCreate',
        component: CustomerCreate,
        meta: {
          title: 'Sajili Mteja',
          permission: 'create_customer',
          icon: 'user-plus',
        },
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: CustomerDetail,
        meta: {
          title: 'Taarifa za Mteja',
          permission: 'view_customer',
          icon: 'user',
        },
      },
      {
        path: 'customers/:id/edit',
        name: 'CustomerEdit',
        component: CustomerEdit,
        meta: {
          title: 'Hariri Mteja',
          permission: 'edit_customer',
          icon: 'user-edit',
        },
      },

      // Loan routes
      {
        path: 'loans',
        name: 'Loans',
        component: LoanList,
        meta: {
          title: 'Mikopo',
          permission: 'view_loans',
          icon: 'hand-holding-usd',
        },
      },
      {
        path: 'loans/create',
        name: 'LoanForm',
        component: LoanForm,
        meta: {
          title: 'Ombi la Mkopo',
          permission: 'create_loan',
          icon: 'plus-circle',
        },
      },
      {
        path: 'loans/pending',
        name: 'PendingLoans',
        component: PendingLoan,
        meta: {
          title: 'Mikopo Inayosubiri',
          permission: 'approve_loan',
          status: 'pending',
          icon: 'clock',
        },
      },
      {
        path: 'loans/:id',
        name: 'LoanDetail',
        component: LoanDetail,
        meta: {
          title: 'Taarifa za Mkopo',
          permission: 'view_loan',
          icon: 'file-invoice',
        },
      },

      // Payment routes
      {
        path: 'payments',
        name: 'Payments',
        component: PaymentList,
        meta: {
          title: 'Malipo',
          permission: 'view_payments',
          icon: 'money-bill-wave',
        },
      },
      {
        path: 'payments/create',
        name: 'PaymentRecord',
        component: RecordPayment,
        meta: {
          title: 'Rekodi Malipo',
          permission: 'create_payment',
          icon: 'cash-register',
        },
      },

      // Collateral routes
      {
        path: 'collateral',
        name: 'Collateral',
        component: CollateralList,
        meta: {
          title: 'Dhamana',
          permission: 'view_collateral',
          icon: 'gem',
        },
      },
      {
        path: 'collateral/:id',
        name: 'CollateralDetail',
        component: CollateralDetail,
        meta: {
          title: 'Taarifa za Dhamana',
          permission: 'view_collateral',
          icon: 'info-circle',
        },
      },

      // Report routes
      {
        path: 'reports',
        name: 'Report',
        component: Report,
        meta: {
          title: 'Ripoti ya Siku',
          permission: 'view_reports',
          icon: 'calendar-day',
        },
      },
    ],
  },

  // ✅ FIXED: 404 page - MUST come AFTER all other routes
  // This catches any route that doesn't match above
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 - Ukurasa Haupatikani',
      requiresAuth: false, // 404 page should be public
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | TAMARA MicroFinance`
  } else {
    document.title = 'TAMARA MicroFinance'
  }

  // Check for inactivity logout reason
  if (to.query.reason === 'inactive') {
    console.log('Logged out due to inactivity')
  }

  // ✅ FIXED: Check if route requires authentication
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Get authentication status
  const isAuthenticated = await authStore.checkAuth()

  // ✅ FIXED: Special case for 404 page - always allow access
  if (to.name === 'NotFound') {
    next()
    return
  }

  // Case 1: Route is login page
  if (to.path === '/login') {
    if (isAuthenticated) {
      // If already authenticated, go to dashboard
      next({ path: '/app/dashboard' })
    } else {
      // Allow access to login
      next()
    }
    return
  }

  // Case 2: Route requires authentication
  if (requiresAuth) {
    if (!isAuthenticated) {
      // Not authenticated - redirect to login with return URL
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Check permission if required
    if (to.meta.permission) {
      const hasPermission = await checkUserPermission(to.meta.permission)
      if (!hasPermission) {
        // No permission - redirect to dashboard
        next({ path: '/app/dashboard' })
        return
      }
    }

    // Check role if required
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      // Wrong role - redirect to dashboard
      next({ path: '/app/dashboard' })
      return
    }

    // Track activity on route change
    authStore.trackActivity()

    // All checks passed
    next()
  }

  // Case 3: Public route (like root redirect or 404)
  else {
    next()
  }
})

// Permission check helper
async function checkUserPermission(permission) {
  const authStore = useAuthStore()

  // If no user, no permissions
  if (!authStore.user) {
    return false
  }

  // Admin has all permissions
  if (authStore.user.role === 'admin') {
    return true
  }

  // Define role-based permissions
  const permissions = {
    loan_officer: [
      'view_dashboard',
      'view_profile',
      'view_customers',
      'create_customer',
      'edit_customer',
      'view_customer',
      'view_loans',
      'create_loan',
      'approve_loan',
      'view_loan',
      'view_payments',
      'create_payment',
      'view_collateral',
      'view_reports',
    ],
    accountant: [
      'view_dashboard',
      'view_profile',
      'view_customers',
      'view_loans',
      'view_loan',
      'view_payments',
      'create_payment',
      'view_reports',
    ],
    viewer: [
      'view_dashboard',
      'view_profile',
      'view_customers',
      'view_loans',
      'view_loan',
      'view_payments',
      'view_reports',
    ],
  }

  const userPermissions = permissions[authStore.user.role] || []
  return userPermissions.includes(permission)
}

export default router
