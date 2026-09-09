import React from 'react';
import type { Player } from '../types/game';
import { RotateCcw, Home, Star, Heart, Award, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface ResultScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  players,
  onPlayAgain,
  onGoHome,
}) => {
  // Sort players by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-pop-in">
      
      {/* Trophy & Title */}
      <div className="text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 flex items-center justify-center text-6xl shadow-bubbly-yellow animate-float">
            🏆
          </div>
          <span className="absolute -bottom-2 -right-2 text-2xl">✨</span>
          <span className="absolute -top-2 -left-2 text-2xl">🎉</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-800 dark:text-slate-100 tracking-tight">
          GAME SELESAI!
        </h1>
        <p className="text-sm sm:text-base text-family-coral font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Keluarga Hebat, Permainan Luar Biasa!
          <Sparkles className="w-4 h-4" />
        </p>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 max-w-lg mx-auto">
        
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-3xl mb-1">{second.avatar}</div>
            <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
              {second.name}
            </span>
            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
              {second.score} Poin
            </span>
            <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex flex-col items-center justify-center shadow-md mt-2 border-t-4 border-slate-300">
              <span className="text-2xl sm:text-3xl">🥈</span>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">JUARA 2</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {first && (
          <div className="flex flex-col items-center -mt-6 z-10">
            <div className="relative mb-1">
              <div className="text-3xl sm:text-4xl animate-bounce">{first.avatar}</div>
              <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl">
                👑
              </span>
            </div>
            <span className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-200 truncate max-w-[100px]">
              {first.name}
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              {first.score} Poin
            </span>
            <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-400 to-yellow-300 flex flex-col items-center justify-center shadow-bubbly-yellow mt-2 border-t-4 border-yellow-200">
              <span className="text-3xl sm:text-4xl">🥇</span>
              <span className="text-xs font-black text-amber-950">JUARA 1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-3xl mb-1">{third.avatar}</div>
            <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
              {third.name}
            </span>
            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
              {third.score} Poin
            </span>
            <div className="w-full h-16 sm:h-20 rounded-t-2xl bg-gradient-to-t from-amber-700/60 to-amber-600/40 dark:from-amber-950 dark:to-amber-900 flex flex-col items-center justify-center shadow-md mt-2 border-t-4 border-amber-600">
              <span className="text-xl sm:text-2xl">🥉</span>
              <span className="text-[10px] font-black text-amber-900 dark:text-amber-200">JUARA 3</span>
            </div>
          </div>
        )}

      </div>

      {/* Full Scoreboard Summary */}
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 shadow-bubbly-sm border border-slate-100 dark:border-slate-700 max-w-lg mx-auto">
        <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-family-coral" />
          <span>Hasil Lengkap Semua Pemain</span>
        </h3>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-sm text-slate-400 w-5 text-center">
                  #{idx + 1}
                </span>
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block">
                    {p.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {p.cardsCompleted} kartu terselesaikan
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-display font-black text-base text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{p.score} ⭐</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heartwarming Family Quote Banner */}
      <div className="max-w-lg mx-auto bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border-2 border-rose-200 dark:border-rose-900 rounded-3xl p-5 text-center space-y-2 shadow-sm">
        <Heart className="w-6 h-6 text-family-coral fill-family-coral mx-auto animate-bounce" />
        <p className="font-display font-bold text-base sm:text-lg text-rose-900 dark:text-rose-200 italic leading-snug">
          “Yang paling penting bukan siapa yang menang, tetapi waktu dan kebahagiaan yang kita habiskan bersama.”
        </p>
        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
          ASTA Family Time ❤️
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-extrabold text-base shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>MAIN LAGI</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-extrabold text-base shadow-bubbly-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>KEMBALI KE HOME</span>
        </button>
      </div>

    </div>
  );
};
