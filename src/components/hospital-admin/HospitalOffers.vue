<template>
  <div class="hospital-offers">
    <div class="page-header">
      <h1>Gestion des Offres de Stage</h1>
      <div class="header-actions">
        <button class="btn btn-outline" @click="importOffers">
          <i class="fas fa-file-import"></i> Importer
        </button>
        <button class="btn btn-outline" @click="exportOffers">
          <i class="fas fa-file-export"></i> Exporter
        </button>
        <button class="btn btn-primary" @click="showNewOfferModal">
          <i class="fas fa-plus"></i> Nouvelle Offre
        </button>
      </div>
    </div>

    <!-- Offers Table -->
    <DataTable 
      :items="offers" 
      :columns="offerColumns"
      :loading="loading"
    >
      <template #cell-places="{ item }">
        {{ item.current_applications }}/{{ item.number_of_positions }}
      </template>
      
      <template #cell-publication_date="{ item }">
        {{ formatDate(item.publication_date) }}
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button 
            class="btn btn-outline btn-sm"
            @click="editOffer(item)"
          >
            <i class="fas fa-edit"></i>
            Modifier
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewApplications(item)"
          >
            <i class="fas fa-list"></i>
            Candidatures
          </button>
          
          <button 
            v-if="item.status === 'draft'"
            class="btn btn-primary btn-sm"
            @click="publishOffer(item)"
          >
            <i class="fas fa-paper-plane"></i>
            Publier
          </button>
          
          <button 
            v-if="item.status === 'published'"
            class="btn btn-danger btn-sm"
            @click="archiveOffer(item)"
          >
            <i class="fas fa-archive"></i>
            Archiver
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Statistics -->
    <div class="offer-statistics">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-number">{{ statistics.totalOffers }}</div>
          <div class="stat-label">Total des offres</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.publishedOffers }}</div>
          <div class="stat-label">Offres publiées</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.draftOffers }}</div>
          <div class="stat-label">Brouillons</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.totalApplications }}</div>
          <div class="stat-label">Candidatures totales</div>
        </div>
      </div>
    </div>

    <!-- New/Edit Offer Modal -->
    <Modal 
      v-if="showOfferModal"
      :show="showOfferModal"
      @close="closeOfferModal"
      :title="offerFormTitle"
      size="large"
    >
      <OfferForm 
        :offer="editingOffer"
        :services="services"
        @submit="saveOffer"
        @cancel="closeOfferModal"
      />
    </Modal>

    <!-- Import Modal -->
    <Modal 
      v-if="showImportModal"
      :show="showImportModal"
      @close="closeImportModal"
      title="Importer des Offres"
      size="large"
    >
      <OfferImport 
        @import="handleImport"
        @cancel="closeImportModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import OfferForm from './components/OfferForm.vue'
import OfferImport from './components/OfferImport.vue'

export default {
  name: 'HospitalOffers',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    OfferForm,
    OfferImport
  },
  data() {
    return {
      offerColumns: [
        { key: 'title', label: 'Titre' },
        { key: 'service.name', label: 'Service' },
        { key: 'places', label: 'Places' },
        { key: 'current_applications', label: 'Candidatures' },
        { key: 'status', label: 'Statut' },
        { key: 'publication_date', label: 'Date publication' },
        { key: 'actions', label: 'Actions' }
      ],
      editingOffer: null,
      showOfferModal: false,
      showImportModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('hospitalAdmin', ['offers', 'services', 'statistics']),
    
    offerFormTitle() {
      return this.editingOffer ? 'Modifier l\'Offre' : 'Nouvelle Offre'
    }
  },
  async created() {
    await this.loadOffers()
  },
  methods: {
    ...mapActions('hospitalAdmin', [
      'fetchOffers',
      'fetchServices',
      'createOffer',
      'updateOffer',
      'publishOffer',
      'archiveOffer',
      'importOffers'
    ]),
    
    async loadOffers() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchOffers(),
          this.fetchServices()
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
    
    showNewOfferModal() {
      this.editingOffer = null
      this.showOfferModal = true
    },
    
    editOffer(offer) {
      this.editingOffer = { ...offer }
      this.showOfferModal = true
    },
    
    closeOfferModal() {
      this.showOfferModal = false
      this.editingOffer = null
    },
    
    viewApplications(offer) {
      this.$router.push({
        name: 'hospital-applications',
        query: { offer: offer.id }
      })
    },
    
    async publishOffer(offer) {
      try {
        await this.publishOffer(offer.id)
        this.$notify({
          type: 'success',
          title: 'Offre publiée',
          message: 'L\'offre a été publiée avec succès.'
        })
        await this.loadOffers()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de publier l\'offre.'
        })
      }
    },
    
    async archiveOffer(offer) {
      if (!confirm('Êtes-vous sûr de vouloir archiver cette offre ?')) {
        return
      }
      
      try {
        await this.archiveOffer(offer.id)
        this.$notify({
          type: 'success',
          title: 'Offre archivée',
          message: 'L\'offre a été archivée.'
        })
        await this.loadOffers()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'archiver l\'offre.'
        })
      }
    },
    
    async saveOffer(offerData) {
      try {
        if (offerData.id) {
          await this.updateOffer(offerData)
          this.$notify({
            type: 'success',
            title: 'Offre modifiée',
            message: 'L\'offre a été modifiée avec succès.'
          })
        } else {
          await this.createOffer(offerData)
          this.$notify({
            type: 'success',
            title: 'Offre créée',
            message: 'L\'offre a été créée avec succès.'
          })
        }
        
        this.closeOfferModal()
        await this.loadOffers()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de sauvegarder l\'offre.'
        })
      }
    },
    
    importOffers() {
      this.showImportModal = true
    },
    
    closeImportModal() {
      this.showImportModal = false
    },
    
    async handleImport(importData) {
      try {
        await this.importOffers(importData)
        this.closeImportModal()
        this.$notify({
          type: 'success',
          title: 'Import réussi',
          message: 'Les offres ont été importées avec succès.'
        })
        await this.loadOffers()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur d\'import',
          message: 'Impossible d\'importer les offres.'
        })
      }
    },
    
    exportOffers() {
      // Implement export functionality
      this.$notify({
        type: 'info',
        title: 'Export',
        message: 'Export des offres en cours...'
      })
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.hospital-offers {
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

.offer-statistics {
  margin-top: 30px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--medical);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-light);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
</style>