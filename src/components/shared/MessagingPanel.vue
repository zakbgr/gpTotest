<template>
  <div class="messaging-panel" v-if="show">
    <div class="panel-header">
      <h3>Messagerie</h3>
      <div class="panel-actions">
        <button class="btn btn-link" @click="startNewConversation">
          <i class="fas fa-plus"></i>
          Nouveau
        </button>
        <button class="modal-close" @click="$emit('close')">
          &times;
        </button>
      </div>
    </div>

    <div class="messaging-container">
      <!-- Liste des conversations -->
      <div class="conversations-sidebar">
        <div class="conversations-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une conversation..."
            class="search-input"
          />
        </div>

        <div class="conversations-list">
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: activeConversation?.id === conversation.id }"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-avatar">
              <i :class="getConversationIcon(conversation.type)"></i>
            </div>
            <div class="conversation-info">
              <div class="conversation-title">
                {{ getConversationTitle(conversation) }}
              </div>
              <div class="conversation-preview">
                {{ getLastMessagePreview(conversation) }}
              </div>
            </div>
            <div class="conversation-meta">
              <div class="conversation-time">
                {{ formatTime(conversation.last_message?.created_at) }}
              </div>
              <div
                v-if="conversation.unread_count > 0"
                class="unread-badge"
              >
                {{ conversation.unread_count }}
              </div>
            </div>
          </div>

          <div v-if="filteredConversations.length === 0" class="empty-conversations">
            <i class="fas fa-comments"></i>
            <p>Aucune conversation</p>
          </div>
        </div>
      </div>

      <!-- Zone de chat -->
      <div class="chat-area" v-if="activeConversation">
        <div class="chat-header">
          <div class="chat-info">
            <div class="chat-title">
              {{ getConversationTitle(activeConversation) }}
            </div>
            <div class="chat-subtitle">
              {{ getConversationSubtitle(activeConversation) }}
            </div>
          </div>
          <div class="chat-actions">
            <button class="btn btn-link" @click="showConversationDetails">
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="loadingMessages" class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            Chargement des messages...
          </div>

          <div
            v-for="message in activeConversation.messages"
            :key="message.id"
            class="message"
            :class="{
              sent: message.is_sent,
              received: !message.is_sent
            }"
          >
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">
                {{ formatMessageTime(message.created_at) }}
              </div>
            </div>
            <div
              v-if="!message.is_sent"
              class="message-status"
            >
              <i
                v-if="message.read"
                class="fas fa-check-double text-success"
                title="Message lu"
              ></i>
              <i
                v-else-if="message.delivered"
                class="fas fa-check-double"
                title="Message délivré"
              ></i>
              <i
                v-else
                class="fas fa-check"
                title="Message envoyé"
              ></i>
            </div>
          </div>

          <div v-if="activeConversation.messages.length === 0" class="no-messages">
            <i class="fas fa-comment-slash"></i>
            <p>Aucun message dans cette conversation</p>
            <p class="subtitle">Soyez le premier à envoyer un message !</p>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-container">
            <textarea
              v-model="newMessage"
              placeholder="Tapez votre message..."
              class="message-input"
              @keydown.enter.prevent="sendMessage"
              rows="1"
            ></textarea>
            <button
              class="btn btn-medical send-button"
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Aucune conversation sélectionnée -->
      <div v-else class="no-conversation-selected">
        <div class="empty-chat">
          <i class="fas fa-comments"></i>
          <h4>Sélectionnez une conversation</h4>
          <p>Choisissez une conversation existante ou démarrez-en une nouvelle</p>
          <button class="btn btn-medical" @click="startNewConversation">
            <i class="fas fa-plus"></i>
            Nouvelle conversation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { messagingService } from '../services/messaging'

