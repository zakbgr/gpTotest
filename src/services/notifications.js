import api from './api'

export const notificationService = {
  // Récupérer les notifications
  getNotifications(params = {}) {
    return api.get('/notifications/', { params })
  },
  
  // Récupérer le nombre de notifications non lues
  getUnreadCount() {
    return api.get('/notifications/unread-count/')
  },
  
  // Marquer une notification comme lue
  markAsRead(notificationId) {
    return api.patch(\/notifications/\/mark-read/\)
  },
  
  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    return api.post('/notifications/mark-all-read/')
  },
  
  // Supprimer une notification
  deleteNotification(notificationId) {
    return api.delete(\/notifications/\/\)
  },
  
  // Supprimer toutes les notifications
  clearAll() {
    return api.post('/notifications/clear-all/')
  },
  
  // Créer une notification (pour les tests/admin)
  createNotification(notificationData) {
    return api.post('/notifications/', notificationData)
  }
}
