<template>
  <div class="hospital-applications">
    <div class="page-header">
      <h1>Gestion des Candidatures</h1>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-row">
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
          <label>Statut</label>
          <select v-model="filters.status" class="form-control">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Acceptée</option>
            <option value="rejected">Refusée</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Date</label>
          <input type="date" v-model="filters.date" class="form-control">
        </div>
      </div>
      
      <div class="search-box">
        <div class="form-group">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="filters.search" 
            class="form-control" 
            placeholder="Rechercher un étudiant..."
          >
        </div>
      </div>
    </div>

    <!-- Applications Table -->
    <DataTable 
      :items="filteredApplications" 
      :columns="applicationColumns"
      :loading="loading"
    >
      <template #cell-student="{ item }">
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
      
      <template #cell-date_of_application="{ item }">
        {{ formatDate(item.date_of_application) }}
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      
      <template #cell-recommendation="{ item }">
        <span v-if="item.recommendation" :class="`recommendation-${item.recommendation}`">
          {{ getRecommendationLabel(item.recommendation) }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button 
            v-if="item.status === 'pending'"
            class="btn btn-success btn-sm"
            @click="giveRecommendation(item, 'favorable')"
          >
            <i class="fas fa-thumbs-up"></i>
            Favorable
          </button>
          
          <button 
            v-if="item.status === 'pending'"
            class="btn btn-danger btn-sm"
            @click="giveRecommendation(item, 'defavorable')"
          >
            <i class="fas fa-thumbs-down"></i>
            Défavorable
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewStudentCV(item.student)"
          >
            <i class="fas fa-file-pdf"></i>
            Voir CV
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewApplicationDetails(item)"
          >
            <i class="fas fa-eye"></i>
            Détails
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Bulk Actions -->
    <div class="bulk-actions" v-if="selectedApplications.length > 0">
      <div class="bulk-header">
        <span>{{ selectedApplications.length }} candidature(s) sélectionnée(s)</span>
        <div class="bulk-buttons">
          <button class="btn btn-success btn-sm" @click="bulkApprove">
            <i class="fas fa-check"></i>
            Approuver la sélection
          </button>
          <button class="btn btn-danger btn-sm" @click="bulkReject">
            <i class="fas fa-times"></i>
            Rejeter la sélection
          </button>
        </div>
      </div>
    </div>

    <!-- Application Details Modal -->
    <Modal 
      v-if="selectedApplication"
      :show="showDetailsModal"
      @close="closeDetailsModal"
      :title="`Candidature - ${selectedApplication.student.prenom} ${selectedApplication.student.name}`"
      size="large"
    >
      <ApplicationDetails 
        :application="selectedApplication"
        @recommend="giveRecommendation(selectedApplication, $event)"
        @view-cv="viewStudentCV(selectedApplication.student)"
      />
    </Modal>

    <!-- CV Viewer Modal -->
    <Modal 
      v-if="selectedStudent"
      :show="showCVModal"
      @close="closeCVModal"
      :title="`CV - ${selectedStudent.prenom} ${selectedStudent.name}`"
      size="large"
    >
      <CVViewer 
        :student="selectedStudent"
        @download="downloadCV(selectedStudent)"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ApplicationDetails from './components/ApplicationDetails.vue'
import CVViewer from './components/CVViewer.vue'

export default {
  name: 'HospitalApplications',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    ApplicationDetails,
    CVViewer
  },
  data() {
    return {
      filters: {
        service: '',
        status: '',
        date: '',
        search: ''
      },
      applicationColumns: [
        { key: 'student', label: 'Étudiant' },
        { key: 'internship_announcement.title', label: 'Offre' },
        { key: 'internship_announcement.service.name', label: 'Service' },
        { key: 'date_of_application', label: 'Date candidature' },
        { key: 'status', label: 'Statut' },
        { key: 'recommendation', label: 'Avis' },
        { key: 'actions', label: 'Actions' }
      ],
      selectedApplications: [],
      selectedApplication: null,
      selectedStudent: null,
      showDetailsModal: false,
      showCVModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('hospitalAdmin', ['applications', 'services']),
    
    filteredApplications() {
      return this.applications.filter(app => {
        const matchesService = !this.filters.service || 
          app.internship_announcement.service.id == this.filters.service
        const matchesStatus = !this.filters.status || app.status === this.filters.status
        const matchesDate = !this.filters.date || 
          app.date_of_application.startsWith(this.filters.date)
        const matchesSearch = !this.filters.search || 
          `${app.student.prenom} ${app.student.name}`.toLowerCase()
            .includes(this.filters.search.toLowerCase()) ||
          app.student.email.toLowerCase().includes(this.filters.search.toLowerCase())
        
        return matchesService && matchesStatus && matchesDate && matchesSearch
      })
    }
  },
  async created() {
    await this.loadApplications()
  },
  methods: {
    ...mapActions('hospitalAdmin', [
      'fetchApplications',
      'fetchServices',
      'updateApplicationStatus',
      'bulkUpdateApplications'
    ]),
    
    async loadApplications() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchApplications(),
          this.fetchServices()
        ])
      } catch (error) {
        console.error('Error loading applications:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les candidatures.'
        })
      } finally {
        this.loading = false
      }
    },
    
    getRecommendationLabel(recommendation) {
      const labels = {
        favorable: 'Favorable',
        defavorable: 'Défavorable'
      }
      return labels[recommendation] || recommendation
    },
    
    async giveRecommendation(application, recommendation) {
      try {
        const updateData = {
          id: application.id,
          status: recommendation === 'favorable' ? 'approved' : 'rejected',
          recommendation: recommendation
        }
        
        await this.updateApplicationStatus(updateData)
        this.$notify({
          type: 'success',
          title: 'Avis enregistré',
          message: `Votre avis ${recommendation} a été enregistré.`
        })
        await this.loadApplications()
        this.closeDetailsModal()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'enregistrer votre avis.'
        })
      }
    },
    
    viewApplicationDetails(application) {
      this.selectedApplication = application
      this.showDetailsModal = true
    },
    
    closeDetailsModal() {
      this.selectedApplication = null
      this.showDetailsModal = false
    },
    
    viewStudentCV(student) {
      this.selectedStudent = student
      this.showCVModal = true
    },
    
    closeCVModal() {
      this.selectedStudent = null
      this.showCVModal = false
    },
    
    downloadCV(student) {
      // Implement CV download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Téléchargement du CV en cours...'
      })
    },
    
    async bulkApprove() {
      if (!confirm(`Approuver ${this.selectedApplications.length} candidature(s) ?`)) {
        return
      }
      
      try {
        await this.bulkUpdateApplications({
          ids: this.selectedApplications.map(app => app.id),
          status: 'approved'
        })
        this.$notify({
          type: 'success',
          title: 'Candidatures approuvées',
          message: `${this.selectedApplications.length} candidature(s) approuvée(s).`
        })
        this.selectedApplications = []
        await this.loadApplications()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'approuver les candidatures.'
        })
      }
    },
    
    async bulkReject() {
      if (!confirm(`Rejeter ${this.selectedApplications.length} candidature(s) ?`)) {
        return
      }
      
      try {
        await this.bulkUpdateApplications({
          ids: this.selectedApplications.map(app => app.id),
          status: 'rejected'
        })
        this.$notify({
          type: 'success',
          title: 'Candidatures rejetées',
          message: `${this.selectedApplications.length} candidature(s) rejetée(s).`
        })
        this.selectedApplications = []
        await this.loadApplications()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de rejeter les candidatures.'
        })
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.hospital-applications {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--medical);
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

.recommendation-favorable {
  color: var(--success);
  font-weight: 600;
}

.recommendation-defavorable {
  color: var(--danger);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.bulk-actions {
  background: var(--secondary);
  border-radius: 8px;
  padding: 15px 20px;
  margin-top: 20px;
}

.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-buttons {
  display: flex;
  gap: 10px;
}
</style>