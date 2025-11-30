// Rôles utilisateur
export const USER_ROLES = {
  STUDENT: 'student',
  DOCTOR: 'doctor',
  HOSPITAL_ADMIN: 'hospital_admin',
  DOYEN: 'doyen'
}

// Statuts des candidatures
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUBMITTED: 'submitted',
  WITHDRAWN: 'withdrawn'
}

// Statuts des stages
export const INTERNSHIP_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  UPCOMING: 'upcoming'
}

// Types d'évaluations
export const EVALUATION_TYPES = {
  INTERNSHIP: 'internship',
  SKILLS: 'skills',
  BEHAVIOR: 'behavior'
}

// Spécialités médicales
export const MEDICAL_SPECIALTIES = [
  'Chirurgie Générale',
  'Pédiatrie',
  'Cardiologie',
  'Médecine Interne',
  'Neurologie',
  'Radiologie',
  'Anesthésiologie',
  'Gynécologie',
  'Dermatologie',
  'Psychiatrie'
]

// Types de documents
export const DOCUMENT_TYPES = {
  CV: 'cv',
  MOTIVATION_LETTER: 'motivation_letter',
  STUDENT_CARD: 'student_card',
  TRANSCRIPT: 'transcript',
  CERTIFICATE: 'certificate',
  OTHER: 'other'
}

// Configuration du calendrier
export const CALENDAR_CONFIG = {
  TIME_SLOTS: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  WEEKDAYS: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  MONTHS: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
}

// Configuration des notifications
export const NOTIFICATION_TYPES = {
  APPLICATION_UPDATE: 'application_update',
  EVALUATION: 'evaluation',
  INTERNSHIP: 'internship',
  MESSAGE: 'message',
  SYSTEM: 'system',
  REMINDER: 'reminder'
}

// Configuration de la pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100]
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Vous n\\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Veuillez corriger les erreurs dans le formulaire.'
}

// Messages de succès
export const SUCCESS_MESSAGES = {
  SAVED: 'Enregistrement réussi.',
  DELETED: 'Suppression réussie.',
  UPDATED: 'Mise à jour réussie.',
  CREATED: 'Création réussie.'
}
