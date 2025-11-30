<template>
  <aside class="sidebar" :class="sidebarClasses">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobile && isOpen" 
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-stethoscope"></i>
          <span class="logo-text" v-if="!collapsed">StagesMédicaux</span>
          <span class="logo-badge" v-if="!collapsed">Hôpital</span>
        </div>
        
        <button 
          class="sidebar-toggle"
          @click="toggleSidebar"
          :title="collapsed ? 'Déplier' : 'Replier'"
        >
          <i :class="toggleIcon"></i>
        </button>
      </div>

      <!-- User Info -->
      <div class="sidebar-user" v-if="!collapsed && user">
        <div class="user-avatar">
          <i :class="userIcon"></i>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ roleLabel }}</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li 
            v-for="item in navItems" 
            :key="item.route"
            class="nav-item"
          >
            <router-link
              :to="{ name: item.route }"
              class="nav-link"
              :class="{ active: isActive(item.route) }"
              @click.native="handleNavClick"
            >
              <div class="nav-icon">
                <i :class="`fas fa-${item.icon}`"></i>
              </div>
              <span class="nav-text" v-if="!collapsed">{{ item.name }}</span>
              
              <!-- Badge for notifications -->
              <span 
                v-if="item.badge && !collapsed" 
                class="nav-badge"
                :class="`badge-${item.badgeType || 'default'}`"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Quick Actions -->
      <div class="sidebar-actions" v-if="!collapsed && quickActions.length > 0">
        <div class="actions-header">
          <span>Actions Rapides</span>
        </div>
        <div class="actions-list">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="action-btn"
            @click="handleQuickAction(action)"
            :title="action.title"
          >
            <i :class="action.icon"></i>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="footer-info" v-if="!collapsed">
          <div class="hospital-info">
            <strong>{{ hospitalName }}</strong>
            <small>Version {{ appVersion }}</small>
          </div>
        </div>
        
        <button 
          class="footer-toggle"
          @click="toggleCollapse"
          :title="collapsed ? 'Agrandir' : 'Réduire'"
        >
          <i :class="collapseIcon"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    role: {
      type: String,
      required: true
    },
    navItems: {
      type: Array,
      required: true,
      validator: (items) => items.every(item => 
        item.name && item.route && item.icon
      )
    },
    currentRoute: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: null
    },
    hospitalName: {
      type: String,
      default: 'CHU Boumerdès'
    },
    appVersion: {
      type: String,
      default: '1.0.0'
    }
  },
  data() {
    return {
      isOpen: true,
      collapsed: false,
      isMobile: false
    }
  },
  computed: {
    sidebarClasses() {
      return {
        'sidebar-collapsed': this.collapsed,
        'sidebar-mobile': this.isMobile,
        'sidebar-open': this.isOpen,
        'sidebar-closed': !this.isOpen
      }
    },
    
    toggleIcon() {
      return this.isOpen ? 'fas fa-times' : 'fas fa-bars'
    },
    
    collapseIcon() {
      return this.collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'
    },
    
    roleLabel() {
      const labels = {
        student: 'Étudiant',
        doctor: 'Docteur',
        'hospital-admin': 'Admin Hôpital',
        doyen: 'Doyen'
      }
      return labels[this.role] || this.role
    },
    
    userIcon() {
      const icons = {
        student: 'fa-user-graduate',
        doctor: 'fa-user-md',
        'hospital-admin': 'fa-user-tie',
        doyen: 'fa-user-shield'
      }
      return `fas ${icons[this.role] || 'fa-user'}`
    },
    
    quickActions() {
      const baseActions = [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'fas fa-bell',
          title: 'Voir les notifications',
          action: 'notifications'
        },
        {
          id: 'messages',
          label: 'Messages',
          icon: 'fas fa-envelope',
          title: 'Ouvrir la messagerie',
          action: 'messages'
        }
      ]
      
      // Role-specific quick actions
      const roleActions = {
        'hospital-admin': [
          {
            id: 'new-offer',
            label: 'Nouvelle offre',
            icon: 'fas fa-plus',
            title: 'Créer une nouvelle offre de stage',
            action: 'new-offer'
          },
          {
            id: 'reports',
            label: 'Rapports',
            icon: 'fas fa-chart-bar',
            title: 'Voir les rapports',
            action: 'reports'
          }
        ],
        doctor: [
          {
            id: 'new-evaluation',
            label: 'Évaluer',
            icon: 'fas fa-clipboard-check',
            title: 'Commencer une évaluation',
            action: 'new-evaluation'
          }
        ],
        student: [
          {
            id: 'new-application',
            label: 'Postuler',
            icon: 'fas fa-paper-plane',
            title: 'Postuler à une offre',
            action: 'new-application'
          }
        ]
      }
      
      return [...baseActions, ...(roleActions[this.role] || [])]
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      if (this.isMobile) {
        this.collapsed = false
        this.isOpen = false
      }
    },
    
    toggleSidebar() {
      if (this.isMobile) {
        this.isOpen = !this.isOpen
      } else {
        this.collapsed = !this.collapsed
      }
    },
    
    toggleCollapse() {
      if (!this.isMobile) {
        this.collapsed = !this.collapsed
      }
    },
    
    closeSidebar() {
      if (this.isMobile) {
        this.isOpen = false
      }
    },
    
    isActive(route) {
      return this.currentRoute === route || this.$route.name === route
    },
    
    handleNavClick() {
      if (this.isMobile) {
        this.closeSidebar()
      }
    },
    
    handleQuickAction(action) {
      this.$emit('quick-action', action)
      
      // Close sidebar on mobile after action
      if (this.isMobile) {
        this.closeSidebar()
      }
    },
    
    handleClickOutside(event) {
      const sidebar = this.$el
      const isClickInside = sidebar.contains(event.target)
      
      if (!isClickInside && this.isMobile && this.isOpen) {
        this.closeSidebar()
      }
    },
    
    // Public methods
    open() {
      this.isOpen = true
    },
    
    close() {
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--medical);
  color: white;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-logo i {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
}

