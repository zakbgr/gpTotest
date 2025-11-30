<template>
  <div id="app">
    <!-- Loading Spinner -->
    <LoadingSpinner v-if="globalLoading" global />

    <!-- Main Layout -->
    <div v-else class="app-layout">
      <!-- Header Component -->
      <Header 
        :user="currentUser"
        :role="currentRole"
        @logout="handleLogout"
        @toggle-notifications="toggleNotifications"
        @toggle-messaging="toggleMessaging"
      />

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Sidebar -->
        <Sidebar 
          v-if="isAuthenticated"
          :role="currentRole"
          :nav-items="navigationItems"
          :current-route="$route.name"
          @navigate="handleNavigation"
        />

        <!-- Page Content -->
        <main class="page-content" :class="{ 'with-sidebar': isAuthenticated }">
          <router-view />
        </main>
      </div>

      <!-- Notification Panel -->
      <NotificationPanel 
        v-if="showNotifications"
        :notifications="notifications"
        @close="toggleNotifications"
        @mark-all-read="markAllNotificationsRead"
        @notification-click="handleNotificationClick"
      />

      <!-- Messaging Panel -->
      <MessagingPanel 
        v-if="showMessaging"
        :conversations="conversations"
        :current-user="currentUser"
        @close="toggleMessaging"
        @send-message="sendMessage"
        @select-conversation="selectConversation"
      />

      <!-- Global Modals -->
      <Modal 
        v-if="globalModal.show"
        :show="globalModal.show"
        :title="globalModal.title"
        :size="globalModal.size"
        @close="closeGlobalModal"
      >
        <component 
          :is="globalModal.component" 
          v-bind="globalModal.props"
          @close="closeGlobalModal"
          @submit="handleModalSubmit"
        />
      </Modal>

      <!-- Toast Notifications -->
      <div class="toast-container">
        <Toast 
          v-for="toast in toasts"
          :key="toast.id"
          :type="toast.type"
          :title="toast.title"
          :message="toast.message"
          :duration="toast.duration"
          @close="removeToast(toast.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import Header from '@/components/shared/Header.vue'
