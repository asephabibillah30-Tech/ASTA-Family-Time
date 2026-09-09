/**
 * ASTA Family Time - Cryptographic & Security Utility Suite
 * Provides Web Crypto SHA-256 hashing, rate limiting, anti-XSS sanitization, and token generation.
 */

// Global App Salt
const APP_PEPPER = 'ASTA_SECURE_SALT_v1_2026';

// 1. Hashing using Web Crypto API SHA-256
export async function hashSHA256(text: string, salt: string = APP_PEPPER): Promise<string> {
  const combined = `${salt}:${text}:${salt}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  // Synchronous fallback hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_sec';
}

// Synchronous Fast Hash for Instant Storage Comparison
export function fastHashSync(text: string, salt: string = APP_PEPPER): string {
  const combined = `${salt}_${text}_${salt}`;
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return 'sec_' + Math.abs(hash).toString(16);
}

// 2. Anti-XSS Sanitization
export function sanitizeInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Strip all HTML tags
    .replace(/[\"\']/g, '')   // Remove dangerous quotes
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

// 3. Rate Limiter for Anti-Brute Force Protection
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
}

class RateLimiter {
  private attemptsMap: Map<string, RateLimitRecord> = new Map();
  private maxAttempts = 5;
  private lockoutDurationSeconds = 30;

  public checkLockout(key: string): { isLocked: boolean; remainingSeconds: number } {
    const record = this.attemptsMap.get(key);
    if (!record) return { isLocked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (record.lockoutUntil > now) {
      const remaining = Math.ceil((record.lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remaining };
    }

    if (record.lockoutUntil <= now && record.lockoutUntil > 0) {
      // Lockout expired, reset
      this.attemptsMap.delete(key);
      return { isLocked: false, remainingSeconds: 0 };
    }

    return { isLocked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(key: string): { isLocked: boolean; attemptsLeft: number; remainingSeconds: number } {
    const now = Date.now();
    let record = this.attemptsMap.get(key);

    if (!record || (record.lockoutUntil > 0 && record.lockoutUntil <= now)) {
      record = { attempts: 1, lockoutUntil: 0 };
    } else {
      record.attempts += 1;
    }

    if (record.attempts >= this.maxAttempts) {
      record.lockoutUntil = now + this.lockoutDurationSeconds * 1000;
      this.attemptsMap.set(key, record);
      return { isLocked: true, attemptsLeft: 0, remainingSeconds: this.lockoutDurationSeconds };
    }

    this.attemptsMap.set(key, record);
    return {
      isLocked: false,
      attemptsLeft: this.maxAttempts - record.attempts,
      remainingSeconds: 0
    };
  }

  public resetAttempts(key: string): void {
    this.attemptsMap.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// 4. Secure Random Token Generator
export function generateCryptoToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}
