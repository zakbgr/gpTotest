<template>
  <div class="student-applications">
    <div class="page-header">
      <h1>Mes Candidatures</h1>
      <button class="btn btn-primary" @click="showNewApplication">
        <i class="fas fa-plus"></i> Nouvelle Candidature
      </button>
    </div>

    <!-- Applications Table -->
    <DataTable 
      :items="applications" 
      :columns="applicationColumns"
      :loading="loading"
    >
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      
      <template #cell-date_of_application="{ item }">
        {{ formatDate(item.date_of_application) }}
      </template>
      
      <template #cell-actions="{ item }">
        <button 
          class="btn btn-outline btn-sm"
          @click="viewApplicationDetails(item)"
        >
          Voir détails
        </button>
        
        <button 
          v-if="item.status === 'pending'"
          class="btn btn-danger btn-sm"
          @click="cancelApplication(item)"
        >
          Annuler
        </button>
        
        <button 
          v-if="item.status === 'rejected' && item.reason_of_refusal"
          class="btn btn-outline btn-sm"
          @click="viewRejectionReason(item)"
        >
          Voir motif
        </button>
        
        <button 
          v-if="item.status === 'approved' && item.internship"
          class="btn btn-success btn-sm"
          @click="viewInternshipDetails(item.internship)"
        >
          Voir stage
        </button>
      </template>
    </DataTable>

    <!-- No Applications -->
    <div v-if="!loading && applications.length === 0" class="no-applications">
      <i class="fas fa-file-alt"></i>
      <h3>Aucune candidature</h3>
      <p>Vous n'avez pas encore postulé à des offres de stage.</p>
      <button class="btn btn-primary" @click="showNewApplication">
        Postuler maintenant
      </button>
    </div>

    <!-- Application Details Modal -->
    <Modal 
      v-if="selectedApplication"
      :show="showDetailsModal"
      @close="closeDetailsModal"
      :title="`Candidature - ${selectedApplication.internship_announcement.title}`"
    >
      <ApplicationDetails 
        :application="selectedApplication"
        @cancel="cancelApplication(selectedApplication)"
      />
    </Modal>

    <!-- Rejection Reason Modal -->
    <Modal 
      v-if="selectedRejection"
      :show="showRejectionModal"
      @close="closeRejectionModal"
      title="Motif de refus"
    >
      <div class="rejection-reason">
        <h4>Motif de refus :</h4>
        <p>{{ selectedRejection.reason_of_refusal }}</p>
      </div>
    </Modal>

    <!-- New Application Modal -->
    <Modal 
      v-if="showNewApplicationModal"
      :show="showNewApplicationModal"
      @close="closeNewApplicationModal"
      title="Nouvelle Candidature"
      size="large"
    >
      <ApplicationForm 
        @submit="submitNewApplication"
        @cancel="closeNewApplicationModal"
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
import ApplicationForm from './components/ApplicationForm.vue'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'StudentApplications',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    ApplicationDetails,
    ApplicationForm
  },
  data() {
    return {
      applicationColumns: [
        { key: 'internship_announcement.title', label: 'Stage' },
        { key: 'internship_announcement.establishment.name', label: 'Hôpital' },
        { key: 'date_of_application', label: 'Date candidature' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      selectedApplication: null,
      selectedRejection: null,
      showDetailsModal: false,
      showRejectionModal: false,
      showNewApplicationModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('student', ['applications'])
  },
  async created() {
    await this.loadApplications()
  },
  methods: {
    ...mapActions('student', ['fetchApplications', 'cancelApplication', 'createApplication']),
    
    async loadApplications() {
      this.loading = true
      try {
        await this.fetchApplications()
      } catch (error) {
        console.error('Error loading applications:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger vos candidatures.'
        })
      } finally {
        this.loading = false
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
    
    viewRejectionReason(application) {
      this.selectedRejection = application
      this.showRejectionModal = true
    },
    
    closeRejectionModal() {
      this.selectedRejection = null
      this.showRejectionModal = false
    },
    
    showNewApplication() {
      this.showNewApplicationModal = true
    },
    
    closeNewApplicationModal() {
      this.showNewApplicationModal = false
    },
    
    async cancelApplication(application) {
      if (!confirm('Êtes-vous sûr de vouloir annuler cette candidature ?')) {
        return
      }
      
      try {
        await this.cancelApplication(application.id)
        this.$notify({
          type: 'success',
          title: 'Candidature annulée',
          message: 'Votre candidature a été annulée avec succès.'
        })
        this.closeDetailsModal()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'annuler la candidature.'
        })
      }
    },
    
    async submitNewApplication(applicationData) {
      try {
        await this.createApplication(applicationData)
        this.closeNewApplicationModal()
        this.$notify({
          type: 'success',
          title: 'Candidature envoyée',
          message: 'Votre candidature a été soumise avec succès.'
        })
        await this.loadApplications() // Refresh the list
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de soumettre votre candidature.'
        })
      }
    },
    
    viewInternshipDetails(internship) {
      this.$router.push({ 
        name: 'student-planning', 
        query: { internship_id: internship.id }
      })
    },
    
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style scoped>
.student-applications {
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

.no-applications {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.no-applications i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.no-applications h3 {
  margin-bottom: 10px;
  color: var(--text);
}

.no-applications p {
  margin-bottom: 20px;
}

.rejection-reason {
  padding: 20px;
}

.rejection-reason h4 {
  color: var(--medical);
  margin-bottom: 15px;
}

.rejection-reason p {
  line-height: 1.6;
  color: var(--text);
  background: var(--secondary);
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid var(--danger);
}
</style>