import React from 'react';
import type { Player } from '../types/game';
import { Sparkles } from 'lucide-react';

interface CardDeckProps {
  cardsRemaining: number;
  totalCards: number;
  currentPlayer: Player;
  isShuffling: boolean;
  onDrawCard: () => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  cardsRemaining,
  totalCards,
  currentPlayer,
  isShuffling,
  onDrawCard,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-sm mx-auto text-center">
      
      {/* Current Turn Announcement */}
      <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-3xl shadow-bubbly-sm border border-slate-100 dark:border-slate-700 w-full animate-pop-in">
        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
          Giliran Bermain
        </span>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">{currentPlayer.avatar}</span>
          <span className="font-display font-black text-2xl text-slate-800 dark:text-slate-100">
            {currentPlayer.name}
          </span>
        </div>
        <p className="text-xs text-family-coral font-bold mt-1">
          Ayo ambil kartumu dan tunjukkan aksimu! ✨
        </p>
      </div>

      {/* 3D Visual Card Stack */}
      <div className="relative w-56 h-72 my-4 cursor-pointer group" onClick={onDrawCard}>
        
        {/* Shadow Stack Layers */}
        <div className="absolute inset-0 bg-rose-300 dark:bg-rose-900 rounded-3xl transform translate-y-3 translate-x-2 rotate-6 opacity-60 transition-transform group-hover:rotate-12 group-hover:translate-x-4"></div>
        <div className="absolute inset-0 bg-family-coral dark:bg-rose-800 rounded-3xl transform translate-y-1.5 -translate-x-2 -rotate-3 opacity-80 transition-transform group-hover:-rotate-6 group-hover:-translate-x-4"></div>

        {/* Top Card Face */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-family-coral via-rose-500 to-family-purple p-6 border-4 border-white shadow-bubbly-coral flex flex-col items-center justify-between text-white transition-all transform ${
            isShuffling ? 'scale-90 animate-spin' : 'group-hover:-translate-y-2 group-hover:scale-105'
          }`}
        >
          {/* Ornaments */}
          <div className="w-full flex justify-between text-xl opacity-75">
            <span>✨</span>
            <span>❤️</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/30 animate-float">
              🎴
            </div>
            <h4 className="font-display font-black text-2xl drop-shadow">
              ASTA Family Time
            </h4>
            <span className="text-xs bg-white/25 px-3 py-1 rounded-full font-bold">
              {cardsRemaining} Kartu Tersisa
            </span>
          </div>

          <div className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Klik untuk Buka
          </div>
        </div>

      </div>

      {/* Big Action Button */}
      <button
        onClick={onDrawCard}
        disabled={isShuffling || cardsRemaining === 0}
        className="w-full max-w-xs py-4 px-6 rounded-3xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xl shadow-bubbly-coral active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 animate-pulse-fast"
      >
        <span>AMBIL KARTU</span>
        <span className="text-2xl">🎴</span>
      </button>

      {/* Progress Info */}
      <div className="w-full max-w-xs space-y-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
        <div className="flex justify-between">
          <span>Progres Kartu</span>
          <span>{totalCards - cardsRemaining} / {totalCards} Dimainkan</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-family-coral to-family-pink h-full rounded-full transition-all duration-500"
            style={{ width: `${((totalCards - cardsRemaining) / totalCards) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
};
