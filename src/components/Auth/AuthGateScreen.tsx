import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { FamilyRoleTitle, UserAccount, FamilyAccount } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';
import { 
  Users, ArrowRight, UserCheck, AlertCircle, 
  UserPlus, CheckCircle2, ShieldCheck, Eye, EyeOff,
  Lock, Sparkles, ArrowLeft, KeyRound, ShieldAlert, Clock
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';
import { sanitizeInput, rateLimiter } from '../../utils/security';

interface AuthGateScreenProps {
  auth?: any;
  onLoginSuccess: () => void;
}

const AVATARS = ['👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '👨‍🎓', '🧕', '👴', '👵'];

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({ auth, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login_head' | 'login_member' | 'register'>('login_head');
  
  // Head Login State
  const [headUsername, setHeadUsername] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  
  // Member Login State
  const [familyCode, setFamilyCode] = useState('');
  const [foundFamily, setFoundFamily] = useState<FamilyAccount | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserAccount[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPin, setMemberPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Security: Anti-Brute Force Lockout & Auto-Lock Session Notice
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [autoLockNotice, setAutoLockNotice] = useState<boolean>(false);

  // Check for auto-lock session timeout notice
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('asta_autolock_notice') === 'true') {
      setAutoLockNotice(true);
      sessionStorage.removeItem('asta_autolock_notice');
    }
  }, []);

  // Monitor lockout state for selected family member profile
  useEffect(() => {
    if (!foundFamily || !selectedMemberId) {
      setLockoutRemaining(0);
      return;
    }
    const rateKey = `pin_${foundFamily.id}_${selectedMemberId}`;
    const status = rateLimiter.checkLockout(rateKey);
    setLockoutRemaining(status.isLocked ? status.remainingSeconds : 0);
  }, [foundFamily, selectedMemberId]);

  // Live countdown timer for lockout cooldown
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Register State
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [headFullName, setHeadFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState<FamilyRoleTitle>('Ayah');
  const [familyName, setFamilyName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [regAvatar, setRegAvatar] = useState('👨‍💼');

  // Password Strength Calculation
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Za-z]/.test(regPassword)) score += 1;
    if (/[0-9]/.test(regPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah (min. 8 karakter)', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score === 2) return { score: 2, label: 'Cukup (tambahkan angka/simbol)', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'bg-teal-500', text: 'text-teal-500' };
    return { score: 4, label: 'Sangat Kuat & Aman', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [regPassword]);
  
  // Step 2 Register State
  const [regFamilyCode, setRegFamilyCode] = useState('');
  const [regFamilyId, setRegFamilyId] = useState('');
  const [regHeadId, setRegHeadId] = useState('');
  const [memberFullName, setMemberFullName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRoleTitle>('Ibu');
  const [memberAvatar, setMemberAvatar] = useState('👩‍🍳');
  const [addedMembersList, setAddedMembersList] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const pgConfig = postgresService.getConfig();

  // 1. Submit Head Login
  const handleHeadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rateCheck = rateLimiter.checkLockout('head_login');
    if (rateCheck.isLocked) {
      setErrorMsg(`Batas keamanan terlampaui. Harap tunggu ${rateCheck.remainingSeconds} detik.`);
      return;
    }

    const cleanUser = sanitizeInput(headUsername);
    if (!cleanUser || !headPassword.trim()) {
      setErrorMsg('Harap isi email/username dan password.');
      return;
    }

    try {
      if (auth?.loginHead) {
        await auth.loginHead(cleanUser, headPassword);
      } else {
        await db.loginHeadAsync(cleanUser, headPassword);
      }
      rateLimiter.resetAttempts('head_login');
      sound.playSuccess();
      fireBurstConfetti();
      onLoginSuccess();
    } catch (err: any) {
      const res = rateLimiter.recordFailedAttempt('head_login');
      if (res.isLocked) {
        setErrorMsg(`Keamanan: Terlalu banyak percobaan. Harap tunggu ${res.remainingSeconds} detik.`);
      } else {
        setErrorMsg(err.message || 'Gagal masuk. Periksa kembali username dan password.');
      }
      sound.playClick();
    }
  };

  // 2. Search Family Code
  const handleSearchFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rateCheck = rateLimiter.checkLockout('search_family');
    if (rateCheck.isLocked) {
      setErrorMsg(`Keamanan: Terlalu banyak pencarian. Harap tunggu ${rateCheck.remainingSeconds} detik.`);
      return;
    }

    const cleanCode = sanitizeInput(familyCode).toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Harap masukkan Kode Keluarga.');
      return;
    }

    setIsSearching(true);
    try {
      const fam = await db.findFamilyByCodeAsync(cleanCode);
      if (!fam) {
        rateLimiter.recordFailedAttempt('search_family');
        setErrorMsg('Kode Keluarga tidak ditemukan. Contoh: ASTA-2026');
        return;
      }
      setFoundFamily(fam);
      const members = db.getUsersByFamily(fam.id);
      setFamilyMembers(members);
      if (members.length > 0) {
        setSelectedMemberId(members[0].id);
      }
      rateLimiter.resetAttempts('search_family');
      sound.playClick();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari Kode Keluarga.');
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Submit Member Login
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!foundFamily || !selectedMemberId) {
      setErrorMsg('Pilih profil anggota keluarga terlebih dahulu.');
      return;
    }

    const rateKey = `pin_${foundFamily.id}_${selectedMemberId}`;
    const rateCheck = rateLimiter.checkLockout(rateKey);
    if (rateCheck.isLocked) {
      setLockoutRemaining(rateCheck.remainingSeconds);
      setErrorMsg(`Akses profil ini terkunci sementara. Harap tunggu ${rateCheck.remainingSeconds} detik.`);
      sound.playClick();
      return;
    }

    const cleanPin = memberPin.trim();
    if (cleanPin.length < 4) {
      setErrorMsg('PIN Keamanan wajib minimal 4 digit.');
      sound.playClick();
      return;
    }

    try {
      if (auth?.loginMember) {
        auth.loginMember(foundFamily.familyCode, selectedMemberId, cleanPin);
      } else {
        db.loginMemberWithCode(foundFamily.familyCode, selectedMemberId, cleanPin);
      }
      rateLimiter.resetAttempts(rateKey);
      sound.playSuccess();
      fireBurstConfetti();
      onLoginSuccess();
    } catch (err: any) {
      const status = rateLimiter.checkLockout(rateKey);
      if (status.isLocked) {
        setLockoutRemaining(status.remainingSeconds);
      }
      setErrorMsg(err.message || 'PIN anggota salah.');
      setMemberPin('');
      sound.playClick();
    }
  };

  // 4. Submit Head Registration
  const handleRegisterHead = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreePrivacy) {
      setErrorMsg('Harap setujui Syarat & Ketentuan serta Kebijakan Privasi ASTA.');
      sound.playClick();
      return;
    }

    const cleanHeadName = sanitizeInput(headFullName);
    const cleanFamName = sanitizeInput(familyName);
    const cleanUser = sanitizeInput(regUsername).trim();

    if (!cleanHeadName || !cleanFamName || !cleanUser || !regPassword.trim()) {
      setErrorMsg('Harap lengkapi semua data pendaftaran kepala keluarga.');
      sound.playClick();
      return;
    }

    if (cleanFamName.length < 3) {
      setErrorMsg('Nama Keluarga (Grup) minimal 3 karakter.');
      sound.playClick();
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter demi keamanan keluarga.');
      sound.playClick();
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      sound.playClick();
      return;
    }

    // Email format validation for account recovery
    if (cleanUser.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanUser)) {
        setErrorMsg('Format email pemulihan akun tidak valid (contoh: ayah@email.com).');
        sound.playClick();
        return;
      }
    }

    try {
      let session;
      if (auth?.registerHead) {
        session = auth.registerHead({
          headFullName: cleanHeadName,
          roleTitle,
          familyName: cleanFamName,
          usernameOrEmail: cleanUser,
          password: regPassword,
          pin: '1234',
          avatar: regAvatar,
          color: 'bg-blue-500'
        });
      } else {
        session = db.registerHeadOfFamily({
          headFullName: cleanHeadName,
          roleTitle,
          familyName: cleanFamName,
          usernameOrEmail: cleanUser,
          password: regPassword,
          pin: '1234',
          avatar: regAvatar,
          color: 'bg-blue-500'
        });
      }

      setRegFamilyCode(session.family.familyCode);
      setRegFamilyId(session.family.id);
      setRegHeadId(session.user.id);
      setRegStep(2);
      sound.playSuccess();
      fireBurstConfetti();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar.');
    }
  };

  // 5. Add Member in Step 2
  const handleAddMemberStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFullName.trim()) return;

    try {
      db.addMemberByHead(regHeadId, regFamilyId, {
        fullName: memberFullName.trim(),
        roleTitle: memberRole,
        pin: '1234',
        avatar: memberAvatar,
        color: 'bg-rose-500'
      });

      setAddedMembersList(prev => [...prev, `${memberAvatar} ${memberFullName} (${memberRole})`]);
      setMemberFullName('');
      sound.playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div 
      className="min-h-dvh bg-family-bg dark:bg-slate-950 flex flex-col justify-between p-3 sm:p-6 lg:p-8 font-body antialiased selection:bg-rose-200"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
    >
      
      {/* 0. Top Announcement Bar (Visible on sm+ screens) */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto mb-2 bg-gradient-to-r from-indigo-600 via-rose-600 to-purple-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-2xl hidden sm:flex items-center justify-between shadow-xs border border-white/20">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-900 font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
            📢 PENGUMUMAN
          </span>
          <p className="text-white font-bold text-[11px] sm:text-xs truncate drop-shadow-xs">
            Selamat Datang di Platform ASTA Family Time: Satu Aplikasi, Lebih Banyak Waktu Bersama Keluarga. ❤️
          </p>
        </div>
      </div>

      {/* Top Mobile & Desktop Header with Safe Area Notch Clearance */}
      <header className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto flex items-center justify-between gap-2 pt-2 sm:pt-4 pb-3 border-b border-rose-200/40 dark:border-slate-800/60 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-family-coral via-rose-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shrink-0">
            🎴
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
              ASTA Family Time
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold truncate max-w-[180px] sm:max-w-none">
              Satu aplikasi, lebih banyak waktu bersama. ❤️
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black shrink-0 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">{pgConfig.statusText}</span>
          <span className="sm:hidden">Cloud Active</span>
        </div>
      </header>

      {/* Main Responsive Layout: Dual Column on Desktop, Centered Column on Mobile & Tablet */}
      <main className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto my-auto py-2 sm:py-4 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
        
        {/* Desktop Left Hero Panel (Hidden on mobile/tablet, visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col space-y-6 text-left p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-black w-fit">
            <span>✨</span> Super-App Keluarga Indonesia
          </div>

          <h2 className="font-display font-black text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight">
            Hubungkan Senyum & Tawa Keluarga Setiap Hari ❤️
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Nikmati 350+ kartu interaktif, game UNO, Ludo, Ular Tangga, Obrolan privat terenkripsi, Jurnal Kenangan, dan Perencana Kegiatan Keluarga dalam 1 aplikasi.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-2xs">
              <span className="text-2xl mb-1 block">🔐</span>
              <h4 className="font-black text-xs text-slate-900 dark:text-white">Privat & Aman</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Penyimpanan Privat per Keluarga</p>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-2xs">
              <span className="text-2xl mb-1 block">☁️</span>
              <h4 className="font-black text-xs text-slate-900 dark:text-white">Real-time Cloud</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Sinkron lintas HP & Laptop</p>
            </div>
          </div>
        </div>

        {/* Right Form Card (Single column on mobile, right 7 cols on desktop) */}
        <div className="lg:col-span-7">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-5 animate-pop-in">
            
            {/* Header Title */}
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl inline-block animate-bounce">🔐</span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                Ruang Masuk Keluarga
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs mx-auto">
                Hubungkan seluruh anggota keluarga dalam ruang privat yang aman.
              </p>
            </div>

          {/* Auto-Lock Inactivity Alert */}
          {autoLockNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-start justify-between gap-2.5 shadow-sm animate-pop-in">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-amber-950 dark:text-white">🛡️ Kunci Otomatis (Auto-Lock) Aktif</div>
                  <div className="text-[11px] font-medium text-amber-800 dark:text-amber-300 mt-0.5">
                    Sesi Anda telah dikunci kembali setelah tidak ada aktivitas demi melindungi privasi keluarga. Masukkan PIN untuk melanjutkan.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoLockNotice(false)}
                className="text-amber-600 hover:text-amber-900 text-xs font-black p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. SEPARATED TAB HIERARCHY: Role Navigation (Kepala vs Anggota) */}
          {activeTab !== 'register' ? (
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-700/80 rounded-2xl gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login_head');
                  setErrorMsg('');
                  sound.playClick();
                }}
                className={`py-2.5 sm:py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  activeTab === 'login_head'
                    ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">👑</span>
                <div className="text-left">
                  <div className="leading-tight">Kepala Keluarga</div>
                  <div className="text-[9px] font-bold opacity-75">Email & Password</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login_member');
                  setErrorMsg('');
                  sound.playClick();
                }}
                className={`py-2.5 sm:py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  activeTab === 'login_member'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">👥</span>
                <div className="text-left">
                  <div className="leading-tight">Anggota Keluarga</div>
                  <div className="text-[9px] font-bold opacity-75">Kode Cepat & PIN</div>
                </div>
              </button>
            </div>
          ) : (
            /* Registration Top Header with Clear Back Action */
            <div className="flex items-center justify-between p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login_member');
                  setErrorMsg('');
                  sound.playClick();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Masuk</span>
              </button>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full font-display">
                ✨ Pendaftaran Baru
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN KEPALA KELUARGA */}
          {activeTab === 'login_head' && (
            <div className="space-y-4 animate-pop-in">
              <form onSubmit={handleHeadLogin} className="space-y-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Ruang Masuk Terlindungi — Data login Anda terenkripsi aman & bebas peretasan.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email / Username Kepala Keluarga
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan Email atau Username"
                    value={headUsername}
                    onChange={e => setHeadUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-family-coral focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password / PIN Keamanan
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password atau PIN"
                    value={headPassword}
                    onChange={e => setHeadPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-family-coral focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>MASUK SEBAGAI KEPALA KELUARGA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Standalone Action: Daftar Ruang Keluarga Baru */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-black text-slate-800 dark:text-white">Belum memiliki ruang keluarga?</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Buat ruang baru untuk menghubungkan seluruh anggota</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegStep(1);
                    setErrorMsg('');
                    sound.playClick();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Daftar Ruang Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOGIN ANGGOTA CEPAT VIA KODE KELUARGA */}
          {activeTab === 'login_member' && (
            <div className="space-y-4 animate-pop-in">
              {!foundFamily ? (
                <div className="space-y-4">
                  <form onSubmit={handleSearchFamily} className="space-y-4">
                    <div className="space-y-1 text-center">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Masukkan Kode Keluarga
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: ASTA-2026"
                        value={familyCode}
                        onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-base sm:text-lg font-black outline-none focus:border-teal-500 text-center tracking-widest text-slate-900 dark:text-white transition-all shadow-2xs uppercase"
                      />
                      <p className="text-[10px] text-slate-400 font-bold">
                        *Minta kode unik keluarga dari Kepala Keluarga Anda
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSearching}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>{isSearching ? 'MENCARI KODE KELUARGA...' : 'TEMUKAN PROFIL KELUARGA'}</span>
                    </button>
                  </form>

                  {/* Standalone Action: Daftar Ruang Keluarga Baru */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-black text-slate-800 dark:text-white">Belum memiliki ruang keluarga?</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Buat ruang baru untuk menghubungkan seluruh anggota</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setRegStep(1);
                        setErrorMsg('');
                        sound.playClick();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Daftar Ruang Baru</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Ruang Keluarga Ditemukan:</span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">Keluarga ({foundFamily.familyCode})</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFoundFamily(null);
                        setMemberPin('');
                        setErrorMsg('');
                      }}
                      className="text-[10px] text-teal-700 dark:text-teal-300 underline font-bold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xs border border-teal-100 dark:border-teal-900/60"
                    >
                      Ganti Kode
                    </button>
                  </div>

                  {/* Anti-Brute Force Lockout Banner */}
                  {lockoutRemaining > 0 && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/90 border-2 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-shake shadow-sm">
                      <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-spin" />
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-rose-950 dark:text-white">🛑 Proteksi Anti-Brute Force Aktif</div>
                        <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300 mt-0.5">
                          PIN salah 3 kali berturut-turut. Akses profil ini dikunci sementara selama <strong>{lockoutRemaining} detik</strong> untuk mencegah tebakan tidak sah.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zero Data Leakage Privacy Notice */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Perlindungan Privasi: Identitas & nama asli anggota disembunyikan sampai PIN terverifikasi.</span>
                  </div>

                  {/* 3. VISUAL ACCESSIBILITY: Enhanced Profile Slot Cards with High Contrast */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      PILIH SLOT PROFIL ANDA:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                      {familyMembers.map((m, idx) => {
                        const isSelected = m.id === selectedMemberId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedMemberId(m.id);
                              setMemberPin('');
                              setErrorMsg('');
                              sound.playClick();
                            }}
                            className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left relative overflow-hidden ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/90 dark:bg-teal-950/90 shadow-sm ring-2 ring-teal-400/40'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/90 hover:border-teal-400 hover:bg-slate-50 shadow-2xs'
                            }`}
                          >
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                              {m.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-black truncate text-slate-900 dark:text-white">
                                {m.roleTitle || `Profil #${idx + 1}`}
                              </div>
                              {/* High-Contrast Accessible Security Badge */}
                              <div className="mt-1">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-600 text-white shadow-2xs">
                                    <Lock className="w-3 h-3 text-teal-200" />
                                    <span>Terkunci PIN</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>Terkunci PIN</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. OTP-STYLE PIN INPUT WITH VISIBILITY TOGGLE */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-teal-500" />
                        <span>MASUKKAN PIN KEAMANAN (4-6 DIGIT)</span>
                      </label>
                      {/* Show / Hide PIN Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowPin(!showPin);
                          sound.playClick();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1"
                        title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                      >
                        {showPin ? <EyeOff className="w-3.5 h-3.5 text-teal-600" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPin ? 'Sembunyikan' : 'Lihat PIN'}</span>
                      </button>
                    </div>

                    {/* Interactive OTP Boxes Grid */}
                    <div 
                      onClick={() => pinInputRef.current?.focus()}
                      className="relative flex items-center justify-center gap-2 sm:gap-2.5 py-1.5 cursor-pointer select-none"
                    >
                      {/* Hidden Native Input (Ensures native touch numpad works seamlessly) */}
                      <input
                        ref={pinInputRef}
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={memberPin}
                        disabled={lockoutRemaining > 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                          setMemberPin(val);
                          setErrorMsg('');
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        autoComplete="off"
                        aria-label="PIN Keamanan"
                      />

                      {/* 6 Visual OTP Digital Boxes */}
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const isFilled = idx < memberPin.length;
                        const isActive = idx === memberPin.length && lockoutRemaining === 0;
                        const digit = memberPin[idx];

                        return (
                          <div
                            key={idx}
                            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all text-lg sm:text-xl font-black ${
                              lockoutRemaining > 0
                                ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 opacity-60'
                                : isActive
                                ? 'border-teal-500 ring-4 ring-teal-400/20 bg-teal-50/60 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 scale-105'
                                : isFilled
                                ? 'border-teal-400 dark:border-teal-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            {isFilled ? (
                              showPin ? (
                                <span>{digit}</span>
                              ) : (
                                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-teal-600 dark:bg-teal-400 inline-block shadow-2xs"></span>
                              )
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 font-normal">
                                {idx < 4 ? '•' : '○'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Character Feedback & Validation Indicator */}
                    <div className="flex items-center justify-between text-[11px] px-1 font-bold">
                      <span className={memberPin.length >= 4 ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-black' : 'text-slate-400'}>
                        {memberPin.length >= 4 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                            <span>{memberPin.length} digit siap diverifikasi</span>
                          </>
                        ) : (
                          <span>Minimal 4 digit PIN (Angka)</span>
                        )}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-black">
                        {memberPin.length}/6 Digit
                      </span>
                    </div>
                  </div>

                  {/* 4. VERIFY BUTTON WITH ANTI-BRUTE FORCE COOLDOWN STATE */}
                  <button
                    type="submit"
                    disabled={lockoutRemaining > 0 || memberPin.length < 4}
                    className={`w-full py-3.5 sm:py-4 rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      lockoutRemaining > 0
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : memberPin.length < 4
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white active:scale-95'
                    }`}
                  >
                    {lockoutRemaining > 0 ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>TERKUNCI SEMENTARA ({lockoutRemaining}s)</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>VERIFIKASI PIN & MASUK</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: DAFTAR KEPALA KELUARGA BARU */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-pop-in">
              {regStep === 1 ? (
                <form onSubmit={handleRegisterHead} className="space-y-3.5">
                  {/* Row 1: Nama Kepala & Panggilan Peran (Mobile-friendly Stack) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Nama Kepala Keluarga *
                      </label>
                      <input
                        type="text"
                        placeholder="misal: Ayah Asep"
                        value={headFullName}
                        onChange={e => setHeadFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Panggilan Peran
                      </label>
                      <select
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Kakek">Kakek</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Nama Keluarga (Grup) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Nama Keluarga (Grup) *
                      </label>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                        Tersanitasi & Bebas XSS
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="misal: Keluarga Harmonis ASTA"
                      value={familyName}
                      onChange={e => setFamilyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Row 3: Email Pemulihan Akun & Login */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Email Pemulihan Akun & Login Utama *
                      </label>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Untuk Pemulihan Akun (Forgot Password)
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="ayah@asta.com atau username unik"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Row 4: Password & Konfirmasi Password (Grid Mobile Stack) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Password Field with Eye Toggle */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Kata Sandi *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Minimal 8 karakter"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-teal-500 text-slate-900 dark:text-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 p-1"
                          title={showRegPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field with Eye Toggle & Matching Indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Konfirmasi Kata Sandi *
                        </label>
                        {regConfirmPassword && (
                          <span className={`text-[10px] font-bold ${regPassword === regConfirmPassword ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {regPassword === regConfirmPassword ? '✓ Cocok' : '✗ Tidak cocok'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          placeholder="Ulangi kata sandi"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none text-slate-900 dark:text-white transition-all ${
                            regConfirmPassword
                              ? regPassword === regConfirmPassword
                                ? 'border-emerald-400 focus:border-emerald-500'
                                : 'border-rose-400 focus:border-rose-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 p-1"
                          title={showRegConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {regPassword && (
                    <div className="space-y-1 p-2 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Kekuatan Sandi:</span>
                        <span className={passwordStrength.text}>{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-all ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        *Minimal 8 karakter, mencakup kombinasi huruf besar/kecil, angka, dan simbol.
                      </div>
                    </div>
                  )}

                  {/* Row 5: Avatar Picker */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      PILIH AVATAR KEPALA KELUARGA
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 pr-1">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            setRegAvatar(av);
                            sound.playClick();
                          }}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all shrink-0 border-2 ${
                            regAvatar === av 
                              ? 'border-teal-500 bg-teal-100 dark:bg-teal-950 scale-110 shadow-sm ring-2 ring-teal-400/40' 
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 6: Persetujuan Privasi (TOS & Privacy Policy) */}
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Dengan mendaftar, Anda menyetujui <strong className="text-slate-900 dark:text-white">Syarat & Ketentuan Layanan</strong> serta <strong className="text-slate-900 dark:text-white">Kebijakan Perlindungan Privasi Data Keluarga</strong> ASTA.
                    </span>
                  </label>

                  {/* Row 7: Tombol Aksi Bernuansa Positif & Ramah (Constructive Emerald/Teal) */}
                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>BUAT RUANG KELUARGA & LANJUT KE ANGGOTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2 Add Initial Members */
                <div className="space-y-4 animate-pop-in">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">Keluarga Berhasil Dibuat!</span>
                    <div className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-widest">
                      Kode: <span className="text-family-coral">{regFamilyCode}</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddMemberStep2} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5 text-family-coral" />
                      <span>Tambahkan Anggota (Ibu / Anak)</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Anggota (Ibu Nia)"
                        value={memberFullName}
                        onChange={e => setMemberFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <select
                        value={memberRole}
                        onChange={e => setMemberRole(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Ibu">Ibu</option>
                        <option value="Kakak">Kakak</option>
                        <option value="Adik">Adik</option>
                        <option value="Kakek">Kakek</option>
                        <option value="Nenek">Nenek</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1 overflow-x-auto">
                        {['👩‍🍳', '👦', '👧', '🧕', '👴', '👵'].map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setMemberAvatar(av)}
                            className={`w-7 h-7 rounded-lg text-sm shrink-0 ${
                              memberAvatar === av ? 'bg-family-coral text-white scale-110' : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-black text-xs shadow-xs shrink-0 flex items-center gap-1 hover:bg-teal-700 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </form>

                  {addedMembersList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {addedMembersList.map((m, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess();
                    }}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SELESAI & MASUK KE APLIKASI</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>

      {/* Footer Feature Highlights */}
      <footer className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto text-center space-y-1.5 pb-2 pt-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1">🎴 350 Kartu ASTA</span> &bull;
          <span className="flex items-center gap-1">🃏 Game UNO</span> &bull;
          <span className="flex items-center gap-1">🎲 Game Ludo</span> &bull;
          <span className="flex items-center gap-1">💬 Obrolan Rahasia Keluarga</span> &bull;
          <span className="flex items-center gap-1">📅 Family Planner</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Data tersimpan sangat aman dan terlindungi secara privat khusus untuk keluarga Anda.
        </p>
      </footer>

    </div>
  );
};
