import api from './api'

export const studentService = {
  // Récupérer tous les étudiants
  getStudents(params = {}) {
    return api.get('/students/', { params })
  },
  
  // Récupérer un étudiant par ID
  getStudentById(id) {
    return api.get(\/students/\/\)
  },
  
  // Créer un nouvel étudiant
  createStudent(studentData) {
    return api.post('/students/', studentData)
  },
  
  // Mettre à jour un étudiant
  updateStudent(id, studentData) {
    return api.put(\/students/\/\, studentData)
  },
  
  // Récupérer les candidatures d'un étudiant
  getStudentApplications(studentId) {
    return api.get(\/students/\/applications/\)
  },
  
  // Récupérer les stages d'un étudiant
  getStudentInternships(studentId) {
    return api.get(\/students/\/internships/\)
  },
  
  // Récupérer les documents d'un étudiant
  getStudentDocuments(studentId) {
    return api.get(\/students/\/documents/\)
  },
  
  // Uploader un document
  uploadDocument(studentId, documentData) {
    const formData = new FormData()
    formData.append('title', documentData.title)
    formData.append('file', documentData.file)
    formData.append('student', studentId)
    
    return api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // Récupérer les évaluations d'un étudiant
  getStudentEvaluations(studentId) {
    return api.get(\/students/\/evaluations/\)
  },
  
  // Récupérer le planning d'un étudiant
  getStudentSchedule(studentId, params = {}) {
    return api.get(\/students/\/schedule/\, { params })
  },
  
  // Récupérer les statistiques d'un étudiant
  getStudentStats(studentId) {
    return api.get(\/students/\/stats/\)
  }
}
