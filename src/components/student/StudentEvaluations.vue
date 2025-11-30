<template>
  <div class="student-evaluations">
    <div class="page-header">
      <h1>Mes Évaluations</h1>
    </div>

    <!-- Evaluations Table -->
    <DataTable 
      :items="evaluations" 
      :columns="evaluationColumns"
      :loading="loading"
    >
      <template #cell-evaluation_date="{ item }">
        {{ formatDate(item.evaluation_date) }}
      </template>
      
      <template #cell-evalyation="{ item }">
        <div class="grade-display">
          <span class="grade-value">{{ parseGrade(item.evalyation) }}</span>
          <span class="grade-max">/20</span>
        </div>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge :status="getEvaluationStatus(item)" />
      </template>
      
      <template #cell-actions="{ item }">
        <button 
          v-if="item.type === 'doctor_evaluation'"
          class="btn btn-primary btn-sm"
          @click="viewEvaluationReport(item)"
        >
          Voir rapport
        </button>
        
        <button 
          v-else-if="item.type === 'self_evaluation' && getEvaluationStatus(item) === 'pending'"
          class="btn btn-warning btn-sm"
          @click="startSelfEvaluation(item)"
        >
          Compléter
        </button>
        
        <button 
          v-if="getEvaluationStatus(item) === 'completed'"
          class="btn btn-outline btn-sm"
          @click="downloadEvaluationPDF(item)"
        >
          Télécharger PDF
        </button>
      </template>
    </DataTable>

    <!-- No Evaluations -->
    <div v-if="!loading && evaluations.length === 0" class="no-evaluations">
      <i class="fas fa-clipboard-check"></i>
      <h3>Aucune évaluation</h3>
      <p>Vous n'avez pas encore d'évaluations disponibles.</p>
    </div>

    <!-- Evaluation Summary -->
    <div class="evaluation-summary" v-if="evaluations.length > 0">
      <div class="summary-card">
        <h3>Résumé des Évaluations</h3>
        <div class="summary-stats">
          <div class="stat">
            <div class="stat-value">{{ completedEvaluations }}</div>
            <div class="stat-label">Évaluations terminées</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ pendingEvaluations }}</div>
            <div class="stat-label">En attente</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ averageGrade }}</div>
            <div class="stat-label">Moyenne générale</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Evaluation Report Modal -->
    <Modal 
      v-if="selectedEvaluation"
      :show="showReportModal"
      @close="closeReportModal"
      :title="`Rapport d'Évaluation - ${selectedEvaluation.internship?.service_name || 'Stage'}`"
      size="large"
    >
      <EvaluationReport 
        :evaluation="selectedEvaluation"
        @download="downloadEvaluationPDF(selectedEvaluation)"
      />
    </Modal>

    <!-- Self Evaluation Modal -->
    <Modal 
      v-if="showSelfEvaluationModal"
      :show="showSelfEvaluationModal"
      @close="closeSelfEvaluationModal"
      title="Auto-évaluation"
      size="large"
    >
      <SelfEvaluationForm 
        :evaluation="currentSelfEvaluation"
        @submit="submitSelfEvaluation"
        @cancel="closeSelfEvaluationModal"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EvaluationReport from './components/EvaluationReport.vue'
import SelfEvaluationForm from './components/SelfEvaluationForm.vue'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'StudentEvaluations',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    EvaluationReport,
    SelfEvaluationForm
  },
  data() {
    return {
      evaluationColumns: [
        { key: 'internship.service_name', label: 'Stage' },
        { key: 'doctor.name', label: 'Encadrant' },
        { key: 'evaluation_date', label: 'Date évaluation' },
        { key: 'evalyation', label: 'Note finale' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      selectedEvaluation: null,
      currentSelfEvaluation: null,
      showReportModal: false,
      showSelfEvaluationModal: false,
      loading: false
    }
  },
  computed: {
    ...mapState('student', ['evaluations']),
    
    completedEvaluations() {
      return this.evaluations.filter(evals => this.getEvaluationStatus(eval) === 'completed').length
    },
    
    pendingEvaluations() {
      return this.evaluations.filter(evals => this.getEvaluationStatus(eval) === 'pending').length
    },
    
    averageGrade() {
      const gradedEvaluations = this.evaluations.filter(evals => {
        return this.getEvaluationStatus(eval) === 'completed' && evals.type === 'doctor_evaluation'
      })
      
      if (gradedEvaluations.length === 0) return '-'
      
      const total = gradedEvaluations.reduce((sum, evalItem) => {
        return sum + this.parseGrade(evalItem.evalyation)
      }, 0)
      
      return (total / gradedEvaluations.length).toFixed(1)
    }
  },
  async created() {
    await this.loadEvaluations()
  },
  methods: {
    ...mapActions('student', ['fetchEvaluations', 'submitSelfEvaluation']),
    
    async loadEvaluations() {
      this.loading = true
      try {
        await this.fetchEvaluations()
      } catch (error) {
        console.error('Error loading evaluations:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger vos évaluations.'
        })
      } finally {
        this.loading = false
      }
    },
    
    getEvaluationStatus(evaluation) {
      if (evaluation.type === 'self_evaluation') {
        return evaluation.evalyation ? 'completed' : 'pending'
      }
      return evaluation.evalyation ? 'completed' : 'pending'
    },
    
    parseGrade(gradeString) {
      if (!gradeString) return '-'
      const match = gradeString.match(/(\d+(\.\d+)?)/)
      return match ? parseFloat(match[1]).toFixed(1) : '-'
    },
    
    viewEvaluationReport(evaluation) {
      this.selectedEvaluation = evaluation
      this.showReportModal = true
    },
    
    closeReportModal() {
      this.selectedEvaluation = null
      this.showReportModal = false
    },
    
    startSelfEvaluation(evaluation) {
      this.currentSelfEvaluation = evaluation
      this.showSelfEvaluationModal = true
    },
    
    closeSelfEvaluationModal() {
      this.currentSelfEvaluation = null
      this.showSelfEvaluationModal = false
    },
    
    async submitSelfEvaluation(evaluationData) {
      try {
        await this.submitSelfEvaluation(evaluationData)
        this.closeSelfEvaluationModal()
        this.$notify({
          type: 'success',
          title: 'Auto-évaluation soumise',
          message: 'Votre auto-évaluation a été enregistrée avec succès.'
        })
        await this.loadEvaluations() // Refresh the list
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de soumettre votre auto-évaluation.'
        })
      }
    },
    
    downloadEvaluationPDF(evaluation) {
      // Implement PDF download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Génération du PDF en cours...'
      })
    },
    
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style scoped>
.student-evaluations {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--medical);
}

.grade-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.grade-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--medical);
}

.grade-max {
  font-size: 0.9rem;
  color: var(--text-light);
}

.no-evaluations {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.no-evaluations i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.no-evaluations h3 {
  margin-bottom: 10px;
  color: var(--text);
}

.evaluation-summary {
  margin-top: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.summary-card h3 {
  color: var(--medical);
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
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
</style>