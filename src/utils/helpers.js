import { format, parseISO, isValid, differenceInDays, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Formater une date
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return format(dateObj, formatStr, { locale: fr })
}

// Formater une date avec l'heure
export const formatDateTime = (date, formatStr = 'dd/MM/yyyy à HH:mm') => {
  return formatDate(date, formatStr)
}

// Formater une date relative (il y a...)
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: fr 
  })
}

// Valider un email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Valider un numéro de téléphone français
export const isValidPhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Tronquer un texte
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Formater un nombre avec séparateurs
export const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(number)
}

// Capitaliser la première lettre
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Formater un nom complet
export const formatFullName = (firstName, lastName) => {
  return \\ \\
}

// Générer un identifiant unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Télécharger un fichier
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Convertir un fichier en base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Formater la durée
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return \\min\
  if (mins === 0) return \\h\
  return \\h\\
}

// Calculer l'âge
export const calculateAge = (birthDate) => {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Filtrer et trier un tableau
export const filterAndSort = (array, filters, sortBy, sortOrder = 'asc') => {
  let filtered = array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      const itemValue = getNestedValue(item, key)
      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }
      
      return itemValue?.toString().toLowerCase().includes(value.toString().toLowerCase())
    })
  })
  
  if (sortBy) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy)
      const bValue = getNestedValue(b, sortBy)
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return filtered
}

// Obtenir une valeur imbriquée d'un objet
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// Débouncer une fonction
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
