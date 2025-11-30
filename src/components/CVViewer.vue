<template>
  <div class="cv-viewer">
    <div class="viewer-header">
      <div class="student-info">
        <h4>CV - {{ student.prenom }} {{ student.name }}</h4>
        <p>Dernière mise à jour: {{ formatDate(student.cv_last_updated) }}</p>
      </div>
      <div class="viewer-actions">
        <button class="btn btn-primary" @click="$emit('download')">
          <i class="fas fa-download"></i> Télécharger
        </button>
      </div>
    </div>

    <div class="cv-content">
      <!-- PDF Viewer Placeholder -->
      <div class="pdf-placeholder">
        <i class="fas fa-file-pdf"></i>
        <h5>Aperçu du CV</h5>
        <p>Le contenu du CV s'affichera ici</p>
        <div class="placeholder-actions">
          <button class="btn btn-outline">
            <i class="fas fa-expand"></i> Plein écran
          </button>
          <button class="btn btn-outline">
            <i class="fas fa-print"></i> Imprimer
          </button>
        </div>
      </div>
    </div>

    <div class="cv-metadata">
      <h5>Informations du CV</h5>
      <div class="metadata-grid">
        <div class="metadata-item">
          <label>Format:</label>
          <span>PDF</span>
        </div>
        <div class="metadata-item">
          <label>Taille:</label>
          <span>2.4 MB</span>
        </div>
        <div class="metadata-item">
          <label>Pages:</label>
          <span>3</span>
        </div>
        <div class="metadata-item">
          <label>Dernier accès:</label>
          <span>{{ formatDate(student.cv_last_accessed) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CVViewer',
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'Non disponible'
      return new Date(date).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.cv-viewer {
  padding: 10px 0;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
}

.student-info h4 {
  margin: 0 0 5px 0;
  color: var(--medical);
}

.student-info p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.cv-content {
  margin-bottom: 20px;
}

.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--secondary);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.pdf-placeholder i {
  font-size: 4rem;
  color: var(--danger);
  margin-bottom: 15px;
}

.pdf-placeholder h5 {
  margin: 0 0 10px 0;
  color: var(--text);
}

.pdf-placeholder p {
  margin: 0 0 20px 0;
  color: var(--text-light);
}

.placeholder-actions {
  display: flex;
  gap: 10px;
}

.cv-metadata {
  padding: 15px;
  background: var(--secondary);
  border-radius: 8px;
}

.cv-metadata h5 {
  margin: 0 0 15px 0;
  color: var(--medical);
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.metadata-item label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.metadata-item span {
  color: var(--text);
}
</style>