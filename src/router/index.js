import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// Route-level code splitting for better performance
const Login = () => import(/* webpackChunkName: "auth" */ '@/views/Login.vue')
const RoleSelection = () => import(/* webpackChunkName: "auth" */ '@/views/RoleSelection.vue')
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue')

// Student routes
const StudentDashboard = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentDashboard.vue')
const StudentOffers = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentOffers.vue')
const StudentApplications = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentApplications.vue')
const StudentPlanning = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentPlanning.vue')
const StudentEvaluations = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentEvaluations.vue')
const StudentProfile = () => import(/* webpackChunkName: "student" */ '@/components/student/StudentProfile.vue')

// Doctor routes
const DoctorDashboard = () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/DoctorDashboard.vue')
const DoctorInterns = () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/DoctorInterns.vue')
const DoctorEvaluations = () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/DoctorEvaluations.vue')
const DoctorPlanning = () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/DoctorPlanning.vue')

// Hospital Admin routes
const HospitalAdminDashboard = () => import(/* webpackChunkName: "hospital-admin" */ '@/components/hospital-admin/HospitalAdminDashboard.vue')
const HospitalServices = () => import(/* webpackChunkName: "hospital-admin" */ '@/components/hospital-admin/HospitalServices.vue')
const HospitalOffers = () => import(/* webpackChunkName: "hospital-admin" */ '@/components/hospital-admin/HospitalOffers.vue')
const HospitalApplications = () => import(/* webpackChunkName: "hospital-admin" */ '@/components/hospital-admin/HospitalApplications.vue')
const HospitalPlanning = () => import(/* webpackChunkName: "hospital-admin" */ '@/components/hospital-admin/HospitalPlanning.vue')

// Doyen routes
const DoyenDashboard = () => import(/* webpackChunkName: "doyen" */ '@/components/doyen/DoyenDashboard.vue')
const DoyenValidation = () => import(/* webpackChunkName: "doyen" */ '@/components/doyen/DoyenValidation.vue')
const DoyenUsers = () => import(/* webpackChunkName: "doyen" */ '@/components/doyen/DoyenUsers.vue')
const DoyenAssignment = () => import(/* webpackChunkName: "doyen" */ '@/components/doyen/DoyenAssignment.vue')
const DoyenReporting = () => import(/* webpackChunkName: "doyen" */ '@/components/doyen/DoyenReporting.vue')

