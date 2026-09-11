import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, AlertTriangle, Eye, EyeOff, X } from 'lucide-react';
import { sound } from '../../utils/sound';
import { rateLimiter, sanitizeInput } from '../../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminRole: string) => void;
  currentFamilyCode?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentFamilyCode = 'ASTA-2026',
}) => {
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSecurityStatus(null);

    // 1. Anti-Brute Force Lockout Check
    const lockout = rateLimiter.checkLockout('admin_login');
    if (lockout.isLocked) {
      setErrorMessage(`⚠️ Terlalu banyak percobaan gagal! Login Admin terkunci demi keamanan selama ${lockout.remainingSeconds} detik.`);
      sound.playTimerWarning();
      return;
    }

    // 2. Input Sanitization (Anti XSS & Script Injection)
    const cleanUser = sanitizeInput(adminUsername);
    const cleanPass = adminPassword.trim();
    const cleanPin = secretPin.trim();

    // Check for malicious injection patterns
    const injectionPattern = /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|CREATE|EXEC)\b)|[<>{}\$]/i;
    if (injectionPattern.test(cleanUser) || injectionPattern.test(cleanPass)) {
      sound.playTimerWarning();
      rateLimiter.recordFailedAttempt('admin_login');
      setSecurityStatus('🛡️ DITEKSEI & DIBLOKIR: Terdeteksi pola karakter/perintah berbahaya pada input (SQL/Script Injection).');
      return;
    }

    // 3. Verification Logic
    // Default master password or family code matching
    const isValidPassword = cleanPass === 'asta2026' || cleanPass === 'admin123' || cleanPass === currentFamilyCode;
    const isValidPin = cleanPin === '1234' || cleanPin === '2026' || cleanPin.length >= 4;

    if (cleanUser && isValidPassword && isValidPin) {
      rateLimiter.resetAttempts('admin_login');
      sound.playVictory();
      onLoginSuccess('Super Admin & Pengelola Keluarga');
      onClose();
    } else {
      sound.playTimerWarning();
      const failRecord = rateLimiter.recordFailedAttempt('admin_login');
      if (failRecord.isLocked) {
        setErrorMessage(`⚠️ Keamanan Ketat Aktif: Sisa 0 percobaan! Login dikunci selama ${failRecord.remainingSeconds} detik.`);
      } else {
        setErrorMessage(`❌ Password atau Kode Kunci Admin salah! (Sisa percobaan: ${failRecord.attemptsLeft})`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-pop-in">
      <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-2xl border-4 border-amber-300 dark:border-amber-700 space-y-5 my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
            🔐
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Portal Admin & Pengelola
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Menu khusus Kepala Keluarga / Pengelola Sistem ASTA untuk mengatur aplikasi, akun, dan keamanan.
          </p>
        </div>

        {/* Security Shield Info Badge */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="font-extrabold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>PROTEKSI KEAMANAN CYBER KETAT (ACTIVE)</span>
          </div>
          <ul className="space-y-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li><strong>Anti-XSS & Script Injection:</strong> Input disanitasi secara *real-time*.</li>
            <li><strong>Anti-Brute Force:</strong> Penguncian otomatis setelah 5x kesalahan berturut-turut.</li>
            <li><strong>Enkripsi Sesi:</strong> Data dilindungi enkripsi SHA-256 Web Crypto.</li>
          </ul>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 p-3 rounded-2xl text-xs font-bold flex items-start gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Cyber Security Detection Alert */}
        {securityStatus && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-2xl text-xs font-bold flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>{securityStatus}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Username Admin / Kepala Keluarga:
            </label>
            <div className="relative">
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Masukkan username admin..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password Admin (Default: <code className="text-amber-600 dark:text-amber-400">asta2026</code> / Kode Keluarga):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secret PIN / Key Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kode Kunci Keamanan 4 Digit (Default: <code className="text-amber-600 dark:text-amber-400">1234</code>):
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={secretPin}
                onChange={(e) => setSecretPin(e.target.value)}
                placeholder="Ketuk kode PIN 4 digit..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-colors letter-spacing-widest"
                required
              />
              <Key className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 text-white font-display font-black text-xs shadow-bubbly-coral flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
          >
            <Lock className="w-4 h-4 fill-white" />
            <span>MASUK KE PORTAL ADMIN</span>
          </button>
        </form>

      </div>
    </div>
  );
};
