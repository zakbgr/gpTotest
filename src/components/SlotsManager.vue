<template>
  <div class="slots-manager">
    <div class="services-tabs">
      <div 
        v-for="service in services"
        :key="service.id"
        class="service-tab"
        :class="{ active: selectedService?.id === service.id }"
        @click="selectService(service)"
      >
        {{ service.name }}
      </div>
    </div>

    <div v-if="selectedService" class="slots-configuration">
      <div class="service-header">
        <h4>Configuration des créneaux - {{ selectedService.name }}</h4>
        <div class="service-stats">
          <div class="stat">
            <span class="stat-value">{{ getServiceSlots(selectedService.id)?.available_slots || 0 }}</span>
            <span class="stat-label">créneaux/semaine</span>
          </div>
        </div>
      </div>

      <div class="weekly-slots">
        <div 
          v-for="day in daysOfWeek"
          :key="day.id"
          class="day-slots"
        >
          <h5>{{ day.name }}</h5>
          <div class="time-slots">
            <div 
              v-for="slot in getDaySlots(day.id)"
              :key="slot.id"
              class="time-slot"
              :class="{ active: slot.active }"
            >
              <div class="slot-time">
                <input 
                  type="time" 
                  v-model="slot.start_time"
                  class="form-control form-control-sm"
                >
                <span>-</span>
                <input 
                  type="time" 
                  v-model="slot.end_time"
                  class="form-control form-control-sm"
                >
              </div>
              <div class="slot-capacity">
                <label>Capacité:</label>
                <input 
                  type="number" 
                  v-model="slot.capacity"
                  class="form-control form-control-sm"
                  min="1"
                  max="10"
                >
              </div>
              <div class="slot-actions">
                <button 
                  class="btn btn-sm"
                  :class="slot.active ? 'btn-danger' : 'btn-success'"
                  @click="toggleSlot(slot)"
                >
                  <i :class="slot.active ? 'fas fa-times' : 'fas fa-check'"></i>
                </button>
              </div>
            </div>
            
            <button 
              class="btn btn-outline btn-sm add-slot"
              @click="addTimeSlot(day.id)"
            >
              <i class="fas fa-plus"></i> Ajouter un créneau
            </button>
          </div>
        </div>
      </div>

      <div class="configuration-summary">
        <h5>Résumé de la configuration</h5>
        <div class="summary-grid">
          <div class="summary-item">
            <label>Total des créneaux actifs:</label>
            <span>{{ activeSlotsCount }} créneaux/semaine</span>
          </div>
          <div class="summary-item">
            <label>Capacité totale:</label>
            <span>{{ totalCapacity }} stagiaires/semaine</span>
          </div>
          <div class="summary-item">
            <label>Jours avec créneaux:</label>
            <span>{{ activeDaysCount }} jours</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slots-actions">
      <button type="button" class="btn btn-outline" @click="$emit('cancel')">
        Annuler
      </button>
      <button 
        type="button" 
        class="btn btn-primary"
        @click="saveConfiguration"
        :disabled="!hasChanges"
      >
        Sauvegarder la configuration
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlotsManager',
  props: {
    services: {
      type: Array,
      default: () => []
    },
    slots: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedService: null,
      daysOfWeek: [
        { id: 1, name: 'Lundi' },
        { id: 2, name: 'Mardi' },
        { id: 3, name: 'Mercredi' },
        { id: 4, name: 'Jeudi' },
        { id: 5, name: 'Vendredi' },
        { id: 6, name: 'Samedi' }
      ],
      timeSlots: [],
      originalSlots: []
    }
  },
  computed: {
    activeSlotsCount() {
      return this.timeSlots.filter(slot => slot.active).length
    },
    
    totalCapacity() {
      return this.timeSlots
        .filter(slot => slot.active)
        .reduce((total, slot) => total + (slot.capacity || 0), 0)
    },
    
    activeDaysCount() {
      const activeDays = new Set(
        this.timeSlots
          .filter(slot => slot.active)
          .map(slot => slot.day)
      )
      return activeDays.size
    },
    
    hasChanges() {
      return JSON.stringify(this.timeSlots) !== JSON.stringify(this.originalSlots)
    }
  },
  watch: {
    services: {
      immediate: true,
      handler(newServices) {
        if (newServices.length > 0 && !this.selectedService) {
          this.selectedService = newServices[0]
        }
      }
    },
    
    selectedService: {
      handler(newService) {
        if (newService) {
          this.loadServiceSlots(newService.id)
        }
      }
    }
  },
  methods: {
    selectService(service) {
      this.selectedService = service
    },
    
    getServiceSlots(serviceId) {
      return this.slots.find(slot => slot.service_id === serviceId)
    },
    
    loadServiceSlots(serviceId) {
      const serviceSlots = this.getServiceSlots(serviceId)
      
      if (serviceSlots && serviceSlots.time_slots) {
        this.timeSlots = JSON.parse(JSON.stringify(serviceSlots.time_slots))
      } else {
        // Initialize empty slots for each day
        this.timeSlots = this.daysOfWeek.flatMap(day => [
          {
            id: this.generateId(),
            day: day.id,
            start_time: '08:00',
            end_time: '12:00',
            capacity: 2,
            active: false
          },
          {
            id: this.generateId(),
            day: day.id,
            start_time: '14:00',
            end_time: '18:00',
            capacity: 2,
            active: false
          }
        ])
      }
      
      this.originalSlots = JSON.parse(JSON.stringify(this.timeSlots))
    },
    
    getDaySlots(dayId) {
      return this.timeSlots.filter(slot => slot.day === dayId)
    },
    
    addTimeSlot(dayId) {
      this.timeSlots.push({
        id: this.generateId(),
        day: dayId,
        start_time: '09:00',
        end_time: '12:00',
        capacity: 2,
        active: true
      })
    },
    
    toggleSlot(slot) {
      slot.active = !slot.active
    },
    
    saveConfiguration() {
      const configuration = {
        service_id: this.selectedService.id,
        time_slots: this.timeSlots
      }
      this.$emit('save', configuration)
    },
    
    generateId() {
      return Math.random().toString(36).substr(2, 9)
    }
  }
}
</script>

<style scoped>
.slots-manager {
  padding: 10px 0;
}

.services-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.service-tab {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  font-weight: 500;
  color: var(--text-light);
}

.service-tab:hover {
  color: var(--medical);
}

.service-tab.active {
  color: var(--medical);
  border-bottom-color: var(--medical);
}

.slots-configuration {
  margin-bottom: 20px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
}

.service-header h4 {
  margin: 0;
  color: var(--medical);
}

.service-stats .stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--medical);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

.weekly-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.day-slots {
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.day-slots h5 {
  margin: 0 0 15px 0;
  color: var(--text);
  text-align: center;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.time-slot.active {
  border-color: var(--success);
}

.time-slot:not(.active) {
  opacity: 0.6;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.slot-time input {
  width: 80px;
}

.slot-capacity {
  display: flex;
  align-items: center;
  gap: 5px;
}

.slot-capacity label {
  font-size: 0.8rem;
  color: var(--text-light);
  white-space: nowrap;
}

.slot-capacity input {
  width: 60px;
}

.add-slot {
  margin-top: 5px;
}

.configuration-summary {
  padding: 15px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid var(--success);
}

.configuration-summary h5 {
  margin: 0 0 15px 0;
  color: var(--success);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-item label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.summary-item span {
  color: var(--text);
  font-weight: 500;
}

.slots-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
</style>