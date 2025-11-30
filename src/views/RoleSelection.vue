<template>
  <div class="role-selection-page">
    <header class="app-header">
      <div class="container">
        <div class="header-top">
          <div class="logo">
            <i class="fas fa-stethoscope"></i>
            <span>StagesMédicaux</span>
          </div>
          <div class="user-info">
            <div class="user-name">Bienvenue, {{ user?.first_name }} {{ user?.last_name }}</div>
            <button class="btn btn-medical" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="role-selection">
          <div class="selection-header">
            <h1>Plateforme de Gestion des Stages Médicaux</h1>
            <p>Wilaya de Boumerdès - Sélectionnez votre rôle</p>
            <div class="user-badge">
              <i class="fas fa-user"></i>
              {{ user?.email }}
            </div>
          </div>

          <div class="role-cards">
            <!-- Étudiant -->
            <div 
              class="role-card"
              :class="{ active: selectedRole === 'student' }"
              @click="selectRole('student')"
            >
              <div class="role-icon">
                <i class="fas fa-user-graduate"></i>
              </div>
              <h3>Étudiant</h3>
              <p>Recherche et gestion des stages, candidatures, suivi des évaluations</p>
              <div class="role-features">
                <span class="feature-item">
                  <i class="fas fa-search"></i>
                  Recherche d'offres
                </span>
                <span class="feature-item">
                  <i class="fas fa-paper-plane"></i>
                  Candidatures
                </span>
                <span class="feature-item">
                  <i class="fas fa-chart-line"></i>
                  Suivi évaluations
                </span>
              </div>
            </div>

            <!-- Docteur Encadrant -->
            <div 
              class="role-card"
              :class="{ active: selectedRole === 'doctor' }"
              @click="selectRole('doctor')"
              v-if="userRoles.includes('doctor')"
            >
              <div class="role-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <h3>Docteur Encadrant</h3>
              <p>Gestion des stagiaires, évaluations, planning des activités</p>
              <div class="role-features">
                <span class="feature-item">
                  <i class="fas fa-users"></i>
                  Gestion stagiaires
                </span>
                <span class="feature-item">
                  <i class="fas fa-clipboard-check"></i>
                  Évaluations
                </span>
                <span class="feature-item">
                  <i class="fas fa-calendar-alt"></i>
                  Planning activités
                </span>
              </div>
            </div>

            <!-- Administrateur Hôpital -->
            <div 
              class="role-card"
              :class="{ active: selectedRole === 'hospital_admin' }"
              @click="selectRole('hospital_admin')"
              v-if="userRoles.includes('hospital_admin')"
            >
              <div class="role-icon">
                <i class="fas fa-hospital-alt"></i>
              </div>
              <h3>Admin Hôpital</h3>
              <p>Publication d'offres, gestion des candidatures, supervision des services</p>
              <div class="role-features">
                <span class="feature-item">
                  <i class="fas fa-briefcase-medical"></i>
                  Offres de stage
                </span>
                <span class="feature-item">
                  <i class="fas fa-tasks"></i>
                  Gestion candidatures
                </span>
                <span class="feature-item">
                  <i class="fas fa-chart-pie"></i>
                  Supervision services
                </span>
              </div>
            </div>

            <!-- Doyen -->
            <div 
              class="role-card"
              :class="{ active: selectedRole === 'doyen' }"
              @click="selectRole('doyen')"
              v-if="userRoles.includes('doyen')"
            >
              <div class="role-icon">
                <i class="fas fa-university"></i>
              </div>
              <h3>Doyen</h3>
              <p>Supervision générale, validation, reporting et statistiques</p>
              <div class="role-features">
                <span class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  Validation offres
                </span>
                <span class="feature-item">
                  <i class="fas fa-chart-bar"></i>
                  Reporting
                </span>
                <span class="feature-item">
                  <i class="fas fa-cogs"></i>
                  Affectation automatique
                </span>
              </div>
            </div>
          </div>

          <div class="selection-actions" v-if="selectedRole">
            <button class="btn btn-medical btn-lg" @click="enterDashboard">
              <i class="fas fa-arrow-right"></i>
              Accéder au tableau de bord {{ selectedRoleLabel }}
            </button>
          </div>

          <div class="quick-stats" v-if="userStats">
            <div class="stat-card">
              <i class="fas fa-briefcase-medical"></i>
              <div class="number">{{ userStats.available_internships || 0 }}</div>
              <div class="label">Offres disponibles</div>
            </div>
            <div class="stat-card">
              <i class="fas fa-paper-plane"></i>
              <div class="number">{{ userStats.pending_applications || 0 }}</div>
              <div class="label">Candidatures en attente</div>
            </div>
            <div class="stat-card">
              <i class="fas fa-calendar-check"></i>
              <div class="number">{{ userStats.current_internships || 0 }}</div>
              <div class="label">Stages en cours</div>
            </div>
            <div class="stat-card">
              <i class="fas fa-bell"></i>
              <div class="number">{{ userStats.unread_notifications || 0 }}</div>
              <div class="label">Notifications</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { studentService } from '../services/students'
