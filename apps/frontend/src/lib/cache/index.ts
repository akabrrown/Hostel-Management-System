// Performance optimization and caching utilities
// Note: Redis client requires 'redis' package to be installed
// import { createClient } from 'redis'

// Cache configuration
interface CacheConfig {
  redis: {
    url: string
    keyPrefix: string
    defaultTTL: number
  }
  memory: {
    maxSize: number
    cleanupInterval: number
  }
  api: {
    defaultTTL: number
    maxAge: number
    etag: boolean
  }
}

// Cache entry interface
interface CacheEntry<T = any> {
  key: string
  value: T
  ttl: number
  createdAt: number
  accessedAt: number
  hitCount: number
}

// Memory cache implementation
class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number
  private cleanupInterval: number
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(maxSize: number = 1000, cleanupInterval: number = 60000) {
    this.maxSize = maxSize
    this.cleanupInterval = cleanupInterval
    this.startCleanup()
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    
    // Remove expired entries
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(key)
      }
    }

    // Remove least recently used entries if cache is full
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].accessedAt - b[1].accessedAt)
      
      const toRemove = entries.slice(0, this.cache.size - this.maxSize)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  set<T>(key: string, value: T, ttl: number = 300000): void { // 5 minutes default
    const now = Date.now()
    
    this.cache.set(key, {
      key,
      value,
      ttl,
      createdAt: now,
      accessedAt: now,
      hitCount: 0,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if entry is expired
    if (now - entry.createdAt > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessedAt = now
    entry.hitCount++
    
    return entry.value
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  getStats(): {
    size: number
    hitRate: number
    averageHitCount: number
  } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0)
    const averageHitCount = entries.length > 0 ? totalHits / entries.length : 0
    
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track misses for this
      averageHitCount,
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.cache.clear()
  }
}

// Redis cache implementation
class RedisCache {
  private client: any
  private keyPrefix: string
  private defaultTTL: number

  constructor(redisUrl: string, keyPrefix: string = 'upsa:', defaultTTL: number = 300000) {
    this.keyPrefix = keyPrefix
    this.defaultTTL = defaultTTL
    
    // Note: Redis client would be initialized here if 'redis' package is installed
    // this.client = createClient({ url: redisUrl })
    // this.connect()
  }

  private async connect(): Promise<void> {
    try {
      // await this.client.connect()
      console.log('Redis client connection disabled - install redis package to enable')
    } catch (error) {
      console.error('Redis connection error:', error)
    }
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      // await this.client.setEx(this.getKey(key), Math.ceil(ttl / 1000), serializedValue)
      console.log('Redis set disabled - install redis package to enable')
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // const value = await this.client.get(this.getKey(key))
      // return value ? JSON.parse(value) : null
      console.log('Redis get disabled - install redis package to enable')
      return null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      // const result = await this.client.del(this.getKey(key))
      // return result > 0
      console.log('Redis delete disabled - install redis package to enable')
      return false
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      // const pattern = `${this.keyPrefix}*`
      // const keys = await this.client.keys(pattern)
      // if (keys.length > 0) {
      //   await this.client.del(keys)
      // }
      console.log('Redis clear disabled - install redis package to enable')
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      // const result = await this.client.exists(this.getKey(key))
      // return result > 0
      console.log('Redis exists disabled - install redis package to enable')
      return false
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      // return await this.client.ttl(this.getKey(key))
      console.log('Redis TTL disabled - install redis package to enable')
      return -1
    } catch (error) {
      console.error('Redis TTL error:', error)
      return -1
    }
  }

  async disconnect(): Promise<void> {
    try {
      // await this.client.disconnect()
      console.log('Redis disconnect disabled - install redis package to enable')
    } catch (error) {
      console.error('Redis disconnect error:', error)
    }
  }
}

// Cache manager
class CacheManager {
  private memoryCache: MemoryCache
  private redisCache: RedisCache | null = null
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
    this.memoryCache = new MemoryCache(
      config.memory.maxSize,
      config.memory.cleanupInterval
    )

