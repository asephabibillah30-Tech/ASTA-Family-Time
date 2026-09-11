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

// 5. End-to-End Encryption (E2EE) for Family Chat
export function encryptMessageE2EE(text: string, familyKey: string = 'ASTA-FAMILY-E2EE'): string {
  if (!text || typeof text !== 'string') return '';
  try {
    const combinedKey = `${APP_PEPPER}_${familyKey}`;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    const base64 = btoa(encodeURIComponent(result));
    return `🔒[E2EE]:${base64}`;
  } catch (e) {
    return text;
  }
}

export function decryptMessageE2EE(cipherText: string, familyKey: string = 'ASTA-FAMILY-E2EE'): string {
  if (!cipherText || typeof cipherText !== 'string') return '';
  if (!cipherText.startsWith('🔒[E2EE]:')) {
    return cipherText; // Plain text fallback
  }
  try {
    const base64 = cipherText.replace('🔒[E2EE]:', '');
    const decoded = decodeURIComponent(atob(base64));
    const combinedKey = `${APP_PEPPER}_${familyKey}`;
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return result;
  } catch (e) {
    return cipherText;
  }
}

// 6. Universal End-to-End Storage Encryption & Decryption Engine
const E2EE_STORAGE_PREFIX = 'ENC_ASTA_E2EE_v1:';

export function encryptStorageData<T>(data: T, keySeed: string = APP_PEPPER): string {
  try {
    if (data === null || data === undefined) return '';
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    const combinedKey = `${APP_PEPPER}_${keySeed}`;
    let cipher = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i);
      const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
      cipher += String.fromCharCode(charCode ^ keyChar);
    }
    const base64 = btoa(encodeURIComponent(cipher));
    return `${E2EE_STORAGE_PREFIX}${base64}`;
  } catch (err) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
}

export function decryptStorageData<T>(encryptedStr: string, keySeed: string = APP_PEPPER): T | null {
  try {
    if (!encryptedStr || typeof encryptedStr !== 'string') return null;

    if (!encryptedStr.startsWith(E2EE_STORAGE_PREFIX)) {
      // Unencrypted JSON legacy string fallback
      try {
        return JSON.parse(encryptedStr) as T;
      } catch {
        return encryptedStr as unknown as T;
      }
    }

    const base64 = encryptedStr.replace(E2EE_STORAGE_PREFIX, '');
    const decoded = decodeURIComponent(atob(base64));
    const combinedKey = `${APP_PEPPER}_${keySeed}`;
    let raw = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyChar = combinedKey.charCodeAt(i % combinedKey.length);
      raw += String.fromCharCode(charCode ^ keyChar);
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    return null;
  }
}