// Error pages
const NotFound = () => import(/* webpackChunkName: "errors" */ '@/views/errors/NotFound.vue')
const Unauthorized = () => import(/* webpackChunkName: "errors" */ '@/views/errors/Unauthorized.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Connexion - Stages Médicaux',
      requiresGuest: true,
      hideNavigation: true
    }
  },
  {
    path: '/role-selection',
    name: 'role-selection',
    component: RoleSelection,
    meta: {
      title: 'Sélection du Rôle - Stages Médicaux',
      requiresAuth: true,
      hideNavigation: true
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Tableau de Bord - Stages Médicaux',
      requiresAuth: true
    }
  },

  // =============================================
  // 👨‍🎓 STUDENT ROUTES
  // =============================================
  {
    path: '/student',
    redirect: '/student/dashboard',
    meta: {
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: StudentDashboard,
    meta: {
      title: 'Tableau de Bord Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Tableau de bord'
    }
  },
  {
    path: '/student/offers',
    name: 'student-offers',
    component: StudentOffers,
    meta: {
      title: 'Offres de Stage - Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Offres de stage'
    }
  },
  {
    path: '/student/applications',
    name: 'student-applications',
    component: StudentApplications,
    meta: {
      title: 'Mes Candidatures - Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Mes candidatures'
    }
  },
  {
    path: '/student/planning',
    name: 'student-planning',
    component: StudentPlanning,
    meta: {
      title: 'Mon Planning - Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Mon planning'
    }
  },
  {
    path: '/student/evaluations',
    name: 'student-evaluations',
    component: StudentEvaluations,
    meta: {
      title: 'Mes Évaluations - Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Mes évaluations'
    }
  },
  {
    path: '/student/profile',
    name: 'student-profile',
    component: StudentProfile,
    meta: {
      title: 'Mon Profil - Étudiant',
      requiresAuth: true,
      requiredRole: 'student',
      breadcrumb: 'Mon profil'
    }
  },

  // =============================================
  // 👨‍⚕️ DOCTOR ROUTES
  // =============================================
  {
    path: '/doctor',
    redirect: '/doctor/dashboard',
    meta: {
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/dashboard',
    name: 'doctor-dashboard',
    component: DoctorDashboard,
    meta: {
      title: 'Tableau de Bord Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Tableau de bord'
    }
  },
  {
    path: '/doctor/interns',
    name: 'doctor-interns',
    component: DoctorInterns,
    meta: {
      title: 'Mes Stagiaires - Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Mes stagiaires'
    }
  },
  {
    path: '/doctor/evaluations',
    name: 'doctor-evaluations',
    component: DoctorEvaluations,
    meta: {
      title: 'Évaluations - Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Évaluations'
    }
  },
  {
    path: '/doctor/planning',
    name: 'doctor-planning',
    component: DoctorPlanning,
    meta: {
      title: 'Planning - Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Planning'
    }
  },

  // Doctor sub-routes with parameters
  {
    path: '/doctor/evaluation/:internshipId',
    name: 'doctor-evaluation-form',
    component: () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/components/EvaluationForm.vue'),
    meta: {
      title: 'Formulaire d\'Évaluation - Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Évaluation'
    },
    props: true
  },
  {
    path: '/doctor/student/:studentId',
    name: 'doctor-student-profile',
    component: () => import(/* webpackChunkName: "doctor" */ '@/components/doctor/components/StudentProfile.vue'),
    meta: {
      title: 'Profil Stagiaire - Docteur',
      requiresAuth: true,
      requiredRole: 'doctor',
      breadcrumb: 'Profil stagiaire'
    },
    props: true
  },

  // =============================================
  // 🏥 HOSPITAL ADMIN ROUTES
  // =============================================
  {
    path: '/hospital-admin',
    redirect: '/hospital-admin/dashboard',
    meta: {
      requiresAuth: true,
      requiredRole: 'hospital-admin'
    }
  },
  {
    path: '/hospital-admin/dashboard',
    name: 'hospital-admin-dashboard',
    component: HospitalAdminDashboard,
    meta: {
      title: 'Tableau de Bord Hôpital',
      requiresAuth: true,
      requiredRole: 'hospital-admin',
      breadcrumb: 'Tableau de bord'
    }
  },
  {
    path: '/hospital-admin/services',
    name: 'hospital-services',
    component: HospitalServices,
    meta: {
      title: 'Gestion des Services - Hôpital',
      requiresAuth: true,
      requiredRole: 'hospital-admin',
      breadcrumb: 'Services'
    }
  },
  {
    path: '/hospital-admin/offers',
    name: 'hospital-offers',
    component: HospitalOffers,
    meta: {
      title: 'Offres de Stage - Hôpital',
      requiresAuth: true,
      requiredRole: 'hospital-admin',
      breadcrumb: 'Offres de stage'
    }
  },
  {
    path: '/hospital-admin/applications',
    name: 'hospital-applications',
    component: HospitalApplications,
    meta: {
      title: 'Candidatures - Hôpital',
      requiresAuth: true,
      requiredRole: 'hospital-admin',
      breadcrumb: 'Candidatures'
    }
  },
  {
    path: '/hospital-admin/planning',
    name: 'hospital-planning',
    component: HospitalPlanning,
    meta: {
      title: 'Planning Hospitalier',
      requiresAuth: true,
      requiredRole: 'hospital-admin',
      breadcrumb: 'Planning'
    }
  },

  // =============================================
  // 🏫 DOYEN ROUTES
  // =============================================
  {
    path: '/doyen',
    redirect: '/doyen/dashboard',
    meta: {
      requiresAuth: true,
      requiredRole: 'doyen'
    }
  },
  {
    path: '/doyen/dashboard',
    name: 'doyen-dashboard',
    component: DoyenDashboard,
    meta: {
      title: 'Tableau de Bord Doyen',
      requiresAuth: true,
      requiredRole: 'doyen',
      breadcrumb: 'Tableau de bord'
    }
  },
  {
    path: '/doyen/validation',
    name: 'doyen-validation',
    component: DoyenValidation,
    meta: {
      title: 'Validation des Offres - Doyen',
      requiresAuth: true,
      requiredRole: 'doyen',
      breadcrumb: 'Validation offres'
    }
  },
  {
    path: '/doyen/users',
    name: 'doyen-users',
    component: DoyenUsers,
    meta: {
      title: 'Gestion des Utilisateurs - Doyen',
      requiresAuth: true,
      requiredRole: 'doyen',
      breadcrumb: 'Utilisateurs'
    }
  },
  {
    path: '/doyen/assignment',
    name: 'doyen-assignment',
    component: DoyenAssignment,
    meta: {
      title: 'Affectation - Doyen',
      requiresAuth: true,
      requiredRole: 'doyen',
      breadcrumb: 'Affectation'
    }
  },
  {
    path: '/doyen/reporting',
    name: 'doyen-reporting',
    component: DoyenReporting,
    meta: {
      title: 'Reporting - Doyen',
      requiresAuth: true,
      requiredRole: 'doyen',
      breadcrumb: 'Reporting'
    }
  },

  // =============================================
  // 🚨 ERROR ROUTES
  // =============================================
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: Unauthorized,
    meta: {
      title: 'Accès Non Autorisé',
      hideNavigation: true
    }
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Page Non Trouvée',
      hideNavigation: true
    }
  },
  {
    path: '*',
    redirect: '/404'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  
  // Scroll behavior for better UX
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        selector: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  console.log('🛡️ Router Guard - Navigating from:', from.name, 'to:', to.name)
  
  // Get authentication status from Vuex store
  const isAuthenticated = router.app.$store?.state?.auth?.isAuthenticated || false
  const currentRole = router.app.$store?.state?.auth?.currentRole || null
  
  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('🔐 Authentication required, redirecting to login')
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Check if route requires specific role
    if (to.meta.requiredRole && currentRole !== to.meta.requiredRole) {
      console.log('🚫 Insufficient permissions, redirecting to role selection')
      next({ name: 'role-selection' })
      return
    }
  }

  // Check if route requires guest (non-authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to dashboard')
      next({ name: 'dashboard' })
      return
    }
  }

  // Check if user needs to select role
  if (isAuthenticated && !currentRole && to.name !== 'role-selection') {
    console.log('🎭 No role selected, redirecting to role selection')
    next({ name: 'role-selection' })
    return
  }

  next()
})

