'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { SkipForward, Volume2, VolumeX } from 'lucide-react'
import Badge from '@/components/ui/badge'
import styles from './accessibility.module.css'

// Skip to Main Content Component
export function SkipToMain() {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
    >
      Skip to main content
    </button>
  )
}

// Accessible Image Component
export function AccessibleImage({ 
  src, 
  alt, 
  caption,
  className = '',
  loading = 'lazy' 
}: {
  src: string
  alt: string
  caption?: string
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <figure className={`space-y-2 ${className}`}>
      <Image
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-auto object-cover rounded-lg ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
        width={800}
        height={600}
      />
      {hasError && (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Image failed to load</span>
        </div>
      )}
      {caption && (
        <figcaption className="text-sm text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Accessible Button Component
export function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  ariaLabel,
  ariaDescribedBy,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white'
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        rounded-lg font-medium transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Accessible Form Field Component
export function AccessibleFormField({ 
  label, 
  error, 
  hint, 
  required = false,
  children 
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div className="space-y-1">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {children}
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible Modal Component
export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium' 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      
      // Trap focus within modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
        
        if (event.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
            
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
              }
            }
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
        
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible Navigation Component
export function AccessibleNavigation({ 
  items, 
  currentPath 
}: {
  items: Array<{
    href: string
    label: string
    icon?: React.ReactNode
    badge?: number
  }>
  currentPath: string
}) {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && (
                <Badge className="ml-auto bg-red-500 text-white">
                  {item.badge}
                </Badge>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Focus Management Hook
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
      setFocusedElement(element)
    } else {
      setFocusedElement(null)
    }
  }

  const restoreFocus = () => {
    if (focusedElement) {
      focusedElement.focus()
    }
  }

  return {
    focusedElement,
    setFocus,
    restoreFocus
  }
}

// Screen Reader Announcer Component
export function ScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState('')

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message)
    
    // Clear announcement after screen reader has had time to read it
    setTimeout(() => {
      setAnnouncement('')
    }, 1000)
  }

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {/* Important announcements can go here */}
      </div>
    </>
  )
}

// Color Contrast Checker Hook
export function useColorContrast() {
  const getContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0
      
      const [r, g, b] = rgb.map(Number)
      const [rs, gs, bs] = [r, g, b].map(val => val / 255)
      
      const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
      return luminance
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  const getWCAGRating = (ratio: number): 'AA' | 'AAA' | 'Fail' => {
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    return 'Fail'
  }

  return {
    getContrastRatio,
    getWCAGRating
  }
}

// Keyboard Navigation Hook
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect keyboard navigation
      if (event.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return isKeyboardUser
}

// Reduced Motion Hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    setPrefersReducedMotion(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// High Contrast Hook
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    setPrefersHighContrast(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersHighContrast
}
