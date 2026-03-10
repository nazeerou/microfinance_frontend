import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

// Auth pages
import Login from '@/views/auth/Login.vue'
// import ForgotPassword from '@/views/auth/ForgotPassword.vue'
// import ResetPassword from '@/views/auth/ResetPassword.vue'

// Dashboard
import Dashboard from '@/views/Dashboard.vue'
import { useAuthStore } from '@/stores/auth' // Add this import

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

// User management (admin only)
// import UserList from '@/views/users/UserList.vue'
// import UserCreate from '@/views/users/UserCreate.vue'
// import UserEdit from '@/views/users/UserEdit.vue'

// Profile and settings
// import Profile from '@/views/profile/Profile.vue'
// import Settings from '@/views/settings/Settings.vue'

// Audit trails (admin only)
// import AuditTrail from '@/views/audit/AuditTrail.vue'

// Search results
// import SearchResults from '@/views/search/SearchResults.vue'

// Notifications
// import Notifications from '@/views/notifications/Notifications.vue'

// Help page
// import Help from '@/views/help/Help.vue'

// 404 page
import NotFound from '@/views/errors/NotFound.vue'
// import TestLogin from '@/views/auth/TestLogin.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/profile/UserProfile.vue'),
        // meta: { requiresAuth: true },
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'TAMARA MicroFinance',
          icon: 'chart-pie',
        },
      },
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
      // {
      //   path: 'loans/:id/approve',
      //   name: 'LoanApproval',
      //   component: LoanApproval,
      //   meta: {
      //     title: 'Idhinisho la Mkopo',
      //     permission: 'approve_loan',
      //     icon: 'check-circle'
      //   }
      // },
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
      // {
      //   path: 'payments/:id',
      //   name: 'PaymentDetail',
      //   component: PaymentDetail,
      //   meta: {
      //     title: 'Taarifa za Malipo',
      //     permission: 'view_payment',
      //     icon: 'receipt'
      //   }
      // },
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
      // {
      //   path: 'reports/outstanding',
      //   name: 'OutstandingLoans',
      //   component: OutstandingLoans,
      //   meta: {
      //     title: 'Mikopo Inayodaiwa',
      //     permission: 'view_reports',
      //     icon: 'chart-line'
      //   }
      // },
      // {
      //   path: 'reports/defaulted',
      //   name: 'DefaultedLoans',
      //   component: DefaultedLoans,
      //   meta: {
      //     title: 'Mikopo Iliyochelewa',
      //     permission: 'view_reports',
      //     icon: 'exclamation-triangle'
      //   }
      // },
      // {
      //   path: 'reports/customer/:id',
      //   name: 'CustomerHistory',
      //   component: CustomerHistory,
      //   meta: {
      //     title: 'Historia ya Mteja',
      //     permission: 'view_reports',
      //     icon: 'history'
      //   }
      // },
      // {
      //   path: 'reports/profit',
      //   name: 'ProfitReport',
      //   component: ProfitReport,
      //   meta: {
      //     title: 'Ripoti ya Faida',
      //     permission: 'view_reports',
      //     icon: 'chart-pie'
      //   }
      // },
      // {
      //   path: 'users',
      //   name: 'Users',
      //   component: UserList,
      //   meta: {
      //     title: 'Watumiaji',
      //     permission: 'manage_users',
      //     role: 'admin',
      //     icon: 'users-cog'
      //   }
      // },
      // {
      //   path: 'users/create',
      //   name: 'UserCreate',
      //   component: UserCreate,
      //   meta: {
      //     title: 'Sajili Mtumiaji',
      //     permission: 'manage_users',
      //     role: 'admin',
      //     icon: 'user-plus'
      //   }
      // },
      // {
      //   path: 'users/:id/edit',
      //   name: 'UserEdit',
      //   component: UserEdit,
      //   meta: {
      //     title: 'Hariri Mtumiaji',
      //     permission: 'manage_users',
      //     role: 'admin',
      //     icon: 'user-edit'
      //   }
      // },
      // {
      //   path: 'profile',
      //   name: 'Profile',
      //   component: Profile,
      //   meta: {
      //     title: 'Wasifu Wangu',
      //     icon: 'user-circle'
      //   }
      // },
      // {
      //   path: 'settings',
      //   name: 'Settings',
      //   component: Settings,
      //   meta: {
      //     title: 'Mipangilio',
      //     icon: 'cog'
      //   }
      // },
      // {
      //   path: 'audit-trails',
      //   name: 'AuditTrail',
      //   component: AuditTrail,
      //   meta: {
      //     title: 'Audit Trail',
      //     permission: 'view_audit',
      //     role: 'admin',
      //     icon: 'history'
      //   }
      // },
      // {
      //   path: 'search',
      //   name: 'Search',
      //   component: SearchResults,
      //   meta: {
      //     title: 'Matokeo ya Utafutaji',
      //     icon: 'search'
      //   }
      // },
      // {
      //   path: 'notifications',
      //   name: 'Notifications',
      //   component: Notifications,
      //   meta: {
      //     title: 'Arifa',
      //     icon: 'bell'
      //   }
      // },
      // {
      //   path: 'help',
      //   name: 'Help',
      //   component: Help,
      //   meta: {
      //     title: 'Msaada',
      //     icon: 'question-circle'
      //   }
      // }

      // {
      //   path: '/forgot-password',
      //   name: 'ForgotPassword',
      //   component: ForgotPassword,
      //   meta: { requiresAuth: false }
      // },
      // {
      //   path: '/reset-password/:token',
      //   name: 'ResetPassword',
      //   component: ResetPassword,
      //   meta: { requiresAuth: false }
      // },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/PageNotFound.vue'),
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

