<template>
  <div class="student-profile">
    <div class="page-header">
      <h1>Mon Profil Étudiant</h1>
      <button class="btn btn-primary" @click="editProfile">
        <i class="fas fa-edit"></i> Modifier le profil
      </button>
    </div>

    <div class="profile-container">
      <!-- Sidebar Navigation -->
      <div class="profile-sidebar">
        <div class="profile-avatar">
          <div class="avatar">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h3>{{ student.prenom }} {{ student.name }}</h3>
          <p>Étudiant en Médecine</p>
          <StatusBadge :status="student.actif_status ? 'approved' : 'inactive'" />
        </div>
        
        <ul class="profile-nav">
          <li>
            <a 
              href="#" 
              :class="{ active: activeTab === 'personal' }"
              @click.prevent="setActiveTab('personal')"
            >
              Informations personnelles
            </a>
          </li>
          <li>
            <a 
              href="#" 
              :class="{ active: activeTab === 'documents' }"
              @click.prevent="setActiveTab('documents')"
            >
              Documents et CV
            </a>
          </li>
          <li>
            <a 
              href="#" 
              :class="{ active: activeTab === 'academic' }"
              @click.prevent="setActiveTab('academic')"
            >
              Historique académique
            </a>
          </li>
          <li>
            <a 
              href="#" 
              :class="{ active: activeTab === 'preferences' }"
              @click.prevent="setActiveTab('preferences')"
            >
              Préférences
            </a>
          </li>
          <li>
            <a 
              href="#" 
              :class="{ active: activeTab === 'security' }"
              @click.prevent="setActiveTab('security')"
            >
              Sécurité du compte
            </a>
          </li>
        </ul>
      </div>

      <!-- Profile Content -->
      <div class="profile-content">
        <!-- Personal Information Tab -->
        <div v-if="activeTab === 'personal'" class="profile-tab">
          <h2>Informations Personnelles</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Nom complet</label>
              <div class="info-value">{{ student.prenom }} {{ student.name }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Date de naissance</label>
              <div class="info-value">{{ formatDate(student.date_of_birth) }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Lieu de naissance</label>
              <div class="info-value">{{ student.place_of_birth }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Adresse</label>
              <div class="info-value">{{ student.address }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Téléphone</label>
              <div class="info-value">{{ student.telephone }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Adresse email</label>
              <div class="info-value">{{ student.email }}</div>
            </div>
          </div>

          <h3>Informations Académiques</h3>
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Date d'inscription</label>
              <div class="info-value">{{ formatDate(student.date_of_enrollment) }}</div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Statut</label>
              <div class="info-value">
                <StatusBadge :status="student.actif_status ? 'approved' : 'inactive'" />
              </div>
            </div>
            
            <div class="info-item">
              <label class="info-label">Faculté</label>
              <div class="info-value">{{ student.doyen?.name || 'Faculté de Médecine' }}</div>
            </div>
          </div>
        </div>

        <!-- Documents and CV Tab -->
        <div v-if="activeTab === 'documents'" class="profile-tab">
          <h2>Documents et Pièces Justificatives</h2>
          <p class="info-label">Gérez vos documents personnels et votre CV pour vos candidatures de stage</p>

          <!-- Upload Area -->
          <div class="upload-area" @click="triggerFileUpload">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h4>Déposer des fichiers</h4>
            <p>Glissez-déposez vos fichiers ici ou cliquez pour parcourir</p>
            <small>Formats acceptés: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</small>
            <input 
              type="file" 
              ref="fileInput"
              multiple 
              style="display: none" 
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            >
          </div>

          <!-- Documents List -->
          <h3>Mes Documents</h3>
          <div class="documents-grid">
            <DocumentCard 
              v-for="document in documents"
              :key="document.id"
              :document="document"
              @view="viewDocument(document)"
              @download="downloadDocument(document)"
              @delete="deleteDocument(document)"
            />
          </div>

          <!-- No Documents -->
          <div v-if="documents.length === 0" class="no-documents">
            <i class="fas fa-folder-open"></i>
            <h4>Aucun document</h4>
            <p>Commencez par uploader vos documents pour compléter votre profil.</p>
          </div>
        </div>

        <!-- Academic History Tab -->
        <div v-if="activeTab === 'academic'" class="profile-tab">
          <h2>Historique Académique</h2>
          
          <div class="academic-stats">
            <div class="stat-card">
              <div class="stat-number">{{ completedInternships }}</div>
              <div class="stat-label">Stages validés</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ averageGrade }}</div>
              <div class="stat-label">Moyenne générale</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalEvaluationCount }}</div>
              <div class="stat-label">Évaluations</div>
            </div>
          </div>

          <h3>Stages Validés</h3>
          <DataTable :items="completedInternshipsList" :columns="internshipColumns">
            <template #cell-actions="{ item }">
              <button class="btn btn-outline btn-sm" @click="viewInternshipDetails(item)">
                Voir détails
              </button>
            </template>
          </DataTable>

          <h3>Évaluations</h3>
          <div class="evaluations-list">
            <div 
              v-for="evaluation in recentEvaluations"
              :key="evaluation.id"
              class="evaluation-item"
            >
              <div class="evaluation-info">
                <h5>{{ evaluation.internship?.service_name }}</h5>
                <p>Encadrant: Dr. {{ evaluation.doctor?.prenom }} {{ evaluation.doctor?.name }}</p>
                <small>{{ formatDate(evaluation.evaluation_date) }}</small>
              </div>
              <div class="evaluation-grade">
                <span class="grade">{{ parseGrade(evaluation.evalyation) }}</span>
                <span class="grade-max">/20</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="profile-tab">
          <h2>Sécurité du Compte</h2>
          
          <div class="security-section">
            <h3>Changer le mot de passe</h3>
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <label>Mot de passe actuel</label>
                <input 
                  type="password" 
                  v-model="passwordForm.currentPassword"
                  class="form-control"
                  required
                >
              </div>
              <div class="form-group">
                <label>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  v-model="passwordForm.newPassword"
                  class="form-control"
                  required
                  minlength="8"
                >
              </div>
              <div class="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  v-model="passwordForm.confirmPassword"
                  class="form-control"
                  required
                >
              </div>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="!passwordsMatch || updatingPassword"
              >
                <LoadingSpinner v-if="updatingPassword" small />
                {{ updatingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
              </button>
            </form>
          </div>

          <div class="security-section">
            <h3>Journal de Connexion</h3>
            <DataTable :items="loginHistory" :columns="loginHistoryColumns" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Modal 
      v-if="showEditModal"
      :show="showEditModal"
      @close="closeEditModal"
      title="Modifier le profil"
      size="large"
    >
      <EditProfileForm 
        :student="student"
        @submit="updateProfile"
        @cancel="closeEditModal"
      />
    </Modal>

    <!-- Document Viewer Modal -->
    <Modal 
      v-if="selectedDocument"
      :show="showDocumentModal"
      @close="closeDocumentModal"
      :title="selectedDocument.title"
      size="large"
    >
      <DocumentViewer 
        :document="selectedDocument"
        @download="downloadDocument(selectedDocument)"
      />
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DataTable from '@/components/shared/DataTable.vue'
import Modal from '@/components/shared/Modal.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import DocumentCard from './components/DocumentCard.vue'
import EditProfileForm from './components/EditProfileForm.vue'
import DocumentViewer from './components/DocumentViewer.vue'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'StudentProfile',
  components: {
    DataTable,
    Modal,
    StatusBadge,
    LoadingSpinner,
    DocumentCard,
    EditProfileForm,
    DocumentViewer
  },
  data() {
    return {
      activeTab: 'personal',
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      selectedDocument: null,
      showEditModal: false,
      showDocumentModal: false,
      updatingPassword: false,
      loginHistoryColumns: [
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Heure' },
        { key: 'ip_address', label: 'Adresse IP' },
        { key: 'status', label: 'Statut' }
      ],
      internshipColumns: [
        { key: 'service_name', label: 'Service' },
        { key: 'establishment_name', label: 'Hôpital' },
        { key: 'period', label: 'Période' },
        { key: 'final_grade', label: 'Note finale' },
        { key: 'actions', label: 'Actions' }
      ]
    }
  },
  computed: {
    ...mapState('student', ['student', 'documents', 'loginHistory', 'internships', 'evaluations']),
    
    completedInternships() {
      return this.internships.filter(i => i.status === 'completed').length
    },
    
    completedInternshipsList() {
      return this.internships.filter(i => i.status === 'completed').map(internship => {
        const evaluation = this.evaluations.find(e => 
          e.internship?.id === internship.id && e.type === 'doctor_evaluation'
        )
        return {
          ...internship,
          final_grade: evaluation ? this.parseGrade(evaluation.evalyation) : '-'
        }
      })
    },
    
    recentEvaluations() {
      return this.evaluations
        .filter(e => e.type === 'doctor_evaluation' && e.evalyation)
        .slice(0, 5)
    },
    
    averageGrade() {
      const gradedEvaluations = this.evaluations.filter(e => 
        e.type === 'doctor_evaluation' && e.evalyation
      )
      
      if (gradedEvaluations.length === 0) return '-'
      
      const total = gradedEvaluations.reduce((sum, evalItem) => {
        return sum + this.parseGrade(evalItem.evalyation)
      }, 0)
      
      return (total / gradedEvaluations.length).toFixed(1)
    },
    
    totalEvaluationCount() {
      return this.evaluations.length
    },
    
    passwordsMatch() {
      return this.passwordForm.newPassword === this.passwordForm.confirmPassword
    }
  },
  async created() {
    await this.loadProfileData()
  },
  methods: {
    ...mapState('student', [
      'fetchStudentProfile',
      'fetchDocuments',
      'fetchLoginHistory',
      'updateStudentProfile',
      'changePassword',
      'uploadDocument',
      'deleteDocument'
    ]),
    
    async loadProfileData() {
      try {
        await Promise.all([
          this.fetchStudentProfile(),
          this.fetchDocuments(),
          this.fetchLoginHistory()
        ])
      } catch (error) {
        console.error('Error loading profile data:', error)
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les données du profil.'
        })
      }
    },
    
    setActiveTab(tab) {
      this.activeTab = tab
    },
    
    editProfile() {
      this.showEditModal = true
    },
    
    closeEditModal() {
      this.showEditModal = false
    },
    
    async updateProfile(profileData) {
      try {
        await this.updateStudentProfile(profileData)
        this.closeEditModal()
        this.$notify({
          type: 'success',
          title: 'Profil mis à jour',
          message: 'Votre profil a été mis à jour avec succès.'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de mettre à jour votre profil.'
        })
      }
    },
    
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },
    
    async handleFileUpload(event) {
      const files = event.target.files
      if (files.length === 0) return
      
      try {
        for (let file of files) {
          await this.uploadDocument(file)
        }
        this.$notify({
          type: 'success',
          title: 'Documents uploadés',
          message: 'Vos documents ont été uploadés avec succès.'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'uploader les documents.'
        })
      }
      
      // Reset file input
      event.target.value = ''
    },
    
    viewDocument(document) {
      this.selectedDocument = document
      this.showDocumentModal = true
    },
    
    closeDocumentModal() {
      this.selectedDocument = null
      this.showDocumentModal = false
    },
    
    async downloadDocument(document) {
      try {
        // Implement document download
        console.log('Downloading document:', document)
        this.$notify({
          type: 'info',
          title: 'Téléchargement',
          message: 'Téléchargement du document en cours...'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de télécharger le document.'
        })
      }
    },
    
    async deleteDocument(document) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
        return
      }
      
      try {
        await this.deleteDocument(document.id)
        this.$notify({
          type: 'success',
          title: 'Document supprimé',
          message: 'Le document a été supprimé avec succès.'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer le document.'
        })
      }
    },
    
    async changePassword() {
      if (!this.passwordsMatch) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Les mots de passe ne correspondent pas.'
        })
        return
      }
      
      this.updatingPassword = true
      try {
        await this.changePassword(this.passwordForm)
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        this.$notify({
          type: 'success',
          title: 'Mot de passe mis à jour',
          message: 'Votre mot de passe a été changé avec succès.'
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de changer le mot de passe.'
        })
      } finally {
        this.updatingPassword = false
      }
    },
    
    viewInternshipDetails(internship) {
      this.$router.push({ 
        name: 'student-planning', 
        query: { internship_id: internship.id }
      })
    },
    
    parseGrade(gradeString) {
      if (!gradeString) return '-'
      const match = gradeString.match(/(\d+(\.\d+)?)/)
      return match ? parseFloat(match[1]).toFixed(1) : '-'
    },
    
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style scoped>
.student-profile {
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

.profile-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.profile-sidebar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 40px;
  color: var(--medical);
  border: 3px solid var(--medical);
}

