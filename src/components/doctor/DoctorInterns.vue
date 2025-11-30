<template>
  <div class="doctor-interns">
    <div class="page-header">
      <h1>Mes Stagiaires</h1>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportInternsData">
          <i class="fas fa-download"></i> Exporter
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="form-group">
          <label>Statut</label>
          <select v-model="filters.status" class="form-control">
            <option value="">Tous les statuts</option>
            <option value="upcoming">À venir</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Service</label>
          <select v-model="filters.service" class="form-control">
            <option value="">Tous les services</option>
            <option 
              v-for="service in services" 
              :key="service.id" 
              :value="service.id"
            >
              {{ service.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Période</label>
          <select v-model="filters.period" class="form-control">
            <option value="">Toutes les périodes</option>
            <option value="current">En cours</option>
            <option value="past">Passés</option>
            <option value="future">Futurs</option>
          </select>
        </div>
      </div>
      
      <div class="search-box">
        <div class="form-group">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="filters.search" 
            class="form-control" 
            placeholder="Rechercher un stagiaire..."
          >
        </div>
      </div>
    </div>

    <!-- Interns Table -->
    <DataTable 
      :items="filteredInterns" 
      :columns="internColumns"
      :loading="loading"
    >
      <template #cell-student_name="{ item }">
        <div class="student-info">
          <div class="avatar-sm">
            <i class="fas fa-user-graduate"></i>
          </div>
          <div>
            <strong>{{ item.student.prenom }} {{ item.student.name }}</strong>
            <div class="student-details">
              {{ item.student.email }} • {{ item.student.telephone }}
            </div>
          </div>
        </div>
      </template>
      
      <template #cell-period="{ item }">
        {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
      </template>
      
      <template #cell-last_evaluation="{ item }">
        <div v-if="item.last_evaluation">
          {{ item.last_evaluation.grade }}/20
          <div class="evaluation-date">
            {{ formatDate(item.last_evaluation.date) }}
          </div>
        </div>
        <span v-else class="text-muted">-</span>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge :status="getInternshipStatus(item)" />
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button 
            class="btn btn-primary btn-sm"
            @click="evaluateStudent(item)"
            :disabled="!canEvaluate(item)"
          >
            <i class="fas fa-clipboard-check"></i>
            Évaluer
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewStudentProfile(item.student)"
          >
            <i class="fas fa-eye"></i>
            Profil
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewInternshipDetails(item)"
          >
            <i class="fas fa-info-circle"></i>
            Détails
          </button>
        </div>
      </template>
    </DataTable>

    <!-- No Results -->
    <div v-if="!loading && filteredInterns.length === 0" class="no-results">
      <i class="fas fa-user-graduate"></i>
      <h3>Aucun stagiaire trouvé</h3>
      <p>Aucun stagiaire ne correspond à vos critères de recherche.</p>
    </div>

    <!-- Internship Details Modal -->
    <Modal 
      v-if="selectedInternship"
      :show="showDetailsModal"
      @close="closeDetailsModal"
      :title="`Stage - ${selectedInternship.student.prenom} ${selectedInternship.student.name}`"
      size="large"
    >
      <InternshipDetails 
        :internship="selectedInternship"
        @evaluate="evaluateStudent(selectedInternship)"
      />
    </Modal>

    <!-- Student Profile Modal -->
    <Modal 
      v-if="selectedStudent"
      :show="showProfileModal"
      @close="closeProfileModal"
      :title="`Profil - ${selectedStudent.prenom} ${selectedStudent.name}`"
      size="large"
    >
      <StudentProfile 
        :student="selectedStudent"
        :internships="getStudentInternships(selectedStudent.id)"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import InternshipDetails from './components/InternshipDetails.vue'
import StudentProfile from './components/StudentProfile.vue'

export default {
  name: 'DoctorInterns',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    InternshipDetails,
    StudentProfile
  },
  data() {
    return {
      filters: {
        status: '',
        service: '',
        period: '',
        search: ''
      },
      internColumns: [
        { key: 'student_name', label: 'Stagiaire' },
        { key: 'internship.service.name', label: 'Service' },
        { key: 'period', label: 'Période' },
        { key: 'last_evaluation', label: 'Dernière évaluation' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      selectedInternship: null,
      selectedStudent: null,
      showDetailsModal: false,
      showProfileModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('doctor', ['interns', 'services']),
    
    filteredInterns() {
      return this.interns.filter(intern => {
        const matchesStatus = !this.filters.status || 
          this.getInternshipStatus(intern) === this.filters.status
        const matchesService = !this.filters.service || 
          intern.internship.service.id == this.filters.service
        const matchesPeriod = this.matchesPeriodFilter(intern)
        const matchesSearch = !this.filters.search || 
          `${intern.student.prenom} ${intern.student.name}`.toLowerCase()
            .includes(this.filters.search.toLowerCase()) ||
          intern.student.email.toLowerCase().includes(this.filters.search.toLowerCase())
        
        return matchesStatus && matchesService && matchesPeriod && matchesSearch
      })
    }
  },
  async created() {
    await this.loadInterns()
  },
  methods: {
    ...mapActions('doctor', ['fetchInterns', 'fetchServices']),
    
    async loadInterns() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchInterns(),
          this.fetchServices()
        ])
      } catch (error) {
        console.error('Error loading interns:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger la liste des stagiaires.'
        })
      } finally {
        this.loading = false
      }
    },
    
    getInternshipStatus(internship) {
      const today = new Date()
      const startDate = new Date(internship.start_date)
      const endDate = new Date(internship.end_date)
      
      if (today < startDate) return 'upcoming'
      if (today > endDate) return 'completed'
      return 'in-progress'
    },
    
    matchesPeriodFilter(internship) {
      if (!this.filters.period) return true
      
      const today = new Date()
      const startDate = new Date(internship.start_date)
      const endDate = new Date(internship.end_date)
      
      switch (this.filters.period) {
        case 'current':
          return today >= startDate && today <= endDate
        case 'past':
          return today > endDate
        case 'future':
          return today < startDate
        default:
          return true
      }
    },
    
    canEvaluate(internship) {
      const status = this.getInternshipStatus(internship)
      return status === 'in-progress' || status === 'completed'
    },
    
    evaluateStudent(internship) {
      this.$router.push({ 
        name: 'doctor-evaluation-form', 
        params: { internshipId: internship.id }
      })
    },
    
    viewStudentProfile(student) {
      this.selectedStudent = student
      this.showProfileModal = true
    },
    
    viewInternshipDetails(internship) {
      this.selectedInternship = internship
      this.showDetailsModal = true
    },
    
    closeDetailsModal() {
      this.selectedInternship = null
      this.showDetailsModal = false
    },
    
    closeProfileModal() {
      this.selectedStudent = null
      this.showProfileModal = false
    },
    
    getStudentInternships(studentId) {
      return this.interns.filter(intern => intern.student.id === studentId)
    },
    
    exportInternsData() {
      // Implement export functionality
      this.$notify({
        type: 'info',
        title: 'Export',
        message: 'Export des données en cours...'
      })
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.doctor-interns {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--medical);
  margin: 0;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.search-box {
  max-width: 400px;
}

.search-box .form-group {
  position: relative;
}

.search-box .fa-search {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  padding-left: 35px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
}

.student-details {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 2px;
}

.evaluation-date {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.no-results h3 {
  margin-bottom: 10px;
  color: var(--text);
}
</style>