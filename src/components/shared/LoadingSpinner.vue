<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass" :style="spinnerStyle">
      <div class="spinner"></div>
      <div v-if="text" class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    color: {
      type: String,
      default: '#2a7a5c'
    },
    text: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: false
    },
    centered: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const containerClass = computed(() => ({
      'loading-overlay': props.overlay,
      'loading-centered': props.centered
    }))

    const spinnerClass = computed(() => `spinner-${props.size}`)

    const spinnerStyle = computed(() => ({
      '--spinner-color': props.color
    }))

    return {
      containerClass,
      spinnerClass,
      spinnerStyle
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.loading-centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--spinner-color, #2a7a5c);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-medium .spinner {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-large .spinner {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.loading-text {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variantes de position */
.loading-spinner.inline {
  flex-direction: row;
  gap: 8px;
}

.loading-spinner.inline .spinner {
  margin: 0;
}

/* Pour les boutons */
.button-spinner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.button-spinner .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

/* Pour les tableaux */
.table-spinner {
  padding: 40px;
}

.table-spinner .loading-spinner {
  gap: 15px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .loading-text {
    color: #ccc;
  }
  
  .spinner {
    border-color: #555;
  }
}
</style>