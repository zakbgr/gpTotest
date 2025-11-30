<template>
  <div class="application-details">
    <div class="student-info">
      <h4>Informations de l'Étudiant</h4>
      <div class="info-grid">
        <div class="info-item">
          <label>Nom complet:</label>
          <span>{{ application.student.prenom }} {{ application.student.name }}</span>
        </div>
        <div class="info-item">
          <label>Email:</label>
          <span>{{ application.student.email }}</span>
        </div>
        <div class="info-item">
          <label>Téléphone:</label>
          <span>{{ application.student.telephone }}</span>
        </div>
        <div class="info-item">
          <label>Faculté:</label>
          <span>{{ application.student.faculty || 'Non spécifié' }}</span>
        </div>
        <div class="info-item">
          <label>Année d'étude:</label>
          <span>{{ application.student.year || 'Non spécifié' }}</span>
        </div>
      </div>
    </div>

    <div class="application-info">
      <h4>Détails de la Candidature</h4>
      <div class="info-grid">
        <div class="info-item">
          <label>Offre:</label>
          <span>{{ application.internship_announcement.title }}</span>
        </div>
        <div class="info-item">
          <label>Service:</label>
          <span>{{ application.internship_announcement.service.name }}</span>
        </div>
        <div class="info-item">
          <label>Date de candidature:</label>
          <span>{{ formatDate(application.date_of_application) }}</span>
        </div>
        <div class="info-item">
          <label>Statut:</label>
          <StatusBadge :status="application.status" />
        </div>
      </div>
    </div>

    <div class="documents-section">
      <h4>Documents</h4>
      <div class="documents-list">
        <div class="document-item">
          <i class="fas fa-file-pdf"></i>
          <span>CV de l'étudiant</span>
          <button class="btn btn-outline btn-sm" @click="$emit('view-cv')">
            <i class="fas fa-eye"></i> Voir
          </button>
        </div>
        <div class="document-item">
          <i class="fas fa-file-word"></i>
          <span>Lettre de motivation</span>
          <button class="btn btn-outline btn-sm">
            <i class="fas fa-eye"></i> Voir
          </button>
        </div>
      </div>
    </div>

    <div class="recommendation-section" v-if="application.status === 'pending'">
      <h4>Donner votre avis</h4>
      <div class="recommendation-actions">
        <button 
          class="btn btn-success"
          @click="$emit('recommend', 'favorable')"
        >
          <i class="fas fa-thumbs-up"></i> Avis Favorable
        </button>
        <button 
          class="btn btn-danger"
          @click="$emit('recommend', 'defavorable')"
        >
          <i class="fas fa-thumbs-down"></i> Avis Défavorable
        </button>
      </div>
    </div>

    <div class="history-section" v-if="application.history && application.history.length > 0">
      <h4>Historique</h4>
      <div class="history-list">
        <div 
          v-for="event in application.history"
          :key="event.id"
          class="history-item"
        >
          <div class="event-description">{{ event.description }}</div>
          <div class="event-date">{{ formatDate(event.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatusBadge from '@/components/shared/StatusBadge.vue'

export default {
  name: 'ApplicationDetails',
  components: {
    StatusBadge
  },
  props: {
    application: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.application-details {
  padding: 10px 0;
}

.student-info,
.application-info,
.documents-section,
.recommendation-section,
.history-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.student-info h4,
.application-info h4,
.documents-section h4,
.recommendation-section h4,
.history-section h4 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.info-item span {
  color: var(--text);
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: var(--secondary);
  border-radius: 6px;
}

.document-item i {
  color: var(--danger);
  font-size: 1.2rem;
}

.document-item span {
  flex: 1;
  color: var(--text);
}

.recommendation-actions {
  display: flex;
  gap: 15px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--secondary);
  border-radius: 6px;
}

.event-description {
  color: var(--text);
}

.event-date {
  color: var(--text-light);
  font-size: 0.9rem;
}
</style>