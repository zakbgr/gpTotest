<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="calendar-controls">
        <button class="btn btn-outline btn-sm" @click="prevPeriod">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <h3 class="calendar-title">{{ currentPeriodTitle }}</h3>
        
        <button class="btn btn-outline btn-sm" @click="nextPeriod">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="calendar-views">
        <button
          v-for="view in availableViews"
          :key="view"
          class="btn btn-sm"
          :class="currentView === view ? 'btn-medical' : 'btn-outline'"
          @click="changeView(view)"
        >
          {{ viewLabels[view] }}
        </button>
      </div>
      
      <div class="calendar-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="calendar-content">
      <!-- Vue Mois -->
      <div v-if="currentView === 'month'" class="month-view">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday-header">
            {{ day }}
          </div>
        </div>
        
        <div class="calendar-grid">
          <div
            v-for="day in monthDays"
            :key="day.date"
            class="calendar-day"
            :class="getDayClasses(day)"
            @click="selectDate(day.date)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div
                v-for="event in getDayEvents(day.date)"
                :key="event.id"
                class="event-item"
                :class="`event-${event.type}`"
                @click.stop="selectEvent(event)"
              >
                <div class="event-time" v-if="event.startTime">
                  {{ event.startTime }}
                </div>
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Semaine -->
      <div v-else-if="currentView === 'week'" class="week-view">
        <div class="week-header">
          <div class="time-column"></div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="day-header"
            :class="{ today: isToday(day.date) }"
          >
            <div class="day-name">{{ getWeekdayName(day.date) }}</div>
            <div class="day-date">{{ getDayNumber(day.date) }}</div>
          </div>
        </div>
        
        <div class="week-body">
          <div class="time-slots">
            <div
              v-for="timeSlot in timeSlots"
              :key="timeSlot"
              class="time-slot"
            >
              {{ timeSlot }}
            </div>
          </div>
          
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="day-column"
          >
            <div
              v-for="timeSlot in timeSlots"
              :key="timeSlot"
              class="time-slot-cell"
              @click="createEvent(day.date, timeSlot)"
            >
              <div
                v-for="event in getTimeSlotEvents(day.date, timeSlot)"
                :key="event.id"
                class="week-event"
                :class="`event-${event.type}`"
                :style="getEventStyle(event)"
                @click.stop="selectEvent(event)"
              >
                <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                <div class="event-title">{{ event.title }}</div>
                <div class="event-location" v-if="event.location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ event.location }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Jour -->
      <div v-else-if="currentView === 'day'" class="day-view">
        <div class="day-header">
          <h4>{{ formatDate(currentDate, 'full') }}</h4>
        </div>
        
        <div class="day-timeline">
          <div
            v-for="timeSlot in timeSlots"
            :key="timeSlot"
            class="time-slot-row"
          >
            <div class="time-label">{{ timeSlot }}</div>
            <div
              class="time-slot-content"
              @click="createEvent(currentDate, timeSlot)"
            >
              <div
                v-for="event in getTimeSlotEvents(currentDate, timeSlot)"
                :key="event.id"
                class="day-event"
                :class="`event-${event.type}`"
                :style="getEventStyle(event)"
                @click.stop="selectEvent(event)"
              >
                <div class="event-header">
                  <span class="event-time">
                    {{ event.startTime }} - {{ event.endTime }}
                  </span>
                  <span class="event-type">{{ event.typeLabel }}</span>
                </div>
                <div class="event-title">{{ event.title }}</div>
                <div class="event-description" v-if="event.description">
                  {{ event.description }}
                </div>
                <div class="event-footer" v-if="event.location || event.participants">
                  <span v-if="event.location" class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ event.location }}
                  </span>
                  <span v-if="event.participants" class="event-participants">
                    <i class="fas fa-users"></i>
                    {{ event.participants }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'événement -->
    <Modal
      v-if="selectedEvent"
      :show="!!selectedEvent"
      :title="selectedEvent.title"
      size="medium"
      @update:show="selectedEvent = null"
    >
      <div class="event-details">
        <div class="detail-item">
          <label>Type:</label>
          <span>{{ selectedEvent.typeLabel }}</span>
        </div>
        <div class="detail-item">
          <label>Date:</label>
          <span>{{ formatDate(selectedEvent.start) }}</span>
        </div>
        <div class="detail-item" v-if="selectedEvent.startTime">
          <label>Heure:</label>
          <span>{{ selectedEvent.startTime }} - {{ selectedEvent.endTime }}</span>
        </div>
        <div class="detail-item" v-if="selectedEvent.location">
          <label>Lieu:</label>
          <span>{{ selectedEvent.location }}</span>
        </div>
        <div class="detail-item" v-if="selectedEvent.description">
          <label>Description:</label>
          <p>{{ selectedEvent.description }}</p>
        </div>
        <div class="detail-item" v-if="selectedEvent.participants">
          <label>Participants:</label>
          <span>{{ selectedEvent.participants }}</span>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-outline" @click="selectedEvent = null">
          Fermer
        </button>
        <button class="btn btn-medical" @click="editEvent(selectedEvent)">
          Modifier
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Modal from './Modal.vue'

export default {
  name: 'Calendar',
  components: {
    Modal
  },
  props: {
    events: {
      type: Array,
      default: () => []
    },
    initialView: {
      type: String,
      default: 'month',
      validator: (value) => ['month', 'week', 'day'].includes(value)
    },
    availableViews: {
      type: Array,
      default: () => ['month', 'week', 'day']
    },
    startDate: {
      type: String,
      default: null
    }
  },
  emits: ['date-select', 'event-select', 'event-create', 'event-edit'],
  setup(props, { emit }) {
    const currentView = ref(props.initialView)
    const currentDate = ref(props.startDate ? new Date(props.startDate) : new Date())
    const selectedEvent = ref(null)

    const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)

    const viewLabels = {
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    }

    // Computed
    const currentPeriodTitle = computed(() => {
      const options = {
        month: 'long',
        year: 'numeric'
      }
      
      if (currentView.value === 'month') {
        return currentDate.value.toLocaleDateString('fr-FR', options)
      } else if (currentView.value === 'week') {
        const start = new Date(currentDate.value)
        start.setDate(start.getDate() - start.getDay() + 1)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        
        return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
      } else {
        return currentDate.value.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    })

    const monthDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay() + 1)
      
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
      
      const days = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        days.push({
          date: new Date(current),
          day: current.getDate(),
          isCurrentMonth: current.getMonth() === month,
          isToday: isToday(current)
        })
        current.setDate(current.getDate() + 1)
      }
      
      return days
    })

    const weekDays = computed(() => {
      const start = new Date(currentDate.value)
      start.setDate(start.getDate() - start.getDay() + 1)
      
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        return { date }
      })
    })

    // Méthodes
    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const formatDate = (date, format = 'short') => {
      const options = {
        short: { day: 'numeric', month: 'short' },
        medium: { weekday: 'short', day: 'numeric', month: 'short' },
        full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      }
      
      return date.toLocaleDateString('fr-FR', options[format])
    }

    const getWeekdayName = (date) => {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    }

    const getDayNumber = (date) => {
      return date.getDate()
    }

    const getDayClasses = (day) => {
      return {
        'other-month': !day.isCurrentMonth,
        'today': day.isToday,
        'weekend': day.date.getDay() === 0 || day.date.getDay() === 6
      }
    }

    const getDayEvents = (date) => {
      return props.events.filter(event => {
        const eventDate = new Date(event.start)
        return eventDate.toDateString() === date.toDateString()
      })
    }

    const getTimeSlotEvents = (date, timeSlot) => {
      return props.events.filter(event => {
        const eventDate = new Date(event.start)
        return eventDate.toDateString() === date.toDateString() && 
               event.startTime === timeSlot
      })
    }

    const getEventStyle = (event) => {
      if (currentView.value === 'month') return {}
      
      const startHour = parseInt(event.startTime.split(':')[0])
      const endHour = parseInt(event.endTime.split(':')[0])
      const duration = endHour - startHour
      
      return {
        height: `${duration * 60}px`
      }
    }

    const changeView = (view) => {
      currentView.value = view
    }

    const prevPeriod = () => {
      const newDate = new Date(currentDate.value)
      
      if (currentView.value === 'month') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else if (currentView.value === 'week') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() - 1)
      }
      
      currentDate.value = newDate
    }

    const nextPeriod = () => {
      const newDate = new Date(currentDate.value)
      
      if (currentView.value === 'month') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else if (currentView.value === 'week') {
        newDate.setDate(newDate.getDate() + 7)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
      
      currentDate.value = newDate
    }

    const selectDate = (date) => {
      emit('date-select', date)
    }

    const selectEvent = (event) => {
      selectedEvent.value = event
      emit('event-select', event)
    }

    const createEvent = (date, timeSlot) => {
      const event = {
        start: date,
        startTime: timeSlot,
        endTime: `${parseInt(timeSlot.split(':')[0]) + 1}:00`
      }
      emit('event-create', event)
    }

    const editEvent = (event) => {
      emit('event-edit', event)
      selectedEvent.value = null
    }

    onMounted(() => {
      // Charger les événements initiaux si nécessaire
    })

    return {
      currentView,
      currentDate,
      selectedEvent,
      weekdays,
      timeSlots,
      viewLabels,
      currentPeriodTitle,
      monthDays,
      weekDays,
      isToday,
      formatDate,
      getWeekdayName,
      getDayNumber,
      getDayClasses,
      getDayEvents,
      getTimeSlotEvents,
      getEventStyle,
      changeView,
      prevPeriod,
      nextPeriod,
      selectDate,
      selectEvent,
      createEvent,
      editEvent
    }
  }
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
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

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.calendar-title {
  margin: 0;
  min-width: 200px;
  text-align: center;
  color: #2a7a5c;
}

