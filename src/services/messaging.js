import api from './api'

export const messagingService = {
  // Récupérer les conversations
  getConversations(params = {}) {
    return api.get('/messaging/conversations/', { params })
  },
  
  // Récupérer une conversation spécifique
  getConversation(conversationId) {
    return api.get(\/messaging/conversations/\/\)
  },
  
  // Créer une nouvelle conversation
  createConversation(conversationData) {
    return api.post('/messaging/conversations/', conversationData)
  },
  
  // Récupérer les messages d'une conversation
  getMessages(conversationId, params = {}) {
    return api.get(\/messaging/conversations/\/messages/\, { params })
  },
  
  // Envoyer un message
  sendMessage(conversationId, content) {
    return api.post(\/messaging/conversations/\/messages/\, {
      content
    })
  },
  
  // Marquer une conversation comme lue
  markAsRead(conversationId) {
    return api.post(\/messaging/conversations/\/mark-read/\)
  },
  
  // Ajouter un participant à une conversation
  addParticipant(conversationId, userId) {
    return api.post(\/messaging/conversations/\/participants/\, {
      user_id: userId
    })
  },
  
  // Supprimer un participant d'une conversation
  removeParticipant(conversationId, userId) {
    return api.delete(\/messaging/conversations/\/participants/\/\)
  },
  
  // Supprimer une conversation
  deleteConversation(conversationId) {
    return api.delete(\/messaging/conversations/\/\)
  }
}
