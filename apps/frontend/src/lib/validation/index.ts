// Real-time form validation utilities
import { useState, useCallback, useEffect } from 'react'
import * as Yup from 'yup'
import { createValidationError } from '@/lib/errors'

// Validation field interface
export interface ValidationField {
  name: string
  value: any
  required?: boolean
  rules?: ValidationRule[]
  touched?: boolean
}

// Validation rule interface
export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  message?: string
  value?: any
  validator?: (value: any) => string | null
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  fieldErrors: Record<string, string>
  touched: Record<string, boolean>
}

// Real-time validation hook
export const useRealTimeValidation = (
  schema: Yup.AnySchema,
  initialValues: Record<string, any>
) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValid, setIsValid] = useState(false)

  // Validate single field
  const validateField = useCallback(async (name: string, value: any) => {
    try {
      await schema.validateAt(name, value)
      setErrors(prev => ({ ...prev, [name]: '' }))
      return null
    } catch (error: any) {
      const errorMessage = error.message
      setErrors(prev => ({ ...prev, [name]: errorMessage }))
      return errorMessage
    }
  }, [schema])

  // Validate all fields
  const validateForm = useCallback(async () => {
    try {
      await schema.validate(values, { abortEarly: false })
      setErrors({})
      setIsValid(true)
      return { isValid: true, errors: {} }
    } catch (error: any) {
      const validationErrors: Record<string, string> = {}
      if (error.inner) {
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message
        })
      }
      setErrors(validationErrors)
      setIsValid(false)
      return { isValid: false, errors: validationErrors }
    }
  }, [values, schema])

  // Update field value and validate
  const updateField = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }, [validateField])

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, values[name])
  }, [values, validateField])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsValid(false)
  }, [initialValues])

  // Set form values
  const setFormValues = useCallback((newValues: Record<string, any>) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])

  // Check if form is valid
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== '')
    const hasUntouchedRequired = Object.keys(values).some(key => {
      try {
        const fieldSchema = Yup.reach(schema, key)
        return fieldSchema && 'spec' in fieldSchema && (fieldSchema.spec as any)?.required && !touched[key] && !values[key]
      } catch {
        return false
      }
    })
    
    setIsValid(!hasErrors && !hasUntouchedRequired)
  }, [errors, touched, values, schema])

  return {
    values,
    errors,
    touched,
    isValid,
    updateField,
    handleBlur,
    validateForm,
    resetForm,
    setFormValues,
  }
}

// Custom validation rules
export const validationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    type: 'required',
    message,
  }),

  email: (message: string = 'Invalid email address'): ValidationRule => ({
    type: 'email',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    value: min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    value: max,
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message,
  }),

  phone: (message: string = 'Invalid phone number'): ValidationRule => ({
    type: 'pattern',
    value: /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
    message,
  }),

  indexNumber: (message: string = 'Invalid index number format'): ValidationRule => ({
    type: 'pattern',
    value: /^(UPSA)?\d{8}$/,
    message,
  }),

  password: (message: string = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
    type: 'pattern',
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message,
  }),

  custom: (validator: (value: any) => string | null, message?: string): ValidationRule => ({
    type: 'custom',
    validator,
    message,
  }),
}

// Field validation function
export const validateField = (field: ValidationField): string | null => {
  const { name, value, required = false, rules = [] } = field

  // Check if required and empty
  if (required && (!value || value.toString().trim() === '')) {
    return `${name} is required`
  }

  // Skip validation if field is empty and not required
  if (!value && !required) {
    return null
  }

  // Apply validation rules
  for (const rule of rules) {
    let error: string | null = null

    switch (rule.type) {
      case 'required':
        if (!value || value.toString().trim() === '') {
          error = rule.message || `${name} is required`
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          error = rule.message || 'Invalid email address'
        }
        break

      case 'min':
        if (value.toString().length < rule.value) {
          error = rule.message || `Must be at least ${rule.value} characters`
        }
        break

      case 'max':
        if (value.toString().length > rule.value) {
          error = rule.message || `Must be no more than ${rule.value} characters`
        }
        break

      case 'pattern':
        if (!rule.value.test(value)) {
          error = rule.message || 'Invalid format'
        }
        break

      case 'custom':
        if (rule.validator) {
          error = rule.validator(value)
        }
        break
    }

    if (error) {
      return error
    }
  }

  return null
}

