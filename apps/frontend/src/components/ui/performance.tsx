'use client'

import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import styles from './performance.module.css'

// Lazy Image Component with Intersection Observer
export function LazyImage({ 
  src, 
  alt, 
  placeholder = '/placeholder.jpg',
  className = '',
  onLoad,
  onError 
}: {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <Image
        src={isInView ? src : placeholder}
        alt={alt}
        width={800}
        height={600}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-auto object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit: 'cover' }}
        loading="lazy"
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Code Splitting Component
export function CodeSplitComponent({ 
  componentPath, 
  fallback = <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
}: {
  componentPath: string
  fallback?: React.ReactNode
}) {
  const LazyComponent = lazy(() => import(`../${componentPath}`))

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  )
}

// Virtual List Component for large datasets
export function VirtualList<T>({ 
  items, 
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  className = ''
}: {
  items: T[]
  itemHeight?: number
  containerHeight?: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [itemHeight])

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleStart + index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle Hook
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => clearTimeout(handler)
  }, [value, limit])

  return throttledValue
}

// Performance Monitor Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  })

  useEffect(() => {
    // Measure page load time
    const measureLoadTime = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        setMetrics(prev => ({ ...prev, loadTime }))
      }
    }

    // Measure render time
    const measureRenderTime = () => {
      const start = performance.now()
      
      requestAnimationFrame(() => {
        const end = performance.now()
        const renderTime = end - start
        setMetrics(prev => ({ ...prev, renderTime }))
      })
    }

    // Measure memory usage (if available)
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
        setMetrics(prev => ({ ...prev, memoryUsage }))
      }
    }

    measureLoadTime()
    measureRenderTime()
    measureMemoryUsage()

    // Set up periodic monitoring
    const interval = setInterval(() => {
      measureMemoryUsage()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Bundle Size Analyzer Component
export function BundleSizeAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState({
    totalSize: 0,
    chunks: [] as Array<{ name: string; size: number }>
  })

  useEffect(() => {
    // This would typically be done at build time
    // Here's a mock implementation
    const mockBundleInfo = {
      totalSize: 2.3, // MB
      chunks: [
        { name: 'main', size: 1.2 },
        { name: 'vendor', size: 0.8 },
        { name: 'runtime', size: 0.3 }
      ]
    }
    setBundleInfo(mockBundleInfo)
  }, [])

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-2">Bundle Analysis</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Size:</span>
          <span className="text-sm font-medium">{bundleInfo.totalSize} MB</span>
        </div>
        {bundleInfo.chunks.map((chunk, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-gray-600">{chunk.name}:</span>
            <span className="text-sm">{chunk.size} MB</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Resource Optimization Hook
export function useResourceOptimization() {
  const [optimized, setOptimized] = useState({
    imagesOptimized: false,
    fontsOptimized: false,
    cssOptimized: false,
    jsOptimized: false
  })

  useEffect(() => {
    // Check for optimized resources
    const checkOptimizations = () => {
      const imagesOptimized = document.querySelectorAll('img[loading="lazy"]').length > 0
      const fontsOptimized = document.querySelector('link[rel="preload"][as="font"]') !== null
      const cssOptimized = document.querySelector('link[rel="preload"][as="style"]') !== null
      const jsOptimized = document.querySelector('script[async], script[defer]') !== null

      setOptimized({
        imagesOptimized,
        fontsOptimized,
        cssOptimized,
        jsOptimized
      })
    }

    checkOptimizations()
  }, [])

  return optimized
}

// Service Worker Registration Hook
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)

      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setIsRegistered(true)
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return { isSupported, isRegistered }
}

// Cache Management Hook
export function useCacheManagement() {
  const [cacheInfo, setCacheInfo] = useState({
    size: 0,
    entries: 0
  })

  useEffect(() => {
    if ('caches' in window) {
      caches.open('app-cache').then((cache) => {
        cache.keys().then((keys) => {
          setCacheInfo({
            size: keys.length,
            entries: keys.length
          })
        })
      })
    }
  }, [])

  const clearCache = async () => {
    if ('caches' in window) {
      await caches.delete('app-cache')
      setCacheInfo({ size: 0, entries: 0 })
    }
  }

  return { cacheInfo, clearCache }
}

// Performance Metrics Component
export function PerformanceMetrics() {
  const metrics = usePerformanceMonitor()
  const optimized = useResourceOptimization()
  const { isRegistered } = useServiceWorker()

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Timing</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Load Time:</span>
                <span className={metrics.loadTime > 3000 ? 'text-red-600' : 'text-green-600'}>
                  {metrics.loadTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Render Time:</span>
                <span className={metrics.renderTime > 16 ? 'text-red-600' : 'text-green-600'}>
                  {metrics.renderTime.toFixed(2)}ms
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Memory</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className={metrics.memoryUsage > 50 ? 'text-red-600' : 'text-green-600'}>
                  {metrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold text-gray-900 mb-3">Optimization Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Images:</span>
            <span className={`text-sm ${optimized.imagesOptimized ? 'text-green-600' : 'text-red-600'}`}>
              {optimized.imagesOptimized ? 'Optimized' : 'Not Optimized'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Fonts:</span>
            <span className={`text-sm ${optimized.fontsOptimized ? 'text-green-600' : 'text-red-600'}`}>
              {optimized.fontsOptimized ? 'Optimized' : 'Not Optimized'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CSS:</span>
            <span className={`text-sm ${optimized.cssOptimized ? 'text-green-600' : 'text-red-600'}`}>
              {optimized.cssOptimized ? 'Optimized' : 'Not Optimized'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">JavaScript:</span>
            <span className={`text-sm ${optimized.jsOptimized ? 'text-green-600' : 'text-red-600'}`}>
              {optimized.jsOptimized ? 'Optimized' : 'Not Optimized'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Service Worker:</span>
            <span className={`text-sm ${isRegistered ? 'text-green-600' : 'text-red-600'}`}>
              {isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
