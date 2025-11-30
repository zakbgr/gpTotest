<template>
  <div class="doctor-planning">
    <div class="page-header">
      <h1>Planning des Activités</h1>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportCalendar">
          <i class="fas fa-download"></i> Exporter
        </button>
        <button class="btn btn-primary" @click="showAvailabilityModal">
          <i class="fas fa-plus"></i> Gérer mes disponibilités
        </button>
      </div>
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
        
        <div class="calendar-actions">
          <button class="btn btn-outline btn-sm" @click="goToToday">
            Aujourd'hui
          </button>
        </div>
      </div>

      <div class="calendar-container">
        <Calendar 
          ref="calendar"
          :events="calendarEvents"
          :view="view"
          :date="currentDate"
          :loading="loading"
          @event-click="handleEventClick"
          @date-click="handleDateClick"
          @event-drop="handleEventDrop"
        />
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="upcoming-events">
      <div class="section-header">
        <h2>Événements à Venir</h2>
        <button class="btn btn-outline btn-sm" @click="showAllEvents">
          Voir tout
        </button>
      </div>
      
      <div class="events-list">
        <div 
          v-for="event in upcomingEvents"
          :key="event.id"
          class="event-item"
        >
          <div class="event-time">
            <div class="event-date">{{ formatEventDate(event.start) }}</div>
            <div class="event-hours">{{ formatEventTime(event.start) }}</div>
          </div>
          
          <div class="event-details">
            <h4>{{ event.title }}</h4>
            <p>{{ event.description }}</p>
            <div class="event-meta">
              <span class="event-type" :class="event.type">
                {{ getEventTypeLabel(event.type) }}
              </span>
              <span v-if="event.student" class="event-student">
                avec {{ event.student.prenom }} {{ event.student.name }}
              </span>
            </div>
          </div>
          
          <div class="event-actions">
            <button 
              class="btn btn-outline btn-sm"
              @click="viewEventDetails(event)"
            >
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="upcomingEvents.length === 0" class="no-events">
        <i class="fas fa-calendar-times"></i>
        <p>Aucun événement à venir</p>
      </div>
    </div>

    <!-- Availability Summary -->
    <div class="availability-summary">
      <div class="section-header">
        <h2>Mes Disponibilités</h2>
      </div>
      
      <div class="availability-grid">
        <div class="availability-card">
          <h3>Créneaux Disponibles</h3>
          <div class="time-slots">
            <div 
              v-for="slot in availabilitySlots"
              :key="slot.id"
              class="time-slot"
            >
              <div class="slot-day">{{ getDayName(slot.day) }}</div>
              <div class="slot-time">{{ slot.start_time }} - {{ slot.end_time }}</div>
              <div class="slot-actions">
                <button 
                  class="btn btn-outline btn-sm"
                  @click="editTimeSlot(slot)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn btn-danger btn-sm"
                  @click="deleteTimeSlot(slot)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="statistics-card">
          <h3>Statistiques de la Semaine</h3>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">{{ weeklyStats.scheduledHours }}</div>
              <div class="stat-label">Heures planifiées</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ weeklyStats.availableSlots }}</div>
              <div class="stat-label">Créneaux disponibles</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ weeklyStats.studentMeetings }}</div>
              <div class="stat-label">Rendez-vous étudiants</div>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Availability Modal -->
    <Modal 
      v-if="showAvailabilityModal"
      :show="showAvailabilityModal"
      @close="closeAvailabilityModal"
      title="Gérer les Disponibilités"
      size="large"
    >
      <AvailabilityManager 
        :slots="availabilitySlots"
        @save="saveAvailability"
        @cancel="closeAvailabilityModal"
      />
    </Modal>

    <!-- New Event Modal -->
    <Modal 
      v-if="showNewEventModal"
      :show="showNewEventModal"
      @close="closeNewEventModal"
      title="Nouvel Événement"
    >
      <EventForm 
        :date="selectedDate"
        @save="saveEvent"
        @cancel="closeNewEventModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Calendar from '@/components/shared/Calendar.vue'
import Modal from '@/components/shared/Modal.vue'
import EventDetails from './components/EventDetails.vue'
import AvailabilityManager from './components/AvailabilityManager.vue'
import EventForm from './components/EventForm.vue'

