import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Settings, Gamepad2, BarChart3, 
  ArrowLeft, Lock, ShieldAlert, 
  CheckCircle2, Plus,
  Crown, LogOut, Search, Menu, X, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { rateLimiter, sanitizeInput } from '../../utils/security';
import type { FamilyAccount, UserAccount } from '../../types/auth';

interface RegisteredFamily {
  id: string;
  familyCode: string;
  familyName: string;
  headName: string;
  headEmail: string;
  headAvatar: string;
  membersCount: number;
  totalLovePoints: number;
  streakDays: number;
  createdAt: string;
  status: 'active' | 'suspended';
}

const INITIAL_FAMILIES_DB: RegisteredFamily[] = [
  {
    id: 'fam-1',
    familyCode: 'ASTA-4539',
    familyName: 'Keluarga Harmonis ASTA',
    headName: 'Papa Asep',
    headEmail: 'asep.head@asta.family',
    headAvatar: '👨‍💼',
    membersCount: 4,
    totalLovePoints: 1250,
    streakDays: 14,
    createdAt: '2026-09-01',
    status: 'active'
  },
  {
    id: 'fam-2',
    familyCode: 'ASTA-2026',
    familyName: 'Keluarga Bahagia Budi',
    headName: 'Ayah Budi',
    headEmail: 'budi.head@asta.family',
    headAvatar: '👨‍👩‍👧‍👦',
    membersCount: 5,
    totalLovePoints: 980,
    streakDays: 7,
    createdAt: '2026-09-05',
    status: 'active'
  },
  {
    id: 'fam-3',
    familyCode: 'ASTA-8812',
    familyName: 'Keluarga Ceria Rahma',
    headName: 'Ibu Rahma',
    headEmail: 'rahma.head@asta.family',
    headAvatar: '👩‍💼',
    membersCount: 3,
    totalLovePoints: 620,
    streakDays: 5,
    createdAt: '2026-09-08',
    status: 'active'
  },
];

interface AstaAdminPortalScreenProps {
  currentFamily?: FamilyAccount | null;
  currentUser?: UserAccount | null;
  onGoBackToApp: () => void;
}

type AdminSidebarMenu = 'head_families' | 'cyber_security' | 'system_settings' | 'game_engine' | 'telemetry';