export default {
  name: 'MessagingPanel',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const conversations = ref([])
    const activeConversation = ref(null)
    const searchQuery = ref('')
    const newMessage = ref('')
    const loadingMessages = ref(false)
    const messagesContainer = ref(null)

    // Conversations filtrées
    const filteredConversations = computed(() => {
      if (!searchQuery.value) return conversations.value

      const query = searchQuery.value.toLowerCase()
      return conversations.value.filter(conversation => {
        const title = getConversationTitle(conversation).toLowerCase()
        const lastMessage = conversation.last_message?.content?.toLowerCase() || ''
        
        return title.includes(query) || lastMessage.includes(query)
      })
    })

    // Charger les conversations
    const loadConversations = async () => {
      try {
        const response = await messagingService.getConversations()
        conversations.value = response.data.results || response.data
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error)
      }
    }

    // Charger les messages d'une conversation
    const loadMessages = async (conversationId) => {
      if (loadingMessages.value) return

      loadingMessages.value = true
      try {
        const response = await messagingService.getMessages(conversationId)
        
        const conversation = conversations.value.find(c => c.id === conversationId)
        if (conversation) {
          conversation.messages = response.data.results || response.data
          activeConversation.value = conversation
          
          // Marquer comme lu
          await markAsRead(conversationId)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      } finally {
        loadingMessages.value = false
        
        // Scroll vers le bas
        nextTick(() => {
          scrollToBottom()
        })
      }
    }

    // Sélectionner une conversation
    const selectConversation = (conversation) => {
      if (activeConversation.value?.id !== conversation.id) {
        loadMessages(conversation.id)
      }
    }

    // Envoyer un message
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !activeConversation.value) return

      const messageContent = newMessage.value.trim()
      newMessage.value = ''

      try {
        const response = await messagingService.sendMessage(
          activeConversation.value.id,
          messageContent
        )

        // Ajouter le message localement
        if (activeConversation.value.messages) {
          activeConversation.value.messages.push(response.data)
        } else {
          activeConversation.value.messages = [response.data]
        }

        // Mettre à jour la dernière conversation
        activeConversation.value.last_message = response.data
        
        // Scroll vers le bas
        nextTick(() => {
          scrollToBottom()
        })
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        // Re-afficher le message en cas d'erreur
        newMessage.value = messageContent
      }
    }

    // Marquer comme lu
    const markAsRead = async (conversationId) => {
      try {
        await messagingService.markAsRead(conversationId)
        
        // Mettre à jour localement
        const conversation = conversations.value.find(c => c.id === conversationId)
        if (conversation) {
          conversation.unread_count = 0
        }
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
      }
    }

    // Démarrer une nouvelle conversation
    const startNewConversation = () => {
      // Implémentation pour démarrer une nouvelle conversation
      console.log('Démarrer une nouvelle conversation')
    }

    const showConversationDetails = () => {
      // Afficher les détails de la conversation
      console.log('Afficher les détails de la conversation')
    }

    // Scroll vers le bas des messages
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    // Utilitaires
    const getConversationIcon = (type) => {
      const icons = {
        individual: 'fas fa-user',
        group: 'fas fa-users',
        internship: 'fas fa-briefcase-medical',
        evaluation: 'fas fa-chart-line'
      }
      return icons[type] || 'fas fa-comment'
    }

    const getConversationTitle = (conversation) => {
      if (conversation.title) return conversation.title
      
      if (conversation.participants && conversation.participants.length > 0) {
        return conversation.participants.map(p => p.name).join(', ')
      }
      
      return 'Conversation'
    }

    const getConversationSubtitle = (conversation) => {
      if (conversation.type === 'internship') {
        return 'Stage'
      } else if (conversation.participants) {
        return `${conversation.participants.length} participant(s)`
      }
      return ''
    }

    const getLastMessagePreview = (conversation) => {
      if (!conversation.last_message) return 'Aucun message'
      
      const content = conversation.last_message.content
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return 'Hier'
      } else if (diffDays < 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      }
    }

    const formatMessageTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    // Recharger quand le panel s'ouvre
    watch(() => props.show, (newVal) => {
      if (newVal) {
        loadConversations()
      }
    })

    onMounted(() => {
      if (props.show) {
        loadConversations()
      }
    })

    return {
      conversations,
      activeConversation,
      searchQuery,
      newMessage,
      loadingMessages,
      messagesContainer,
      filteredConversations,
      selectConversation,
      sendMessage,
      startNewConversation,
      showConversationDetails,
      getConversationIcon,
      getConversationTitle,
      getConversationSubtitle,
      getLastMessagePreview,
      formatTime,
      formatMessageTime
    }
  }
}
</script>

<style scoped>
.messaging-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 800px;
  height: 600px;
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

.messaging-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar des conversations */
.conversations-sidebar {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.conversations-search {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #2a7a5c;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  gap: 12px;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.conversation-item.active {
  background: #f0f7ff;
  border-right: 3px solid #2a7a5c;
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a7a5c;
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
}

.conversation-preview {
  color: #666;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.conversation-time {
  font-size: 0.7rem;
  color: #999;
}

.unread-badge {
  background: #2a7a5c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.empty-conversations {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-conversations i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-conversations p {
  margin: 0;
  font-size: 0.9rem;
}

/* Zone de chat */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.chat-info {
  flex: 1;
}

.chat-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.chat-subtitle {
  font-size: 0.8rem;
  color: #666;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-messages {
  text-align: center;
  color: #666;
  padding: 20px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.received {
  align-self: flex-start;
}

.message-content {
  background: #f1f3f4;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
}

.message.sent .message-content {
  background: #2a7a5c;
  color: white;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
}

.message-status {
  align-self: flex-end;
  font-size: 0.8rem;
  color: #999;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.no-messages i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-messages .subtitle {
  font-size: 0.9rem;
  margin-top: 5px;
}

.chat-input {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  max-height: 100px;
}

.message-input:focus {
  outline: none;
  border-color: #2a7a5c;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Aucune conversation sélectionnée */
.no-conversation-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chat {
  text-align: center;
  color: #999;
  padding: 40px;
}

.empty-chat i {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-chat h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.empty-chat p {
  margin: 0 0 20px 0;
  font-size: 0.9rem;
}

/* Scrollbars */
.conversations-list::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.conversations-list::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversations-list::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.conversations-list::-webkit-scrollbar-thumb:hover,
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .messaging-panel {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .conversations-sidebar {
    width: 100%;
  }
  
  .chat-area {
    display: none;
  }
  
  .conversation-item.active + .chat-area {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 10;
  }
}
</style>