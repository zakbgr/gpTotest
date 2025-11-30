<template>
  <div class="hospital-planning">
    <div class="page-header">
      <h1>Planning Hospitalier</h1>
      <button class="btn btn-primary" @click="showSlotsModal">
        <i class="fas fa-calendar-plus"></i> Gérer les créneaux
      </button>
    </div>

    <!-- Calendar View -->
    <div class="calendar-section">
      <div class="calendar-header">
        <div class="view-selector">
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': view === 'month' }"
            @click="changeView('month')"
          >
            Mois
          </button>
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': view === 'week' }"
            @click="changeView('week')"
          >
            Semaine
          </button>
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': view === 'day' }"
            @click="changeView('day')"
          >
            Jour
          </button>
        </div>
        
        <div class="calendar-navigation">
          <button class="btn btn-outline btn-sm" @click="previousPeriod">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3>{{ currentPeriod }}</h3>
          <button class="btn btn-outline btn-sm" @click="nextPeriod">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="service-filter">
          <select v-model="selectedService" class="form-control">
            <option value="">Tous les services</option>
            <option 
              v-for="service in services" 
              :key="service.id" 
              :value="service.id"
            >
              {{ service.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="calendar-container">
        <Calendar 
          ref="calendar"
          :events="filteredEvents"
          :view="view"
          :date="currentDate"
          :loading="loading"
          @event-click="handleEventClick"
          @date-click="handleDateClick"
        />
      </div>
    </div>

    <!-- Available Slots Summary -->
    <div class="slots-summary">
      <div class="section-header">
        <h2>Créneaux Disponibles par Service</h2>
      </div>
      
      <DataTable :items="slotsByService" :columns="slotsColumns">
        <template #cell-available_slots="{ item }">
          {{ item.available_slots }}/semaine
        </template>
        
        <template #cell-max_interns="{ item }">
          {{ item.max_interns }}
        </template>
        
        <template #cell-available_doctors="{ item }">
          {{ item.available_doctors }}
        </template>
        
        <template #cell-actions="{ item }">
          <button 
            class="btn btn-outline btn-sm"
            @click="configureServiceSlots(item)"
          >
            Configurer
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Event Details Modal -->
    <Modal 
      v-if="selectedEvent"
      :show="showEventModal"
      @close="closeEventModal"
      :title="selectedEvent.title"
    >
      <EventDetails 
        :event="selectedEvent"
        @edit="editEvent(selectedEvent)"
        @delete="deleteEvent(selectedEvent)"
      />
    </Modal>

    <!-- Slots Management Modal -->
    <Modal 
      v-if="showSlotsModal"
      :show="showSlotsModal"
      @close="closeSlotsModal"
      title="Gestion des Créneaux"
      size="large"
    >
      <SlotsManager 
        :services="services"
        :slots="availableSlots"
        @save="saveSlots"
        @cancel="closeSlotsModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Calendar from '@/components/shared/Calendar.vue'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import EventDetails from './components/EventDetails.vue'
import SlotsManager from './components/SlotsManager.vue'

export default {
  name: 'HospitalPlanning',
  components: {
    Calendar,
    DataTable,
    Modal,
    EventDetails,
    SlotsManager
  },
  data() {
    return {
      view: 'month',
      currentDate: new Date(),
      selectedService: '',
      selectedEvent: null,
      showEventModal: false,
      showSlotsModal: false,
      loading: false,
      slotsColumns: [
        { key: 'name', label: 'Service' },
        { key: 'available_slots', label: 'Créneaux/semaine' },
        { key: 'max_interns', label: 'Stagiaires max' },
        { key: 'available_doctors', label: 'Encadrants disponibles' },
        { key: 'actions', label: 'Actions' }
      ]
    }
  },
  computed: {
    ...mapState('hospitalAdmin', ['calendarEvents', 'services', 'slotsByService', 'availableSlots']),
    
    filteredEvents() {
      if (!this.selectedService) {
        return this.calendarEvents
      }
      return this.calendarEvents.filter(event => 
        event.service && event.service.id == this.selectedService
      )
    },
    
    currentPeriod() {
      const date = new Date(this.currentDate)
      if (this.view === 'month') {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      } else if (this.view === 'week') {
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        return `${startOfWeek.toLocaleDateString('fr-FR')} - ${endOfWeek.toLocaleDateString('fr-FR')}`
      } else {
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      }
    }
  },
  async created() {
    await this.loadPlanningData()
  },
  methods: {
    ...mapActions('hospitalAdmin', [
      'fetchCalendarEvents',
      'fetchServices',
      'fetchSlotsByService',
      'saveSlotsConfiguration'
    ]),
    
    async loadPlanningData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchCalendarEvents(),
          this.fetchServices(),
          this.fetchSlotsByService()
        ])
      } catch (error) {
        console.error('Error loading planning data:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger le planning.'
        })
      } finally {
        this.loading = false
      }
    },
    
    changeView(newView) {
      this.view = newView
    },
    
    previousPeriod() {
      if (this.view === 'month') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      } else if (this.view === 'week') {
        this.currentDate = new Date(this.currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else {
        this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000)
      }
    },
    
    nextPeriod() {
      if (this.view === 'month') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      } else if (this.view === 'week') {
        this.currentDate = new Date(this.currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      } else {
        this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    
    handleEventClick(event) {
      this.selectedEvent = event
      this.showEventModal = true
    },
    
    handleDateClick(date) {
      console.log('Date clicked:', date)
    },
    
    closeEventModal() {
      this.selectedEvent = null
      this.showEventModal = false
    },
    
    showSlotsModal() {
      this.showSlotsModal = true
    },
    
    closeSlotsModal() {
      this.showSlotsModal = false
    },
    
    configureServiceSlots(service) {
      this.selectedService = service.id
      this.showSlotsModal = true
    },
    
    async saveSlots(slotsData) {
      try {
        await this.saveSlotsConfiguration(slotsData)
        this.closeSlotsModal()
        this.$notify({
          type: 'success',
          title: 'Créneaux sauvegardés',
          message: 'La configuration des créneaux a été mise à jour.'
        })
        await this.loadPlanningData()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de sauvegarder les créneaux.'
        })
      }
    },
    
    editEvent(event) {
      // Implement event editing
      console.log('Edit event:', event)
      this.closeEventModal()
    },
    
    async deleteEvent(event) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        return
      }
      
      try {
        // Implement event deletion
        console.log('Delete event:', event)
        this.closeEventModal()
        this.$notify({
          type: 'success',
          title: 'Événement supprimé',
          message: 'L\'événement a été supprimé.'
        })
        await this.loadPlanningData()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer l\'événement.'
        })
      }
    }
  }
}
</script>

<style scoped>
.hospital-planning {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--medical);
  margin: 0;
}

.calendar-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.view-selector {
  display: flex;
  gap: 5px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.calendar-navigation h3 {
  margin: 0;
  color: var(--text);
  min-width: 200px;
  text-align: center;
}

.service-filter {
  min-width: 200px;
}

.calendar-container {
  min-height: 600px;
}

.slots-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--medical);
}

.section-header h2 {
  color: var(--medical);
  margin: 0;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .calendar-navigation {
    order: -1;
    justify-content: center;
  }
  
  .service-filter {
    width: 100%;
  }
}
</style>