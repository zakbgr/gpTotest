import api from './api'

export const authService = {
  // Connexion
  login(credentials) {
    return api.post('/auth/login/', credentials)
  },
  
  // Inscription étudiant
  registerStudent(studentData) {
    return api.post('/auth/register/student/', studentData)
  },
  
  // Rafraîchir le token
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    return api.post('/auth/token/refresh/', { refresh: refreshToken })
  },
  
  // Déconnexion
  logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    return api.post('/auth/logout/', { refresh_token: refreshToken })
  },
  
  // Mot de passe oublié
  forgotPassword(email) {
    return api.post('/auth/password/reset/', { email })
  },
  
  // Réinitialiser le mot de passe
  resetPassword(uid, token, newPassword) {
    return api.post('/auth/password/reset/confirm/', {
      uid,
      token,
      new_password: newPassword
    })
  }
}