// Add navigation guard
// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check for inactivity logout reason
  if (to.query.reason === 'inactive') {
    // Show inactivity message if needed
    console.log('Logged out due to inactivity')
  }

  if (to.meta.requiresAuth) {
    const isAuthenticated = await authStore.checkAuth()

    if (!isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    } else {
      // Track activity on route change
      authStore.trackActivity()
      next()
    }
  } else if (to.meta.requiresGuest) {
    const isAuthenticated = await authStore.checkAuth()

    if (isAuthenticated) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

// Navigation guards (commented out as in original)
// router.beforeEach(async (to, from, next) => {
//   // Set page title
//   document.title = to.meta.title ? `${to.meta.title} | TAMARA MicroFinance` : 'TAMARA MicroFinance'
//
//   const authStore = useAuthStore()
//
//   // Check if route requires authentication
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
//
//   // Public routes - allow access even if not authenticated
//   if (!requiresAuth) {
//     // If trying to access login page while already authenticated, redirect to dashboard
//     if (to.path === '/login' && authStore.isAuthenticated) {
//       next('/dashboard')
//       return
//     }
//     next()
//     return
//   }
//
//   // Protected routes - require authentication
//   if (!authStore.isAuthenticated) {
//     next('/login')
//     return
//   }
//
//   // Check role-based access
//   const requiresRole = to.meta.role
//   if (requiresRole && authStore.user?.role !== requiresRole) {
//     next('/dashboard')
//     return
//   }
//
//   // Check permission-based access
//   const requiresPermission = to.meta.permission
//   if (requiresPermission) {
//     const hasPermission = await checkPermission(requiresPermission)
//     if (!hasPermission) {
//       next('/dashboard')
//       return
//     }
//   }
//
//   next()
// })

// Permission check helper (commented out as in original)
// async function checkPermission(permission) {
//   const authStore = useAuthStore()
//
//   // Admin has all permissions
//   if (authStore.user?.role === 'admin') {
//     return true
//   }
//
//   // Define role-based permissions
//   const permissions = {
//     loan_officer: [
//       'view_customers',
//       'create_customer',
//       'edit_customer',
//       'view_loans',
//       'create_loan',
//       'approve_loan',
//       'view_payments',
//       'create_payment',
//       'view_collateral',
//       'view_reports',
//     ],
//     accountant: ['view_customers', 'view_loans', 'view_payments', 'create_payment', 'view_reports'],
//   }
//
//   const userPermissions = permissions[authStore.user?.role] || []
//   return userPermissions.includes(permission)
// }

// export default router