// After each route hook for analytics and tracking
router.afterEach((to, from) => {
  console.log('✅ Navigation completed to:', to.name)
  
  // Track page view for analytics
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: to.meta.title || 'Stages Médicaux',
      page_location: window.location.href
    })
  }

  // Close any open modals or panels
  if (router.app.$store) {
    router.app.$store.commit('app/CLOSE_ALL_MODALS')
  }
})

// Error handler for navigation failures
router.onError((error) => {
  console.error('🚨 Router Error:', error)
  
  // Check if it's a chunk loading error
  if (/loading chunk \S+ failed/.test(error.message)) {
    console.log('🔄 Chunk loading failed, reloading page...')
    window.location.reload()
  }
})

// Navigation duplication prevention
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err
    }
  })
}

// Helper methods for programmatic navigation
router.navigateToRole = function(role) {
  const roleRoutes = {
    student: '/student/dashboard',
    doctor: '/doctor/dashboard',
    'hospital-admin': '/hospital-admin/dashboard',
    doyen: '/doyen/dashboard'
  }
  
  if (roleRoutes[role]) {
    this.push(roleRoutes[role])
  } else {
    console.error('Unknown role:', role)
    this.push('/role-selection')
  }
}

router.getBreadcrumbs = function(route) {
  const breadcrumbs = []
  const matched = route.matched
  
  for (const match of matched) {
    if (match.meta && match.meta.breadcrumb) {
      breadcrumbs.push({
        text: match.meta.breadcrumb,
        to: match.path
      })
    }
  }
  
  return breadcrumbs
}

router.hasPermission = function(permission) {
  const user = router.app.$store?.state?.auth?.currentUser
  return user && user.permissions && user.permissions.includes(permission)
}

router.hasRole = function(role) {
  const currentRole = router.app.$store?.state?.auth?.currentRole
  return currentRole === role
}

// Export router instance
export default router