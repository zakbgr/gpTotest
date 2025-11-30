<template>
  <header class="app-header">
    <div class="container">
      <div class="header-top">
        <div class="logo">
          <i class="fas fa-stethoscope"></i>
          <span>StagesMédicaux</span>
        </div>
        <div class="user-info">
          <div class="user-role">{{ currentRoleName }}</div>
          <div style="position: relative;">
            <button class="btn btn-outline" @click="toggleNotifications">
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
            </button>
          </div>
          <button class="btn btn-outline" @click="toggleMessaging">
            <i class="fas fa-envelope"></i>
          </button>
          <div class="auth-buttons">
            <button class="btn btn-medical" @click="logout">Déconnexion</button>
          </div>
        </div>
      </div>
    </div>
    <nav class="main-nav" v-if="showNavigation">
      <div class="container">
        <ul class="nav-links">
          <li v-for="navItem in navigation" :key="navItem.name">
            <a 
              href="#" 
              :class="{ active: activeSection === navItem.section }"
              @click.prevent="navigateTo(navItem.section)"
            >
              {{ navItem.name }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store'

export default {
  name: 'AppHeader',
  props: {
    navigation: {
      type: Array,
      default: () => []
    },
    activeSection: {
      type: String,
      default: 'dashboard'
    },
    showNavigation: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle-notifications', 'toggle-messaging', 'section-change'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const unreadNotifications = ref(0)
    
    // Récupérer les notifications non lues
    const fetchUnreadNotifications = async () => {
      try {
        // Simulation d'appel API - à remplacer par votre endpoint réel
        const response = await fetch('/api/notifications/unread-count/')
        if (response.ok) {
          const data = await response.json()
          unreadNotifications.value = data.count
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
      }
    }
    
    const currentRoleName = computed(() => {
      const roles = {
        'student': 'Étudiant',
        'doctor': 'Docteur',
        'hospital_admin': 'Admin Hôpital',
        'doyen': 'Doyen'
      }
      return roles[authStore.role] || 'Utilisateur'
    })
    
    const toggleNotifications = () => {
      emit('toggle-notifications')
    }
    
    const toggleMessaging = () => {
      emit('toggle-messaging')
    }
    
    const navigateTo = (section) => {
      emit('section-change', section)
    }
    
    const logout = () => {
      authStore.logout()
      router.push('/')
    }
    
    onMounted(() => {
      fetchUnreadNotifications()
    })
    
    return {
      unreadNotifications,
      currentRoleName,
      toggleNotifications,
      toggleMessaging,
      navigateTo,
      logout
    }
  }
}
</script>

<style scoped>
.app-header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
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

.user-role {
  background: #2a7a5c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 14px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #2c5aa0;
  color: #2c5aa0;
}

.btn-medical {
  background: #2a7a5c;
  color: white;
}

.btn-medical:hover {
  background: #1e5e46;
}

.main-nav {
  background-color: #2a7a5c;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  display: block;
  padding: 12px 20px;
  color: white;
  font-weight: 500;
  transition: background 0.3s;
  cursor: pointer;
  text-decoration: none;
}

.nav-links li a:hover,
.nav-links li a.active {
  background-color: #1e5e46;
}

.notification-badge {
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  position: absolute;
  top: -5px;
  right: -5px;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-links {
    flex-wrap: wrap;
  }
  
  .nav-links li a {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>