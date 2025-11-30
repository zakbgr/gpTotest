<template>
  <div class="search-filters">
    <div class="filters-header" v-if="title || $slots.header">
      <h4 v-if="title">{{ title }}</h4>
      <slot name="header"></slot>
    </div>

    <div class="filters-content">
      <div class="filter-row">
        <div 
          v-for="filter in visibleFilters" 
          :key="filter.key"
          class="filter-group"
          :class="filter.class"
        >
          <label v-if="filter.label" :for="`filter-${filter.key}`">
            {{ filter.label }}
          </label>
          
          <!-- Input Text -->
          <input
            v-if="filter.type === 'text'"
            :id="`filter-${filter.key}`"
            v-model="filterValues[filter.key]"
            type="text"
            class="form-control"
            :placeholder="filter.placeholder"
            @input="onFilterChange"
          />

          <!-- Select -->
          <select
            v-else-if="filter.type === 'select'"
            :id="`filter-${filter.key}`"
            v-model="filterValues[filter.key]"
            class="form-control"
            @change="onFilterChange"
          >
            <option value="">{{ filter.placeholder || 'Tous' }}</option>
            <option 
              v-for="option in getOptions(filter)" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Date -->
          <input
            v-else-if="filter.type === 'date'"
            :id="`filter-${filter.key}`"
            v-model="filterValues[filter.key]"
            type="date"
            class="form-control"
            @change="onFilterChange"
          />

          <!-- Date Range -->
          <div v-else-if="filter.type === 'date-range'" class="date-range">
            <input
              v-model="filterValues[filter.key].start"
              type="date"
              class="form-control"
              placeholder="Date de début"
              @change="onFilterChange"
            />
            <span class="date-separator">au</span>
            <input
              v-model="filterValues[filter.key].end"
              type="date"
              class="form-control"
              placeholder="Date de fin"
              @change="onFilterChange"
            />
          </div>

          <!-- Checkbox Group -->
          <div v-else-if="filter.type === 'checkbox-group'" class="checkbox-group">
            <label
              v-for="option in getOptions(filter)"
              :key="option.value"
              class="checkbox-item"
            >
              <input
                v-model="filterValues[filter.key]"
                type="checkbox"
                :value="option.value"
                @change="onFilterChange"
              />
              <span class="checkmark"></span>
              {{ option.label }}
            </label>
          </div>

          <!-- Radio Group -->
          <div v-else-if="filter.type === 'radio-group'" class="radio-group">
            <label
              v-for="option in getOptions(filter)"
              :key="option.value"
              class="radio-item"
            >
              <input
                v-model="filterValues[filter.key]"
                type="radio"
                :value="option.value"
                @change="onFilterChange"
              />
              <span class="radiomark"></span>
              {{ option.label }}
            </label>
          </div>
        </div>
      </div>

      <!-- Filtres avancés -->
      <div v-if="showAdvanced && advancedFilters.length > 0" class="advanced-filters">
        <div class="filter-row">
          <div 
            v-for="filter in advancedFilters" 
            :key="filter.key"
            class="filter-group"
            :class="filter.class"
          >
            <label v-if="filter.label" :for="`filter-${filter.key}`">
              {{ filter.label }}
            </label>
            
            <!-- Répéter les types d'inputs pour les filtres avancés -->
            <input
              v-if="filter.type === 'text'"
              :id="`filter-${filter.key}`"
              v-model="filterValues[filter.key]"
              type="text"
              class="form-control"
              :placeholder="filter.placeholder"
              @input="onFilterChange"
            />

            <select
              v-else-if="filter.type === 'select'"
              :id="`filter-${filter.key}`"
              v-model="filterValues[filter.key]"
              class="form-control"
              @change="onFilterChange"
            >
              <option value="">{{ filter.placeholder || 'Tous' }}</option>
              <option 
                v-for="option in getOptions(filter)" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-footer">
      <button 
        v-if="advancedFilters.length > 0"
        class="btn btn-link"
        @click="showAdvanced = !showAdvanced"
      >
        <i class="fas" :class="showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ showAdvanced ? 'Moins de filtres' : 'Plus de filtres' }}
      </button>

      <div class="actions">
        <button class="btn btn-outline" @click="resetFilters" v-if="hasActiveFilters">
          <i class="fas fa-times"></i>
          Réinitialiser
        </button>
        <button class="btn btn-medical" @click="applyFilters">
          <i class="fas fa-search"></i>
          Appliquer
        </button>
      </div>
    </div>

    <!-- Filtres actifs -->
    <div v-if="showActiveFilters && activeFilters.length > 0" class="active-filters">
      <div class="active-filters-header">
        <strong>Filtres actifs :</strong>
      </div>
      <div class="active-filters-list">
        <span 
          v-for="filter in activeFilters" 
          :key="filter.key"
          class="active-filter"
        >
          {{ filter.label }}: {{ filter.displayValue }}
          <button @click="removeFilter(filter.key)" class="remove-filter">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'SearchFilters',
  props: {
    filters: {
      type: Array,
      required: true,
      validator: (filters) => filters.every(f => f.key && f.type)
    },
    title: {
      type: String,
      default: ''
    },
    showAdvancedToggle: {
      type: Boolean,
      default: true
    },
    showActiveFilters: {
      type: Boolean,
      default: true
    },
    immediate: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'filter-change', 'filter-reset'],
  setup(props, { emit }) {
    const showAdvanced = ref(false)
    const filterValues = ref({})
    const initialValues = ref({})

    // Séparer les filtres basiques et avancés
    const basicFilters = computed(() => 
      props.filters.filter(f => !f.advanced)
    )
    
    const advancedFilters = computed(() => 
      props.filters.filter(f => f.advanced)
    )
    
    const visibleFilters = computed(() => 
      showAdvanced.value ? [...basicFilters.value, ...advancedFilters.value] : basicFilters.value
    )

    // Initialiser les valeurs des filtres
    const initializeFilters = () => {
      const initial = {}
      props.filters.forEach(filter => {
        if (props.modelValue[filter.key] !== undefined) {
          initial[filter.key] = props.modelValue[filter.key]
        } else {
          initial[filter.key] = getDefaultValue(filter)
        }
      })
      filterValues.value = { ...initial }
      initialValues.value = { ...initial }
    }

    const getDefaultValue = (filter) => {
      switch (filter.type) {
        case 'checkbox-group':
          return []
        case 'date-range':
          return { start: '', end: '' }
        default:
          return ''
      }
    }

    const getOptions = (filter) => {
      if (filter.options && typeof filter.options === 'function') {
        return filter.options()
      }
      return filter.options || []
    }

    // Filtres actifs
    const activeFilters = computed(() => {
      return props.filters
        .filter(filter => {
          const value = filterValues.value[filter.key]
          if (value === undefined || value === null) return false
          
          switch (filter.type) {
            case 'text':
              return value !== ''
            case 'select':
              return value !== ''
            case 'date':
              return value !== ''
            case 'date-range':
              return value.start !== '' || value.end !== ''
            case 'checkbox-group':
              return value.length > 0
            case 'radio-group':
              return value !== ''
            default:
              return false
          }
        })
        .map(filter => ({
          key: filter.key,
          label: filter.label,
          displayValue: getDisplayValue(filter)
        }))
    })

    const getDisplayValue = (filter) => {
      const value = filterValues.value[filter.key]
      
      if (filter.type === 'select' || filter.type === 'radio-group') {
        const option = getOptions(filter).find(opt => opt.value === value)
        return option ? option.label : value
      }
      
      if (filter.type === 'checkbox-group') {
        return value.map(val => {
          const option = getOptions(filter).find(opt => opt.value === val)
          return option ? option.label : val
        }).join(', ')
      }
      
      if (filter.type === 'date-range') {
        const start = value.start ? new Date(value.start).toLocaleDateString('fr-FR') : ''
        const end = value.end ? new Date(value.end).toLocaleDateString('fr-FR') : ''
        return start && end ? `${start} - ${end}` : start || end
      }
      
      return value
    }

    const hasActiveFilters = computed(() => activeFilters.value.length > 0)

    // Méthodes
    const onFilterChange = () => {
      if (props.immediate) {
        applyFilters()
      }
    }

    const applyFilters = () => {
      emit('update:modelValue', { ...filterValues.value })
      emit('filter-change', { ...filterValues.value })
    }

    const resetFilters = () => {
      filterValues.value = { ...initialValues.value }
      emit('update:modelValue', { ...filterValues.value })
      emit('filter-reset')
      
      if (props.immediate) {
        emit('filter-change', { ...filterValues.value })
      }
    }

    const removeFilter = (filterKey) => {
      filterValues.value[filterKey] = initialValues.value[filterKey]
      applyFilters()
    }

    // Watchers
    watch(() => props.filters, initializeFilters, { immediate: true })
    watch(() => props.modelValue, (newValue) => {
      filterValues.value = { ...newValue }
    })

    onMounted(() => {
      if (props.immediate) {
        applyFilters()
      }
    })

    return {
      showAdvanced,
      filterValues,
      basicFilters,
      advancedFilters,
      visibleFilters,
      activeFilters,
      hasActiveFilters,
      getOptions,
      onFilterChange,
      applyFilters,
      resetFilters,
      removeFilter
    }
  }
}
</script>