// Form validation hook for dynamic forms
export const useFormValidation = (
  fields: ValidationField[],
  onSubmit: (values: Record<string, any>) => void | Promise<void>
) => {
  const [values, setValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize values
  useEffect(() => {
    const initialValues: Record<string, any> = {}
    fields.forEach(field => {
      initialValues[field.name] = field.value || ''
    })
    setValues(initialValues)
  }, [fields])

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach(field => {
      const error = validateField({
        ...field,
        value: values[field.name],
        touched: touched[field.name],
      })
      
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [fields, values, touched])

  // Handle field change
  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))

    // Validate field in real-time
    const field = fields.find(f => f.name === name)
    if (field) {
      const error = validateField({
        ...field,
        value,
        touched: true,
      })
      
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }))
    }
  }, [fields])

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))

    const field = fields.find(f => f.name === name)
    if (field) {
      const error = validateField({
        ...field,
        value: values[name],
        touched: true,
      })
      
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }))
    }
  }, [fields, values])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {}
    fields.forEach(field => {
      allTouched[field.name] = true
    })
    setTouched(allTouched)

    // Validate form
    const isValid = validateForm()
    
    if (isValid) {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [fields, values, onSubmit, validateForm])

  // Reset form
  const resetForm = useCallback(() => {
    const initialValues: Record<string, any> = {}
    fields.forEach(field => {
      initialValues[field.name] = field.value || ''
    })
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [fields])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  }
}

// Debounced validation
export const useDebouncedValidation = (
  validateFn: (value: any) => string | null,
  delay: number = 300
) => {
  const [debouncedFn] = useState(() => 
    debounce(validateFn, delay)
  )

  return debouncedFn
}

// Validation helper functions
export const validationHelpers = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
    return phoneRegex.test(phone)
  },

  isGhanaPhone: (phone: string): boolean => {
    const ghanaPhoneRegex = /^(\+233|0)[2-3]\d{8}$/
    return ghanaPhoneRegex.test(phone.replace(/\s/g, ''))
  },

  isIndexNumber: (indexNumber: string): boolean => {
    const indexRegex = /^(UPSA)?\d{8}$/
    return indexRegex.test(indexNumber)
  },

  isStrongPassword: (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return strongPasswordRegex.test(password)
  },

  isValidDate: (date: string): boolean => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  },

  isFutureDate: (date: string): boolean => {
    const parsedDate = new Date(date)
    const today = new Date()
    return parsedDate > today
  },

  isPastDate: (date: string): boolean => {
    const parsedDate = new Date(date)
    const today = new Date()
    return parsedDate < today
  },

  isAdult: (dateOfBirth: string): boolean => {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= 18
    }
    
    return age >= 18
  },
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Validation schemas for common forms
export const commonSchemas = {
  login: Yup.object({
    email: Yup.string().email('Invalid email').optional(),
    password: Yup.string().min(6, 'Password must be at least 6 characters').optional(),
    indexNumber: Yup.string().matches(/^\d{8}$/, 'Invalid index number format (e.g., 12345678)').optional(),
    dateOfBirth: Yup.date().optional(),
  }).test('valid-auth', 'Either email+password or indexNumber+dateOfBirth is required', function(value) {
    const hasEmailPassword = value.email && value.password
    const hasStudentAuth = value.indexNumber && value.dateOfBirth
    return hasEmailPassword || hasStudentAuth ? true : false
  }),

  signup: Yup.object({
    indexNumber: Yup.string().matches(/^(UPSA)?\d{8}$/, 'Invalid index number format (e.g., 12345678)').required('Index number is required'),
    dateOfBirth: Yup.date().required('Date of birth is required'),
    phone: Yup.string().matches(/^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number').required('Phone number is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
  }),

  roomReservation: Yup.object({
    hostelId: Yup.string().required('Hostel is required'),
    floorId: Yup.string().required('Floor is required'),
    roomTypeId: Yup.string().required('Room type is required'),
    academicYear: Yup.string().required('Academic year is required'),
    semester: Yup.string().required('Semester is required'),
    specialRequests: Yup.string().optional(),
  }),

  roomBooking: Yup.object({
    hostelId: Yup.string().required('Hostel is required'),
    floorId: Yup.string().required('Floor is required'),
    roomId: Yup.string().required('Room is required'),
    bedId: Yup.string().required('Bed is required'),
    academicYear: Yup.string().required('Academic year is required'),
    semester: Yup.string().required('Semester is required'),
  }),

  payment: Yup.object({
    amount: Yup.number().min(50, 'Minimum payment amount is GHS 50').max(10000, 'Maximum payment amount is GHS 10,000').required('Amount is required'),
    paymentMethod: Yup.string().oneOf(['mobile_money', 'bank_transfer', 'card'], 'Invalid payment method').required('Payment method is required'),
    transactionId: Yup.string().required('Transaction ID is required'),
    semester: Yup.string().required('Semester is required'),
    academicYear: Yup.string().required('Academic year is required'),
    provider: Yup.string().optional(),
    phoneNumber: Yup.string().optional(),
    bankName: Yup.string().optional(),
    accountNumber: Yup.string().optional(),
  }),
}
