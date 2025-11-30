// Router utility functions
export const routePermissions = {
  // Student permissions
  STUDENT_VIEW_OFFERS: 'student.view_offers',
  STUDENT_CREATE_APPLICATION: 'student.create_application',
  STUDENT_VIEW_EVALUATIONS: 'student.view_evaluations',
  
  // Doctor permissions
  DOCTOR_MANAGE_INTERNS: 'doctor.manage_interns',
  DOCTOR_CREATE_EVALUATIONS: 'doctor.create_evaluations',
  DOCTOR_VIEW_STUDENT_PROFILES: 'doctor.view_student_profiles',
  
  // Hospital Admin permissions
  HOSPITAL_MANAGE_SERVICES: 'hospital.manage_services',
  HOSPITAL_CREATE_OFFERS: 'hospital.create_offers',
  HOSPITAL_REVIEW_APPLICATIONS: 'hospital.review_applications',
  
  // Doyen permissions
  DOYEN_VALIDATE_OFFERS: 'doyen.validate_offers',
  DOYEN_MANAGE_USERS: 'doyen.manage_users',
  DOYEN_RUN_ASSIGNMENT: 'doyen.run_assignment',
  DOYEN_VIEW_REPORTS: 'doyen.view_reports'
}

export const getDefaultRouteForRole = (role) => {
  const defaultRoutes = {
    student: '/student/dashboard',
    doctor: '/doctor/dashboard',
    'hospital-admin': '/hospital-admin/dashboard',
    doyen: '/doyen/dashboard'
  }
  return defaultRoutes[role] || '/dashboard'
}

export const getRoleFromPath = (path) => {
  if (path.startsWith('/student')) return 'student'
  if (path.startsWith('/doctor')) return 'doctor'
  if (path.startsWith('/hospital-admin')) return 'hospital-admin'
  if (path.startsWith('/doyen')) return 'doyen'
  return null
}

export const isRouteAccessible = (route, userRole, userPermissions = []) => {
  // Check role requirement
  if (route.meta.requiredRole && route.meta.requiredRole !== userRole) {
    return false
  }
  
  // Check permission requirements
  if (route.meta.requiredPermissions) {
    const hasAllPermissions = route.meta.requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )
    if (!hasAllPermissions) {
      return false
    }
  }
  
  return true
}

export const generateRoute = (name, params = {}, query = {}) => {
  return {
    name,
    params,
    query
  }
}