export default {
  name: 'DoctorPlanning',
  components: {
    Calendar,
    Modal,
    EventDetails,
    AvailabilityManager,
    EventForm
  },
  data() {
    return {
      view: 'month',
      currentDate: new Date(),
      selectedEvent: null,
      selectedDate: null,
      showEventModal: false,
      showAvailabilityModal: false,
      showNewEventModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('doctor', [
      'calendarEvents', 
      'upcomingEvents', 
      'availabilitySlots', 
      'weeklyStats'
    ]),
    
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
    ...mapActions('doctor', [
      'fetchCalendarEvents',
      'fetchUpcomingEvents', 
      'fetchAvailability',
      'saveAvailability',
      'createEvent',
      'updateEvent',
      'deleteEvent'
    ]),
    
    async loadPlanningData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchCalendarEvents(),
          this.fetchUpcomingEvents(),
          this.fetchAvailability()
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
    
    goToToday() {
      this.currentDate = new Date()
    },
    
    handleEventClick(event) {
      this.selectedEvent = event
      this.showEventModal = true
    },
    
    handleDateClick(date) {
      this.selectedDate = date
      this.showNewEventModal = true
    },
    
    handleEventDrop(event, newDate) {
      const updatedEvent = {
        ...event,
        start: newDate.start,
        end: newDate.end
      }
      
      this.updateEvent(updatedEvent)
        .then(() => {
          this.$notify({
            type: 'success',
            title: 'Événement déplacé',
            message: 'L\'événement a été déplacé avec succès.'
          })
        })
        .catch(error => {
          console.error('Error moving event:', error)
          this.$notify({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de déplacer l\'événement.'
          })
        })
    },
    
    viewEventDetails(event) {
      this.selectedEvent = event
      this.showEventModal = true
    },
    
    closeEventModal() {
      this.selectedEvent = null
      this.showEventModal = false
    },
    
    showAvailabilityModal() {
      this.showAvailabilityModal = true
    },
    
    closeAvailabilityModal() {
      this.showAvailabilityModal = false
    },
    
    closeNewEventModal() {
      this.selectedDate = null
      this.showNewEventModal = false
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
        await this.deleteEvent(event.id)
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
    },
    
    editTimeSlot(slot) {
      // Implement time slot editing
      console.log('Edit time slot:', slot)
    },
    
    async deleteTimeSlot(slot) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
        return
      }
      
      try {
        // Implement time slot deletion
        console.log('Delete time slot:', slot)
        this.$notify({
          type: 'success',
          title: 'Créneau supprimé',
          message: 'Le créneau a été supprimé.'
        })
        await this.loadPlanningData()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer le créneau.'
        })
      }
    },
    
    async saveAvailability(availabilityData) {
      try {
        await this.saveAvailability(availabilityData)
        this.closeAvailabilityModal()
        this.$notify({
          type: 'success',
          title: 'Disponibilités sauvegardées',
          message: 'Vos disponibilités ont été mises à jour.'
        })
        await this.loadPlanningData()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de sauvegarder les disponibilités.'
        })
      }
    },
    
    async saveEvent(eventData) {
      try {
        await this.createEvent(eventData)
        this.closeNewEventModal()
        this.$notify({
          type: 'success',
          title: 'Événement créé',
          message: 'L\'événement a été ajouté à votre planning.'
        })
        await this.loadPlanningData()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de créer l\'événement.'
        })
      }
    },
    
    showAllEvents() {
      this.view = 'month'
      this.currentDate = new Date()
    },
    
    exportCalendar() {
      // Implement calendar export
      this.$notify({
        type: 'info',
        title: 'Export',
        message: 'Export du calendrier en cours...'
      })
    },
    
    formatEventDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    },
    
    formatEventTime(date) {
      return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },
    
    getEventTypeLabel(type) {
      const labels = {
        evaluation: 'Évaluation',
        meeting: 'Réunion',
        supervision: 'Encadrement',
        training: 'Formation',
        other: 'Autre'
      }
      return labels[type] || type
    },
    
    getDayName(dayNumber) {
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      return days[dayNumber]
    }
  }
}
</script>

<style scoped>
.doctor-planning {
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

.header-actions {
  display: flex;
  gap: 10px;
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

.calendar-actions {
  display: flex;
  gap: 10px;
}

.calendar-container {
  min-height: 600px;
}

.upcoming-events {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
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

.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.event-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-time {
  text-align: center;
  min-width: 80px;
}

.event-date {
  font-weight: 600;
  color: var(--medical);
  margin-bottom: 4px;
}

.event-hours {
  font-size: 0.9rem;
  color: var(--text-light);
}

.event-details {
  flex: 1;
}

.event-details h4 {
  margin: 0 0 8px 0;
  color: var(--text);
}

.event-details p {
  margin: 0 0 8px 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.event-meta {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
}

.event-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.event-type.evaluation {
  background: #e8f5e8;
  color: var(--success);
}

.event-type.meeting {
  background: #e3f2fd;
  color: var(--primary);
}

.event-type.supervision {
  background: #fff3e0;
  color: var(--warning);
}

.event-type.training {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-student {
  color: var(--text-light);
}

.event-actions {
  display: flex;
  gap: 5px;
}

.no-events {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
}

.no-events i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--border);
}

.availability-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.availability-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.availability-card,
.statistics-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
}

.availability-card h3,
.statistics-card h3 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--secondary);
  border-radius: 6px;
}

.slot-day {
  font-weight: 600;
  color: var(--text);
  min-width: 100px;
}

.slot-time {
  color: var(--text-light);
  flex: 1;
}

.slot-actions {
  display: flex;
  gap: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.stat {
  text-align: center;
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--medical);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-light);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .availability-grid {
    grid-template-columns: 1fr;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .calendar-navigation {
    order: -1;
    justify-content: center;
  }
  
  .event-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .event-time {
    text-align: left;
  }
}
</style>