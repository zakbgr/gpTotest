<template>
  <span class="status-badge" :class="statusClass">
    {{ statusText }}
  </span>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'default', // 'default' or 'outline'
      validator: (value) => ['default', 'outline'].includes(value)
    }
  },
  setup(props) {
    const statusConfig = {
      // Candidatures
      'pending': { text: 'En attente', class: 'pending' },
      'approved': { text: 'Acceptée', class: 'approved' },
      'rejected': { text: 'Refusée', class: 'rejected' },
      'submitted': { text: 'Soumise', class: 'submitted' },
      'withdrawn': { text: 'Retirée', class: 'withdrawn' },
      
      // Stages
      'draft': { text: 'Brouillon', class: 'draft' },
      'published': { text: 'Publiée', class: 'published' },
      'in_progress': { text: 'En cours', class: 'in-progress' },
      'completed': { text: 'Terminé', class: 'completed' },
      'cancelled': { text: 'Annulé', class: 'cancelled' },
      'upcoming': { text: 'À venir', class: 'upcoming' },
      
      // Évaluations
      'evaluated': { text: 'Évaluée', class: 'evaluated' },
      'pending_evaluation': { text: 'En attente', class: 'pending-evaluation' },
      'signed': { text: 'Signée', class: 'signed' },
      
      // Utilisateurs
      'active': { text: 'Actif', class: 'active' },
      'inactive': { text: 'Inactif', class: 'inactive' },
      'suspended': { text: 'Suspendu', class: 'suspended' }
    }

    const statusText = computed(() => {
      return statusConfig[props.status]?.text || props.status
    })

    const statusClass = computed(() => {
      const baseClass = statusConfig[props.status]?.class || 'default'
      return props.variant === 'outline' ? `${baseClass}-outline` : baseClass
    })

    return {
      statusText,
      statusClass
    }
  }
}
</script>

<style scoped>
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-transform: capitalize;
  white-space: nowrap;
}

/* Variantes par défaut */
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.approved { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.status-badge.submitted { background: #cce7ff; color: #004085; }
.status-badge.withdrawn { background: #e2e3e5; color: #383d41; }
.status-badge.draft { background: #e2e3e5; color: #383d41; }
.status-badge.published { background: #d4edda; color: #155724; }
.status-badge.in-progress { background: #cce7ff; color: #004085; }
.status-badge.completed { background: #d4edda; color: #155724; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
.status-badge.upcoming { background: #fff3cd; color: #856404; }
.status-badge.evaluated { background: #d4edda; color: #155724; }
.status-badge.pending-evaluation { background: #fff3cd; color: #856404; }
.status-badge.signed { background: #d4edda; color: #155724; }
.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #e2e3e5; color: #383d41; }
.status-badge.suspended { background: #f8d7da; color: #721c24; }
.status-badge.default { background: #e2e3e5; color: #383d41; }

/* Variantes outline */
.status-badge.pending-outline { 
  background: transparent; 
  color: #856404; 
  border: 1px solid #856404; 
}
.status-badge.approved-outline { 
  background: transparent; 
  color: #155724; 
  border: 1px solid #155724; 
}
.status-badge.rejected-outline { 
  background: transparent; 
  color: #721c24; 
  border: 1px solid #721c24; 
}
.status-badge.submitted-outline { 
  background: transparent; 
  color: #004085; 
  border: 1px solid #004085; 
}
.status-badge.in-progress-outline { 
  background: transparent; 
  color: #004085; 
  border: 1px solid #004085; 
}
.status-badge.completed-outline { 
  background: transparent; 
  color: #155724; 
  border: 1px solid #155724; 
}

/* Tailles supplémentaires */
.status-badge.small {
  padding: 2px 6px;
  font-size: 10px;
}

.status-badge.large {
  padding: 6px 12px;
  font-size: 14px;
}
</style>