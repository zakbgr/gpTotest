<template>
  <div class="doctor-evaluations">
    <div class="page-header">
      <h1>Évaluations des Stagiaires</h1>
      <button class="btn btn-primary" @click="showEvaluationForm">
        <i class="fas fa-plus"></i> Nouvelle Évaluation
      </button>
    </div>

    <!-- Evaluation Tabs -->
    <div class="evaluation-tabs">
      <div 
        class="tab"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <i class="fas fa-clock"></i>
        En Attente
        <span class="tab-badge" v-if="pendingEvaluations.length > 0">
          {{ pendingEvaluations.length }}
        </span>
      </div>
      
      <div 
        class="tab"
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <i class="fas fa-check-circle"></i>
        Terminées
      </div>
      
      <div 
        class="tab"
        :class="{ active: activeTab === 'drafts' }"
        @click="activeTab = 'drafts'"
      >
        <i class="fas fa-edit"></i>
        Brouillons
      </div>
    </div>

    <!-- Evaluations List -->
    <div class="evaluations-content">
      <!-- Pending Evaluations -->
      <div v-if="activeTab === 'pending'" class="tab-content">
        <div class="evaluations-grid">
          <div 
            v-for="evaluation in pendingEvaluations"
            :key="evaluation.id"
            class="evaluation-card"
          >
            <div class="evaluation-header">
              <div class="student-info">
                <div class="avatar">
                  <i class="fas fa-user-graduate"></i>
                </div>
                <div>
                  <h4>{{ evaluation.student.prenom }} {{ evaluation.student.name }}</h4>
                  <p>{{ evaluation.internship.service.name }}</p>
                </div>
              </div>
              <StatusBadge status="pending" />
            </div>
            
            <div class="evaluation-details">
              <div class="detail-row">
                <div class="detail-item">
                  <label>Période du stage:</label>
                  <span>
                    {{ formatDate(evaluation.internship.start_date) }} - 
                    {{ formatDate(evaluation.internship.end_date) }}
                  </span>
                </div>
                
                <div class="detail-item">
                  <label>Échéance:</label>
                  <span class="due-date" :class="{ 'overdue': isOverdue(evaluation.due_date) }">
                    {{ formatDate(evaluation.due_date) }}
                  </span>
                </div>
              </div>
              
              <div class="progress-section" v-if="evaluation.progress">
                <label>Progression:</label>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: evaluation.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ evaluation.progress }}%</span>
              </div>
            </div>
            
            <div class="evaluation-actions">
              <button 
                class="btn btn-primary"
                @click="startEvaluation(evaluation)"
              >
                <i class="fas fa-play-circle"></i>
                Commencer
              </button>
              
              <button 
                class="btn btn-outline"
                @click="viewStudentProfile(evaluation.student)"
              >
                <i class="fas fa-eye"></i>
                Profil
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="pendingEvaluations.length === 0" class="empty-state">
          <i class="fas fa-clipboard-check"></i>
          <h3>Aucune évaluation en attente</h3>
          <p>Toutes vos évaluations sont à jour.</p>
        </div>
      </div>

      <!-- Completed Evaluations -->
      <div v-if="activeTab === 'completed'" class="tab-content">
        <DataTable :items="completedEvaluations" :columns="completedColumns">
          <template #cell-student_name="{ item }">
            {{ item.student.prenom }} {{ item.student.name }}
          </template>
          
          <template #cell-evaluation_date="{ item }">
            {{ formatDate(item.evaluation_date) }}
          </template>
          
          <template #cell-grade="{ item }">
            <div class="grade-display">
              <span class="grade-value">{{ item.grade }}</span>
              <span class="grade-max">/20</span>
            </div>
          </template>
          
          <template #cell-status="{ item }">
            <StatusBadge status="completed" />
          </template>
          
          <template #cell-actions="{ item }">
            <div class="action-buttons">
              <button 
                class="btn btn-outline btn-sm"
                @click="viewEvaluationReport(item)"
              >
                <i class="fas fa-eye"></i>
                Voir
              </button>
              
              <button 
                class="btn btn-outline btn-sm"
                @click="editEvaluation(item)"
              >
                <i class="fas fa-edit"></i>
                Modifier
              </button>
              
              <button 
                class="btn btn-outline btn-sm"
                @click="downloadEvaluationPDF(item)"
              >
                <i class="fas fa-download"></i>
                PDF
              </button>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Draft Evaluations -->
      <div v-if="activeTab === 'drafts'" class="tab-content">
        <div class="drafts-list">
          <div 
            v-for="draft in draftEvaluations"
            :key="draft.id"
            class="draft-card"
          >
            <div class="draft-header">
              <h4>{{ draft.student.prenom }} {{ draft.student.name }}</h4>
              <span class="draft-date">
                Modifié le {{ formatDate(draft.updated_at) }}
              </span>
            </div>
            
            <div class="draft-preview">
              <p>{{ draft.comments ? truncateText(draft.comments, 100) : 'Aucun commentaire' }}</p>
            </div>
            
            <div class="draft-actions">
              <button 
                class="btn btn-primary btn-sm"
                @click="continueEvaluation(draft)"
              >
                <i class="fas fa-edit"></i>
                Continuer
              </button>
              
              <button 
                class="btn btn-outline btn-sm"
                @click="deleteDraft(draft)"
              >
                <i class="fas fa-trash"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="draftEvaluations.length === 0" class="empty-state">
          <i class="fas fa-edit"></i>
          <h3>Aucun brouillon</h3>
          <p>Vous n'avez pas d'évaluations en cours de rédaction.</p>
        </div>
      </div>
    </div>

    <!-- Evaluation Form Modal -->
    <Modal 
      v-if="showEvaluationModal"
      :show="showEvaluationModal"
      @close="closeEvaluationModal"
      title="Formulaire d'Évaluation"
      size="large"
    >
      <EvaluationForm 
        :evaluation="currentEvaluation"
        :student="currentStudent"
        @submit="submitEvaluation"
        @save-draft="saveEvaluationDraft"
        @cancel="closeEvaluationModal"
      />
    </Modal>

    <!-- Evaluation Report Modal -->
    <Modal 
      v-if="selectedEvaluation"
      :show="showReportModal"
      @close="closeReportModal"
      :title="`Rapport d'Évaluation - ${selectedEvaluation.student.prenom} ${selectedEvaluation.student.name}`"
      size="large"
    >
      <EvaluationReport 
        :evaluation="selectedEvaluation"
        @download="downloadEvaluationPDF(selectedEvaluation)"
        @edit="editEvaluation(selectedEvaluation)"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EvaluationForm from './components/EvaluationForm.vue'
