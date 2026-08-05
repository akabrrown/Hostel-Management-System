// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

export const sanitizeEmail = (email: string): string => {
  if (!email) return ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = email.toLowerCase().trim()
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  // Remove all non-digit characters except + for international numbers
  return phone.replace(/[^\d+]/g, '')
}

export const sanitizeIndexNumber = (indexNumber: string): string => {
  if (!indexNumber) return ''
  
  // Format: YYYY/NNNN
  const sanitized = indexNumber.trim().toUpperCase()
  const indexRegex = /^\d{4}\/\d{4}$/
  
  return indexRegex.test(sanitized) ? sanitized : ''
}

export const sanitizeText = (text: string, maxLength?: number): string => {
  if (!text) return ''
  
  let sanitized = sanitizeInput(text)
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

export const sanitizeHtml = (html: string): string => {
  if (!html) return ''
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
}
