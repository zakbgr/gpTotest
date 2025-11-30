<template>
  <form @submit.prevent="submitForm" class="service-form">
    <div class="form-grid">
      <div class="form-group">
        <label>Nom du service *</label>
        <input 
          type="text" 
          v-model="formData.name"
          class="form-control"
          required
        >
      </div>
      
      <div class="form-group">
        <label>Capacité d'accueil *</label>
        <input 
          type="number" 
          v-model="formData.capacity"
          class="form-control"
          min="1"
          required
        >
      </div>
      
      <div class="form-group full-width">
        <label>Description</label>
        <textarea 
          v-model="formData.description"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Chef de service</label>
        <select v-model="formData.head_doctor_id" class="form-control">
          <option value="">Sélectionner un docteur</option>
          <option 
            v-for="doctor in doctors" 
            :key="doctor.id" 
            :value="doctor.id"
          >
            Dr. {{ doctor.prenom }} {{ doctor.name }} - {{ doctor.specialty }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Statut</label>
        <select v-model="formData.status" class="form-control">
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-outline" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        {{ formData.id ? 'Modifier' : 'Créer' }} le service
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ServiceForm',
  props: {
    service: {
      type: Object,
      default: null
    },
    doctors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        id: null,
        name: '',
        description: '',
        capacity: 1,
        head_doctor_id: null,
        status: 'active'
      }
    }
  },
  watch: {
    service: {
      immediate: true,
      handler(newService) {
        if (newService) {
          this.formData = { ...newService }
        }
      }
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit', this.formData)
    }
  }
}
</script>

<style scoped>
.service-form {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>