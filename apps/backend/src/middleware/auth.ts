import { Request, Response, NextFunction } from 'express';
import { verifyToken, getSessionFromToken } from '../lib/auth';

export interface AuthRequest extends Request {
  user?: any;
  session?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // JWT must have userId to be usable
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Try session lookup first, fall back to JWT payload if session store is unavailable
    const session = await getSessionFromToken(token);

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };
    req.session = session || req.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
