import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { AUTH_COOKIE_NAME, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { repository } from '../utils/repository.ts';
import { asTrimmedString, isValidEmail } from '../utils/validation.ts';

function signToken(user: { id: string; email: string }): string {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader(
      'Set-Cookie',
      `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; Secure; SameSite=None; Partitioned`
    );
  } else {
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}

function clearSessionCookie(req: Request, res: Response): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader(
      'Set-Cookie',
      `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned`
    );
  } else {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const name = asTrimmedString(req.body?.name, 80);
    const emailRaw = asTrimmedString(req.body?.email, 254);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || name.length < 2) {
      throw new AppError('Please enter your full name (at least 2 characters).', 400, 'INVALID_NAME');
    }
    if (!emailRaw || !isValidEmail(emailRaw)) {
      throw new AppError('Please provide a valid email address.', 400, 'INVALID_EMAIL');
    }
    if (password.length < 8 || password.length > 128) {
      throw new AppError('Password must be between 8 and 128 characters.', 400, 'INVALID_PASSWORD');
    }

    const email = emailRaw.toLowerCase();
    const existing = await repository.findUserByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await repository.createUser({
      name,
      email,
      password: passwordHash,
    });

    const token = signToken(created);
    setSessionCookie(req, res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        createdAt: created.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const emailRaw = asTrimmedString(req.body?.email, 254);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!emailRaw || !isValidEmail(emailRaw) || !password) {
      throw new AppError('Please enter both your email address and password.', 400, 'INVALID_CREDENTIALS_INPUT');
    }

    const user = await repository.findUserByEmail(emailRaw.toLowerCase());
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = signToken(user);
    setSessionCookie(req, res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response): void {
  clearSessionCookie(req, res);
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }
    const user = await repository.findUserById(req.user.id);
    if (!user) {
      throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