import { notificationService } from '../services/notifications'

export default {
  name: 'RoleSelection',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const selectedRole = ref('')
    const userStats = ref(null)
    const loading = ref(false)

    // Récupérer l'utilisateur connecté
    const user = computed(() => authStore.user)
    
    // Déterminer les rôles disponibles pour l'utilisateur
    const userRoles = computed(() => {
      const roles = ['student'] // Par défaut, tous les utilisateurs peuvent être étudiants
      
      // Ajouter les rôles supplémentaires basés sur les permissions de l'utilisateur
      if (user.value?.is_doctor) roles.push('doctor')
      if (user.value?.is_hospital_admin) roles.push('hospital_admin')
      if (user.value?.is_doyen) roles.push('doyen')
      
      return roles
    })

    // Labels des rôles
    const roleLabels = {
      student: 'Étudiant',
      doctor: 'Docteur',
      hospital_admin: 'Administrateur Hôpital',
      doyen: 'Doyen'
    }

    const selectedRoleLabel = computed(() => 
      selectedRole.value ? roleLabels[selectedRole.value] : ''
    )

    // Sélectionner un rôle
    const selectRole = (role) => {
      selectedRole.value = role
    }

    // Accéder au tableau de bord
    const enterDashboard = () => {
      if (selectedRole.value) {
        // Mettre à jour le rôle dans le store
        authStore.role = selectedRole.value
        
        // Rediriger vers le dashboard
        router.push('/dashboard')
      }
    }

    // Déconnexion
    const logout = () => {
      authStore.logout()
      router.push('/')
    }

    // Charger les statistiques utilisateur
    const loadUserStats = async () => {
      if (!user.value) return
      
      loading.value = true
      try {
        // Charger les statistiques en fonction du rôle principal de l'utilisateur
        const [internshipsResponse, applicationsResponse, notificationsResponse] = await Promise.all([
          studentService.getStudentInternships(user.value.id),
          studentService.getStudentApplications(user.value.id),
          notificationService.getUnreadCount()
        ])

        userStats.value = {
          available_internships: internshipsResponse.data?.length || 0,
          pending_applications: applicationsResponse.data?.filter(app => app.status === 'pending').length || 0,
          current_internships: internshipsResponse.data?.filter(internship => 
            internship.status === 'in_progress'
          ).length || 0,
          unread_notifications: notificationsResponse.data?.count || 0
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        loading.value = false
      }
    }

    // Sélectionner automatiquement le rôle principal si un seul disponible
    onMounted(() => {
      if (userRoles.value.length === 1) {
        selectedRole.value = userRoles.value[0]
      }
      
      loadUserStats()
    })

    return {
      selectedRole,
      userStats,
      user,
      userRoles,
      selectedRoleLabel,
      selectRole,
      enterDashboard,
      logout
    }
  }
}
</script>

<style scoped>
.role-selection-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #2a7a5c;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.main-content {
  padding: 40px 0;
}

.role-selection {
  text-align: center;
}

.selection-header {
  margin-bottom: 40px;
}

.selection-header h1 {
  color: #2a7a5c;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.selection-header p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e8f5e8;
  color: #2a7a5c;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.role-card {
  background: white;
  border-radius: 12px;
  padding: 30px 25px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #2a7a5c;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.role-card:hover::before {
  transform: scaleX(1);
}

.role-card.active {
  border-color: #2a7a5c;
  background: #f8fffc;
}

.role-card.active::before {
  transform: scaleX(1);
}

.role-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2a7a5c, #3a9a7c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  color: white;
}

.role-card h3 {
  color: #2a7a5c;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.role-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.role-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 0.9rem;
}

.feature-item i {
  color: #2a7a5c;
  width: 16px;
}

.selection-actions {
  margin-bottom: 40px;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 25px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card i {
  font-size: 2.5rem;
  color: #2a7a5c;
  margin-bottom: 15px;
}

.stat-card .number {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2a7a5c;
  margin-bottom: 5px;
}

.stat-card .label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .selection-header h1 {
    font-size: 2rem;
  }
  
  .role-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .role-card {
    padding: 25px 20px;
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-top {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .selection-header h1 {
    font-size: 1.75rem;
  }
}
</style>