.profile-avatar h3 {
  margin: 0 0 5px 0;
  color: var(--text);
}

.profile-avatar p {
  margin: 0 0 10px 0;
  color: var(--text-light);
}

.profile-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile-nav li {
  margin-bottom: 5px;
}

.profile-nav a {
  display: block;
  padding: 12px 15px;
  color: var(--text);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.profile-nav a:hover,
.profile-nav a.active {
  background: var(--medical);
  color: white;
}

.profile-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.profile-tab h2 {
  color: var(--medical);
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 5px;
  display: block;
}

.info-value {
  font-size: 16px;
  color: var(--text);
}

.upload-area {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 30px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: var(--medical);
}

.upload-icon {
  font-size: 50px;
  color: var(--medical);
  margin-bottom: 15px;
}

.upload-area h4 {
  margin-bottom: 10px;
  color: var(--text);
}

.upload-area p {
  margin-bottom: 5px;
  color: var(--text-light);
}

.upload-area small {
  color: var(--text-light);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.no-documents {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
}

.no-documents i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: var(--border);
}

.academic-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--secondary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
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

.evaluations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.evaluation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.evaluation-info h5 {
  margin: 0 0 5px 0;
  color: var(--text);
}

.evaluation-info p {
  margin: 0 0 5px 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.evaluation-info small {
  color: var(--text-light);
}

.evaluation-grade {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.grade {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--medical);
}

.grade-max {
  color: var(--text-light);
}

.security-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.security-section:last-child {
  border-bottom: none;
}

.security-section h3 {
  color: var(--medical);
  margin-bottom: 20px;
}

@media (max-width: 992px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    order: 2;
  }
  
  .profile-content {
    order: 1;
  }
}
</style>