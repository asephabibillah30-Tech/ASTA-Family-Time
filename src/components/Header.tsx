import React, { useState } from 'react';
import type { UserAccount, FamilyAccount } from '../types/auth';
import { Volume2, VolumeX, Moon, Sun, Settings, HelpCircle, Home, RotateCcw, Crown, Users, LogIn, UserPlus, LogOut, ChevronDown, Copy, Check, ShieldCheck } from 'lucide-react';
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

  return (
    <header 
      className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-rose-100 dark:border-slate-800 transition-colors"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-2">
        
        {/* Left: Logo & Brand */}
        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="flex items-center gap-2 group transition-transform active:scale-95 text-left shrink-0"
          title="Kembali ke Beranda"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-family-coral to-family-pink flex items-center justify-center text-white text-xl sm:text-2xl shadow-bubbly-sm group-hover:rotate-6 transition-transform">
            🎴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-family-coral via-family-pink to-family-purple bg-clip-text text-transparent">
                ASTA Family Time
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded-full font-black">
                ❤️
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold hidden sm:block truncate max-w-xs md:max-w-md">
              {currentFamily?.familyName ? `${currentFamily.familyName} • Satu aplikasi, lebih banyak waktu bersama keluarga.` : 'Satu aplikasi, lebih banyak waktu bersama keluarga.'}
            </p>
          </div>
        </button>

        {/* Center: Active Profile & Family Code Badge */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick();
              setShowProfileMenu(!showProfileMenu);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-2xs"
          >
            <span className="text-xl sm:text-2xl">{currentUser?.avatar || '👨‍💼'}</span>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-xs text-slate-900 dark:text-white truncate max-w-[100px]">
                  {currentUser?.fullName || 'Ayah'}
                </span>
                {currentUser?.isHead ? (
                  <span className="px-1 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[8px] font-black flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 text-amber-600" />
                    <span>Kepala</span>
                  </span>
                ) : (
                  <span className="px-1 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[8px] font-black">
                    Anggota
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">
                {currentFamily?.familyCode || 'ASTA-2026'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div 
              className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 rounded-3xl p-3 border-2 border-rose-100 dark:border-slate-700 shadow-bubbly-lg space-y-2 animate-pop-in"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-100 dark:border-rose-900">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentUser?.avatar || '👨‍💼'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                      {currentUser?.fullName}
                    </div>
                    <div className="text-[10px] text-family-coral font-bold">
                      {currentUser?.isHead ? '👑 Kepala Keluarga (Admin)' : `❤️ ${currentUser?.roleTitle || 'Anggota'}`}
                    </div>
                  </div>
                </div>

                {/* Family Code Copy Strip */}
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between gap-1.5">
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold truncate">
                    Kode: <span className="font-black text-family-coral">{currentFamily?.familyCode}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleCopyFamilyCode}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-black text-family-coral border border-rose-200 flex items-center gap-1"
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

              {/* Action Links */}
              <div className="space-y-1">
                {currentUser?.isHead && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenManageFamily();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-family-coral" />
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

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Kepala Keluarga Quick Manage Button */}
          {currentUser?.isHead && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenManageFamily();
              }}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 transition-all active:scale-90 hidden sm:flex items-center gap-1"
              title="Kelola Anggota Keluarga"
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-black">Anggota</span>
            </button>
          )}

          {/* How to play */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 transition-all active:scale-90"
            title="Cara Bermain"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              soundEnabled
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-family-coral'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Suara' : 'Aktifkan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleDarkMode();
            }}
            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-family-teal transition-all active:scale-90"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Restart Button when in game board */}
          {currentScreen === 'game_board' && onRestartGame && (
            <button
              onClick={() => {
                sound.playClick();
                onRestartGame();
              }}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 transition-all active:scale-90"
              title="Kocok Ulang Game"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Home button when not in home */}
          {currentScreen !== 'home' && (
            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-family-coral transition-all active:scale-90"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