    // Initialize Redis if URL is provided and redis package is available
    if (config.redis.url && typeof window === 'undefined') {
      try {
        // this.redisCache = new RedisCache(
        //   config.redis.url,
        //   config.redis.keyPrefix,
        //   config.redis.defaultTTL
        // )
        console.log('Redis cache disabled - install redis package to enable')
      } catch (error) {
        console.warn('Redis initialization failed:', error)
      }
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheTTL = ttl || this.config.api.defaultTTL
    
    // Set in memory cache
    this.memoryCache.set(key, value, cacheTTL)
    
    // Set in Redis if available
    if (this.redisCache) {
      await this.redisCache.set(key, value, cacheTTL)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryValue = this.memoryCache.get<T>(key)
    if (memoryValue !== null) {
      return memoryValue
    }
    
    // Try Redis cache
    if (this.redisCache) {
      const redisValue = await this.redisCache.get<T>(key)
      if (redisValue !== null) {
        // Store in memory cache for faster access
        this.memoryCache.set(key, redisValue, this.config.api.defaultTTL)
        return redisValue
      }
    }
    
    return null
  }

  async delete(key: string): Promise<boolean> {
    const memoryDeleted = this.memoryCache.delete(key)
    let redisDeleted = true
    
    if (this.redisCache) {
      redisDeleted = await this.redisCache.delete(key)
    }
    
    return memoryDeleted && redisDeleted
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    
    if (this.redisCache) {
      await this.redisCache.clear()
    }
  }

  async exists(key: string): Promise<boolean> {
    const memoryExists = this.memoryCache.get(key) !== null
    
    if (memoryExists) {
      return true
    }
    
    if (this.redisCache) {
      return await this.redisCache.exists(key)
    }
    
    return false
  }

  getStats(): {
    memory: {
      size: number
      hitRate: number
      averageHitCount: number
    }
    redis?: {
      connected: boolean
    }
  } {
    const stats = {
      memory: this.memoryCache.getStats(),
      redis: this.redisCache ? { connected: true } : undefined,
    }
    
    return stats
  }

  async destroy(): Promise<void> {
    this.memoryCache.destroy()
    
    if (this.redisCache) {
      try {
        await this.redisCache.disconnect()
      } catch (error) {
        console.warn('Redis disconnect error during destroy:', error)
      }
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private thresholds: Map<string, number> = new Map()

  constructor() {
    this.setThresholds()
  }

  private setThresholds(): void {
    this.thresholds.set('api_response_time', 1000) // 1 second
    this.thresholds.set('database_query_time', 500) // 500ms
    this.thresholds.set('cache_hit_rate', 0.8) // 80%
    this.thresholds.set('memory_usage', 0.8) // 80%
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetricStats(name: string): {
    current: number
    average: number
    min: number
    max: number
    threshold: number
    isHealthy: boolean
  } | null {
    const values = this.metrics.get(name)
    
    if (!values || values.length === 0) {
      return null
    }
    
    const current = values[values.length - 1]
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const threshold = this.thresholds.get(name) || 0
    
    return {
      current,
      average,
      min,
      max,
      threshold,
      isHealthy: current <= threshold,
    }
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    
    const metricKeys = Array.from(this.metrics.keys())
    for (let i = 0; i < metricKeys.length; i++) {
      const name = metricKeys[i]
      result[name] = this.getMetricStats(name)
    }
    
    return result
  }

  isHealthy(): boolean {
    const metricKeys = Array.from(this.metrics.keys())
    for (let i = 0; i < metricKeys.length; i++) {
      const name = metricKeys[i]
      const stats = this.getMetricStats(name)
      if (stats && !stats.isHealthy) {
        return false
      }
    }
    return true
  }
}

// API response caching middleware
export const createCacheMiddleware = (cacheManager: CacheManager) => {
  return async (req: Request, res: Response, next: Function) => {
    const cacheKey = `api:${req.method}:${req.url}`
    
    // Check cache for GET requests
    if (req.method === 'GET') {
      const cachedResponse = await cacheManager.get(cacheKey)
      
      if (cachedResponse) {
        return new Response(JSON.stringify(cachedResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-TTL': '300',
          },
        })
      }
    }
    
    // Continue to next middleware
    const response = await next(req, res)
    
    // Cache successful GET responses
    if (req.method === 'GET' && response.status === 200) {
      const responseData = await response.clone().json()
      await cacheManager.set(cacheKey, responseData, 300000) // 5 minutes
    }
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...response.headers,
        'X-Cache': 'MISS',
      },
    })
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image URLs
  generateResponsiveUrl: (baseUrl: string, width: number, height: number, quality: number = 80): string => {
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: quality.toString(),
      auto: 'format',
    })
    
    return `${baseUrl}?${params.toString()}`
  },

  // Generate srcset for responsive images
  generateSrcSet: (baseUrl: string, sizes: number[], quality: number = 80): string => {
    return sizes
      .map(size => `${imageOptimization.generateResponsiveUrl(baseUrl, size, Math.round(size * 0.75), quality)} ${size}w`)
      .join(', ')
  },

  // Lazy loading image placeholder
  generatePlaceholder: (width: number, height: number): string => {
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `.trim()
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  },
}

// Bundle optimization utilities
export const bundleOptimization = {
  // Code splitting strategies
  splitChunks: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all',
    },
    common: {
      name: 'common',
      minChunks: 2,
      chunks: 'all',
      enforce: true,
    },
  },

  // Tree shaking configuration
  treeShake: {
    usedExports: true,
    sideEffects: false,
  },

  // Compression settings
  compression: {
    gzip: true,
    brotli: true,
    threshold: 10240, // 10KB
  },
}

// Initialize cache and performance monitoring
const config: CacheConfig = {
  redis: {
    url: process.env.REDIS_URL || '',
    keyPrefix: 'upsa:',
    defaultTTL: 300000, // 5 minutes
  },
  memory: {
    maxSize: 1000,
    cleanupInterval: 60000, // 1 minute
  },
  api: {
    defaultTTL: 300000, // 5 minutes
    maxAge: 300,
    etag: true,
  },
}

export const cacheManager = new CacheManager(config)
export const performanceMonitor = new PerformanceMonitor()

// Performance hooks
export const usePerformance = () => {
  const measureApiCall = async <T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - start
      performanceMonitor.recordMetric(`api_${name}_duration`, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      performanceMonitor.recordMetric(`api_${name}_duration`, duration)
      performanceMonitor.recordMetric(`api_${name}_error`, 1)
      throw error
    }
  }

  const measureCacheHit = (key: string, hit: boolean): void => {
    performanceMonitor.recordMetric('cache_hit', hit ? 1 : 0)
  }

  return {
    measureApiCall,
    measureCacheHit,
    getMetrics: performanceMonitor.getAllMetrics,
    isHealthy: performanceMonitor.isHealthy,
  }
}

// Cleanup on process exit
process.on('SIGTERM', async () => {
  await cacheManager.destroy()
})

process.on('SIGINT', async () => {
  await cacheManager.destroy()
})
