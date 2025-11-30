import { defineStore } from 'pinia'
import { authService } from '../services/auth'
import { studentService } from '../services/students'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,
    isAuthenticated: false,
    token: localStorage.getItem('authToken') || null
  }),
  
  getters: {
    isStudent: (state) => state.role === 'student',
    isDoctor: (state) => state.role === 'doctor',
    isHospitalAdmin: (state) => state.role === 'hospital_admin',
    isDoyen: (state) => state.role === 'doyen'
  },
  
  actions: {
    async login(credentials) {
      try {
        const response = await authService.login(credentials)
        const { access, refresh, user } = response.data
        
        // Stocker les tokens
        localStorage.setItem('authToken', access)
        localStorage.setItem('refreshToken', refresh)
        
        this.token = access
        this.user = user
        this.role = user.role
        this.isAuthenticated = true
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Erreur de connexion' 
        }
      }
    },
    
    async registerStudent(studentData) {
      try {
        const response = await authService.registerStudent(studentData)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data || 'Erreur d\\'inscription'
        }
      }
    },
    
    logout() {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      this.user = null
      this.role = null
      this.isAuthenticated = false
      this.token = null
    },
    
    updateUserProfile(userData) {
      this.user = { ...this.user, ...userData }
    }
  }
})

export const useStudentStore = defineStore('student', {
  state: () => ({
    student: null,
    applications: [],
    internships: [],
    documents: [],
    isLoading: false
  }),
  
  actions: {
    async fetchStudentProfile(studentId) {
      this.isLoading = true
      try {
        const response = await studentService.getStudentById(studentId)
        this.student = response.data
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchStudentApplications(studentId) {
      this.isLoading = true
      try {
        const response = await studentService.getStudentApplications(studentId)
        this.applications = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des candidatures:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async uploadDocument(studentId, documentData) {
      try {
        const response = await studentService.uploadDocument(studentId, documentData)
        this.documents.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data || 'Erreur lors de l\\'upload'
        }
      }
    }
  }
})

export const useInternshipStore = defineStore('internship', {
  state: () => ({
    announcements: [],
    filteredAnnouncements: [],
    currentAnnouncement: null,
    filters: {
      specialty: '',
      establishment: '',
      status: 'active'
    }
  }),
  
  actions: {
    async fetchAnnouncements(filters = {}) {
      try {
        const response = await internshipService.getInternshipAnnouncements(filters)
        this.announcements = response.data
        this.applyFilters()
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error)
        throw error
      }
    },
    
    applyFilters() {
      this.filteredAnnouncements = this.announcements.filter(announcement => {
        const matchesSpecialty = !this.filters.specialty || 
          announcement.service.specialty === this.filters.specialty
        const matchesEstablishment = !this.filters.establishment ||
          announcement.establishment.id == this.filters.establishment
        const matchesStatus = !this.filters.status ||
          announcement.status === this.filters.status
        
        return matchesSpecialty && matchesEstablishment && matchesStatus
      })
    },
    
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.applyFilters()
    }
  }
})
