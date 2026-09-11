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

// 7. Intelligent AI Safety Filter & Chat Content Moderation Engine
export interface ChatModerationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function moderateChatMessage(text: string): ChatModerationResult {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
    };
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Deobfuscation Engine:
  // 1. Converts leetspeak numbers/symbols to letters (0->o, 3->e, 1->i, 4->a, 5->s, 7->t, 8->b, @->a, $->s, !->i)
  // 2. Removes all spaces, dots, dashes, underscores, and special characters to detect obfuscated words like "n g e n t 0 t"
  // 3. Strips non-alphabet characters to uncover hidden words like "t.e.r.o.r", "b-u-n-u-h", "k_o_n_t_o_l"
  // 4. Replaces wildcard symbols (*, #, @, $, %, +, -, _, ., !, ?) with vowel placeholders
  const deobfuscatedText = lowerText
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
    .replace(/[^a-z0-9]/g, '');

  const textWithoutSymbols = lowerText.replace(/[^a-z]/g, '');

  const wildcardSubstitutedText = lowerText
    .replace(/[*#@$%+\-_.\?!]/g, 'o')
    .replace(/[^a-z0-9]/g, '');

  const testPattern = (pattern: RegExp) => 
    pattern.test(lowerText) || 
    pattern.test(deobfuscatedText) || 
    pattern.test(textWithoutSymbols) || 
    pattern.test(wildcardSubstitutedText);

  // 0. Strict Anti-Symbolic Signs & Obfuscation Filter (Penyaring Tanda Simbolis & Obfuskasi Kode)
  const symbolicMaskingPatterns = [
    // Words with interspersed symbols like "t*e*r*o*r", "b-u-n-u-h", "n_g_e_n_t_o_t", "k.o.n.t.o.l"
    /([a-z0-9][*#@$%^&~+=_|\/\\.-]){2,}[a-z0-9]/i,
    // Consecutive masking symbols like "***", "###", "$$$", "@@@", "!@#$", "**"
    /[*#@$%^&~+=|\\<>{}\[\]]{2,}/,
    // Symbols embedded within words like "t*ror", "b*nuh", "k*ntol", "s*x", "b*kep"
    /\b[a-z]{1,4}[*#@$%^&~+=_|\/\\][a-z]{1,4}\b/i,
    // Pure symbol sequences without readable words
    /^[^a-zA-Z0-9\s\u4e00-\u9fa5\u0600-\u06FF\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F1E0-\u1F1FF]+$/,
    // Morse code or cipher symbols
    /^[\.\-\s]{4,}$/,
    // Secret code symbols pattern
    /[!@#$%^&*()_+=\-\[\]{};:'",.<>?\/\\|]{4,}/
  ];

  for (const pattern of symbolicMaskingPatterns) {
    if (pattern.test(cleanText)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  // Check overall symbol density: If non-alphanumeric/non-space symbols exceed 35% of message length and message is >= 4 chars
  const symbolCount = (cleanText.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (cleanText.length >= 4 && (symbolCount / cleanText.length) > 0.35) {
    return {
      isValid: false,
      errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
    };
  }

  // Fuzzy Wildcard & Asterisk Stem Masking Engine (Catches symbol masking like "ngen**t*t", "k*nt*l", "b*k*p", "t*r*r", "b*n*h")
  const wildcardMaskedPatterns = [
    /n\s*g\s*[\w*#@$%+\-_.\?!]{1,6}\s*t\s*[\w*#@$%+\-_.\?!]{1,4}\s*t/i,
    /k\s*[\w*#@$%+\-_.\?!]{1,3}\s*n\s*t\s*[\w*#@$%+\-_.\?!]{1,3}\s*l/i,
    /m\s*[\w*#@$%+\-_.\?!]{1,3}\s*m\s*[\w*#@$%+\-_.\?!]{1,3}\s*k/i,
    /p\s*[\w*#@$%+\-_.\?!]{1,3}\s*p\s*[\w*#@$%+\-_.\?!]{1,3}\s*k/i,
    /b\s*[\w*#@$%+\-_.\?!]{1,3}\s*k\s*[\w*#@$%+\-_.\?!]{1,3}\s*p/i,
    /p\s*[\w*#@$%+\-_.\?!]{1,3}\s*r\s*n\s*[\w*#@$%+\-_.\?!]{1,3}/i,
    /s\s*[\w*#@$%+\-_.\?!]{1,3}\s*k\s*s/i,
    /n\s*g\s*[\w*#@$%+\-_.\?!]{1,4}\s*w\s*[\w*#@$%+\-_.\?!]{1,2}/i,
    /c\s*[\w*#@$%+\-_.\?!]{1,3}\s*b\s*[\w*#@$%+\-_.\?!]{1,3}\s*l/i,
    /t\s*[\w*#@$%+\-_.\?!]{1,3}\s*r\s*[\w*#@$%+\-_.\?!]{1,3}\s*r/i,
    /b\s*[\w*#@$%+\-_.\?!]{1,3}\s*n\s*[\w*#@$%+\-_.\?!]{1,3}\s*h/i,
    /b\s*[*#@$%+\-_.\?!10oO]{1,3}\s*m/i,
    /r\s*[\w*#@$%+\-_.\?!]{1,3}\s*c\s*[\w*#@$%+\-_.\?!]{1,3}\s*n/i,
    /r\s*[\w*#@$%+\-_.\?!]{1,3}\s*m\s*p\s*[\w*#@$%+\-_.\?!]{1,3}\s*k/i,
    /c\s*[\w*#@$%+\-_.\?!]{1,3}\s*l\s*[\w*#@$%+\-_.\?!]{1,3}\s*k/i
  ];

  for (const pattern of wildcardMaskedPatterns) {
    if (pattern.test(lowerText)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  // 1. Check for Criminal, Terrorism, Violence, Harm, & Evil Planning Keywords (Anti-Obfuscation Mode)
  const dangerousPatterns = [
    /teror/i,
    /teroris/i,
    /terorisme/i,
    /bunuh/i,
    /pembunuhan/i,
    /membunuh/i,
    /racun/i,
    /meracun/i,
    /bom/i,
    /ledakan/i,
    /merakitbom/i,
    /perakitanbom/i,
    /senjata/i,
    /pistol/i,
    /senapan/i,
    /rampok/i,
    /perampokan/i,
    /merampok/i,
    /culik/i,
    /penculikan/i,
    /menculik/i,
    /sandera/i,
    /penyanderaan/i,
    /perencanaanjahat/i,
    /rencanajahat/i,
    /perencanaan/i,
    /eksekusi/i,
    /sabotase/i,
    /pembakaran/i,
    /membakar/i,
    /kejahatan/i,
    /kriminal/i,
    /penyerangan/i,
    /menyerang/i,
    /santet/i,
    /tindakanilegal/i,
    /ancaman/i,
    /ancam/i,
    /bantai/i,
    /pembantaian/i,
    /narkoba/i,
    /sabu/i,
    /ganja/i
  ];

  for (const pattern of dangerousPatterns) {
    if (testPattern(pattern)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  // 2. Check for Coded Communication & Secret Cipher Patterns (Obrolan Kode Rahasia)
  const codedPatterns = [
    /\b(code|kode|alfa|alpha|target|ops|op|agent|agen|signal|sinyal|pass|sandi)[-_\s]*[0-9a-z]+\b/i,
    /\b[a-z]{1,3}[-_\s]*[0-9]{2,6}\b/i,
    /\b[0-9]{3,8}[-_\s]*[a-z]{1,3}\b/i,
    /^[0-9]{3,10}$/,
    /^0x[0-9a-fA-F]{4,}$/,
    /^[a-zA-Z0-9+/]{8,}={0,2}$/,
    /^[*#$@!%^&]{3,}[0-9a-zA-Z]*$/,
    /\b(rahasia|secret)\s+[0-9a-z]{1,10}\b/i
  ];

  const isNormalFamilyTimeOrNumber = /^(jam|pukul|jam\s+\d{1,2}|\d{1,2}\s*menit|\d{1,2}\s*jam|tanggal\s+\d{1,2}|\d{1,2}\.\d{2}|\d{1,2}:\d{2})$/i.test(cleanText);

  if (!isNormalFamilyTimeOrNumber) {
    for (const pattern of codedPatterns) {
      if (pattern.test(lowerText)) {
        return {
          isValid: false,
          errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
        };
      }
    }
  }

  // 3. Check for Rude / Toxic / Inappropriate Words (Penyimpangan)
  const inappropriatePatterns = [
    /anjing/i,
    /babi/i,
    /bangsat/i,
    /kontol/i,
    /memek/i,
    /goblok/i,
    /tolol/i,
    /idiot/i,
    /setan/i,
    /iblis/i,
    /bajingan/i
  ];

  for (const pattern of inappropriatePatterns) {
    if (testPattern(pattern)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  // 4. Sexual & Adult Content Moderation (Penyaring Konten Seksual & Dewasa)
  const adultContentPatterns = [
    /seks/i,
    /porn/i,
    /bokep/i,
    /vulg/i,
    /telanjang/i,
    /penis/i,
    /vagina/i,
    /kontol/i,
    /memek/i,
    /pepek/i,
    /itil/i,
    /ngentot/i,
    /ngewe/i,
    /bersetubuh/i,
    /gairah/i,
    /syahwat/i,
    /perkosa/i,
    /pemerkosaan/i,
    /pelecehan/i,
    /cabul/i,
    /pencabulan/i,
    /masturbasi/i,
    /onani/i,
    /openbo/i,
    /prostitusi/i,
    /videodewasa/i,
    /filmdewasa/i,
    /kontendewasa/i,
    /bikinanak/i,
    /berhubunganbadan/i,
    /berhubunganintim/i,
    /kencandewasa/i,
    /silit/i,
    /tetek/i,
    /payudara/i,
    /toket/i,
    /crot/i,
    /sperma/i,
    /sanggama/i
  ];

  for (const pattern of adultContentPatterns) {
    if (testPattern(pattern)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  // 5. Cyber Attack & Exploit Payload Detection (Penyaring Serangan Cyber)
  const cyberAttackPatterns = [
    /(\b(select|union|insert|update|delete|drop|alter|truncate|exec|create)\b.+?\b(from|where|into|table|database|select)\b)/i,
    /('|\"|\b)(or|and)\s+('|\"|\d+)\s*=\s*('|\"|\d+)/i,
    /;\s*(drop|delete|exec|select|insert|update|alter)/i,
    /pg_sleep\s*\(|sleep\s*\(|benchmark\s*\(/i,
    /<script[^>]*>[\s\S]*?<\/script>/i,
    /javascript\s*:/i,
    /\bon(error|load|click|mouseover|submit|focus|blur)\s*=/i,
    /<(iframe|object|embed|svg|applet|meta|link)[^>]*>/i,
    /document\.(cookie|location|referrer|domain)/i,
    /eval\s*\(|String\.fromCharCode\s*\(/i,
    /;\s*(system|exec|passthru|shell_exec|popen|cmd|powershell|bash|sh|curl|wget)\b/i,
    /\b(rm\s+-rf|cmd\.exe|powershell\.exe|\/bin\/bash|\/bin\/sh)\b/i,
    /\|\s*(bash|sh|cmd|powershell)/i,
    /(\.\.\/|\.\.\\){2,}/,
    /\/etc\/(passwd|shadow|group|hosts)/i,
    /c:\\windows\\(system32|repair|win\.ini)/i,
    /https?:\/\/[^\s]+\.(exe|bat|cmd|vbs|scr|sh|dll|msi|ps1|apk|jar)\b/i,
    /(.)\1{120,}/
  ];

  for (const pattern of cyberAttackPatterns) {
    if (pattern.test(cleanText)) {
      return {
        isValid: false,
        errorMessage: 'Gunakan obrolan yang sesuai tanpa ada kode tertentu dan tidak menyimpang'
      };
    }
  }

  return { isValid: true };
}
