import api from './api'

export const doctorService = {
  // Récupérer tous les docteurs
  getDoctors() {
    return api.get('/doctors/')
  },
  
  // Récupérer un docteur par ID
  getDoctorById(id) {
    return api.get(\/doctors/\/\)
  },
  
  // Récupérer les stagiaires d'un docteur
  getDoctorInterns(doctorId) {
    return api.get(\/doctors/\/interns/\)
  },
  
  // Récupérer les évaluations d'un docteur
  getDoctorEvaluations(doctorId) {
    return api.get(\/doctors/\/evaluations/\)
  },
  
  // Créer une évaluation
  createEvaluation(evaluationData) {
    return api.post('/evaluations/', evaluationData)
  },
  
  // Mettre à jour une évaluation
  updateEvaluation(id, evaluationData) {
    return api.put(\/evaluations/\/\, evaluationData)
  }
}
