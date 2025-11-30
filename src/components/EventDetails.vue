<template>
  <div class="event-details">
    <div class="event-header">
      <h3>{{ event.title }}</h3>
      <StatusBadge :status="event.status" />
    </div>

    <div class="event-info">
      <div class="info-grid">
        <div class="info-item">
          <label>Date et heure:</label>
          <span>{{ formatDateTime(event.start) }}</span>
        </div>
        <div class="info-item">
          <label>Durée:</label>
          <span>{{ calculateDuration(event.start, event.end) }}</span>
        </div>
        <div class="info-item">
          <label>Service:</label>
          <span>{{ event.service?.name || 'Non spécifié' }}</span>
        </div>
        <div class="info-item">
          <label>Type:</label>
          <span class="event-type" :class="event.type">
            {{ getEventTypeLabel(event.type) }}
          </span>
        </div>
        <div class="info-item full-width">
          <label>Description:</label>
          <p>{{ event.description || 'Aucune description' }}</p>
        </div>
      </div>
    </div>

    <div class="participants-section" v-if="event.participants && event.participants.length > 0">
      <h4>Participants</h4>
      <div class="participants-list">
        <div 
          v-for="participant in event.participants"
          :key="participant.id"
          class="participant-item"
        >
          <div class="participant-avatar">
            <i :class="getParticipantIcon(participant.type)"></i>
          </div>
          <div class="participant-info">
            <strong>{{ participant.name }}</strong>
            <span class="participant-role">{{ getParticipantRole(participant.type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="event-actions">
      <button class="btn btn-outline" @click="$emit('edit')">
        <i class="fas fa-edit"></i> Modifier
      </button>
      <button class="btn btn-danger" @click="$emit('delete')">
        <i class="fas fa-trash"></i> Supprimer
      </button>
    </div>
  </div>
</template>

<script>
import StatusBadge from '@/components/shared/StatusBadge.vue'

export default {
  name: 'EventDetails',
  components: {
    StatusBadge
  },
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDateTime(date) {
      return new Date(date).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    calculateDuration(start, end) {
      const startTime = new Date(start)
      const endTime = new Date(end)
      const duration = endTime - startTime
      const hours = Math.floor(duration / (1000 * 60 * 60))
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`
      }
      return `${minutes}min`
    },
    
    getEventTypeLabel(type) {
      const labels = {
        meeting: 'Réunion',
        training: 'Formation',
        evaluation: 'Évaluation',
        supervision: 'Encadrement',
        other: 'Autre'
      }
      return labels[type] || type
    },
    
    getParticipantIcon(type) {
      const icons = {
        doctor: 'fas fa-user-md',
        student: 'fas fa-user-graduate',
        admin: 'fas fa-user-tie'
      }
      return icons[type] || 'fas fa-user'
    },
    
    getParticipantRole(type) {
      const roles = {
        doctor: 'Docteur',
        student: 'Étudiant',
        admin: 'Administrateur'
      }
      return roles[type] || type
    }
  }
}
</script>

<style scoped>
.event-details {
  padding: 10px 0;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
}

.event-header h3 {
  margin: 0;
  color: var(--text);
}

.event-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.info-item span, .info-item p {
  color: var(--text);
}

.info-item p {
  margin: 0;
  line-height: 1.5;
}

.event-type {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.event-type.meeting {
  background: #e3f2fd;
  color: var(--primary);
}

.event-type.training {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-type.evaluation {
  background: #e8f5e8;
  color: var(--success);
}

.event-type.supervision {
  background: #fff3e0;
  color: var(--warning);
}

.participants-section {
  margin-bottom: 20px;
}

.participants-section h4 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--secondary);
  border-radius: 6px;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-info strong {
  color: var(--text);
  font-size: 0.9rem;
}

.participant-role {
  color: var(--text-light);
  font-size: 0.8rem;
}

.event-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>