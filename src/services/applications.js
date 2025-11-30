import api from './api'

export const applicationService = {
  // Récupérer toutes les candidatures
  getApplications(params = {}) {
    return api.get('/candidacies/', { params })
  },
  
  // Récupérer une candidature par ID
  getApplicationById(id) {
    return api.get(\/candidacies/\/\)
  },
  
  // Créer une nouvelle candidature
  createApplication(applicationData) {
    return api.post('/candidacies/', applicationData)
  },
  
  // Mettre à jour le statut d'une candidature
  updateApplicationStatus(id, status, reason = null) {
    const data = { status }
    if (reason) {
      data.reason_of_refusal = reason
    }
    return api.patch(\/candidacies/\/\, data)
  },
  
  // Assigner un stage à une candidature
  assignInternship(applicationId, internshipData) {
    return api.post(\/candidacies/\/assign-internship/\, internshipData)
  }
}
