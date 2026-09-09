import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Settings, HelpCircle, Home, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  soundEnabled: boolean;
  darkMode: boolean;
  currentScreen: string;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onGoHome: () => void;
  onRestartGame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  darkMode,
  currentScreen,
  onToggleSound,
  onToggleDarkMode,
  onOpenSettings,
  onOpenHowToPlay,
  onGoHome,
  onRestartGame,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/85 border-b border-rose-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="flex items-center gap-2 group transition-transform active:scale-95 text-left"
          title="Kembali ke Beranda"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-family-coral to-family-pink flex items-center justify-center text-white text-2xl shadow-bubbly-sm group-hover:rotate-6 transition-transform">
            🎴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-family-coral via-family-pink to-family-purple bg-clip-text text-transparent">
                ASTA Family Time
              </span>
              <span className="text-xs bg-family-yellow/40 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                ❤️
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Game Kartu Keluarga ASTA &bull; Main Bersama, Lebih Dekat, Lebih Bahagia
            </p>
          </div>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* How to play */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-all active:scale-90"
            title="Cara Bermain"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              soundEnabled
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-family-coral'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Suara' : 'Aktifkan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleDarkMode();
            }}
            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 text-family-teal transition-all active:scale-90"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Restart Button when in game board */}
          {currentScreen === 'game_board' && onRestartGame && (
            <button
              onClick={() => {
                sound.playClick();
                onRestartGame();
              }}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 transition-all active:scale-90"
              title="Kocok Ulang Game"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Home button when not in home */}
          {currentScreen !== 'home' && (
            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-family-coral transition-all active:scale-90"
              title="Kembali ke Beranda"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
            title="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
