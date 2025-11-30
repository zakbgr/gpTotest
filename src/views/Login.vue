<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-form">
        <div class="login-logo">
          <i class="fas fa-stethoscope"></i>
          <h1>StagesMédicaux</h1>
          <p>Plateforme de gestion des stages médicaux</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form-content">
          <div class="form-group">
            <label for="login-email">Adresse email ou Numéro étudiant</label>
            <input
              v-model="loginForm.email"
              type="text"
              id="login-email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="votre@email.dz ou 2025001"
              required
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <div class="form-group">
            <label for="login-password">Mot de passe</label>
            <input
              v-model="loginForm.password"
              type="password"
              id="login-password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="Votre mot de passe"
              required
            />
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="login-role">Je suis</label>
            <select
              v-model="loginForm.role"
              id="login-role"
              class="form-control"
              :class="{ 'is-invalid': errors.role }"
              required
            >
              <option value="">Sélectionnez votre rôle</option>
              <option value="student">Étudiant</option>
              <option value="doctor">Docteur Encadrant</option>
              <option value="hospital_admin">Administrateur Hôpital</option>
              <option value="doyen">Doyen</option>
            </select>
            <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
          </div>

          <button 
            type="submit" 
            class="btn btn-medical btn-block"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Se connecter</span>
          </button>

          <div class="login-links">
            <a href="#" @click.prevent="showForgotPassword = true">Mot de passe oublié ?</a>
            <br>
            <a href="#" @click.prevent="showRegistration = true">Créer un compte étudiant</a>
          </div>
        </form>
      </div>
    </div>

    <div class="login-right">
      <div class="login-features">
        <h2>Bienvenue sur la plateforme</h2>
        <p>Gestion centralisée des stages médicaux pour la Wilaya de Boumerdès</p>
        
        <ul class="feature-list">
          <li><i class="fas fa-check-circle"></i> Gestion simplifiée des stages</li>
          <li><i class="fas fa-check-circle"></i> Candidatures en ligne</li>
          <li><i class="fas fa-check-circle"></i> Évaluations numériques</li>
          <li><i class="fas fa-check-circle"></i> Planning interactif</li>
          <li><i class="fas fa-check-circle"></i> Communication centralisée</li>
          <li><i class="fas fa-check-circle"></i> Affectation automatique</li>
        </ul>
      </div>
    </div>

    <!-- Modal Mot de passe oublié -->
    <Modal
      v-if="showForgotPassword"
      :show="showForgotPassword"
      title="Réinitialisation du mot de passe"
      @update:show="showForgotPassword = false"
    >
      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label>Adresse email</label>
          <input
            v-model="forgotPasswordForm.email"
            type="email"
            class="form-control"
            placeholder="votre@email.dz"
            required
          />
        </div>
        <div class="form-group">
          <label>Rôle</label>
          <select
            v-model="forgotPasswordForm.role"
            class="form-control"
            required
          >
            <option value="">Sélectionnez votre rôle</option>
            <option value="student">Étudiant</option>
            <option value="doctor">Docteur</option>
            <option value="hospital_admin">Administrateur Hôpital</option>
            <option value="doyen">Doyen</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-medical btn-block"
          :disabled="forgotPasswordLoading"
        >
          <i v-if="forgotPasswordLoading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Envoyer le lien de réinitialisation</span>
        </button>
      </form>
      
      <template #footer>
        <button 
          class="btn btn-outline" 
          @click="showForgotPassword = false"
        >
          Annuler
        </button>
      </template>
    </Modal>

    <!-- Modal Inscription -->
    <Modal
      v-if="showRegistration"
      :show="showRegistration"
      title="Inscription Étudiant"
      size="large"
      @update:show="showRegistration = false"
    >
      <div class="registration-steps">
        <div 
          v-for="step in registrationSteps" 
          :key="step.number"
          class="step"
          :class="{ active: currentStep === step.number }"
        >
          <div class="step-number">{{ step.number }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>

      <form @submit.prevent="handleRegistration" class="registration-form">
        <!-- Étape 1: Informations personnelles -->
        <div v-if="currentStep === 1" class="registration-step">
          <div class="form-group">
            <label>Nom</label>
            <input
              v-model="registrationForm.last_name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.last_name }"
              required
            />
            <div v-if="registrationErrors.last_name" class="form-error">
              {{ registrationErrors.last_name }}
            </div>
          </div>
          <div class="form-group">
            <label>Prénom</label>
            <input
              v-model="registrationForm.first_name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.first_name }"
              required
            />
            <div v-if="registrationErrors.first_name" class="form-error">
              {{ registrationErrors.first_name }}
            </div>
          </div>
          <div class="form-group">
            <label>Date de naissance</label>
            <input
              v-model="registrationForm.date_of_birth"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.date_of_birth }"
              required
            />
            <div v-if="registrationErrors.date_of_birth" class="form-error">
              {{ registrationErrors.date_of_birth }}
            </div>
          </div>
          <div class="form-group">
            <label>Lieu de naissance</label>
            <input
              v-model="registrationForm.place_of_birth"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.place_of_birth }"
              required
            />
            <div v-if="registrationErrors.place_of_birth" class="form-error">
              {{ registrationErrors.place_of_birth }}
            </div>
          </div>
          
          <button 
            type="button" 
            class="btn btn-medical btn-block"
            @click="nextStep"
          >
            Suivant
          </button>
        </div>

        <!-- Étape 2: Informations académiques -->
        <div v-if="currentStep === 2" class="registration-step">
          <div class="form-group">
            <label>Numéro étudiant</label>
            <input
              v-model="registrationForm.student_number"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.student_number }"
              required
            />
            <div v-if="registrationErrors.student_number" class="form-error">
              {{ registrationErrors.student_number }}
            </div>
          </div>
          <div class="form-group">
            <label>Faculté</label>
            <select
              v-model="registrationForm.faculty"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.faculty }"
              required
            >
              <option value="">Sélectionnez votre faculté</option>
              <option value="medecine">Faculté de Médecine - Université de Boumerdès</option>
            </select>
            <div v-if="registrationErrors.faculty" class="form-error">
              {{ registrationErrors.faculty }}
            </div>
          </div>
          <div class="form-group">
            <label>Année d'étude</label>
            <select
              v-model="registrationForm.year"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.year }"
              required
            >
              <option value="">Sélectionnez votre année</option>
              <option value="2">2ème année</option>
              <option value="3">3ème année</option>
              <option value="4">4ème année</option>
              <option value="5">5ème année</option>
              <option value="interne">Interne</option>
            </select>
            <div v-if="registrationErrors.year" class="form-error">
              {{ registrationErrors.year }}
            </div>
          </div>
          <div class="form-group">
            <label>Spécialité</label>
            <input
              v-model="registrationForm.specialty"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.specialty }"
              required
            />
            <div v-if="registrationErrors.specialty" class="form-error">
              {{ registrationErrors.specialty }}
            </div>
          </div>
          
          <div class="step-actions">
            <button 
              type="button" 
              class="btn btn-outline"
              @click="prevStep"
            >
              Précédent
            </button>
            <button 
              type="button" 
              class="btn btn-medical"
              @click="nextStep"
            >
              Suivant
            </button>
          </div>
        </div>

        <!-- Étape 3: Compte et validation -->
        <div v-if="currentStep === 3" class="registration-step">
          <div class="form-group">
            <label>Adresse email</label>
            <input
              v-model="registrationForm.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.email }"
              required
            />
            <div v-if="registrationErrors.email" class="form-error">
              {{ registrationErrors.email }}
            </div>
          </div>
          <div class="form-group">
            <label>Numéro de téléphone</label>
            <input
              v-model="registrationForm.telephone"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.telephone }"
              required
            />
            <div v-if="registrationErrors.telephone" class="form-error">
              {{ registrationErrors.telephone }}
            </div>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input
              v-model="registrationForm.password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.password }"
              required
            />
            <div v-if="registrationErrors.password" class="form-error">
              {{ registrationErrors.password }}
            </div>
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              v-model="registrationForm.password_confirmation"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': registrationErrors.password_confirmation }"
              required
            />
            <div v-if="registrationErrors.password_confirmation" class="form-error">
              {{ registrationErrors.password_confirmation }}
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="registrationForm.terms_accepted"
                type="checkbox"
                required
              />
              <span class="checkmark"></span>
              J'accepte les conditions d'utilisation et la politique de confidentialité
            </label>
          </div>
          
          <div class="step-actions">
            <button 
              type="button" 
              class="btn btn-outline"
              @click="prevStep"
            >
              Précédent
            </button>
            <button 
              type="submit" 
              class="btn btn-medical"
              :disabled="registrationLoading"
            >
              <i v-if="registrationLoading" class="fas fa-spinner fa-spin"></i>
              <span v-else>Créer mon compte</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { authService } from '../services/auth'
