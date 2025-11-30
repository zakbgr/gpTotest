// Enhanced route guards
export const authGuard = (to, from, next, store) => {
  const isAuthenticated = store.state.auth.isAuthenticated
  const currentRole = store.state.auth.currentRole
  
  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.warn('🛡️ Auth Guard: User not authenticated, redirecting to login')
      return next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    }
    
    // Check role-specific access
    if (to.meta.requiredRole && currentRole !== to.meta.requiredRole) {
      console.warn(`🛡️ Auth Guard: User role ${currentRole} doesn't match required role ${to.meta.requiredRole}`)
      return next({ name: 'unauthorized' })
    }
  }
  
  // Routes that require guest (non-authenticated users)
  if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    console.warn('🛡️ Auth Guard: User already authenticated, redirecting to dashboard')
    return next({ name: 'dashboard' })
  }
  
  next()
}

export const roleGuard = (to, from, next, store) => {
  const currentRole = store.state.auth.currentRole
  const isAuthenticated = store.state.auth.isAuthenticated
  
  // If authenticated but no role selected, redirect to role selection
  if (isAuthenticated && !currentRole && to.name !== 'role-selection') {
    console.warn('🛡️ Role Guard: No role selected, redirecting to role selection')
    return next({ name: 'role-selection' })
  }
  
  next()
}

export const permissionGuard = (to, from, next, store) => {
  const userPermissions = store.state.auth.currentUser?.permissions || []
  
  // Check if route requires specific permissions
  if (to.meta.requiredPermissions) {
    const hasPermission = to.meta.requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )
    
    if (!hasPermission) {
      console.warn('🛡️ Permission Guard: Insufficient permissions')
      return next({ name: 'unauthorized' })
    }
  }
  
  next()
}

export const dataPrefetchGuard = async (to, from, next, store) => {
  // Prefetch data based on route
  try {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      const currentRole = store.state.auth.currentRole
      
      switch (currentRole) {
        case 'student':
          if (to.name === 'student-dashboard') {
            await store.dispatch('student/fetchStudentDashboard')
          }
          break
        case 'doctor':
          if (to.name === 'doctor-dashboard') {
            await store.dispatch('doctor/fetchDoctorDashboard')
          }
          break
        case 'hospital-admin':
          if (to.name === 'hospital-admin-dashboard') {
            await store.dispatch('hospitalAdmin/fetchHospitalDashboard')
          }
          break
        case 'doyen':
          if (to.name === 'doyen-dashboard') {
            await store.dispatch('doyen/fetchDoyenDashboard')
          }
          break
      }
    }
  } catch (error) {
    console.error('Data prefetch error:', error)
    // Continue navigation even if prefetch fails
  }
  
  next()
}