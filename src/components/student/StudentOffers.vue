<template>
  <div class="student-offers">
    <div class="page-header">
      <h1>Offres de Stage Disponibles</h1>
    </div>

    <!-- Search Box -->
    <SearchFilters 
      :filters="filters"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="form-group">
          <label>Spécialité</label>
          <select v-model="filters.specialty" class="form-control">
            <option value="">Toutes</option>
            <option v-for="spec in specialties" :key="spec" :value="spec">
              {{ spec }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Établissement</label>
          <select v-model="filters.establishment" class="form-control">
            <option value="">Tous</option>
            <option v-for="est in establishments" :key="est.id" :value="est.id">
              {{ est.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Date de début</label>
          <input type="date" v-model="filters.startDate" class="form-control">
        </div>
      </div>
    </div>

    <!-- Offers List -->
    <div class="offers-grid" v-if="!loading">
      <div 
        v-for="offer in filteredOffers" 
        :key="offer.id"
        class="offer-card"
      >
        <div class="offer-header">
          <h3>{{ offer.title }}</h3>
          <StatusBadge :status="offer.status" />
        </div>
        
        <div class="offer-details">
          <div class="detail-item">
            <i class="fas fa-hospital"></i>
            <span>{{ offer.establishment.name }} - {{ offer.service.name }}</span>
          </div>
          
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>{{ formatDate(offer.start_date) }} - {{ formatDate(offer.end_date) }}</span>
          </div>
          
          <div class="detail-item">
            <i class="fas fa-users"></i>
            <span>{{ offer.current_applications }}/{{ offer.number_of_positions }} places</span>
          </div>
          
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ offer.establishment.city }}</span>
          </div>
        </div>
        
        <div class="offer-description">
          <p>{{ truncateDescription(offer.description) }}</p>
        </div>
        
        <div class="offer-actions">
          <button 
            class="btn btn-primary"
            @click="applyForOffer(offer)"
            :disabled="offer.current_applications >= offer.number_of_positions || hasApplied(offer.id)"
          >
            {{ hasApplied(offer.id) ? 'Déjà postulé' : 'Postuler' }}
          </button>
          <button 
            class="btn btn-outline"
            @click="showOfferDetails(offer)"
          >
            Détails
          </button>
        </div>
      </div>
    </div>

    <LoadingSpinner v-else />

    <!-- No Results -->
    <div v-if="!loading && filteredOffers.length === 0" class="no-results">
      <i class="fas fa-search"></i>
      <h3>Aucune offre trouvée</h3>
      <p>Ajustez vos critères de recherche ou réessayez plus tard.</p>
    </div>

    <!-- Offer Details Modal -->
    <Modal 
      v-if="selectedOffer"
      :show="showDetailsModal"
      @close="closeDetailsModal"
      :title="selectedOffer.title"
      size="large"
    >
      <OfferDetails 
        :offer="selectedOffer"
        :has-applied="hasApplied(selectedOffer.id)"
        @apply="applyForOffer(selectedOffer)"
      />
    </Modal>

    <!-- Application Modal -->
    <Modal 
      v-if="showApplicationModal"
      :show="showApplicationModal"
      @close="closeApplicationModal"
      title="Nouvelle Candidature"
    >
      <ApplicationForm 
        :offer="applicationOffer"
        @submit="submitApplication"
        @cancel="closeApplicationModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SearchFilters from '@/components/shared/SearchFilters.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import OfferDetails from './components/OfferDetails.vue'
import ApplicationForm from './components/ApplicationForm.vue'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'StudentOffers',
  components: {
    SearchFilters,
    Modal,
    StatusBadge,
    LoadingSpinner,
    OfferDetails,
    ApplicationForm
  },
  data() {
    return {
      filters: {
        specialty: '',
        establishment: '',
        startDate: '',
        searchQuery: ''
      },
      specialties: ['Chirurgie', 'Pédiatrie', 'Cardiologie', 'Médecine Interne', 'Neurologie'],
      selectedOffer: null,
      showDetailsModal: false,
      showApplicationModal: false,
      applicationOffer: null,
      loading: false
    }
  },
  computed: {
    ...mapState('student', ['offers', 'applications', 'establishments']),
    
    filteredOffers() {
      return this.offers.filter(offer => {
        const matchesSpecialty = !this.filters.specialty || 
          offer.service.name.toLowerCase().includes(this.filters.specialty.toLowerCase())
        const matchesEstablishment = !this.filters.establishment || 
          offer.establishment.id == this.filters.establishment
        const matchesStartDate = !this.filters.startDate || 
          offer.start_date >= this.filters.startDate
        const matchesSearch = !this.filters.searchQuery || 
          offer.title.toLowerCase().includes(this.filters.searchQuery.toLowerCase()) ||
          offer.establishment.name.toLowerCase().includes(this.filters.searchQuery.toLowerCase()) ||
          offer.service.name.toLowerCase().includes(this.filters.searchQuery.toLowerCase())
        
        return matchesSpecialty && matchesEstablishment && matchesStartDate && matchesSearch
      })
    }
  },
  async created() {
    await this.loadOffers()
  },
  methods: {
    ...mapActions('student', ['fetchOffers', 'fetchEstablishments', 'submitApplication']),
    
    async loadOffers() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchOffers(),
          this.fetchEstablishments()
        ])
      } catch (error) {
        console.error('Error loading offers:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les offres de stage.'
        })
      } finally {
        this.loading = false
      }
    },
    
    handleSearch(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    
    handleReset() {
      this.filters = {
        specialty: '',
        establishment: '',
        startDate: '',
        searchQuery: ''
      }
    },
    
    showOfferDetails(offer) {
      this.selectedOffer = offer
      this.showDetailsModal = true
    },
    
    closeDetailsModal() {
      this.selectedOffer = null
      this.showDetailsModal = false
    },
    
    applyForOffer(offer) {
      this.applicationOffer = offer
      this.showApplicationModal = true
      this.closeDetailsModal()
    },
    
    closeApplicationModal() {
      this.applicationOffer = null
      this.showApplicationModal = false
    },
    
    hasApplied(offerId) {
      return this.applications.some(app => app.internship_announcement.id === offerId)
    },
    
    async submitApplication(applicationData) {
      try {
        await this.submitApplication(applicationData)
        this.closeApplicationModal()
        this.$notify({
          type: 'success',
          title: 'Candidature envoyée',
          message: 'Votre candidature a été soumise avec succès.'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de soumettre votre candidature.'
        })
      }
    },
    
    formatDate(date) {
      return formatDate(date)
    },
    
    truncateDescription(description, length = 150) {
      return description.length > length 
        ? description.substring(0, length) + '...' 
        : description
    }
  }
}
</script>

<style scoped>
.student-offers {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--medical);
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.offer-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.offer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.offer-header h3 {
  color: var(--medical);
  margin: 0;
  flex: 1;
  margin-right: 15px;
}

.offer-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: var(--text-light);
}

.detail-item i {
  width: 16px;
  color: var(--medical);
}

.offer-description {
  margin-bottom: 20px;
}

.offer-description p {
  color: var(--text);
  line-height: 1.5;
  margin: 0;
}

.offer-actions {
  display: flex;
  gap: 10px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.no-results h3 {
  margin-bottom: 10px;
  color: var(--text);
}
</style>