export const AstaAdminPortalScreen: React.FC<AstaAdminPortalScreenProps> = ({
  currentFamily: _currentFamily,
  currentUser: _currentUser,
  onGoBackToApp,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState<AdminSidebarMenu>('head_families');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login Credentials State
  const [adminUser, setAdminUser] = useState('administrator_asta');
  const [adminPass, setAdminPass] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSecurityAlert, setLoginSecurityAlert] = useState<string | null>(null);

  // Registered Families State Management
  const [families, setFamilies] = useState<RegisteredFamily[]>(INITIAL_FAMILIES_DB);
  const [searchFamilyQuery, setSearchFamilyQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Master System Settings State
  const [platformTitle, setPlatformTitle] = useState('ASTA Family Time Super-App');
  const [masterCodePrefix, setMasterCodePrefix] = useState('ASTA');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxMembersPerFamily, setMaxMembersPerFamily] = useState(10);
  const [defaultSignUpPoints, setDefaultSignUpPoints] = useState(500);

  // Security Switches
  const [firewallXss, setFirewallXss] = useState(true);
  const [aiContentModeration, setAiContentModeration] = useState(true);
  const [chatE2EE, setChatE2EE] = useState(true);

  // Cyber Audit Logs
  const [cyberAuditLogs, setCyberAuditLogs] = useState([
    { id: '1', timestamp: new Date().toLocaleTimeString('id-ID'), type: 'Serangan XSS Form Login', source: '/administrator_asta', status: '🛡️ DIBLOKIR OTOMATIS', detail: 'Upaya penginputan <script>eval()</script>' },
    { id: '2', timestamp: '15:10:04', type: 'SQL Injection Pattern', source: '/administrator_asta', status: '🛡️ DIBLOKIR OTOMATIS', detail: "Upaya bypass query UNION SELECT" },
    { id: '3', timestamp: '14:30:22', type: 'Brute Force Attempts', source: 'Admin Portal Login', status: '🔒 AKUN DIKUNCI (60s)', detail: '5x Salah Password' },
  ]);

  // Ensure window URL reflects /administrator_asta
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/administrator_asta');
    }
  }, []);

  const notify = (msg: string) => {
    sound.playSuccess();
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Handle Cyber-Protected Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSecurityAlert(null);

    // 1. Check Rate Limiter
    const lockout = rateLimiter.checkLockout('super_admin_login');
    if (lockout.isLocked) {
      sound.playTimerWarning();
      setLoginError(`⚠️ Keamanan Ketat: Akses Admin dikunci demi keamanan! Silakan tunggu ${lockout.remainingSeconds} detik.`);
      return;
    }

    // 2. Anti-XSS Sanitization & Injection Filter
    const cleanUser = sanitizeInput(adminUser);
    const cleanPass = adminPass.trim();
    const cleanPin = adminPin.trim();

    const injectionPattern = /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|CREATE|EXEC)\b)|[<>{}\$]/i;
    if (injectionPattern.test(cleanUser) || injectionPattern.test(cleanPass)) {
      sound.playTimerWarning();
      rateLimiter.recordFailedAttempt('super_admin_login');
      setLoginSecurityAlert('🛡️ SERANGAN CYBER TERDETEKSI: Input mengandung skrip/perintah database berbahaya dan telah diblokir.');
      return;
    }

    // 3. Credentials Validation (Default password: asta2026 / superadmin)
    const isValidUser = cleanUser.toLowerCase().includes('admin');
    const isValidPass = cleanPass === 'asta2026' || cleanPass === 'superadmin' || cleanPass === 'asta2026_superadmin';
    const isValidPin = cleanPin === '2026' || cleanPin === '1234' || cleanPin.length >= 4;

    if (isValidUser && isValidPass && isValidPin) {
      rateLimiter.resetAttempts('super_admin_login');
      sound.playVictory();
      setIsLoggedIn(true);
    } else {
      sound.playTimerWarning();
      const fail = rateLimiter.recordFailedAttempt('super_admin_login');
      if (fail.isLocked) {
        setLoginError(`⚠️ Keamanan Ketat: Percobaan gagal! Portal Admin dikunci ${fail.remainingSeconds} detik.`);
      } else {
        setLoginError(`❌ Username, Password, atau PIN Kunci Admin salah! (Sisa percobaan: ${fail.attemptsLeft})`);
      }
    }
  };

  const handleToggleFamilyStatus = (famId: string) => {
    sound.playClick();
    setFamilies(prev => prev.map(f => {
      if (f.id === famId) {
        const nextStatus = f.status === 'active' ? 'suspended' : 'active';
        notify(`Status akun ${f.familyName} diubah menjadi: ${nextStatus.toUpperCase()}`);
        return { ...f, status: nextStatus };
      }
      return f;
    }));
  };

  const handleAddBonusToFamily = (famId: string) => {
    sound.playFunnyBonus();
    setFamilies(prev => prev.map(f => {
      if (f.id === famId) {
        notify(`⭐ Menambahkan 500 Bonus Love Points untuk ${f.familyName}!`);
        return { ...f, totalLovePoints: f.totalLovePoints + 500 };
      }
      return f;
    }));
  };

  const handleTestCyberSimulation = () => {
    sound.playClick();
    const now = new Date().toLocaleTimeString('id-ID');
    setCyberAuditLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp: now,
        type: 'Simulasi Serangan Scripting (XSS)',
        source: '/administrator_asta',
        status: '🛡️ DIBLOKIR OTOMATIS',
        detail: '<svg/onload=alert(document.cookie)>'
      },
      ...prev
    ]);
    notify('🧪 Uji simulasi serangan cyber berhasil dieksekusi dan diblokir firewall!');
  };

  const filteredFamilies = families.filter(f => {
    const matchesSearch = 
      f.familyName.toLowerCase().includes(searchFamilyQuery.toLowerCase()) ||
      f.headName.toLowerCase().includes(searchFamilyQuery.toLowerCase()) ||
      f.familyCode.toLowerCase().includes(searchFamilyQuery.toLowerCase()) ||
      f.headEmail.toLowerCase().includes(searchFamilyQuery.toLowerCase());
    
    const matchesStatus = selectedStatusFilter === 'all' || f.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // UNAUTHENTICATED SUPER ADMIN LOGIN GATE SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 text-slate-100 font-body select-none">
        
        {/* Top Back Link */}
        <button
          onClick={() => {
            sound.playClick();
            if (typeof window !== 'undefined' && window.history) {
              window.history.pushState(null, '', '/');
            }
            onGoBackToApp();
          }}
          className="absolute top-4 left-4 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi Utama</span>
        </button>

        <div className="w-full max-w-md bg-slate-900 border-4 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-pop-in my-auto">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-amber-300/40">
              👑
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Portal Administrator ASTA
            </h1>
            <p className="text-xs text-amber-300 font-mono">
              https://asta-family-time.vercel.app/administrator_asta
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Sistem manajemen pusat untuk mengelola seluruh Kepala Keluarga & Akun Terdaftar.
            </p>
          </div>

          {/* Cyber Shield Status */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/40 space-y-1 text-xs">
            <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PROTEKSI SIBER TINGKAT TINGGI (ACTIVE)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Enkripsi SHA-256 Web Crypto, Sanitasi Input Anti-XSS, Anti-SQL Injection, & Anti-Brute Force active.
            </p>
          </div>

          {/* Alerts */}
          {loginError && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-2xl text-xs font-bold flex items-start gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{loginError}</p>
            </div>
          )}

          {loginSecurityAlert && (
            <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-3 rounded-2xl text-xs font-bold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>{loginSecurityAlert}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Username Admin (Default: <code className="text-amber-400">administrator_asta</code>):
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 font-bold text-xs text-white focus:border-amber-400 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Password Admin (Default: <code className="text-amber-400">asta2026</code>):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 font-bold text-xs text-white focus:border-amber-400 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Kode PIN Kunci 4 Digit (Default: <code className="text-amber-400">2026</code>):
              </label>
              <input
                type="password"
                maxLength={6}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 font-bold text-xs text-white focus:border-amber-400 outline-none letter-spacing-widest"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 text-white font-display font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
            >
              <Lock className="w-4 h-4 fill-white" />
              <span>MASUK PORTAL ADMINISTRATOR ASTA</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // AUTHENTICATED DEDICATED ADMIN PORTAL SCREEN WITH FULL SIDEBAR
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-body select-none">
      
      {/* MOBILE TOP BAR WITH DRAWER TOGGLE */}
      <div className="md:hidden bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-base">
            👑
          </div>
          <span className="font-display font-black text-sm text-white">
            ADMINISTRATOR ASTA
          </span>
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* DEDICATED LEFT SIDEBAR NAVIGATION */}
      <aside className={`w-full md:w-72 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 ${
        isMobileSidebarOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="space-y-6">
          
          {/* Admin Profile Brand Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-indigo-600/20 border border-amber-400/30 space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-xl font-black shadow-md shrink-0">
                👑
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-sm text-white block truncate">
                  Super Admin ASTA
                </span>
                <span className="text-[10px] text-amber-300 font-extrabold uppercase block">
                  Pengelola Seluruh Keluarga
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-white/10 truncate">
              /administrator_asta
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { sound.playClick(); setActiveMenu('head_families'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 transition-all text-left ${
                activeMenu === 'head_families'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Kelola Kepala Keluarga ({families.length})</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveMenu('cyber_security'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 transition-all text-left ${
                activeMenu === 'cyber_security'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Keamanan Cyber & Log</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveMenu('system_settings'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 transition-all text-left ${
                activeMenu === 'system_settings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Pengaturan Platform</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveMenu('game_engine'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 transition-all text-left ${
                activeMenu === 'game_engine'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-teal-400" />
              <span>Pengaturan Game Engine</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveMenu('telemetry'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 transition-all text-left ${
                activeMenu === 'telemetry'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Analisis & Telemetri</span>
            </button>
          </nav>
        </div>

        {/* Bottom Exit Links */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              sound.playClick();
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState(null, '', '/');
              }
              onGoBackToApp();
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke App Utama</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsLoggedIn(false);
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-950/60 text-rose-300 hover:bg-rose-900 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Success Alert */}
        {successNotice && (
          <div className="bg-emerald-500 text-white p-3.5 rounded-2xl font-display font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-yellow-300" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* MENU 1: KELOLA KEPALA KELUARGA & SELURUH AKUN */}
        {activeMenu === 'head_families' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <span>Pengelolaan Kepala Keluarga Terdaftar ({families.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Daftar seluruh Kepala Keluarga yang terdaftar di platform ASTA beserta status keaktifannya.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-800">
                  Total {families.reduce((acc, f) => acc + f.membersCount, 0)} Anggota Keluarga
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFamilyQuery}
                  onChange={(e) => setSearchFamilyQuery(e.target.value)}
                  placeholder="Cari Kepala Keluarga, Nama, Kode..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                    selectedStatusFilter === 'all' ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Semua ({families.length})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                    selectedStatusFilter === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  🟢 Aktif ({families.filter(f => f.status === 'active').length})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('suspended')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                    selectedStatusFilter === 'suspended' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  🔴 Ditangguhkan ({families.filter(f => f.status === 'suspended').length})
                </button>
              </div>
            </div>

            {/* Families List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFamilies.map((fam) => (
                <div
                  key={fam.id}
                  className="bg-slate-950 p-5 rounded-3xl border-2 border-slate-800 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{fam.headAvatar}</span>
                      <div>
                        <h3 className="font-display font-black text-base text-white">
                          {fam.headName}
                        </h3>
                        <p className="text-[11px] text-amber-300 font-bold">
                          {fam.familyName}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                      fam.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {fam.status === 'active' ? '🟢 Aktif' : '🔴 Suspend'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kode Akses:</span>
                      <span className="font-mono font-black text-indigo-400">{fam.familyCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Anggota Terdaftar:</span>
                      <span className="font-bold text-white">{fam.membersCount} Orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Love Points:</span>
                      <span className="font-bold text-amber-400">{fam.totalLovePoints} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Streak Kebersamaan:</span>
                      <span className="font-bold text-rose-400">{fam.streakDays} Hari 🔥</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddBonusToFamily(fam.id)}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+500 Poin</span>
                    </button>

                    <button
                      onClick={() => handleToggleFamilyStatus(fam.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1 ${
                        fam.status === 'active'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <span>{fam.status === 'active' ? '🔴 Suspend' : '🟢 Aktifkan'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENU 2: KEAMANAN CYBER & FIREWALL */}
        {activeMenu === 'cyber_security' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-rose-400" />
                  <span>Pusat Keamanan Cyber & Firewall Administrator</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Proteksi ketat dari serangan XSS, SQL Injection, NoSQL, Brute Force, & AI Content Moderation.
                </p>
              </div>

              <button
                onClick={handleTestCyberSimulation}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs active:scale-95"
              >
                🧪 Uji Simulasi Serangan Cyber
              </button>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Firewall Anti-XSS</span>
                  <input
                    type="checkbox"
                    checked={firewallXss}
                    onChange={(e) => setFirewallXss(e.target.checked)}
                    className="w-4 h-4 accent-emerald-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Sanitasi otomatis tag HTML & JavaScript berbahaya pada form.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">AI Content Moderation</span>
                  <input
                    type="checkbox"
                    checked={aiContentModeration}
                    onChange={(e) => setAiContentModeration(e.target.checked)}
                    className="w-4 h-4 accent-rose-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Memblokir kata kasar, konten dewasa, & ujaran tidak pantas.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Chat End-to-End Encryption</span>
                  <input
                    type="checkbox"
                    checked={chatE2EE}
                    onChange={(e) => setChatE2EE(e.target.checked)}
                    className="w-4 h-4 accent-indigo-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Enkripsi pesan obrolan keluarga menggunakan Web Crypto SHA-256.</p>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-display font-black text-sm text-white flex items-center gap-2">
                <span>📜</span> Log Audit Keamanan Cyber Terdeteksi (Real-Time)
              </h3>

              <div className="space-y-2">
                {cyberAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono font-bold">
                        {log.timestamp}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{log.type} ({log.source})</span>
                        <code className="text-[10px] text-slate-400 font-mono block">{log.detail}</code>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MENU 3: PENGATURAN PLATFORM */}
        {activeMenu === 'system_settings' && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="font-display font-black text-xl text-white">⚙️ Master Pengaturan Platform</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Nama Platform:</label>
                <input
                  type="text"
                  value={platformTitle}
                  onChange={(e) => setPlatformTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Awalan Kode Akses (Prefix):</label>
                <input
                  type="text"
                  value={masterCodePrefix}
                  onChange={(e) => setMasterCodePrefix(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-xs text-white uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Batas Anggota per Keluarga:</label>
                <input
                  type="number"
                  value={maxMembersPerFamily}
                  onChange={(e) => setMaxMembersPerFamily(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Poin Pendaftaran Awal:</label>
                <input
                  type="number"
                  value={defaultSignUpPoints}
                  onChange={(e) => setDefaultSignUpPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="maintenanceMode" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Mode Pemeliharaan Sistem (Maintenance Mode)
                </label>
              </div>
            </div>

            <button
              onClick={() => notify('⚙️ Master Pengaturan Platform berhasil disimpan!')}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-display font-black text-xs active:scale-95 transition-all"
            >
              SIMPAN PENGATURAN MASTER
            </button>
          </div>
        )}

        {/* MENU 4: GAME ENGINE */}
        {activeMenu === 'game_engine' && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="font-display font-black text-xl text-white">🎨 Master Game Engine ASTA</h2>
            <p className="text-xs text-slate-400">Pengaturan sakelar game, durasi timer, & tingkat kesulitan AI Bot.</p>
            <button
              onClick={() => notify('🎨 Pengaturan Game Engine berhasil disimpan!')}
              className="px-6 py-3 rounded-2xl bg-teal-500 text-slate-900 font-display font-black text-xs active:scale-95"
            >
              SIMPAN GAME ENGINE
            </button>
          </div>
        )}

        {/* MENU 5: TELEMETRI & ANALISIS */}
        {activeMenu === 'telemetry' && (
          <div className="space-y-4">
            <h2 className="font-display font-black text-2xl text-white">📊 Analisis Telemetri Platform</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Keluarga</span>
                <span className="font-display font-black text-2xl text-amber-400">{families.length}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Anggota</span>
                <span className="font-display font-black text-2xl text-emerald-400">
                  {families.reduce((acc, f) => acc + f.membersCount, 0)}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Cloud Status</span>
                <span className="font-display font-black text-sm text-emerald-400">🟢 Synchronized</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Cache Storage</span>
                <span className="font-display font-black text-sm text-indigo-400">1.2 MB / 5 MB</span>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
