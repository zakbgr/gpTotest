<template>
  <div class="student-planning">
    <div class="page-header">
      <h1>Mon Planning de Stage</h1>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportCalendar">
          <i class="fas fa-download"></i> Exporter iCal
        </button>
        <button class="btn btn-primary" @click="printPlanning">
          <i class="fas fa-print"></i> Imprimer
        </button>
      </div>
    </div>

    <!-- Internship Selection -->
    <div class="internship-selector" v-if="internships.length > 1">
      <label>Sélectionner un stage :</label>
      <select v-model="selectedInternshipId" class="form-control">
        <option 
          v-for="internship in internships" 
          :key="internship.id" 
          :value="internship.id"
        >
          {{ internship.service_name }} - {{ internship.establishment_name }} 
          ({{ formatDate(internship.start_date) }} - {{ formatDate(internship.end_date) }})
        </option>
      </select>
    </div>

    <!-- Calendar -->
    <div class="calendar-section">
      <div class="calendar-container">
        <Calendar 
          :events="calendarEvents"
          :loading="loading"
          @event-click="handleEventClick"
          @date-click="handleDateClick"
        />
      </div>
    </div>

    <!-- Current Internship Details -->
    <div class="internship-details" v-if="currentInternship">
      <div class="details-card">
        <h3>Détails du Stage</h3>
        <div class="details-grid">
          <div class="detail-item">
            <label>Service :</label>
            <span>{{ currentInternship.service_name }}</span>
          </div>
          <div class="detail-item">
            <label>Hôpital :</label>
            <span>{{ currentInternship.establishment_name }}</span>
          </div>
          <div class="detail-item">
            <label>Encadrant :</label>
            <span>Dr. {{ currentInternship.doctor_name }}</span>
          </div>
          <div class="detail-item">
            <label>Période :</label>
            <span>{{ formatDate(currentInternship.start_date) }} - {{ formatDate(currentInternship.end_date) }}</span>
          </div>
          <div class="detail-item">
            <label>Statut :</label>
            <StatusBadge :status="currentInternship.status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Downloadable Documents -->
    <div class="documents-section" v-if="currentInternship">
      <h3>Documents Téléchargeables</h3>
      <div class="documents-grid">
        <div class="document-card">
          <div class="document-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="document-info">
            <h5>Planning détaillé</h5>
            <p>Planning complet du stage {{ currentInternship.service_name }}</p>
          </div>
          <div class="document-actions">
            <button class="btn btn-primary btn-sm" @click="downloadPlanning">
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>
        
        <div class="document-card" v-if="currentInternship.status === 'completed'">
          <div class="document-icon">
            <i class="fas fa-file-pdf"></i>
          </div>
          <div class="document-info">
            <h5>Rapport de stage</h5>
            <p>Rapport final du stage {{ currentInternship.service_name }}</p>
          </div>
          <div class="document-actions">
            <button class="btn btn-primary btn-sm" @click="downloadReport">
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>
        
        <div class="document-card">
          <div class="document-icon">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="document-info">
            <h5>Attestation de stage</h5>
            <p>Attestation officielle de participation</p>
          </div>
          <div class="document-actions">
            <button 
              class="btn btn-primary btn-sm" 
              @click="downloadCertificate"
              :disabled="currentInternship.status !== 'completed'"
            >
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <Modal 
      v-if="selectedEvent"
      :show="showEventModal"
      @close="closeEventModal"
      :title="selectedEvent.title"
    >
      <EventDetails :event="selectedEvent" />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Calendar from '@/components/shared/Calendar.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EventDetails from './components/EventDetails.vue'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'StudentPlanning',
  components: {
    Calendar,
    Modal,
    StatusBadge,
    EventDetails
  },
  data() {
    return {
      selectedInternshipId: null,
      selectedEvent: null,
      showEventModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('student', ['internships', 'calendarEvents']),
    
    currentInternship() {
      if (!this.selectedInternshipId && this.internships.length > 0) {
        return this.internships[0]
      }
      return this.internships.find(i => i.id === this.selectedInternshipId) || this.internships[0]
    }
  },
  watch: {
    selectedInternshipId(newVal) {
      if (newVal) {
        this.loadCalendarEvents(newVal)
      }
    },
    internships: {
      immediate: true,
      handler(newInternships) {
        if (newInternships.length > 0 && !this.selectedInternshipId) {
          this.selectedInternshipId = newInternships[0].id
        }
      }
    }
  },
  async created() {
    await this.loadInternships()
  },
  methods: {
    ...mapActions('student', ['fetchInternships', 'fetchCalendarEvents']),
    
    async loadInternships() {
      this.loading = true
      try {
        await this.fetchInternships()
      } catch (error) {
        console.error('Error loading internships:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger vos stages.'
        })
      } finally {
        this.loading = false
      }
    },
    
    async loadCalendarEvents(internshipId) {
      try {
        await this.fetchCalendarEvents(internshipId)
      } catch (error) {
        console.error('Error loading calendar events:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger le planning.'
        })
      }
    },
    
    handleEventClick(event) {
      this.selectedEvent = event
      this.showEventModal = true
    },
    
    handleDateClick(date) {
      console.log('Date clicked:', date)
      // Could implement adding personal events here
    },
    
    closeEventModal() {
      this.selectedEvent = null
      this.showEventModal = false
    },
    
    exportCalendar() {
      // Implement iCal export
      this.$notify({
        type: 'info',
        title: 'Export calendrier',
        message: 'Fonctionnalité d\'export iCal en développement.'
      })
    },
    
    printPlanning() {
      window.print()
    },
    
    downloadPlanning() {
      // Implement planning download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Téléchargement du planning en cours...'
      })
    },
    
    downloadReport() {
      // Implement report download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Téléchargement du rapport en cours...'
      })
    },
    
    downloadCertificate() {
      // Implement certificate download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Téléchargement de l\'attestation en cours...'
      })
    },
    
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style scoped>
.student-planning {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.internship-selector {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.internship-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text);
}

.calendar-section {
  margin-bottom: 30px;
}

.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.internship-details {
  margin-bottom: 30px;
}

.details-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.details-card h3 {
  color: var(--medical);
  margin-bottom: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.detail-item span {
  color: var(--text);
}

.documents-section {
  margin-bottom: 30px;
}

.documents-section h3 {
  color: var(--medical);
  margin-bottom: 20px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.document-icon {
  width: 50px;
  height: 50px;
  background: var(--secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--medical);
}

.document-info {
  flex: 1;
}

.document-info h5 {
  margin: 0 0 5px 0;
  color: var(--text);
}

.document-info p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

@media print {
  .header-actions,
  .internship-selector {
    display: none;
  }
}
</style>