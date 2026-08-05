// UPSA Hostel Management System - Formatters

export const formatters = {
  // Date formatters
  formatDate: (date: string | Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }

    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      },
    }

    return new Intl.DateTimeFormat('en-US', options[format]).format(dateObj)
  },

  // Currency formatter
  formatCurrency: (amount: number, currency: string = 'GHS'): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  },

  // Phone number formatter
  formatPhoneNumber: (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format for Ghana phone numbers
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    return phone
  },

  // Index number formatter
  formatIndexNumber: (indexNumber: string): string => {
    if (!indexNumber) return ''
    const upper = indexNumber.toUpperCase().trim()
    return upper.startsWith('UPSA') ? upper.replace('UPSA', '') : upper
  },

  // Percentage formatter
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`
  },

  // File size formatter
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Text formatter
  formatText: {
    capitalize: (text: string): string => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },
    
    titleCase: (text: string): string => {
      return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    },
    
    truncate: (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text
      return text.slice(0, maxLength) + '...'
    },
  },

  // Duration formatter
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`
  },

  // Relative time formatter
  formatRelativeTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return formatters.formatDate(dateObj, 'short')
  },

  // List formatter
  formatList: (items: string[], conjunction: 'and' | 'or' = 'and'): string => {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0]
    if (items.length === 2) return items.join(` ${conjunction} `)
    
    return items.slice(0, -1).join(', ') + `, ${conjunction} ` + items[items.length - 1]
  },
}

// Export individual formatters for convenience
export const {
  formatDate,
  formatCurrency,
  formatPhoneNumber,
  formatIndexNumber,
  formatPercentage,
  formatFileSize,
  formatText,
  formatDuration,
  formatRelativeTime,
  formatList,
} = formatters
