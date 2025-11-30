import api from './api'

export const hospitalService = {
  // Récupérer tous les établissements
  getEstablishments() {
    return api.get('/establishments/')
  },
  
  // Récupérer un établissement par ID
  getEstablishmentById(id) {
    return api.get(\/establishments/\/\)
  },
  
  // Récupérer les services d'un hôpital
  getHospitalServices(establishmentId) {
    return api.get(\/establishments/\/services/\)
  },
  
  // Récupérer les statistiques d'un hôpital
  getHospitalStats(establishmentId) {
    return api.get(\/establishments/\/stats/\)
  },
  
  // Mettre à jour la capacité d'un service
  updateServiceCapacity(serviceId, capacity) {
    return api.patch(\/hospital-services/\/\, { capacity })
  }
}
