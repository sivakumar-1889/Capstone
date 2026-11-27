import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('Requested API endpoint does not exist.', 404, 'NOT_FOUND'));
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Handle Mongoose duplicate key or validation errors cleanly
  const mongoErr = err as { code?: number; name?: string; message?: string };
  if (mongoErr.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'An account with this email address already exists.',
      code: 'DUPLICATE_EMAIL',
    });
    return;
  }

  if (mongoErr.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: mongoErr.message || 'Validation failed.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