.calendar-views {
  display: flex;
  gap: 5px;
}

.calendar-actions {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Vue Mois */
.month-view {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.weekday-header {
  background: #f8f9fa;
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #2a7a5c;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.calendar-day {
  background: white;
  min-height: 100px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #999;
}

.calendar-day.today {
  background: #fff3cd;
}

.calendar-day.weekend {
  background: #f8f9fa;
}

.day-number {
  font-weight: 600;
  margin-bottom: 5px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 0.6rem;
  opacity: 0.8;
}

.event-title {
  font-weight: 500;
}

/* Types d'événements */
.event-internship { background: #d4edda; color: #155724; }
.event-evaluation { background: #fff3cd; color: #856404; }
.event-meeting { background: #cce7ff; color: #004085; }
.event-training { background: #d1ecf1; color: #0c5460; }
.event-other { background: #e2e3e5; color: #383d41; }

/* Vue Semaine */
.week-view {
  width: 100%;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.time-column {
  background: #f8f9fa;
  padding: 10px;
}

.day-header {
  background: #f8f9fa;
  padding: 10px;
  text-align: center;
  cursor: pointer;
}

.day-header.today {
  background: #fff3cd;
}

.day-name {
  font-weight: 600;
  color: #2a7a5c;
  font-size: 0.9rem;
}

.day-date {
  font-size: 1.2rem;
  font-weight: 600;
}

.week-body {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
  max-height: 600px;
  overflow-y: auto;
}

.time-slots {
  display: flex;
  flex-direction: column;
}

.time-slot {
  background: #f8f9fa;
  padding: 8px;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.time-slot-cell {
  background: white;
  min-height: 60px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.time-slot-cell:hover {
  background: #f8f9fa;
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  cursor: pointer;
  overflow: hidden;
}

.week-event .event-time {
  font-size: 0.6rem;
  opacity: 0.8;
}

.week-event .event-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.week-event .event-location {
  font-size: 0.6rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Vue Jour */
.day-view {
  width: 100%;
}

.day-header {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.day-header h4 {
  margin: 0;
  color: #2a7a5c;
}

.day-timeline {
  max-height: 600px;
  overflow-y: auto;
}

.time-slot-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  min-height: 60px;
}

.time-label {
  width: 80px;
  padding: 8px;
  background: #f8f9fa;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-slot-content {
  flex: 1;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.time-slot-content:hover {
  background: #f8f9fa;
}

.day-event {
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
}

.day-event .event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.8rem;
}

.day-event .event-time {
  font-weight: 600;
}

.day-event .event-type {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.day-event .event-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.day-event .event-description {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.day-event .event-footer {
  display: flex;
  gap: 15px;
  font-size: 0.7rem;
  opacity: 0.8;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
}

.detail-item label {
  font-weight: 600;
  min-width: 100px;
  color: #333;
}

.detail-item p {
  margin: 0;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .calendar-controls {
    justify-content: center;
  }
  
  .calendar-views {
    justify-content: center;
  }
  
  .calendar-actions {
    justify-content: center;
  }
  
  .week-header,
  .week-body {
    grid-template-columns: 60px repeat(7, 1fr);
  }
  
  .time-column {
    width: 60px;
  }
  
  .time-slots {
    width: 60px;
  }
  
  .time-label {
    width: 60px;
  }
}
</style>