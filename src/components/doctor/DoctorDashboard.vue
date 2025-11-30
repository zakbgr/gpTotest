<template>
  <div class="doctor-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de Bord Docteur</h1>
      <p>Bienvenue, Dr. {{ doctor.prenom }} {{ doctor.name }} !</p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.currentInterns }}</div>
          <div class="stat-label">Stagiaires encadrés</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingEvaluations }}</div>
          <div class="stat-label">Évaluations en attente</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.weeklyHours }}</div>
          <div class="stat-label">Heures cette semaine</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.satisfactionRate }}</div>
          <div class="stat-label">Moyenne satisfaction</div>
        </div>
      </div>
    </div>

    <!-- Current Interns -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Stagiaires Actuels</h2>
        <button class="btn btn-primary" @click="showAllInterns">
          Voir tous les stagiaires
        </button>
      </div>
      
      <DataTable :items="currentInterns" :columns="internColumns" :loading="loading">
        <template #cell-student_name="{ item }">
          {{ item.student.prenom }} {{ item.student.name }}
        </template>
        
        <template #cell-period="{ item }">
          {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
        </template>
        
        <template #cell-next_evaluation="{ item }">
          {{ item.next_evaluation ? formatDate(item.next_evaluation) : 'Non planifiée' }}
        </template>
        
        <template #cell-status="{ item }">
          <StatusBadge :status="getInternshipStatus(item)" />
        </template>
        
        <template #cell-actions="{ item }">
          <button 
            class="btn btn-primary btn-sm"
            @click="evaluateStudent(item)"
            :disabled="!canEvaluate(item)"
          >
            Évaluer
          </button>
          <button 
            class="btn btn-outline btn-sm"
            @click="viewStudentProfile(item.student)"
          >
            Profil
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Upcoming Evaluations -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Évaluations à Venir</h2>
      </div>
      
      <div class="evaluations-grid">
        <div 
          v-for="evaluation in upcomingEvaluations"
          :key="evaluation.id"
          class="evaluation-card"
        >
          <div class="evaluation-header">
            <h4>{{ evaluation.student.prenom }} {{ evaluation.student.name }}</h4>
            <StatusBadge :status="evaluation.status" />
          </div>
          
          <div class="evaluation-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>Échéance: {{ formatDate(evaluation.due_date) }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-briefcase-medical"></i>
              <span>{{ evaluation.internship.service.name }}</span>
            </div>
          </div>
          
          <div class="evaluation-actions">
            <button 
              class="btn btn-primary btn-sm"
              @click="startEvaluation(evaluation)"
            >
              Commencer l'évaluation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Activité Récente</h2>
      </div>
      
      <div class="activity-timeline">
        <div 
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

export default {
  name: 'DoctorDashboard',
  components: {
    DataTable,
    StatusBadge
  },
  data() {
    return {
      internColumns: [
        { key: 'student_name', label: 'Étudiant' },
        { key: 'internship.service.name', label: 'Service' },
        { key: 'period', label: 'Période' },
        { key: 'next_evaluation', label: 'Prochaine évaluation' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      loading: false
    }
  },
  computed: {
    ...mapState('doctor', [
      'doctor', 
      'stats', 
      'currentInterns', 
      'upcomingEvaluations', 
      'recentActivities'
    ])
  },
  async created() {
    await this.loadDashboardData()
  },
  methods: {
    ...mapActions('doctor', ['fetchDoctorDashboard']),
    
    async loadDashboardData() {
      this.loading = true
      try {
        await this.fetchDoctorDashboard()
      } catch (error) {
        console.error('Error loading doctor dashboard:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger le tableau de bord.'
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
      this.$router.push({
        name: 'doctor-student-profile',
        params: { studentId: student.id }
      })
    },
    
    startEvaluation(evaluation) {
      this.$router.push({
        name: 'doctor-evaluation-form',
        params: { evaluationId: evaluation.id }
      })
    },
    
    showAllInterns() {
      this.$router.push({ name: 'doctor-interns' })
    },
    
    getActivityIcon(activityType) {
      const icons = {
        evaluation: 'fas fa-clipboard-check',
        meeting: 'fas fa-users',
        note: 'fas fa-sticky-note',
        message: 'fas fa-comment',
        update: 'fas fa-sync'
      }
      return icons[activityType] || 'fas fa-circle'
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    },
    
    formatTimeAgo(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInMinutes = Math.floor((now - time) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'À l\'instant'
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
      if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
      return `Il y a ${Math.floor(diffInMinutes / 1440)} j`
    }
  }
}
</script>

<style scoped>
.doctor-dashboard {
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

.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.evaluation-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.evaluation-header h4 {
  margin: 0;
  color: var(--text);
}

.evaluation-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: var(--text-light);
}

.detail-item i {
  width: 16px;
  color: var(--medical);
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  color: var(--text);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-light);
}
</style>