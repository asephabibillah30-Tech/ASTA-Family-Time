import React from 'react';
import { Play, Heart } from 'lucide-react';
import type { Player } from '../types/game';
import { sound } from '../utils/sound';

interface HomePageProps {
  players: Player[];
  onStartGame: () => void;
  onOpenPlayerSetup: () => void;
  onOpenHowToPlay: () => void;
  onOpenScoreboard: () => void;
  onOpenSettings: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  players,
  onStartGame,
  onOpenPlayerSetup,
  onOpenHowToPlay,
  onOpenScoreboard,
  onOpenSettings,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center text-center space-y-8 animate-pop-in">
      
      {/* Hero Badge Tagline */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-extrabold text-xs sm:text-sm shadow-sm animate-float">
        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
        <span>Main Bersama, Lebih Dekat, Lebih Bahagia ❤️</span>
      </div>

      {/* Main Brand Title & Subtitle */}
      <div className="space-y-3 max-w-lg">
        <div className="relative inline-block">
          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight">
            ASTA{' '}
            <span className="bg-gradient-to-r from-family-coral via-family-pink to-family-purple bg-clip-text text-transparent">
              Family Time
            </span>
          </h1>
          <span className="absolute -top-4 -right-4 text-3xl animate-bounce">🎴</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-family-coral tracking-wide uppercase">
            Game Kartu Keluarga ASTA
          </p>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            “Waktu bersama adalah kenangan terbaik.”
          </p>
        </div>
      </div>

      {/* Cute Family Illustration & Card Visual Banner */}
      <div className="w-full max-w-lg relative py-4">
        <div className="bg-gradient-to-br from-amber-100 via-rose-100 to-teal-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 rounded-3xl p-6 shadow-bubbly border-4 border-white dark:border-slate-700 relative overflow-hidden">
          
          {/* Background Doodles */}
          <div className="absolute top-2 left-3 text-2xl opacity-40">✨</div>
          <div className="absolute top-3 right-4 text-2xl opacity-40">⭐</div>
          <div className="absolute bottom-2 left-6 text-2xl opacity-40">🎉</div>
          <div className="absolute bottom-3 right-5 text-2xl opacity-40">❤️</div>

          {/* Family Avatars Display */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
            {players.slice(0, 4).map((p, idx) => (
              <div
                key={p.id}
                className="flex flex-col items-center group cursor-pointer"
                onClick={onOpenPlayerSetup}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${p.color} p-0.5 shadow-bubbly-sm group-hover:scale-110 transition-transform ${idx % 2 === 0 ? 'animate-float' : ''}`}>
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-3xl">
                    {p.avatar}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate max-w-[60px]">
                  {p.name}
                </span>
              </div>
            ))}
            {players.length > 4 && (
              <div
                onClick={onOpenPlayerSetup}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-200 text-sm shadow-sm">
                  +{players.length - 4}
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1">Lainnya</span>
              </div>
            )}
          </div>

          {/* Mini Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700 text-center">
            <div>
              <span className="font-display font-black text-lg text-family-coral">50</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block -mt-1">Kartu Seru</span>
            </div>
            <div>
              <span className="font-display font-black text-lg text-family-teal">7</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block -mt-1">Kategori</span>
            </div>
            <div>
              <span className="font-display font-black text-lg text-family-purple">5</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block -mt-1">Mode Game</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Buttons Section */}
      <div className="w-full max-w-sm space-y-3">
        
        {/* Primary Play Button */}
        <button
          onClick={() => {
            sound.playClick();
            onStartGame();
          }}
          className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-family-coral via-rose-500 to-family-pink hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xl shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse-fast group"
        >
          <Play className="w-6 h-6 fill-white group-hover:scale-125 transition-transform" />
          <span>MULAI BERMAIN</span>
          <span className="text-2xl">🎮</span>
        </button>

        {/* Secondary Menu Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          
          {/* Player List */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPlayerSetup();
            }}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-bold text-xs sm:text-sm shadow-bubbly-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
          >
            <span className="text-xl">👨‍👩‍👧</span>
            <span>DAFTAR PEMAIN</span>
          </button>

          {/* How to play */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-bold text-xs sm:text-sm shadow-bubbly-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
          >
            <span className="text-xl">📖</span>
            <span>CARA BERMAIN</span>
          </button>

          {/* Scores */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenScoreboard();
            }}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-bold text-xs sm:text-sm shadow-bubbly-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
          >
            <span className="text-xl">🏆</span>
            <span>SKOR</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-bold text-xs sm:text-sm shadow-bubbly-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
          >
            <span className="text-xl">⚙️</span>
            <span>PENGATURAN</span>
          </button>

        </div>

      </div>

    </div>
  );
};
