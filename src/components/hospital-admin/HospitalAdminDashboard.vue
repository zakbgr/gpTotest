<template>
  <div class="hospital-admin-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de Bord Hôpital</h1>
      <p>Bienvenue, {{ hospital.name }} !</p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-briefcase-medical"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.publishedOffers }}</div>
          <div class="stat-label">Offres publiées</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.receivedApplications }}</div>
          <div class="stat-label">Candidatures reçues</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.currentInterns }}</div>
          <div class="stat-label">Stagiaires actuels</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.occupancyRate }}%</div>
          <div class="stat-label">Taux d'occupation</div>
        </div>
      </div>
    </div>

    <!-- Alerts and Required Actions -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Alertes et Actions Requises</h2>
      </div>
      
      <DataTable :items="alerts" :columns="alertColumns" :loading="loading">
        <template #cell-service="{ item }">
          {{ item.service.name }}
        </template>
        
        <template #cell-priority="{ item }">
          <span :class="`priority-${item.priority}`">
            {{ getPriorityLabel(item.priority) }}
          </span>
        </template>
        
        <template #cell-actions="{ item }">
          <button 
            class="btn btn-primary btn-sm"
            @click="handleAlertAction(item)"
          >
            {{ getActionLabel(item.type) }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Services Overview -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Aperçu des Services</h2>
        <button class="btn btn-outline" @click="viewAllServices">
          Voir tous les services
        </button>
      </div>
      
      <div class="services-grid">
        <div 
          v-for="service in servicesOverview"
          :key="service.id"
          class="service-card"
        >
          <div class="service-header">
            <h3>{{ service.name }}</h3>
            <StatusBadge :status="service.status" />
          </div>
          
          <div class="service-stats">
            <div class="stat">
              <div class="stat-value">{{ service.capacity }}</div>
              <div class="stat-label">Capacité</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ service.currentInterns }}</div>
              <div class="stat-label">Stagiaires</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ service.occupancyRate }}%</div>
              <div class="stat-label">Occupation</div>
            </div>
          </div>
          
          <div class="service-actions">
            <button 
              class="btn btn-outline btn-sm"
              @click="viewServiceDetails(service)"
            >
              Détails
            </button>
            <button 
              class="btn btn-outline btn-sm"
              @click="manageServiceQuotas(service)"
            >
              Quotas
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
  name: 'HospitalAdminDashboard',
  components: {
    DataTable,
    StatusBadge
  },
  data() {
    return {
      alertColumns: [
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'service', label: 'Service' },
        { key: 'date', label: 'Date' },
        { key: 'priority', label: 'Priorité' },
        { key: 'actions', label: 'Action' }
      ],
      loading: false
    }
  },
  computed: {
    ...mapState('hospitalAdmin', [
      'hospital', 
      'stats', 
      'alerts', 
      'servicesOverview', 
      'recentActivities'
    ])
  },
  async created() {
    await this.loadDashboardData()
  },
  methods: {
    ...mapActions('hospitalAdmin', ['fetchHospitalDashboard']),
    
    async loadDashboardData() {
      this.loading = true
      try {
        await this.fetchHospitalDashboard()
      } catch (error) {
        console.error('Error loading hospital dashboard:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger le tableau de bord.'
        })
      } finally {
        this.loading = false
      }
    },
    
    getPriorityLabel(priority) {
      const labels = {
        high: 'Haute',
        medium: 'Moyenne',
        low: 'Basse'
      }
      return labels[priority] || priority
    },
    
    getActionLabel(alertType) {
      const actions = {
        new_applications: 'Traiter',
        missing_evaluations: 'Rappeler',
        capacity_warning: 'Configurer',
        offer_approval: 'Valider'
      }
      return actions[alertType] || 'Traiter'
    },
    
    handleAlertAction(alert) {
      switch (alert.type) {
        case 'new_applications':
          this.$router.push({ name: 'hospital-applications' })
          break
        case 'missing_evaluations':
          this.sendEvaluationReminder(alert.service)
          break
        case 'capacity_warning':
          this.manageServiceQuotas(alert.service)
          break
        case 'offer_approval':
          this.$router.push({ name: 'hospital-offers' })
          break
        default:
          console.log('Alert action:', alert)
      }
    },
    
    viewAllServices() {
      this.$router.push({ name: 'hospital-services' })
    },
    
    viewServiceDetails(service) {
      this.$router.push({
        name: 'hospital-service-details',
        params: { serviceId: service.id }
      })
    },
    
    manageServiceQuotas(service) {
      this.$router.push({
        name: 'hospital-service-quotas',
        params: { serviceId: service.id }
      })
    },
    
    async sendEvaluationReminder(service) {
      try {
        // Implement reminder logic
        this.$notify({
          type: 'success',
          title: 'Rappel envoyé',
          message: `Rappel d'évaluation envoyé pour le service ${service.name}`
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'envoyer le rappel.'
        })
      }
    },
    
    getActivityIcon(activityType) {
      const icons = {
        application_received: 'fas fa-file-alt',
        offer_published: 'fas fa-briefcase-medical',
        evaluation_completed: 'fas fa-clipboard-check',
        intern_assigned: 'fas fa-user-graduate',
        system_update: 'fas fa-cog'
      }
      return icons[activityType] || 'fas fa-circle'
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
.hospital-admin-dashboard {
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

.priority-high {
  color: var(--danger);
  font-weight: 600;
}

.priority-medium {
  color: var(--warning);
  font-weight: 600;
}

.priority-low {
  color: var(--info);
  font-weight: 600;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-header h3 {
  margin: 0;
  color: var(--text);
}

.service-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.service-stats .stat {
  text-align: center;
  padding: 10px;
  background: var(--secondary);
  border-radius: 6px;
}

.service-stats .stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--medical);
  margin-bottom: 2px;
}

.service-stats .stat-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

.service-actions {
  display: flex;
  gap: 10px;
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