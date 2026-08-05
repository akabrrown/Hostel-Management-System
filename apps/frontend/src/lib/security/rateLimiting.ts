interface RateLimitEntry {
  count: number
  resetTime: number
}

export class RateLimiter {
  private storage: Map<string, RateLimitEntry>
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.storage = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.storage.get(key)

    if (!entry || now > entry.resetTime) {
      // New entry or expired entry
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      }
    }

    // Existing entry within window
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment count
    entry.count++
    this.storage.set(key, entry)

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  reset(key: string): void {
    this.storage.delete(key)
  }

  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.storage.entries())
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i]
      if (now > entry.resetTime) {
        this.storage.delete(key)
      }
    }
  }
}

// Predefined rate limiters
export const authRateLimiter = new RateLimiter(process.env.NODE_ENV === 'production' ? 5 : 500, 15 * 60 * 1000) // 5 requests per 15 minutes in prod, 500 in dev
export const generalRateLimiter = new RateLimiter(100, 60 * 1000) // 100 requests per minute
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000) // 10 uploads per minute
export const bookingRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 bookings per hour

// Client-side rate limiting utilities
export const getClientId = (): string => {
  if (typeof window === 'undefined') return 'server'
  
  let clientId = localStorage.getItem('client_id')
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('client_id', clientId)
  }
  return clientId
}

export const getIPBasedKey = (ip: string, endpoint: string): string => {
  return ip + ':' + endpoint
}

export const getUserBasedKey = (userId: string, endpoint: string): string => {
  return 'user:' + userId + ':' + endpoint
}

// Rate limiting middleware for API routes
export const withRateLimit = (
  handler: (req: any, res: any) => Promise<void>,
  limiter: RateLimiter,
  getKey: (req: any) => string
) => {
  return async (req: any, res: any) => {
    const key = getKey(req)
    const result = limiter.isAllowed(key)

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter['maxRequests'])
    res.setHeader('X-RateLimit-Remaining', result.remaining)
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toUTCString())

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: result.resetTime,
      })
      return
    }

    await handler(req, res)
  }
}

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    authRateLimiter.cleanup()
    generalRateLimiter.cleanup()
    uploadRateLimiter.cleanup()
    bookingRateLimiter.cleanup()
  }, 5 * 60 * 1000) // Cleanup every 5 minutes
}
