<template>
  <div class="notification-panel" v-if="show">
    <div class="panel-header">
      <h3>Notifications</h3>
      <div class="panel-actions">
        <button class="btn btn-link" @click="markAllAsRead" v-if="unreadCount > 0">
          Tout marquer comme lu
        </button>
        <button class="btn btn-link" @click="clearAll">
          Tout effacer
        </button>
        <button class="modal-close" @click="$emit('close')">
          &times;
        </button>
      </div>
    </div>

    <div class="panel-content">
      <div class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <div class="notification-meta">
              <span class="notification-time">
                {{ formatTime(notification.created_at) }}
              </span>
              <span class="notification-type">
                {{ getNotificationTypeLabel(notification.type) }}
              </span>
            </div>
          </div>
          <div class="notification-actions">
            <button
              v-if="!notification.read"
              class="btn btn-sm btn-link"
              @click.stop="markAsRead(notification.id)"
            >
              <i class="fas fa-check"></i>
            </button>
            <button
              class="btn btn-sm btn-link text-danger"
              @click.stop="deleteNotification(notification.id)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty-state">
          <i class="fas fa-bell-slash"></i>
          <p>Aucune notification</p>
        </div>
      </div>
    </div>

    <div class="panel-footer" v-if="notifications.length > 0">
      <button class="btn btn-outline btn-sm" @click="loadMore" :disabled="loading">
        <i class="fas fa-refresh" :class="{ 'fa-spin': loading }"></i>
        Charger plus
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { notificationService } from '../services/notifications'

export default {
  name: 'NotificationPanel',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'notification-click'],
  setup(props, { emit }) {
    const notifications = ref([])
    const loading = ref(false)
    const page = ref(1)
    const hasMore = ref(true)

    const unreadCount = computed(() => 
      notifications.value.filter(n => !n.read).length
    )

    // Types de notifications
    const notificationTypes = {
      application_update: {
        icon: 'fas fa-file-alt',
        label: 'Candidature'
      },
      evaluation: {
        icon: 'fas fa-chart-line',
        label: 'Évaluation'
      },
      internship: {
        icon: 'fas fa-briefcase-medical',
        label: 'Stage'
      },
      message: {
        icon: 'fas fa-envelope',
        label: 'Message'
      },
      system: {
        icon: 'fas fa-cog',
        label: 'Système'
      },
      reminder: {
        icon: 'fas fa-clock',
        label: 'Rappel'
      }
    }

    // Charger les notifications
    const loadNotifications = async (reset = false) => {
      if (loading.value) return

      loading.value = true
      try {
        if (reset) {
          page.value = 1
          notifications.value = []
        }

        const response = await notificationService.getNotifications({
          page: page.value,
          page_size: 20
        })

        if (response.data.results) {
          if (reset) {
            notifications.value = response.data.results
          } else {
            notifications.value.push(...response.data.results)
          }
          
          hasMore.value = !!response.data.next
          page.value++
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
      } finally {
        loading.value = false
      }
    }

    // Marquer comme lu
    const markAsRead = async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId)
        
        // Mettre à jour localement
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
        }
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
      }
    }

    const markAllAsRead = async () => {
      try {
        await notificationService.markAllAsRead()
        
        // Mettre à jour localement
        notifications.value.forEach(notification => {
          notification.read = true
        })
      } catch (error) {
        console.error('Erreur lors du marquage de tout comme lu:', error)
      }
    }

    // Supprimer une notification
    const deleteNotification = async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId)
        notifications.value = notifications.value.filter(n => n.id !== notificationId)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }

    const clearAll = async () => {
      try {
        await notificationService.clearAll()
        notifications.value = []
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error)
      }
    }

    // Gérer le clic sur une notification
    const handleNotificationClick = (notification) => {
      if (!notification.read) {
        markAsRead(notification.id)
      }
      
      emit('notification-click', notification)
      
      // Navigation basée sur le type de notification
      switch (notification.type) {
        case 'application_update':
          // Naviguer vers les candidatures
          break
        case 'evaluation':
          // Naviguer vers les évaluations
          break
        case 'internship':
          // Naviguer vers les stages
          break
      }
    }

    // Utilitaires
    const getNotificationIcon = (type) => {
      return notificationTypes[type]?.icon || 'fas fa-bell'
    }

    const getNotificationTypeLabel = (type) => {
      return notificationTypes[type]?.label || 'Notification'
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const notificationDate = new Date(timestamp)
      const diffMs = now - notificationDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'À l\'instant'
      if (diffMins < 60) return `Il y a ${diffMins} min`
      if (diffHours < 24) return `Il y a ${diffHours} h`
      if (diffDays < 7) return `Il y a ${diffDays} j`
      
      return notificationDate.toLocaleDateString('fr-FR')
    }

    const loadMore = () => {
      if (hasMore.value && !loading.value) {
        loadNotifications(false)
      }
    }

    // Recharger quand le panel s'ouvre
    watch(() => props.show, (newVal) => {
      if (newVal) {
        loadNotifications(true)
      }
    })

    onMounted(() => {
      if (props.show) {
        loadNotifications(true)
      }
    })

    return {
      notifications,
      loading,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      handleNotificationClick,
      getNotificationIcon,
      getNotificationTypeLabel,
      formatTime,
      loadMore
    }
  }
}
</script>

<style scoped>
.notification-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #2a7a5c;
  font-size: 1.1rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: #2a7a5c;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px 8px;
}

.btn-link:hover {
  text-decoration: underline;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background: #f5f5f5;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f7ff;
  border-left: 3px solid #2a7a5c;
}

.notification-item.unread:hover {
  background: #e8f2ff;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a7a5c;
  flex-shrink: 0;
}

.notification-item.unread .notification-icon {
  background: #2a7a5c;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.notification-message {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 6px;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.notification-actions .btn-sm {
  padding: 2px 6px;
  font-size: 0.7rem;
}

.text-danger {
  color: #dc3545;
}

.text-danger:hover {
  color: #c82333;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.panel-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
  text-align: center;
}

/* Scrollbar personnalisée */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .notification-panel {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .panel-header {
    padding: 15px;
  }
  
  .notification-item {
    padding: 12px 15px;
  }
  
  .notification-actions {
    opacity: 1;
  }
}
</style>