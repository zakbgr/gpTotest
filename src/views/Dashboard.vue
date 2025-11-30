<template>
  <div class="dashboard-layout">
    <AppHeader 
      :navigation="navigation"
      :active-section="activeSection"
      :show-navigation="true"
      @toggle-notifications="toggleNotifications"
      @toggle-messaging="toggleMessaging"
      @section-change="changeSection"
    />

    <!-- Panels overlay -->
    <div 
      v-if="showNotifications || showMessaging" 
      class="panel-overlay"
      @click="closePanels"
    ></div>

    <!-- Notification Panel -->
    <NotificationPanel
      v-if="showNotifications"
      :show="showNotifications"
      @close="showNotifications = false"
      @notification-click="handleNotificationClick"
    />

    <!-- Messaging Panel -->
    <MessagingPanel
      v-if="showMessaging"
      :show="showMessaging"
      @close="showMessaging = false"
    />

    <main class="dashboard-main">
      <div class="container">
        <!-- Composant dynamique basé sur la section active -->
        <component 
          :is="activeComponent" 
          :key="activeSection"
        />
      </div>
    </main>

    <!-- Loading global -->
    <div v-if="globalLoading" class="global-loading">
      <LoadingSpinner size="large" text="Chargement..." />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

// Composants shared
import AppHeader from '../components/shared/Header.vue'
import NotificationPanel from '../components/shared/NotificationPanel.vue'
import MessagingPanel from '../components/shared/MessagingPanel.vue'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'

// Composants par rôle
// Étudiant
import StudentDashboard from '../components/student/StudentDashboard.vue'
import StudentOffers from '../components/student/StudentOffers.vue'
import StudentApplications from '../components/student/StudentApplications.vue'
import StudentPlanning from '../components/student/StudentPlanning.vue'
import StudentEvaluations from '../components/student/StudentEvaluations.vue'
import StudentProfile from '../components/student/StudentProfile.vue'

// Docteur
import DoctorDashboard from '../components/doctor/DoctorDashboard.vue'
import DoctorInterns from '../components/doctor/DoctorInterns.vue'
import DoctorEvaluations from '../components/doctor/DoctorEvaluations.vue'
import DoctorPlanning from '../components/doctor/DoctorPlanning.vue'

// Admin Hôpital
import HospitalAdminDashboard from '../components/hospital-admin/HospitalAdminDashboard.vue'
import HospitalServices from '../components/hospital-admin/HospitalServices.vue'
import HospitalOffers from '../components/hospital-admin/HospitalOffers.vue'
import HospitalApplications from '../components/hospital-admin/HospitalApplications.vue'
import HospitalPlanning from '../components/hospital-admin/HospitalPlanning.vue'

// Doyen
import DoyenDashboard from '../components/doyen/DoyenDashboard.vue'
import DoyenValidation from '../components/doyen/DoyenValidation.vue'
import DoyenUsers from '../components/doyen/DoyenUsers.vue'
import DoyenAssignment from '../components/doyen/DoyenAssignment.vue'
import DoyenReporting from '../components/doyen/DoyenReporting.vue'

