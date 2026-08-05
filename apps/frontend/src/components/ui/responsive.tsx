'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import styles from './responsive.module.css'

// Mobile Navigation Component
export function MobileNavigation({ 
  children, 
  isOpen, 
  onToggle 
}: {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onToggle}>
          <div 
            className="w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <nav className="space-y-4">
                {children}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Responsive Container Component
export function ResponsiveContainer({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

// Responsive Grid Component
export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = '' 
}: {
  children: React.ReactNode
  cols?: { mobile: number; tablet: number; desktop: number }
  gap?: number
  className?: string
}) {
  const gridClasses = `
    grid 
    grid-cols-${cols.mobile} 
    md:grid-cols-${cols.tablet} 
    lg:grid-cols-${cols.desktop}
    gap-${gap}
    ${className}
  `

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Responsive Card Component
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = { mobile: 4, tablet: 6, desktop: 8 }
}: {
  children: React.ReactNode
  className?: string
  padding?: { mobile: number; tablet: number; desktop: number }
}) {
  const paddingClasses = `
    bg-white rounded-lg shadow-lg 
    p-${padding.mobile} 
    md:p-${padding.tablet} 
    lg:p-${padding.desktop}
    ${className}
  `

  return (
    <div className={paddingClasses}>
      {children}
    </div>
  )
}

// Responsive Table Component
export function ResponsiveTable({ 
  headers, 
  data, 
  className = '' 
}: {
  headers: Array<{ key: string; label: string; render?: (value: any, row: any) => React.ReactNode }>
  data: any[]
  className?: string
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* Desktop Table */}
      <table className="hidden lg:table w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={header.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  index === 0 ? 'pl-6' : ''
                } ${index === headers.length - 1 ? 'pr-6' : ''}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {headers.map((header, colIndex) => (
                <td
                  key={header.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                    colIndex === 0 ? 'pl-6' : ''
                  } ${colIndex === headers.length - 1 ? 'pr-6' : ''}`}
                >
                  {header.render ? header.render(row[header.key], row) : row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                {row[headers[0].key]}
              </h3>
              <button
                onClick={() => toggleRow(rowIndex)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Toggle row details"
              >
                {expandedRows.has(rowIndex) ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            
            {expandedRows.has(rowIndex) && (
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                {headers.slice(1).map((header) => (
                  <div key={header.key} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {header.label}:
                    </span>
                    <span className="text-sm text-gray-900">
                      {header.render ? header.render(row[header.key], row) : row[header.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Responsive Form Component
export function ResponsiveForm({ 
  children, 
  className = '',
  layout = 'vertical' 
}: {
  children: React.ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal' | 'grid'
}) {
  const layoutClasses = {
    vertical: 'space-y-6',
    horizontal: 'space-y-6 md:space-y-0 md:space-x-6 md:flex md:items-end',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  }

  return (
    <form className={`space-y-6 ${layoutClasses[layout]} ${className}`}>
      {children}
    </form>
  )
}

// Responsive Button Group Component
export function ResponsiveButtonGroup({ 
  children, 
  className = '',
  direction = 'horizontal' 
}: {
  children: React.ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
}) {
  const directionClasses = {
    horizontal: 'flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2',
    vertical: 'flex flex-col space-y-2'
  }

  return (
    <div className={`${directionClasses[direction]} ${className}`}>
      {children}
    </div>
  )
}

// Responsive Sidebar Component
export function ResponsiveSidebar({ 
  children, 
  isOpen, 
  onToggle,
  className = '' 
}: {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-64 bg-white shadow-lg h-screen sticky top-0 ${className}`}>
        {children}
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onToggle} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

// Responsive Modal Component
export function ResponsiveModal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'medium',
  className = '' 
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'full'
  className?: string
}) {
  const sizeClasses = {
    small: 'max-w-sm mx-4',
    medium: 'max-w-md mx-4',
    large: 'max-w-lg mx-4',
    full: 'max-w-full mx-4 h-full'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} ${className} max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Responsive Image Component
export function ResponsiveImage({ 
  src, 
  alt, 
  className = '',
  sizes = '100vw',
  priority = false 
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        sizes={sizes}
        className="w-full h-auto object-cover"
        priority={priority}
      />
    </div>
  )
}

// Responsive Text Component
export function ResponsiveText({ 
  children, 
  size = 'base',
  weight = 'normal',
  className = '' 
}: {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
}) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  return (
    <span className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}>
      {children}
    </span>
  )
}

// Hook for responsive breakpoints
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint
  }
}

// Hook for touch detection
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkTouch()
    window.addEventListener('touchstart', checkTouch, { once: true })

    return () => {
      window.removeEventListener('touchstart', checkTouch)
    }
  }, [])

  return isTouch
}

// Hook for orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  return orientation
}
