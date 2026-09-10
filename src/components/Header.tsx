import React, { useState, useEffect } from 'react';
import type { UserAccount, FamilyAccount } from '../types/auth';
import { 
  Volume2, VolumeX, Moon, Sun, Settings, HelpCircle, Home, RotateCcw, 
  Crown, Users, LogIn, UserPlus, LogOut, ChevronDown, Copy, Check, 
  ShieldCheck, Bell, RefreshCw, Clock, X, Megaphone
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  soundEnabled: boolean;
  darkMode: boolean;
  currentScreen: string;
  currentUser?: UserAccount;
  currentFamily?: FamilyAccount;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onGoHome: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenManageFamily: () => void;
  onOpenSecurityCenter?: () => void;
  onLogout: () => void;
  onRestartGame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  darkMode,
  currentScreen,
  currentUser,
  currentFamily,
  onToggleSound,
  onToggleDarkMode,
  onOpenSettings,
  onOpenHowToPlay,
  onGoHome,
  onOpenLogin,
  onOpenRegister,
  onOpenManageFamily,
  onOpenSecurityCenter,
  onLogout,
  onRestartGame,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifToast, setShowNotifToast] = useState(false);

  // Real-time clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okto', 'Nov', 'Des'];
      const dayName = days[now.getDay()];
      const dateNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${dayName}, ${dateNum} ${monthName} ${year} - ${hours}:${minutes}:${seconds}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyFamilyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentFamily?.familyCode || 'ASTA-2026');
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://asta-family-time.vercel.app';
    const message = `✨ *ASTA Family Time - Platform & Super-App Game Keluarga Indonesia*\n\n` +
      `"ASTA - Aktivitas • Senyum • Tawa • Apresiasi - Satu aplikasi, lebih banyak waktu bersama Keluarga." ❤️\n\n` +
      `👨‍👩‍👧‍👦 *Keluarga:* ${currentFamily?.familyName || 'Keluarga Harmonis ASTA'}\n` +
      `🔑 *Kode Keluarga:* ${currentFamily?.familyCode || 'ASTA-2026'}\n\n` +
      `Yuk bergabung dan main bareng sekarang di link berikut:\n` +
      `👉 ${shareUrl}/`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSyncRefresh = () => {
    sound.playCardShuffle();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      sound.playSuccess();
    }, 800);
  };

  return (
    <header 
      className="sticky top-0 z-30 w-full flex flex-col shadow-md select-none transition-colors"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      
      {/* 1. TOP ANNOUNCEMENT BAR (Ref: KayPOS Top Announcement Bar) */}
      {showAnnouncement && (
        <div className="w-full bg-gradient-to-r from-indigo-600 via-rose-600 to-purple-600 text-white text-[11px] font-bold px-3.5 py-1.5 flex items-center justify-between shadow-xs border-b border-white/20">
          <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-900 font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
              <Megaphone className="w-3.5 h-3.5 text-slate-900" />
              PENGUMUMAN
            </span>
            <p className="text-white font-bold text-[11px] sm:text-xs truncate drop-shadow-xs">
              📢 Selamat Datang di Platform ASTA Family Time: Satu Aplikasi, Lebih Banyak Waktu Bersama Keluarga. ❤️
            </p>
          </div>

          <button
            onClick={() => setShowAnnouncement(false)}
            className="p-1 rounded-lg hover:bg-white/20 transition-all text-white shrink-0 ml-2 active:scale-90"
            title="Tutup Pengumuman"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN HEADER TOOLBAR */}
      <div className="w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          
          {/* Left: Brand Logo & Title */}
          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="flex items-center gap-2.5 group transition-transform active:scale-95 text-left shrink-0"
            title="Kembali ke Beranda"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-family-coral via-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-bubbly-coral group-hover:rotate-6 transition-transform">
              🎴
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-family-coral via-rose-500 to-purple-600 bg-clip-text text-transparent">
                  ASTA Family Time
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded-full font-black">
                  ❤️
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {currentFamily?.familyName ? `${currentFamily.familyName} • Kode: ${currentFamily.familyCode}` : 'Satu aplikasi, lebih banyak waktu bersama keluarga.'}
              </div>
            </div>
          </button>

          {/* Center: Real-Time Clock & Sync Widget (Ref: Kasir POS Header Clock & Status) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Clock Widget */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-family-coral animate-pulse" />
              <span>{currentTimeStr || 'Memuat waktu...'}</span>
            </div>

            {/* Refresh Sync Button */}
            <button
              onClick={handleSyncRefresh}
              className={`p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-90 shadow-2xs ${
                isRefreshing ? 'animate-spin text-family-coral' : ''
              }`}
              title="Sinkronkan Data Cloud"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Cloud Status Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Cloud Active</span>
            </div>
          </div>

          {/* Right: Quick Action Pill Buttons & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Panduan Button (Ref: ? Panduan) */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenHowToPlay();
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black transition-all active:scale-95 shadow-2xs flex items-center gap-1"
              title="Panduan Bermain ASTA"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Panduan</span>
            </button>

            {/* 2. Notification Bell (Ref: Bell Icon with Dot) */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowNotifToast(!showNotifToast);
                }}
                className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all active:scale-90 shadow-2xs relative"
                title="Notifikasi Aktivitas"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifToast && (
                <div 
                  className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-slate-800 rounded-3xl p-3.5 border-2 border-amber-200 dark:border-amber-900 shadow-bubbly-lg space-y-2 animate-pop-in text-xs"
                  onClick={() => setShowNotifToast(false)}
                >
                  <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                    <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-500" /> Notifikasi Aktivitas
                    </span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-black">Baru</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      ✨ Sesi privat terenkripsi aktif untuk <strong>{currentFamily?.familyName}</strong>.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      ☁️ Sinkronisasi Supabase Real-time aktif.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                sound.playClick();
              }}
              className={`p-2 rounded-2xl border transition-all active:scale-90 shadow-2xs hidden sm:flex ${
                soundEnabled
                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-family-coral'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Suara' : 'Aktifkan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* 4. Dark Mode Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleDarkMode();
              }}
              className="p-2 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-all active:scale-90 shadow-2xs hidden sm:flex"
              title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 5. Home Button when not in home */}
            {currentScreen !== 'home' && (
              <button
                onClick={() => {
                  sound.playClick();
                  onGoHome();
                }}
                className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-family-coral border border-rose-200 dark:border-rose-800 transition-all active:scale-90 shadow-2xs"
                title="Kembali ke Beranda"
              >
                <Home className="w-4 h-4" />
              </button>
            )}

            {/* Game Restart Button when in card game board */}
            {currentScreen === 'game_board' && onRestartGame && (
              <button
                onClick={() => {
                  sound.playClick();
                  onRestartGame();
                }}
                className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all active:scale-90 shadow-2xs"
                title="Mulai Ulang Game Kartu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* 6. Settings */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90 shadow-2xs hidden sm:flex"
              title="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* 7. USER PROFILE PILL BADGE (Ref: Kaylin & CO. OWNER v Style) */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-black shadow-md active:scale-95 transition-all border border-blue-400/40"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-base shrink-0 border border-white/30">
                  {currentUser?.avatar || '👨‍💼'}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-black truncate max-w-[110px]">
                    {currentUser?.fullName || 'Papa Asep'}
                  </div>
                  <div className="text-[8px] font-extrabold uppercase tracking-wider text-blue-200">
                    {currentUser?.isHead ? 'KEPALA KELUARGA' : (currentUser?.roleTitle || 'ANGGOTA')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 rounded-3xl p-3.5 border-2 border-indigo-100 dark:border-slate-700 shadow-bubbly-lg space-y-2.5 animate-pop-in"
                  onClick={() => setShowProfileMenu(false)}
                >
                  {/* User Badge Info */}
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/90 rounded-2xl border border-indigo-100 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{currentUser?.avatar || '👨‍💼'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                          {currentUser?.fullName}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold flex items-center gap-1">
                          {currentUser?.isHead ? (
                            <span className="flex items-center gap-1 text-amber-600 font-black">
                              <Crown className="w-3 h-3 text-amber-500" /> Kepala Keluarga (Admin)
                            </span>
                          ) : (
                            <span>❤️ {currentUser?.roleTitle || 'Anggota Keluarga'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Family Code Copy Strip */}
                    <div className="mt-2.5 pt-2 border-t border-indigo-200/60 dark:border-slate-700 flex items-center justify-between gap-1.5">
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold truncate">
                        Kode: <span className="font-black text-indigo-600 dark:text-indigo-400">{currentFamily?.familyCode}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleCopyFamilyCode}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-[10px] font-black text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-slate-600 flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                        </button>
                        <button
                          onClick={handleShareWhatsApp}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black text-white flex items-center gap-1"
                          title="Kirim ke WhatsApp"
                        >
                          <span>💬 WA</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {currentUser?.isHead && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenManageFamily();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Kelola Anggota Keluarga 👑</span>
                      </button>
                    )}

                    {onOpenSecurityCenter && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenSecurityCenter();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Pusat Keamanan & Sandi 🛡️</span>
                      </button>
                    )}

                    {/* Sound / Dark Mode toggles inside profile dropdown for mobile convenience */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 sm:hidden">
                      <button
                        onClick={onToggleSound}
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                        <span>Suara: {soundEnabled ? 'Aktif' : 'Mute'}</span>
                      </button>
                      <button
                        onClick={onToggleDarkMode}
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                        <span>{darkMode ? 'Terang' : 'Gelap'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenLogin();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-teal-600" />
                      <span>Masuk Akun / Ganti Profil</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenRegister();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span>Daftar Kepala Keluarga Baru</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