.logo-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* User Info */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
  font-size: 16px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--text-light);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: var(--secondary);
  color: var(--medical);
}

.nav-link.active {
  background: var(--medical-light);
  color: white;
  border-left-color: var(--medical);
}

.nav-link.active .nav-icon {
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  transition: color 0.2s;
}

.nav-link:hover .nav-icon {
  color: var(--medical);
}

.nav-text {
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.badge-default {
  background: var(--info);
  color: white;
}

.badge-warning {
  background: var(--warning);
  color: black;
}

.badge-danger {
  background: var(--danger);
  color: white;
}

/* Quick Actions */
.sidebar-actions {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.actions-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--secondary);
  border: none;
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.action-btn:hover {
  background: var(--medical-light);
  color: white;
  transform: translateY(-1px);
}

.action-btn i {
  width: 16px;
  text-align: center;
}

/* Footer */
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid var(--border);
  background: var(--secondary);
}

.footer-info {
  flex: 1;
}

.hospital-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hospital-info strong {
  font-size: 12px;
  color: var(--text);
}

.hospital-info small {
  font-size: 10px;
  color: var(--text-light);
}

.footer-toggle {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.footer-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text);
}

/* Collapsed State */
.sidebar-collapsed .logo-text,
.sidebar-collapsed .logo-badge,
.sidebar-collapsed .user-info,
.sidebar-collapsed .nav-text,
.sidebar-collapsed .nav-badge,
.sidebar-collapsed .actions-header,
.sidebar-collapsed .action-btn span,
.sidebar-collapsed .footer-info {
  display: none;
}

.sidebar-collapsed .sidebar-user {
  justify-content: center;
  padding: 20px 8px;
}

.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: 12px 8px;
}

.sidebar-collapsed .action-btn {
  justify-content: center;
  padding: 10px 8px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar-mobile.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-collapsed {
    width: 280px;
  }
  
  .sidebar-collapsed .logo-text,
  .sidebar-collapsed .logo-badge,
  .sidebar-collapsed .user-info,
  .sidebar-collapsed .nav-text,
  .sidebar-collapsed .nav-badge,
  .sidebar-collapsed .actions-header,
  .sidebar-collapsed .action-btn span,
  .sidebar-collapsed .footer-info {
    display: block;
  }
  
  .sidebar-collapsed .sidebar-user {
    justify-content: flex-start;
    padding: 20px 16px;
  }
  
  .sidebar-collapsed .nav-link {
    justify-content: flex-start;
    padding: 12px 16px;
  }
  
  .sidebar-collapsed .action-btn {
    justify-content: flex-start;
    padding: 10px 12px;
  }
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: var(--secondary);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-light);
}
</style>