import EvaluationReport from './components/EvaluationReport.vue'

export default {
  name: 'DoctorEvaluations',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    EvaluationForm,
    EvaluationReport
  },
  data() {
    return {
      activeTab: 'pending',
      completedColumns: [
        { key: 'student_name', label: 'Stagiaire' },
        { key: 'internship.service.name', label: 'Service' },
        { key: 'evaluation_date', label: 'Date évaluation' },
        { key: 'grade', label: 'Note' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' }
      ],
      showEvaluationModal: false,
      showReportModal: false,
      currentEvaluation: null,
      currentStudent: null,
      selectedEvaluation: null,
      loading: false
    }
  },
  computed: {
    ...mapState('doctor', ['evaluations', 'drafts']),
    
    pendingEvaluations() {
      return this.evaluations.filter(evals => evals.status === 'pending')
    },
    
    completedEvaluations() {
      return this.evaluations.filter(evals => evals.status === 'completed')
    },
    
    draftEvaluations() {
      return this.drafts
    }
  },
  async created() {
    await this.loadEvaluations()
  },
  methods: {
    ...mapActions('doctor', [
      'fetchEvaluations', 
      'fetchDrafts', 
      'submitEvaluation', 
      'saveDraft',
      'deleteDraft'
    ]),
    
    async loadEvaluations() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchEvaluations(),
          this.fetchDrafts()
        ])
      } catch (error) {
        console.error('Error loading evaluations:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les évaluations.'
        })
      } finally {
        this.loading = false
      }
    },
    
    showEvaluationForm() {
      this.currentEvaluation = null
      this.currentStudent = null
      this.showEvaluationModal = true
    },
    
    startEvaluation(evaluation) {
      this.currentEvaluation = evaluation
      this.currentStudent = evaluation.student
      this.showEvaluationModal = true
    },
    
    continueEvaluation(draft) {
      this.currentEvaluation = draft
      this.currentStudent = draft.student
      this.showEvaluationModal = true
    },
    
    closeEvaluationModal() {
      this.showEvaluationModal = false
      this.currentEvaluation = null
      this.currentStudent = null
    },
    
    viewEvaluationReport(evaluation) {
      this.selectedEvaluation = evaluation
      this.showReportModal = true
    },
    
    closeReportModal() {
      this.selectedEvaluation = null
      this.showReportModal = false
    },
    
    async submitEvaluation(evaluationData) {
      try {
        await this.submitEvaluation(evaluationData)
        this.closeEvaluationModal()
        this.$notify({
          type: 'success',
          title: 'Évaluation soumise',
          message: 'L\'évaluation a été enregistrée avec succès.'
        })
        await this.loadEvaluations()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de soumettre l\'évaluation.'
        })
      }
    },
    
    async saveEvaluationDraft(draftData) {
      try {
        await this.saveDraft(draftData)
        this.closeEvaluationModal()
        this.$notify({
          type: 'success',
          title: 'Brouillon sauvegardé',
          message: 'Votre brouillon a été sauvegardé.'
        })
        await this.loadEvaluations()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de sauvegarder le brouillon.'
        })
      }
    },
    
    async deleteDraft(draft) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce brouillon ?')) {
        return
      }
      
      try {
        await this.deleteDraft(draft.id)
        this.$notify({
          type: 'success',
          title: 'Brouillon supprimé',
          message: 'Le brouillon a été supprimé.'
        })
        await this.loadEvaluations()
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer le brouillon.'
        })
      }
    },
    
    editEvaluation(evaluation) {
      this.currentEvaluation = evaluation
      this.currentStudent = evaluation.student
      this.showEvaluationModal = true
      this.closeReportModal()
    },
    
    downloadEvaluationPDF(evaluation) {
      // Implement PDF download
      this.$notify({
        type: 'info',
        title: 'Téléchargement',
        message: 'Génération du PDF en cours...'
      })
    },
    
    viewStudentProfile(student) {
      this.$router.push({
        name: 'doctor-student-profile',
        params: { studentId: student.id }
      })
    },
    
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date()
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    },
    
    truncateText(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text
    }
  }
}
</script>

<style scoped>
.doctor-evaluations {
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

.evaluation-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
  color: var(--text-light);
}

.tab:hover {
  background: var(--secondary);
}

.tab.active {
  background: var(--medical);
  color: white;
}

.tab-badge {
  background: var(--danger);
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.evaluations-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.evaluation-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.evaluation-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--medical);
  font-size: 1.2rem;
}

.student-info h4 {
  margin: 0 0 4px 0;
  color: var(--text);
}

.student-info p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.evaluation-details {
  margin-bottom: 20px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

.detail-item span {
  color: var(--text);
  font-weight: 500;
}

.due-date.overdue {
  color: var(--danger);
  font-weight: 600;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-section label {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
  min-width: 80px;
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
  background: var(--medical);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--text-light);
  min-width: 40px;
  text-align: right;
}

.evaluation-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--border);
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text);
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.draft-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  background: var(--secondary);
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.draft-header h4 {
  margin: 0;
  color: var(--text);
}

.draft-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.draft-preview {
  margin-bottom: 15px;
}

.draft-preview p {
  margin: 0;
  color: var(--text);
  font-style: italic;
}

.draft-actions {
  display: flex;
  gap: 10px;
}
</style>