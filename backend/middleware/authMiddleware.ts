import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { repository } from '../utils/repository.ts';
import { AppError } from './errorHandler.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
}

export const AUTH_COOKIE_NAME = 'quizora_session';

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function verifyCsrfForCookieMutation(req: Request): void {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }
  const hasCustomHeader = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const origin = req.headers.origin;
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return;
    } catch {
      // fall through
    }
  }

  if (!hasCustomHeader) {
    throw new AppError('CSRF check failed for cookie-authenticated request.', 403, 'CSRF_FAILED');
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    let usedCookie = false;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      const cookies = parseCookieHeader(req.headers.cookie);
      if (cookies[AUTH_COOKIE_NAME]) {
        token = cookies[AUTH_COOKIE_NAME];
        usedCookie = true;
      }
    }

    if (!token) {
      throw new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
    }

    if (usedCookie) {
      verifyCsrfForCookieMutation(req);
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded?.sub) {
      throw new AppError('Invalid session token.', 401, 'INVALID_TOKEN');
    }

    const user = await repository.findUserById(decoded.sub);
    if (!user) {
      throw new AppError('Account no longer exists.', 401, 'USER_NOT_FOUND');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError('Session expired or invalid. Please sign in again.', 401, 'INVALID_TOKEN'));
  }
}
