<template>
  <form @submit.prevent="submitForm" class="offer-form">
    <div class="form-grid">
      <div class="form-group full-width">
        <label>Titre de l'offre *</label>
        <input 
          type="text" 
          v-model="formData.title"
          class="form-control"
          placeholder="Ex: Stage de Chirurgie Générale"
          required
        >
      </div>
      
      <div class="form-group">
        <label>Service *</label>
        <select v-model="formData.service_id" class="form-control" required>
          <option value="">Sélectionner un service</option>
          <option 
            v-for="service in services" 
            :key="service.id" 
            :value="service.id"
          >
            {{ service.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Nombre de places *</label>
        <input 
          type="number" 
          v-model="formData.number_of_positions"
          class="form-control"
          min="1"
          required
        >
      </div>
      
      <div class="form-group">
        <label>Date de début *</label>
        <input 
          type="date" 
          v-model="formData.start_date"
          class="form-control"
          required
        >
      </div>
      
      <div class="form-group">
        <label>Date de fin *</label>
        <input 
          type="date" 
          v-model="formData.end_date"
          class="form-control"
          required
        >
      </div>
      
      <div class="form-group full-width">
        <label>Description détaillée *</label>
        <textarea 
          v-model="formData.description"
          class="form-control"
          rows="6"
          placeholder="Décrivez en détail le stage, les missions, les compétences requises..."
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Statut</label>
        <select v-model="formData.status" class="form-control">
          <option value="draft">Brouillon</option>
          <option value="pending">En attente</option>
          <option value="published">Publié</option>
        </select>
      </div>
    </div>

    <div class="requirements-section">
      <h4>Compétences Requises</h4>
      <div class="requirements-list">
        <div 
          v-for="(requirement, index) in formData.requirements"
          :key="index"
          class="requirement-item"
        >
          <input 
            type="text" 
            v-model="requirement.text"
            class="form-control"
            placeholder="Ex: Connaissances en anatomie"
          >
          <button 
            type="button" 
            class="btn btn-danger btn-sm"
            @click="removeRequirement(index)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button 
          type="button" 
          class="btn btn-outline btn-sm"
          @click="addRequirement"
        >
          <i class="fas fa-plus"></i> Ajouter une compétence
        </button>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-outline" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        {{ formData.id ? 'Modifier' : 'Créer' }} l'offre
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'OfferForm',
  props: {
    offer: {
      type: Object,
      default: null
    },
    services: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        id: null,
        title: '',
        description: '',
        service_id: null,
        number_of_positions: 1,
        start_date: '',
        end_date: '',
        status: 'draft',
        requirements: []
      }
    }
  },
  watch: {
    offer: {
      immediate: true,
      handler(newOffer) {
        if (newOffer) {
          this.formData = { 
            ...newOffer,
            requirements: newOffer.requirements || []
          }
        }
      }
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit', this.formData)
    },
    
    addRequirement() {
      this.formData.requirements.push({ text: '' })
    },
    
    removeRequirement(index) {
      this.formData.requirements.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.offer-form {
  padding: 10px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.requirements-section {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.requirements-section h4 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.requirement-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.requirement-item .form-control {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>