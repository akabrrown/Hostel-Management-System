// UPSA Hostel Management System - Custom Validators

export const validators = {
  // Ghana phone number validator
  isValidGhanaPhone: (phone: string): boolean => {
    const phoneRegex = /^(0|\+233)?[23]\d{8}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  },

  // UPSA index number validator
  isValidUPSAIndexNumber: (indexNumber: string): boolean => {
    // UPSA index numbers typically follow format: 20XXXXXXX or similar
    const indexRegex = /^\d{10}$/
    return indexRegex.test(indexNumber)
  },

  // Email validator
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password strength validator
  isStrongPassword: (password: string): {
    isValid: boolean
    errors: string[]
  } => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Date validator (must be in the past for DOB, in the future for other dates)
  isValidDate: (date: string, options: {
    minAge?: number
    maxAge?: number
    future?: boolean
  } = {}): boolean => {
    const dateObj = new Date(date)
    const now = new Date()

    if (isNaN(dateObj.getTime())) {
      return false
    }

    if (options.future && dateObj <= now) {
      return false
    }

    if (!options.future && dateObj > now) {
      return false
    }

    if (options.minAge || options.maxAge) {
      const age = Math.floor((now.getTime() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      
      if (options.minAge && age < options.minAge) {
        return false
      }

      if (options.maxAge && age > options.maxAge) {
        return false
      }
    }

    return true
  },

  // Amount validator
  isValidAmount: (amount: number, options: {
    min?: number
    max?: number
    positive?: boolean
  } = {}): boolean => {
    if (isNaN(amount)) {
      return false
    }

    if (options.positive && amount <= 0) {
      return false
    }

    if (options.min !== undefined && amount < options.min) {
      return false
    }

    if (options.max !== undefined && amount > options.max) {
      return false
    }

    return true
  },

  // File validator
  isValidFile: (file: File, options: {
    maxSize?: number
    allowedTypes?: string[]
  } = {}): {
    isValid: boolean
    errors: string[]
  } => {
    const errors: string[] = []

    if (options.maxSize && file.size > options.maxSize) {
      errors.push(`File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB`)
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Academic year validator
  isValidAcademicYear: (year: number): boolean => {
    const currentYear = new Date().getFullYear()
    return year >= currentYear - 6 && year <= currentYear + 1
  },

  // Semester validator
  isValidSemester: (semester: string): boolean => {
    const validSemesters = ['first', 'second', 'summer']
    return validSemesters.includes(semester.toLowerCase())
  },

  // Room type validator
  isValidRoomType: (roomType: string): boolean => {
    const validRoomTypes = ['single', 'double', 'triple', 'quadruple']
    return validRoomTypes.includes(roomType.toLowerCase())
  },

  // Program of study validator (basic Ghanaian university programs)
  isValidProgram: (program: string): boolean => {
    // This is a basic validation - in a real app, this would come from a database
    const validPrograms = [
      'B.Sc. Computer Science',
      'B.Sc. Information Technology',
      'B.Sc. Business Administration',
      'B.Sc. Accounting',
      'B.Sc. Banking and Finance',
      'B.Sc. Marketing',
      'B.Sc. Human Resource Management',
      'B.Sc. Economics',
      'B.Sc. Statistics',
      'B.A. Communication Studies',
      'LLB Law',
    ]
    
    return validPrograms.some(validProgram => 
      validProgram.toLowerCase() === program.toLowerCase()
    )
  },

  // URL validator
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Ghana ID card number validator (basic format)
  isValidGhanaID: (idNumber: string): boolean => {
    // Ghana ID cards typically have format: GHA-XXXXXXXXXXXXXX
    const idRegex = /^GHA-\d{16}$/
    return idRegex.test(idNumber)
  },

  // Required field validator
  isRequired: (value: any): boolean => {
    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    if (Array.isArray(value)) {
      return value.length > 0
    }

    return true
  },

  // Length validator
  isValidLength: (value: string, options: {
    min?: number
    max?: number
  }): boolean => {
    const length = value.length

    if (options.min !== undefined && length < options.min) {
      return false
    }

    if (options.max !== undefined && length > options.max) {
      return false
    }

    return true
  },

  // Numeric validator
  isNumeric: (value: string): boolean => {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value))
  },

  // Integer validator
  isInteger: (value: string | number): boolean => {
    const num = typeof value === 'string' ? Number(value) : value
    return Number.isInteger(num)
  },

  // Range validator
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },
}

// Export individual validators for convenience
export const {
  isValidGhanaPhone,
  isValidUPSAIndexNumber,
  isValidEmail,
  isStrongPassword,
  isValidDate,
  isValidAmount,
  isValidFile,
  isValidAcademicYear,
  isValidSemester,
  isValidRoomType,
  isValidProgram,
  isValidUrl,
  isValidGhanaID,
  isRequired,
  isValidLength,
  isNumeric,
  isInteger,
  isInRange,
} = validators
