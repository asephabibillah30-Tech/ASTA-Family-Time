import React from 'react';
import { X, Volume2, VolumeX, Moon, Sun, Clock, RotateCcw, Music } from 'lucide-react';
import type { GameSettings } from '../types/game';
import { sound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onResetGame,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextState });
    if (nextState) {
      setTimeout(() => {
        sound.playSuccess();
      }, 50);
    }
  };

  const handleTestSound = () => {
    sound.init();
    sound.playFunnyBonus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-20 sm:pt-24 pb-24 sm:pb-28 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-2xl border-3 border-slate-200 dark:border-slate-700 max-h-full flex flex-col overflow-hidden animate-pop-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <h2 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>⚙️</span> Pengaturan Game
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-rose-100 hover:text-family-coral transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-left">

        {/* Settings List */}
        <div className="space-y-4">
          
          {/* Sound Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-family-coral">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                    Efek Suara (SFX)
                  </strong>
                  <span className="text-xs text-slate-400">
                    {settings.soundEnabled ? 'Suara aktif' : 'Suara dibisukan'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleSound}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                  settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Sound Button */}
            {settings.soundEnabled && (
              <button
                onClick={handleTestSound}
                className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-200 dark:border-amber-800 active:scale-95"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Tes Bunyi Suara 🔔</span>
              </button>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-family-teal">
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <strong className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  Mode Gelap (Dark Mode)
                </strong>
                <span className="text-xs text-slate-400">
                  {settings.darkMode ? 'Tema Gelap Aktic' : 'Tema Terang Ceria'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.darkMode ? 'bg-family-teal' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Default Timer Duration */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <strong className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Waktu Default Timer
              </strong>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    onUpdateSettings({ customTimerSeconds: sec });
                    sound.playClick();
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    settings.customTimerSeconds === sec
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Reset Game Session Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onResetGame();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-family-coral font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200 dark:border-rose-900"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Sesi & Mulai Ulang Dari Awal</span>
            </button>
          </div>

        </div>

        {/* Save/Close button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-display font-bold text-sm shadow-bubbly-sm active:scale-95 transition-all"
        >
          Tutup & Simpan
        </button>

        </div>
      </div>
    </div>
  );
};