import Sidebar from '@/components/shared/Sidebar.vue'
import NotificationPanel from '@/components/shared/NotificationPanel.vue'
import MessagingPanel from '@/components/shared/MessagingPanel.vue'
import Modal from '@/components/shared/Modal.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import Toast from '@/components/shared/Toast.vue'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar,
    NotificationPanel,
    MessagingPanel,
    Modal,
    LoadingSpinner,
    Toast
  },
  data() {
    return {
      showNotifications: false,
      showMessaging: false,
      globalModal: {
        show: false,
        title: '',
        component: null,
        props: {},
        size: 'medium'
      }
    }
  },
  computed: {
    ...mapState('auth', ['currentUser', 'currentRole', 'isAuthenticated']),
    ...mapState('notifications', ['notifications', 'unreadCount']),
    ...mapState('messaging', ['conversations', 'activeConversation']),
    ...mapState('app', ['globalLoading', 'toasts']),
    
    ...mapGetters('auth', ['hasPermission']),
    
    navigationItems() {
      if (!this.currentRole) return []
      
      const roleNavs = {
        student: [
          { name: 'Tableau de bord', route: 'student-dashboard', icon: 'tachometer-alt' },
          { name: 'Offres de stage', route: 'student-offers', icon: 'briefcase-medical' },
          { name: 'Mes candidatures', route: 'student-applications', icon: 'paper-plane' },
          { name: 'Mon planning', route: 'student-planning', icon: 'calendar-alt' },
          { name: 'Mes évaluations', route: 'student-evaluations', icon: 'clipboard-check' },
          { name: 'Mon profil', route: 'student-profile', icon: 'user-graduate' }
        ],
        doctor: [
          { name: 'Tableau de bord', route: 'doctor-dashboard', icon: 'tachometer-alt' },
          { name: 'Mes stagiaires', route: 'doctor-interns', icon: 'user-graduate' },
          { name: 'Évaluations', route: 'doctor-evaluations', icon: 'clipboard-check' },
          { name: 'Planning', route: 'doctor-planning', icon: 'calendar-alt' }
        ],
        'hospital-admin': [
          { name: 'Tableau de bord', route: 'hospital-admin-dashboard', icon: 'tachometer-alt' },
          { name: 'Services', route: 'hospital-services', icon: 'hospital-alt' },
          { name: 'Offres de stage', route: 'hospital-offers', icon: 'briefcase-medical' },
          { name: 'Candidatures', route: 'hospital-applications', icon: 'file-alt' },
          { name: 'Planning', route: 'hospital-planning', icon: 'calendar-alt' }
        ],
        doyen: [
          { name: 'Tableau de bord', route: 'doyen-dashboard', icon: 'tachometer-alt' },
          { name: 'Validation offres', route: 'doyen-validation', icon: 'check-circle' },
          { name: 'Utilisateurs', route: 'doyen-users', icon: 'users' },
          { name: 'Affectation', route: 'doyen-assignment', icon: 'cogs' },
          { name: 'Reporting', route: 'doyen-reporting', icon: 'chart-bar' }
        ]
      }
      
      return roleNavs[this.currentRole] || []
    }
  },
  async created() {
    // Initialize application
    await this.initializeApp()
    
    // Set up global error handler
    window.addEventListener('unhandledrejection', this.handleGlobalError)
    window.addEventListener('error', this.handleGlobalError)
  },
  beforeDestroy() {
    // Clean up event listeners
    window.removeEventListener('unhandledrejection', this.handleGlobalError)
    window.removeEventListener('error', this.handleGlobalError)
  },
  methods: {
    ...mapActions('auth', ['initializeAuth', 'logout']),
    ...mapActions('notifications', ['fetchNotifications', 'markAllAsRead']),
    ...mapActions('messaging', ['fetchConversations', 'sendMessage']),
    ...mapActions('app', ['setLoading', 'addToast', 'removeToast', 'showModal']),
    
    async initializeApp() {
      try {
        this.setLoading(true)
        
        // Initialize authentication
        await this.initializeAuth()
        
        // If authenticated, load additional data
        if (this.isAuthenticated) {
          await Promise.all([
            this.fetchNotifications(),
            this.fetchConversations()
          ])
        }
        
      } catch (error) {
        console.error('Error initializing app:', error)
        this.addToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger l\'application.'
        })
      } finally {
        this.setLoading(false)
      }
    },
    
    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/login')
        this.addToast({
          type: 'success',
          title: 'Déconnexion',
          message: 'Vous avez été déconnecté avec succès.'
        })
      } catch (error) {
        console.error('Logout error:', error)
        this.addToast({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la déconnexion.'
        })
      }
    },
    
    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      if (this.showNotifications) {
        this.showMessaging = false
      }
    },
    
    toggleMessaging() {
      this.showMessaging = !this.showMessaging
      if (this.showMessaging) {
        this.showNotifications = false
      }
    },
    
    async markAllNotificationsRead() {
      try {
        await this.markAllAsRead()
        this.addToast({
          type: 'success',
          title: 'Notifications',
          message: 'Toutes les notifications ont été marquées comme lues.'
        })
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    },
    
    handleNotificationClick(notification) {
      // Handle notification click based on type
      switch (notification.type) {
        case 'new_offer':
          this.$router.push({ name: 'student-offers' })
          break
        case 'application_update':
          this.$router.push({ name: 'student-applications' })
          break
        case 'evaluation_ready':
          this.$router.push({ name: 'student-evaluations' })
          break
        default:
          console.log('Notification clicked:', notification)
      }
      this.toggleNotifications()
    },
    
    async sendMessage(messageData) {
      try {
        await this.sendMessage(messageData)
        this.addToast({
          type: 'success',
          title: 'Message envoyé',
          message: 'Votre message a été envoyé avec succès.'
        })
      } catch (error) {
        this.addToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'envoyer le message.'
        })
      }
    },
    
    selectConversation(conversation) {
      // Implementation for selecting conversation
      console.log('Selected conversation:', conversation)
    },
    
    handleNavigation(route) {
      this.$router.push({ name: route })
    },
    
    openGlobalModal(component, props = {}, title = '', size = 'medium') {
      this.globalModal = {
        show: true,
        title,
        component,
        props,
        size
      }
    },
    
    closeGlobalModal() {
      this.globalModal = {
        show: false,
        title: '',
        component: null,
        props: {},
        size: 'medium'
      }
    },
    
    handleModalSubmit(data) {
      // Handle modal form submissions
      console.log('Modal submitted:', data)
      this.closeGlobalModal()
    },
    
    handleGlobalError(event) {
      console.error('Global error:', event)
      
      // Don't show toast for network errors or aborted requests
      if (event.reason && event.reason.name === 'CanceledError') return
      
      this.addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur inattendue est survenue.',
        duration: 5000
      })
    }
  },
  watch: {
    // Watch for route changes to close panels
    $route() {
      this.showNotifications = false
      this.showMessaging = false
    },
    
    // Watch for authentication changes
    isAuthenticated: {
      immediate: true,
      handler(isAuthenticated) {
        if (isAuthenticated) {
          // Load user-specific data
          this.fetchNotifications()
          this.fetchConversations()
        } else {
          // Clear user-specific data
          this.showNotifications = false
          this.showMessaging = false
        }
      }
    }
  }
}
</script>

<style>
/* Global Styles */
:root {
  --primary: #2c5aa0;
  --primary-dark: #1e3d72;
  --secondary: #f8f9fa;
  --accent: #ff6b00;
  --medical: #2a7a5c;
  --medical-light: #3a9a7c;
  --medical-dark: #1e5e46;
  --text: #333;
  --text-light: #666;
  --border: #e0e0e0;
  --success: #28a745;
  --danger: #dc3545;
  --warning: #ffc107;
  --info: #17a2b8;
  --background: #f5f7fa;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background);
  color: var(--text);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.page-content.with-sidebar {
  margin-left: 0;
}

/* Toast Container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .page-content.with-sidebar {
    margin-left: 0;
    margin-top: 0;
  }
  
  .page-content {
    padding: 15px;
  }
  
  .toast-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }
.p-5 { padding: 3rem; }

.d-flex { display: flex; }
.d-grid { display: grid; }
.d-none { display: none; }

.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .page-content {
    padding: 0;
  }
  
  body {
    background: white;
  }
}
</style>