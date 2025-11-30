<template>
  <div class="student-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de Bord Étudiant</h1>
      <p>Bienvenue, {{ student.prenom }} {{ student.name }} !</p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-briefcase-medical"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.availableOffers }}</div>
          <div class="stat-label">Offres disponibles</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.submittedApplications }}</div>
          <div class="stat-label">Candidatures envoyées</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.currentInternships }}</div>
          <div class="stat-label">Stage en cours</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ averageGrade }}</div>
          <div class="stat-label">Moyenne générale</div>
        </div>
      </div>
    </div>

    <!-- Upcoming Deadlines -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Prochaines Échéances</h2>
      </div>
      <DataTable :items="deadlines" :columns="deadlineColumns" :loading="loading">
        <template #cell-status="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #cell-actions="{ item }">
          <button 
            v-if="item.type === 'evaluation' && item.status === 'pending'"
            class="btn btn-primary btn-sm"
            @click="startEvaluation(item)"
          >
            Commencer
          </button>
          <button 
            v-else-if="item.type === 'report'"
            class="btn btn-outline btn-sm"
            @click="downloadDocument(item)"
          >
            Télécharger
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Current Internships -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Mes Stages</h2>
      </div>
      <DataTable :items="internships" :columns="internshipColumns" :loading="loading">
        <template #cell-status="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #cell-actions="{ item }">
          <button 
            class="btn btn-outline btn-sm"
            @click="showPlanning(item)"
            :disabled="item.status === 'upcoming'"
          >
            Planning
          </button>
          <button 
            class="btn btn-outline btn-sm"
            @click="showEvaluation(item)"
            :disabled="item.status !== 'completed'"
          >
            Évaluation
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Recent Notifications -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Notifications Récentes</h2>
      </div>
      <NotificationPanel :notifications="recentNotifications" compact />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import NotificationPanel from '@/components/shared/NotificationPanel.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

export default {
  name: 'StudentDashboard',
  components: {
    DataTable,
    NotificationPanel,
    StatusBadge
  },
  data() {
    return {
      deadlineColumns: [
        { key: 'title', label: 'Échéance' },
        { key: 'internship_title', label: 'Stage' },
        { key: 'due_date', label: 'Date limite' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Action' }
      ],
      internshipColumns: [
        { key: 'service_name', label: 'Service' },
        { key: 'establishment_name', label: 'Hôpital' },
        { key: 'period', label: 'Période' },
        { key: 'doctor_name', label: 'Encadrant' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      loading: false
    }
  },
  computed: {
    ...mapState('student', ['student', 'stats', 'deadlines', 'internships', 'recentNotifications']),
    
    averageGrade() {
      if (!this.student.evaluations || this.student.evaluations.length === 0) return '-'
      const total = this.student.evaluations.reduce((sum, evalItem) => {
        return sum + this.parseGrade(evalItem.evalyation)
      }, 0)
      return (total / this.student.evaluations.length).toFixed(1)
    }
  },
  async created() {
    await this.loadDashboardData()
  },
  methods: {
    ...mapActions('student', ['fetchStudentDashboard']),
    
    async loadDashboardData() {
      this.loading = true
      try {
        await this.fetchStudentDashboard()
      } catch (error) {
        console.error('Error loading dashboard:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les données du tableau de bord.'
        })
      } finally {
        this.loading = false
      }
    },
    
    parseGrade(gradeString) {
      // Convert evaluation string to numeric grade
      const match = gradeString.match(/(\d+(\.\d+)?)/)
      return match ? parseFloat(match[1]) : 0
    },
    
    startEvaluation(deadline) {
      this.$router.push({ name: 'student-evaluation', params: { id: deadline.id } })
    },
    
    downloadDocument(deadline) {
      // Implementation for document download
      console.log('Downloading document for:', deadline)
    },
    
    showPlanning(internship) {
      this.$router.push({ 
        name: 'student-planning', 
        query: { internship_id: internship.id }
      })
    },
    
    showEvaluation(internship) {
      this.$router.push({ 
        name: 'student-evaluation', 
        params: { id: internship.id } 
      })
    }
  }
}
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: var(--medical);
  margin-bottom: 10px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--medical);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--medical);
}

.stat-label {
  color: var(--text-light);
  font-size: 0.9rem;
}

.dashboard-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--medical);
}

.section-header h2 {
  color: var(--medical);
  margin: 0;
}
</style>