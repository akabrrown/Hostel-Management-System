import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitInfo>();

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = process.env.NODE_ENV === 'production' ? 5 : 500; // 500 attempts in dev

  let info = store.get(ip);
  if (!info) {
    info = { count: 0, resetTime: now + windowMs };
    store.set(ip, info);
  }

  if (now > info.resetTime) {
    info.count = 0;
    info.resetTime = now + windowMs;
  }

  info.count++;

  if (info.count > max) {
    return res.status(429).json({
      error: 'Too many login attempts from this IP, please try again after 15 minutes'
    });
  }

  next();
};

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of store.entries()) {
    if (now > info.resetTime) {
      store.delete(ip);
    }
  }
}, 15 * 60 * 1000);