export default {
  name: 'Dashboard',
  components: {
    AppHeader,
    NotificationPanel,
    MessagingPanel,
    LoadingSpinner,
    // Composants étudiants
    StudentDashboard,
    StudentOffers,
    StudentApplications,
    StudentPlanning,
    StudentEvaluations,
    StudentProfile,
    // Composants docteurs
    DoctorDashboard,
    DoctorInterns,
    DoctorEvaluations,
    DoctorPlanning,
    // Composants admin hôpital
    HospitalAdminDashboard,
    HospitalServices,
    HospitalOffers,
    HospitalApplications,
    HospitalPlanning,
    // Composants doyen
    DoyenDashboard,
    DoyenValidation,
    DoyenUsers,
    DoyenAssignment,
    DoyenReporting
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // États de l'interface
    const activeSection = ref('dashboard')
    const showNotifications = ref(false)
    const showMessaging = ref(false)
    const globalLoading = ref(false)

    // Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      router.push('/')
    }

    // Navigation par rôle
    const navigationConfig = {
      student: [
        { name: 'Tableau de bord', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'Offres de stage', section: 'offers', icon: 'fas fa-briefcase-medical' },
        { name: 'Mes candidatures', section: 'applications', icon: 'fas fa-paper-plane' },
        { name: 'Mon planning', section: 'planning', icon: 'fas fa-calendar-alt' },
        { name: 'Mes évaluations', section: 'evaluations', icon: 'fas fa-chart-line' },
        { name: 'Mon profil', section: 'profile', icon: 'fas fa-user' }
      ],
      doctor: [
        { name: 'Tableau de bord', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'Mes stagiaires', section: 'interns', icon: 'fas fa-users' },
        { name: 'Évaluations', section: 'evaluations', icon: 'fas fa-clipboard-check' },
        { name: 'Planning', section: 'planning', icon: 'fas fa-calendar-alt' }
      ],
      hospital_admin: [
        { name: 'Tableau de bord', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'Services', section: 'services', icon: 'fas fa-hospital' },
        { name: 'Offres de stage', section: 'offers', icon: 'fas fa-briefcase-medical' },
        { name: 'Candidatures', section: 'applications', icon: 'fas fa-tasks' },
        { name: 'Planning', section: 'planning', icon: 'fas fa-calendar-alt' }
      ],
      doyen: [
        { name: 'Tableau de bord', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'Validation offres', section: 'validation', icon: 'fas fa-check-circle' },
        { name: 'Utilisateurs', section: 'users', icon: 'fas fa-users' },
        { name: 'Affectation', section: 'assignment', icon: 'fas fa-cogs' },
        { name: 'Reporting', section: 'reporting', icon: 'fas fa-chart-bar' }
      ]
    }

    // Navigation actuelle
    const navigation = computed(() => 
      navigationConfig[authStore.role] || navigationConfig.student
    )

    // Composant actuel basé sur le rôle et la section
    const activeComponent = computed(() => {
      const roleComponents = {
        student: {
          dashboard: 'StudentDashboard',
          offers: 'StudentOffers',
          applications: 'StudentApplications',
          planning: 'StudentPlanning',
          evaluations: 'StudentEvaluations',
          profile: 'StudentProfile'
        },
        doctor: {
          dashboard: 'DoctorDashboard',
          interns: 'DoctorInterns',
          evaluations: 'DoctorEvaluations',
          planning: 'DoctorPlanning'
        },
        hospital_admin: {
          dashboard: 'HospitalAdminDashboard',
          services: 'HospitalServices',
          offers: 'HospitalOffers',
          applications: 'HospitalApplications',
          planning: 'HospitalPlanning'
        },
        doyen: {
          dashboard: 'DoyenDashboard',
          validation: 'DoyenValidation',
          users: 'DoyenUsers',
          assignment: 'DoyenAssignment',
          reporting: 'DoyenReporting'
        }
      }

      const roleMap = roleComponents[authStore.role] || roleComponents.student
      return roleMap[activeSection.value] || 'StudentDashboard'
    })

    // Méthodes
    const changeSection = (section) => {
      activeSection.value = section
      // Fermer les panels quand on change de section
      closePanels()
    }

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      if (showNotifications.value) {
        showMessaging.value = false
      }
    }

    const toggleMessaging = () => {
      showMessaging.value = !showMessaging.value
      if (showMessaging.value) {
        showNotifications.value = false
      }
    }

    const closePanels = () => {
      showNotifications.value = false
      showMessaging.value = false
    }

    const handleNotificationClick = (notification) => {
      // Navigation basée sur le type de notification
      switch (notification.type) {
        case 'application_update':
          activeSection.value = 'applications'
          break
        case 'evaluation':
          activeSection.value = 'evaluations'
          break
        case 'internship':
          activeSection.value = authStore.role === 'student' ? 'offers' : 'interns'
          break
        case 'message':
          showMessaging.value = true
          break
      }
      
      showNotifications.value = false
    }

    // Charger les données initiales
    const loadInitialData = async () => {
      globalLoading.value = true
      try {
        // Charger les données spécifiques au rôle
        // Cette fonction peut être étendue pour charger des données globales
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        globalLoading.value = false
      }
    }

    // Écouter les changements de rôle
    watch(() => authStore.role, (newRole) => {
      // Réinitialiser la section active quand le rôle change
      activeSection.value = 'dashboard'
    })

    onMounted(() => {
      loadInitialData()
    })

    return {
      // États
      activeSection,
      showNotifications,
      showMessaging,
      globalLoading,
      
      // Computed
      navigation,
      activeComponent,
      
      // Méthodes
      changeSection,
      toggleNotifications,
      toggleMessaging,
      closePanels,
      handleNotificationClick
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
}

.dashboard-main {
  padding: 30px 0;
  min-height: calc(100vh - 80px);
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Animations de transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 20px 0;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 15px 0;
  }
}
</style>