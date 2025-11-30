<template>
  <div class="data-table-container">
    <div class="table-header" v-if="$slots.header || showSearch">
      <slot name="header">
        <div class="search-box" v-if="showSearch">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Rechercher..."
            @input="onSearch"
          />
          <button class="btn btn-outline" @click="onSearch">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </slot>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="{
                'sortable': column.sortable,
                'sort-asc': sortBy === column.key && sortOrder === 'asc',
                'sort-desc': sortBy === column.key && sortOrder === 'desc'
              }"
              @click="column.sortable ? sortTable(column.key) : null"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon">
                <i class="fas fa-sort"></i>
              </span>
            </th>
            <th v-if="hasActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="loading-cell">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Chargement...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedData.length === 0">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="no-data">
              <i class="fas fa-inbox"></i>
              <p>Aucune donnée disponible</p>
            </td>
          </tr>
          <tr 
            v-else
            v-for="(row, index) in paginatedData" 
            :key="row.id || index"
            :class="getRowClass(row)"
          >
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :value="getValue(row, column.key)" :row="row">
                <template v-if="column.formatter">
                  {{ column.formatter(getValue(row, column.key), row) }}
                </template>
                <template v-else-if="column.type === 'date'">
                  {{ formatDate(getValue(row, column.key)) }}
                </template>
                <template v-else-if="column.type === 'status'">
                  <StatusBadge :status="getValue(row, column.key)" />
                </template>
                <template v-else>
                  {{ getValue(row, column.key) }}
                </template>
              </slot>
            </td>
            <td v-if="hasActions" class="actions-cell">
              <slot name="actions" :row="row" :index="index">
                <button 
                  v-if="showEdit"
                  class="btn btn-sm btn-outline"
                  @click="$emit('edit', row)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="showDelete"
                  class="btn btn-sm btn-danger"
                  @click="$emit('delete', row)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer" v-if="showPagination">
      <div class="pagination-info">
        Affichage de {{ startIndex + 1 }} à {{ endIndex }} sur {{ filteredData.length }} éléments
      </div>
      <div class="pagination-controls">
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-numbers">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        
        <button 
          class="btn btn-outline btn-sm"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'

export default {
  name: 'DataTable',
  components: {
    StatusBadge
  },
  props: {
    columns: {
      type: Array,
      required: true,
      validator: (cols) => cols.every(col => col.key && col.label)
    },
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    showEdit: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    }
  },
  emits: ['edit', 'delete', 'search', 'sort', 'page-change'],
  setup(props, { emit, slots }) {
    const searchQuery = ref('')
    const sortBy = ref('')
    const sortOrder = ref('asc')
    const currentPage = ref(1)

    const hasActions = computed(() => {
      return slots.actions || props.showEdit || props.showDelete
    })

    // Filtrer les données basées sur la recherche
    const filteredData = computed(() => {
      if (!searchQuery.value) return props.data

      const query = searchQuery.value.toLowerCase()
      return props.data.filter(row =>
        props.columns.some(column => {
          const value = getValue(row, column.key)
          return value && value.toString().toLowerCase().includes(query)
        })
      )
    })

    // Trier les données
    const sortedData = computed(() => {
      if (!sortBy.value) return filteredData.value

      return [...filteredData.value].sort((a, b) => {
        const aValue = getValue(a, sortBy.value)
        const bValue = getValue(b, sortBy.value)

        if (aValue === bValue) return 0

        const result = aValue < bValue ? -1 : 1
        return sortOrder.value === 'asc' ? result : -result
      })
    })

    // Pagination
    const totalPages = computed(() => Math.ceil(sortedData.value.length / props.pageSize))
    const paginatedData = computed(() => {
      if (!props.showPagination) return sortedData.value

      const start = (currentPage.value - 1) * props.pageSize
      const end = start + props.pageSize
      return sortedData.value.slice(start, end)
    })

    const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
    const endIndex = computed(() => Math.min(startIndex.value + props.pageSize, sortedData.value.length))

    // Méthodes
    const getValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const getRowClass = (row) => {
      return {
        'row-highlight': row.highlight,
        'row-disabled': row.disabled
      }
    }

    const sortTable = (columnKey) => {
      if (sortBy.value === columnKey) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = columnKey
        sortOrder.value = 'asc'
      }
      emit('sort', { sortBy: sortBy.value, sortOrder: sortOrder.value })
    }

    const onSearch = () => {
      currentPage.value = 1
      emit('search', searchQuery.value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        emit('page-change', page)
      }
    }

    // Réinitialiser la pagination quand les données changent
    watch(() => props.data, () => {
      currentPage.value = 1
    })

    return {
      searchQuery,
      sortBy,
      sortOrder,
      currentPage,
      hasActions,
      filteredData,
      sortedData,
      paginatedData,
      totalPages,
      startIndex,
      endIndex,
      getValue,
      formatDate,
      getRowClass,
      sortTable,
      onSearch,
      changePage
    }
  }
}
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2a7a5c;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2a7a5c;
  position: relative;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  background: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
  opacity: 0.5;
}

.data-table th.sort-asc .sort-icon,
.data-table th.sort-desc .sort-icon {
  opacity: 1;
}

.data-table th.sort-asc .sort-icon i {
  transform: rotate(180deg);
}

.loading-cell,
.no-data {
  text-align: center;
  padding: 40px !important;
  color: #666;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.row-highlight {
  background-color: #fff3cd !important;
}

.row-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.actions-cell {
  white-space: nowrap;
}

.actions-cell .btn {
  margin: 0 2px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-numbers {
  font-size: 14px;
  color: #333;
}

@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 10px;
    font-size: 14px;
  }
}
</style>