import mongoose from 'mongoose';

export function asTrimmedString(value: unknown, maxLength = 500): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function asOptionalString(value: unknown, maxLength = 15000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  return mongoose.Types.ObjectId.isValid(trimmed) || /^[a-f0-9]{24}$/i.test(trimmed);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