import Modal from '../components/shared/Modal.vue'

export default {
  name: 'Login',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // États pour la connexion
    const loginForm = reactive({
      email: '',
      password: '',
      role: ''
    })
    
    const errors = reactive({})
    const loading = ref(false)
    
    // États pour l'inscription
    const showRegistration = ref(false)
    const currentStep = ref(1)
    const registrationLoading = ref(false)
    
    const registrationForm = reactive({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      place_of_birth: '',
      student_number: '',
      faculty: '',
      year: '',
      specialty: '',
      email: '',
      telephone: '',
      password: '',
      password_confirmation: '',
      terms_accepted: false
    })
    
    const registrationErrors = reactive({})
    
    // États pour mot de passe oublié
    const showForgotPassword = ref(false)
    const forgotPasswordLoading = ref(false)
    const forgotPasswordForm = reactive({
      email: '',
      role: ''
    })

    // Étapes d'inscription
    const registrationSteps = [
      { number: 1, label: 'Informations personnelles' },
      { number: 2, label: 'Informations académiques' },
      { number: 3, label: 'Compte et validation' }
    ]

    // Méthodes de connexion
    const handleLogin = async () => {
      // Réinitialiser les erreurs
      Object.keys(errors).forEach(key => delete errors[key])
      loading.value = true

      try {
        const result = await authStore.login(loginForm)
        
        if (result.success) {
          // Redirection vers la sélection de rôle
          router.push('/role-selection')
        } else {
          // Gérer les erreurs
          if (result.error) {
            errors.general = result.error
          }
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        errors.general = 'Une erreur est survenue lors de la connexion'
      } finally {
        loading.value = false
      }
    }

    // Méthodes d'inscription
    const nextStep = () => {
      if (validateStep(currentStep.value)) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      currentStep.value--
    }

    const validateStep = (step) => {
      const stepErrors = {}
      
      switch (step) {
        case 1:
          if (!registrationForm.last_name.trim()) {
            stepErrors.last_name = 'Le nom est requis'
          }
          if (!registrationForm.first_name.trim()) {
            stepErrors.first_name = 'Le prénom est requis'
          }
          if (!registrationForm.date_of_birth) {
            stepErrors.date_of_birth = 'La date de naissance est requise'
          }
          if (!registrationForm.place_of_birth.trim()) {
            stepErrors.place_of_birth = 'Le lieu de naissance est requis'
          }
          break
        
        case 2:
          if (!registrationForm.student_number.trim()) {
            stepErrors.student_number = 'Le numéro étudiant est requis'
          }
          if (!registrationForm.faculty) {
            stepErrors.faculty = 'La faculté est requise'
          }
          if (!registrationForm.year) {
            stepErrors.year = "L'année d'étude est requise"
          }
          if (!registrationForm.specialty.trim()) {
            stepErrors.specialty = 'La spécialité est requise'
          }
          break
      }
      
      Object.assign(registrationErrors, stepErrors)
      return Object.keys(stepErrors).length === 0
    }

    const handleRegistration = async () => {
      if (!validateStep(3)) return
      
      registrationLoading.value = true
      
      try {
        const result = await authStore.registerStudent(registrationForm)
        
        if (result.success) {
          // Fermer le modal et afficher un message de succès
          showRegistration.value = false
          alert('Compte créé avec succès ! Un email de confirmation a été envoyé.')
          
          // Réinitialiser le formulaire
          resetRegistrationForm()
        } else {
          // Afficher les erreurs de validation
          if (result.error) {
            Object.assign(registrationErrors, result.error)
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        registrationErrors.general = 'Une erreur est survenue lors de l\'inscription'
      } finally {
        registrationLoading.value = false
      }
    }

    const resetRegistrationForm = () => {
      Object.keys(registrationForm).forEach(key => {
        if (typeof registrationForm[key] === 'boolean') {
          registrationForm[key] = false
        } else {
          registrationForm[key] = ''
        }
      })
      currentStep.value = 1
      Object.keys(registrationErrors).forEach(key => delete registrationErrors[key])
    }

    // Méthode mot de passe oublié
    const handleForgotPassword = async () => {
      forgotPasswordLoading.value = true
      
      try {
        await authService.forgotPassword(forgotPasswordForm)
        alert('Un lien de réinitialisation a été envoyé à votre adresse email.')
        showForgotPassword.value = false
        forgotPasswordForm.email = ''
        forgotPasswordForm.role = ''
      } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error)
        alert('Une erreur est survenue. Veuillez réessayer.')
      } finally {
        forgotPasswordLoading.value = false
      }
    }

    return {
      // États connexion
      loginForm,
      errors,
      loading,
      
      // États inscription
      showRegistration,
      currentStep,
      registrationForm,
      registrationErrors,
      registrationLoading,
      registrationSteps,
      
      // États mot de passe oublié
      showForgotPassword,
      forgotPasswordLoading,
      forgotPasswordForm,
      
      // Méthodes
      handleLogin,
      nextStep,
      prevStep,
      handleRegistration,
      handleForgotPassword
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #2a7a5c 0%, #1e5e46 100%);
}

.login-left {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
  text-align: center;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo i {
  font-size: 48px;
  color: #2a7a5c;
  margin-bottom: 15px;
}

.login-logo h1 {
  color: #2a7a5c;
  font-size: 28px;
  margin-bottom: 5px;
}

.login-logo p {
  color: #666;
  font-size: 14px;
}

.login-form-content {
  margin-top: 30px;
}

.login-links {
  text-align: center;
  margin-top: 20px;
}

.login-links a {
  color: #2a7a5c;
  text-decoration: none;
  font-size: 14px;
}

.login-links a:hover {
  text-decoration: underline;
}

.login-features {
  max-width: 500px;
}

.login-features h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

.login-features p {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.feature-list {
  list-style: none;
  text-align: left;
}

.feature-list li {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-list i {
  font-size: 20px;
  color: #fff;
}

/* Inscription */
.registration-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
}

.step.active .step-number {
  background: #2a7a5c;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.step.active .step-label {
  color: #2a7a5c;
  font-weight: 600;
}

.registration-form {
  max-width: 500px;
  margin: 0 auto;
}

.registration-step {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.step-actions .btn {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
  margin-bottom: 0;
}

.checkbox-label input {
  margin-top: 2px;
}

.is-invalid {
  border-color: #dc3545 !important;
}

.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-right {
    order: -1;
    padding: 20px;
  }
  
  .login-left {
    padding: 20px;
  }
  
  .registration-steps {
    flex-direction: column;
    gap: 10px;
  }
  
  .step {
    flex-direction: row;
    gap: 10px;
  }
  
  .step-label {
    text-align: left;
  }
}
</style>