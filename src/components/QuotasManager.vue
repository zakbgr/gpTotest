<template>
  <div class="quotas-manager">
    <div class="current-stats">
      <h4>Statistiques actuelles</h4>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">{{ service.current_interns }}</div>
          <div class="stat-label">Stagiaires actuels</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ service.capacity }}</div>
          <div class="stat-label">Capacité maximale</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ service.occupancy_rate }}%</div>
          <div class="stat-label">Taux d'occupation</div>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveQuotas" class="quotas-form">
      <div class="form-group">
        <label>Nouvelle capacité maximale</label>
        <input 
          type="number" 
          v-model="quotasData.capacity"
          class="form-control"
          :min="service.current_interns"
          required
        >
        <small class="form-text">
          La capacité ne peut pas être inférieure au nombre actuel de stagiaires ({{ service.current_interns }})
        </small>
      </div>

      <div class="form-group">
        <label>Période d'application</label>
        <select v-model="quotasData.period" class="form-control">
          <option value="immediate">Immédiate</option>
          <option value="next_month">Mois prochain</option>
          <option value="next_semester">Prochain semestre</option>
        </select>
      </div>

      <div class="form-group">
        <label>Raison du changement</label>
        <textarea 
          v-model="quotasData.reason"
          class="form-control"
          rows="3"
          placeholder="Expliquez la raison de cette modification de capacité..."
        ></textarea>
      </div>

      <div class="impact-preview" v-if="showImpact">
        <h5>Impact du changement:</h5>
        <div class="impact-item">
          <span>Nouveau taux d'occupation:</span>
          <strong>{{ newOccupancyRate }}%</strong>
        </div>
        <div class="impact-item">
          <span>Places supplémentaires:</span>
          <strong>{{ additionalSlots }} places</strong>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" @click="$emit('cancel')">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary">
          Sauvegarder les quotas
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'QuotasManager',
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      quotasData: {
        capacity: this.service.capacity,
        period: 'immediate',
        reason: ''
      }
    }
  },
  computed: {
    showImpact() {
      return this.quotasData.capacity !== this.service.capacity
    },
    
    newOccupancyRate() {
      return Math.round((this.service.current_interns / this.quotasData.capacity) * 100)
    },
    
    additionalSlots() {
      return this.quotasData.capacity - this.service.capacity
    }
  },
  methods: {
    saveQuotas() {
      const quotasData = {
        service_id: this.service.id,
        ...this.quotasData
      }
      this.$emit('save', quotasData)
    }
  }
}
</script>

<style scoped>
.quotas-manager {
  padding: 10px 0;
}

.current-stats {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.current-stats h4 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--medical);
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

.quotas-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.impact-preview {
  padding: 15px;
  background: #e8f5e8;
  border-radius: 6px;
  border-left: 4px solid var(--success);
}

.impact-preview h5 {
  margin: 0 0 10px 0;
  color: var(--success);
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.impact-item span {
  color: var(--text);
}

.impact-item strong {
  color: var(--medical);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>