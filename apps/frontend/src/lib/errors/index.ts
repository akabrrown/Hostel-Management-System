// Error handling utilities for consistent error management
import { NextRequest, NextResponse } from 'next/server'

// Error types
export type ErrorType = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'rate_limit'
  | 'server_error'
  | 'network_error'
  | 'payment_error'
  | 'database_error'
  | 'unknown'

export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: string
  stack?: string
  metadata?: Record<string, any>
}

// Error class
class CustomError extends Error {
  public type: ErrorType
  public code?: string
  public details?: any
  public metadata?: Record<string, any>

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    metadata?: Record<string, any>
  ) {
    super(message)
    this.type = type
    this.code = code
    this.details = details
    this.metadata = metadata
    this.name = 'CustomError'
  }
}

// Error factory functions
export const createError = (
  type: ErrorType,
  message: string,
  code?: string,
  details?: any,
  metadata?: Record<string, any>
): CustomError => {
  return new CustomError(type, message, code, details, metadata)
}

export const createValidationError = (message: string, field?: string): CustomError => {
  return createError(
    'validation',
    message,
    'VALIDATION_ERROR',
    { field },
    { isFieldError: true }
  )
}

export const createAuthError = (message: string): CustomError => {
  return createError(
    'authentication',
    message,
    'AUTH_ERROR',
    undefined,
    { isAuthError: true }
  )
}

export const createAuthzError = (message: string): CustomError => {
  return createError(
    'authorization',
    message,
    'AUTHZ_ERROR',
    undefined,
    { isAuthzError: true }
  )
}

export const createNotFoundError = (resource: string, id?: string): CustomError => {
  const idText = id ? ` with ID: ${id}` : ''
  return createError(
    'not_found',
    `${resource} not found${idText}`,
    'NOT_FOUND',
    { resource, id }
  )
}

export const createRateLimitError = (message: string, retryAfter?: number): CustomError => {
  return createError(
    'rate_limit',
    message,
    'RATE_LIMIT',
    undefined,
    { retryAfter }
  )
}

export const createServerError = (message: string, code?: string): CustomError => {
  return createError(
    'server_error',
    message,
    code || 'SERVER_ERROR',
    undefined,
    { isServerError: true }
  )
}

export const createPaymentError = (message: string, code?: string): CustomError => {
  return createError(
    'payment_error',
    message,
    code || 'PAYMENT_ERROR',
    undefined,
    { isPaymentError: true }
  )
}

export const createDatabaseError = (message: string, operation?: string): CustomError => {
  return createError(
    'database_error',
    message,
    'DB_ERROR',
    undefined,
    { operation }
  )
}

// Error handling utilities
export const handleError = (error: unknown): AppError => {
  if (error instanceof CustomError) {
    return {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      metadata: error.metadata,
    }
  }

  if (error instanceof Error) {
    return {
      type: 'server_error',
      message: error.message,
      code: 'GENERIC_ERROR',
      timestamp: new Date().toISOString(),
      stack: error.stack,
    }
  }

  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      timestamp: new Date().toISOString(),
    }
  }

  return {
    type: 'unknown',
    message: 'An unknown error occurred',
    timestamp: new Date().toISOString(),
  }
}

// API error response utilities
export const createErrorResponse = (
  error: AppError,
  statusCode: number = 500
): NextResponse => {
  return NextResponse.json(
    {
      error: error.message,
      type: error.type,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
    },
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Type': error.type,
        'X-Error-Code': error.code || 'UNKNOWN',
      },
    }
  )
}

// Client-side error handling
export const handleClientError = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  if (error?.message) {
    return error.message
  }

  if (error?.error) {
    return error.error
  }

  if (typeof error === 'string') {
    return error
  }

  return fallbackMessage
}

// Error boundary utilities
export const logError = (error: AppError, context?: string) => {
  const logData = {
    ...error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  }

  console.error('Application Error:', logData)

  // In production, you might want to send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service like Sentry, LogRocket, etc.
    // trackError(logData)
  }
}

// Loading state utilities
export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any
}

export const createLoadingState = (): LoadingState => ({
  isLoading: false,
  error: null,
  data: null,
})

export const setLoading = (state: LoadingState, isLoading: boolean): LoadingState => ({
  ...state,
  isLoading,
})

export const setError = (state: LoadingState, error: string | null): LoadingState => ({
  ...state,
  error,
  isLoading: false,
})

export const setData = (state: LoadingState, data: any): LoadingState => ({
  ...state,
  data,
  isLoading: false,
  error: null,
})

export const resetLoadingState = (): LoadingState => createLoadingState()

// Async state utilities
export const handleAsyncOperation = async <T>(
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setData: (data: T) => void,
  operation: () => Promise<T>
): Promise<T> => {
  setLoading(true)
  setError(null)

  try {
    const result = await operation()
    setData(result)
    return result
  } catch (error) {
    const errorMessage = handleClientError(error)
    setError(errorMessage)
    throw error
  } finally {
    setLoading(false)
  }
}

// Retry utilities
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  shouldRetry: (error: any) => boolean = () => true
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

// Error message utilities
export const getErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case 'validation':
      return `Validation error: ${error.message}`
    case 'authentication':
      return 'Authentication failed. Please check your credentials.'
    case 'authorization':
      return 'Access denied. You do not have permission to perform this action.'
    case 'not_found':
      return 'The requested resource was not found.'
    case 'rate_limit':
      return 'Too many requests. Please try again later.'
    case 'payment_error':
      return 'Payment processing failed. Please try again or contact support.'
    case 'database_error':
      return 'A database error occurred. Please try again.'
    case 'server_error':
      return 'A server error occurred. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

// Error type guards
export const isValidationError = (error: AppError): error is AppError & { type: 'validation' } => {
  return error.type === 'validation'
}

export const isAuthError = (error: AppError): error is AppError & { type: 'authentication' | 'authorization' } => {
  return error.type === 'authentication' || error.type === 'authorization'
}

export const isNetworkError = (error: AppError): error is AppError & { type: 'network_error' | 'server_error' } => {
  return error.type === 'network_error' || error.type === 'server_error'
}

export const isRetryableError = (error: AppError): boolean => {
  return isNetworkError(error) || error.type === 'rate_limit'
}
