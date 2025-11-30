<template>
  <div class="hospital-services">
    <div class="page-header">
      <h1>Gestion des Services Hospitaliers</h1>
      <button class="btn btn-primary" @click="showNewServiceModal">
        <i class="fas fa-plus"></i> Nouveau Service
      </button>
    </div>

    <!-- Services Table -->
    <DataTable 
      :items="services" 
      :columns="serviceColumns"
      :loading="loading"
    >
      <template #cell-capacity="{ item }">
        {{ item.current_interns }}/{{ item.capacity }}
      </template>
      
      <template #cell-occupancy_rate="{ item }">
        <div class="occupancy-display">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: item.occupancy_rate + '%' }"
              :class="getOccupancyClass(item.occupancy_rate)"
            ></div>
          </div>
          <span class="occupancy-text">{{ item.occupancy_rate }}%</span>
        </div>
      </template>
      
      <template #cell-head_doctor="{ item }">
        <div v-if="item.head_doctor" class="doctor-info">
          <div class="avatar-sm">
            <i class="fas fa-user-md"></i>
          </div>
          <div>
            <strong>Dr. {{ item.head_doctor.prenom }} {{ item.head_doctor.name }}</strong>
            <div class="doctor-details">
              {{ item.head_doctor.specialty }}
            </div>
          </div>
        </div>
        <span v-else class="text-muted">Non assigné</span>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button 
            class="btn btn-outline btn-sm"
            @click="editService(item)"
          >
            <i class="fas fa-edit"></i>
            Modifier
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="manageQuotas(item)"
          >
            <i class="fas fa-chart-pie"></i>
            Quotas
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            @click="viewServiceDetails(item)"
          >
            <i class="fas fa-eye"></i>
            Détails
          </button>
        </div>
      </template>
    </DataTable>

    <!-- No Services -->
    <div v-if="!loading && services.length === 0" class="no-services">
      <i class="fas fa-hospital-alt"></i>
      <h3>Aucun service configuré</h3>
      <p>Commencez par créer votre premier service hospitalier.</p>
      <button class="btn btn-primary" @click="showNewServiceModal">
        Créer un service
      </button>
    </div>

    <!-- Service Details Modal -->
    <Modal 
      v-if="selectedService"
      :show="showDetailsModal"
      @close="closeDetailsModal"
      :title="`Service - ${selectedService.name}`"
      size="large"
    >
      <ServiceDetails 
        :service="selectedService"
        @edit="editService(selectedService)"
        @manage-quotas="manageQuotas(selectedService)"
      />
    </Modal>

    <!-- New/Edit Service Modal -->
    <Modal 
      v-if="showServiceModal"
      :show="showServiceModal"
      @close="closeServiceModal"
      :title="serviceFormTitle"
      size="large"
    >
      <ServiceForm 
        :service="editingService"
        :doctors="availableDoctors"
        @submit="saveService"
        @cancel="closeServiceModal"
      />
    </Modal>

    <!-- Quotas Management Modal -->
    <Modal 
      v-if="showQuotasModal"
      :show="showQuotasModal"
      @close="closeQuotasModal"
      :title="`Gestion des Quotas - ${selectedService?.name}`"
      size="large"
    >
      <QuotasManager 
        :service="selectedService"
        @save="saveQuotas"
        @cancel="closeQuotasModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ServiceDetails from './components/ServiceDetails.vue'
import ServiceForm from './components/ServiceForm.vue'
import QuotasManager from './components/QuotasManager.vue'

export default {
  name: 'HospitalServices',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    ServiceDetails,
    ServiceForm,
    QuotasManager
  },
  data() {
    return {
      serviceColumns: [
        { key: 'name', label: 'Service' },
        { key: 'head_doctor', label: 'Chef de service' },
        { key: 'capacity', label: 'Capacité d\'accueil' },
        { key: 'current_interns', label: 'Stagiaires actuels' },
        { key: 'occupancy_rate', label: 'Taux d\'occupation' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      selectedService: null,
      editingService: null,
      showDetailsModal: false,
      showServiceModal: false,
      showQuotasModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('hospitalAdmin', ['services', 'availableDoctors']),
    
    serviceFormTitle() {
      return this.editingService ? 'Modifier le Service' : 'Nouveau Service'
    }
  },
  async created() {
    await this.loadServices()
  },
  methods: {
    ...mapActions('hospitalAdmin', [
      'fetchServices', 
      'fetchAvailableDoctors',
      'createService',
      'updateService',
      'updateServiceQuotas'
    ]),
    
    async loadServices() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchServices(),
          this.fetchAvailableDoctors()
        ])
      } catch (error) {
        console.error('Error loading services:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger la liste des services.'
        })
      } finally {
        this.loading = false
      }
    },
    
    getOccupancyClass(rate) {
      if (rate >= 90) return 'high'
      if (rate >= 70) return 'medium'
      return 'low'
    },
    
    showNewServiceModal() {
      this.editingService = null
      this.showServiceModal = true
    },
    
    editService(service) {
      this.editingService = { ...service }
      this.showServiceModal = true
      this.closeDetailsModal()
    },
    
    viewServiceDetails(service) {
      this.selectedService = service
      this.showDetailsModal = true
    },
    
    manageQuotas(service) {
      this.selectedService = service
      this.showQuotasModal = true
      this.closeDetailsModal()
    },
    
    closeDetailsModal() {
      this.selectedService = null
      this.showDetailsModal = false
    },
    
    closeServiceModal() {
      this.showServiceModal = false
      this.editingService = null
    },
    
    closeQuotasModal() {
      this.showQuotasModal = false
      this.selectedService = null
    },
    
    async saveService(serviceData) {
      try {
        if (serviceData.id) {
          await this.updateService(serviceData)
          this.$notify({
            type: 'success',
            title: 'Service modifié',
            message: 'Le service a été modifié avec succès.'
          })
        } else {
          await this.createService(serviceData)
          this.$notify({
            type: 'success',
            title: 'Service créé',
            message: 'Le service a été créé avec succès.'
          })
        }
        
        this.closeServiceModal()
        await this.loadServices()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de sauvegarder le service.'
        })
      }
    },
    
    async saveQuotas(quotasData) {
      try {
        await this.updateServiceQuotas(quotasData)
        this.closeQuotasModal()
        this.$notify({
          type: 'success',
          title: 'Quotas mis à jour',
          message: 'Les quotas du service ont été mis à jour.'
        })
        await this.loadServices()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de mettre à jour les quotas.'
        })
      }
    }
  }
}
</script>

<style scoped>
.hospital-services {
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

.occupancy-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill.low {
  background: var(--success);
}

.progress-fill.medium {
  background: var(--warning);
}

.progress-fill.high {
  background: var(--danger);
}

.occupancy-text {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
}

.doctor-details {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.no-services {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.no-services i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.no-services h3 {
  margin-bottom: 10px;
  color: var(--text);
}

.no-services p {
  margin-bottom: 20px;
}
</style>