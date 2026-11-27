import crypto from 'crypto';

const globalForEnv = globalThis as unknown as { __quizoraFallbackJwtSecret?: string };

function getJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    return process.env.JWT_SECRET.trim();
  }
  if (!globalForEnv.__quizoraFallbackJwtSecret) {
    globalForEnv.__quizoraFallbackJwtSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalForEnv.__quizoraFallbackJwtSecret;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI?.trim() || '',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: '7d' as const,
};
