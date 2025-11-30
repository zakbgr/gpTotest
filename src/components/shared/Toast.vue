<template>
  <transition name="toast-slide">
    <div 
      v-if="visible" 
      class="toast"
      :class="toastClasses"
      @mouseenter="pauseTimeout"
      @mouseleave="resumeTimeout"
    >
      <div class="toast-icon">
        <i :class="iconClass"></i>
      </div>
      
      <div class="toast-content">
        <div class="toast-title" v-if="title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      
      <button class="toast-close" @click="close">
        <i class="fas fa-times"></i>
      </button>
      
      <div v-if="showProgress" class="toast-progress">
        <div 
          class="toast-progress-bar" 
          :class="`toast-progress-${type}`"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      progress: 100,
      startTime: null,
      remainingTime: this.duration,
      timer: null,
      progressTimer: null
    }
  },
  computed: {
    toastClasses() {
      return [
        `toast-${this.type}`,
        {
          'toast-with-title': this.title,
          'toast-persistent': this.persistent
        }
      ]
    },
    
    iconClass() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[this.type] || icons.info
    }
  },
  mounted() {
    this.show()
  },
  beforeDestroy() {
    this.clearTimers()
  },
  methods: {
    show() {
      this.visible = true
      this.$nextTick(() => {
        if (!this.persistent) {
          this.startTimer()
        }
      })
    },
    
    startTimer() {
      this.startTime = Date.now()
      this.progress = 100
      
      // Progress bar animation
      this.progressTimer = setInterval(() => {
        const elapsed = Date.now() - this.startTime
        this.progress = Math.max(0, 100 - (elapsed / this.duration) * 100)
      }, 50)
      
      // Auto-close timer
      this.timer = setTimeout(() => {
        this.close()
      }, this.duration)
    },
    
    pauseTimeout() {
      if (this.persistent) return
      
      this.clearTimers()
      const elapsed = Date.now() - this.startTime
      this.remainingTime = this.duration - elapsed
    },
    
    resumeTimeout() {
      if (this.persistent) return
      
      this.duration = this.remainingTime
      this.startTimer()
    },
    
    clearTimers() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    
    close() {
      this.visible = false
      this.clearTimers()
      
      // Wait for animation to complete before emitting
      setTimeout(() => {
        this.$emit('close', this.id)
      }, 300)
    },
    
    // Public method to manually close toast
    dismiss() {
      this.close()
    }
  }
}
</script>

<style scoped>
.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-width: 300px;
  max-width: 400px;
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  border-left: 4px solid;
  animation: toast-enter 0.3s ease-out;
  transition: all 0.3s ease;
  overflow: hidden;
}

.toast-success {
  border-left-color: var(--success);
}

.toast-error {
  border-left-color: var(--danger);
}

.toast-warning {
  border-left-color: var(--warning);
}

.toast-info {
  border-left-color: var(--info);
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon {
  color: var(--success);
}

.toast-error .toast-icon {
  color: var(--danger);
}

.toast-warning .toast-icon {
  color: var(--warning);
}

.toast-info .toast-icon {
  color: var(--info);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: var(--text);
  line-height: 1.3;
}

.toast-message {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-left: 12px;
  margin-top: 2px;
  border: none;
  background: none;
  color: var(--text-light);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.05s linear;
}

.toast-progress-success {
  background: var(--success);
}

.toast-progress-error {
  background: var(--danger);
}

.toast-progress-warning {
  background: var(--warning);
}

.toast-progress-info {
  background: var(--info);
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes toast-enter {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    min-width: auto;
    max-width: none;
    margin: 8px 16px;
  }
}

/* Hover effects */
.toast:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Accessibility */
.toast:focus {
  outline: 2px solid var(--medical);
  outline-offset: 2px;
}
</style>