<style scoped>
.search-filters {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.filters-header h4 {
  margin: 0;
  color: #2a7a5c;
  font-size: 1.1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  font-size: 0.9rem;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #2a7a5c;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-separator {
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-item input,
.radio-item input {
  margin: 0;
}

.checkmark,
.radiomark {
  width: 16px;
  height: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.radiomark {
  border-radius: 50%;
}

.checkbox-item input:checked + .checkmark {
  background: #2a7a5c;
  border-color: #2a7a5c;
}

.checkbox-item input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
}

.radio-item input:checked + .radiomark {
  border-color: #2a7a5c;
}

.radio-item input:checked + .radiomark::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #2a7a5c;
  border-radius: 50%;
}

.filters-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.btn-link {
  background: none;
  border: none;
  color: #2a7a5c;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-link:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #2c5aa0;
  color: #2c5aa0;
}

.btn-medical {
  background: #2a7a5c;
  color: white;
}

.btn-medical:hover {
  background: #1e5e46;
}

.active-filters {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.active-filters-header {
  margin-bottom: 8px;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filter {
  background: white;
  padding: 4px 8px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-filter {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-filter:hover {
  background: #f5f5f5;
  color: #333;
}

.advanced-filters {
  border-top: 1px dashed #e0e0e0;
  padding-top: 15px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .search-filters {
    padding: 15px;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filters-footer {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .actions {
    justify-content: flex-end;
  }
  
  .date-range {
    flex-direction: column;
    gap: 8px;
  }
  
  .date-separator {
    text-align: center;
  }
}
</style>