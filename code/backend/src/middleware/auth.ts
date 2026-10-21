import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const DEV_FALLBACK_SECRET = 'dev-only-secret-change-me';
const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('JWT_SECRET is not set. Using an insecure development secret.');
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (!decoded?.id) throw new Error('Malformed token');
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch {
    // 401 so clients treat it the same as a missing session and sign the user out.
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

/** Signs only identity claims; never pass a full user document here. */
export function generateToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });
}
