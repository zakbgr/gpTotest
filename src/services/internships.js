import api from './api'

export const internshipService = {
  // Récupérer toutes les annonces de stage
  getInternshipAnnouncements(params = {}) {
    return api.get('/internship-announcements/', { params })
  },
  
  // Récupérer une annonce par ID
  getAnnouncementById(id) {
    return api.get(\/internship-announcements/\/\)
  },
  
  // Créer une nouvelle annonce
  createAnnouncement(announcementData) {
    return api.post('/internship-announcements/', announcementData)
  },
  
  // Mettre à jour une annonce
  updateAnnouncement(id, announcementData) {
    return api.put(\/internship-announcements/\/\, announcementData)
  },
  
  // Récupérer les candidatures pour une annonce
  getAnnouncementApplications(announcementId) {
    return api.get(\/internship-announcements/\/applications/\)
  },
  
  // Changer le statut d'une annonce
  updateAnnouncementStatus(id, status) {
    return api.patch(\/internship-announcements/\/\, { status })
  }
}
