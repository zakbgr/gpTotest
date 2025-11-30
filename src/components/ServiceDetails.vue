<template>
  <div class="service-details">
    <div class="details-grid">
      <div class="detail-item">
        <label>Nom du service:</label>
        <span>{{ service.name }}</span>
      </div>
      <div class="detail-item">
        <label>Description:</label>
        <span>{{ service.description }}</span>
      </div>
      <div class="detail-item">
        <label>Capacité d'accueil:</label>
        <span>{{ service.capacity }} stagiaires</span>
      </div>
      <div class="detail-item">
        <label>Stagiaires actuels:</label>
        <span>{{ service.current_interns }}</span>
      </div>
      <div class="detail-item">
        <label>Taux d'occupation:</label>
        <span>{{ service.occupancy_rate }}%</span>
      </div>
      <div class="detail-item">
        <label>Chef de service:</label>
        <span v-if="service.head_doctor">
          Dr. {{ service.head_doctor.prenom }} {{ service.head_doctor.name }}
        </span>
        <span v-else class="text-muted">Non assigné</span>
      </div>
      <div class="detail-item">
        <label>Statut:</label>
        <StatusBadge :status="service.status" />
      </div>
    </div>

    <div class="actions-section">
      <button class="btn btn-primary" @click="$emit('edit')">
        <i class="fas fa-edit"></i> Modifier
      </button>
      <button class="btn btn-outline" @click="$emit('manage-quotas')">
        <i class="fas fa-chart-pie"></i> Gérer les quotas
      </button>
    </div>
  </div>
</template>

<script>
import StatusBadge from '@/components/shared/StatusBadge.vue'

export default {
  name: 'ServiceDetails',
  components: {
    StatusBadge
  },
  props: {
    service: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.detail-item span {
  color: var(--text);
}

.actions-section {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>