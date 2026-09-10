import React from 'react';
import type { Card, Player } from '../types/game';
import { CATEGORIES } from '../data/cards';
import { DifficultyBadge } from './common/DifficultyBadge';
import { Timer } from './Timer';
import { useTimer } from '../hooks/useTimer';
import { Lightbulb, Heart, Sparkles, SkipForward, Award } from 'lucide-react';

interface GameCardProps {
  card: Card;
  currentPlayer: Player;
  isFlipped: boolean;
  onFlipCard?: () => void;
  onSubmitScore: (actionType: 'success' | 'funny' | 'skip') => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  card,
  currentPlayer,
  isFlipped,
  onFlipCard,
  onSubmitScore,
}) => {
  const categoryInfo = CATEGORIES[card.category] || CATEGORIES.expression;
  const initialDuration = card.duration || 15;
  const timer = useTimer(initialDuration);

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 my-2">
      <div
        className={`relative w-full rounded-3xl transition-transform duration-700 transform-style-preserve-3d shadow-bubbly-lg ${
          isFlipped ? '' : 'rotate-y-180'
        }`}
      >
        {/* ================= CARD FRONT (CHALLENGE DISPLAY) ================= */}
        <div className="w-full rounded-3xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 overflow-hidden backface-hidden flex flex-col">
          
          {/* Header Bar with Gradient */}
          <div className={`p-4 bg-gradient-to-r ${categoryInfo.color} text-white flex items-center justify-between shadow-inner`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow">{categoryInfo.emoji}</span>
              <div>
                <span className="text-[11px] font-extrabold tracking-wider uppercase opacity-90 block">Kategori</span>
                <span className="text-sm font-display font-bold">{categoryInfo.name}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold tracking-wider">
              #{card.id}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 flex-1 flex flex-col items-center text-center space-y-4">
            
            {/* Top Info: Turn Indicator & Difficulty */}
            <div className="w-full flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <span>Giliran:</span>
                <span className="font-extrabold flex items-center gap-1">
                  {currentPlayer.avatar} {currentPlayer.name}
                </span>
              </div>

              <DifficultyBadge difficulty={card.difficulty} points={card.points} />
            </div>

            {/* Central Animated Illustration / Emoji */}
            <div className="relative group my-0.5 sm:my-1">
              <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr ${categoryInfo.color} p-1 shadow-bubbly-sm animate-float`}>
                <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-800 flex items-center justify-center text-4xl sm:text-6xl select-none">
                  {card.emoji}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow flex items-center gap-0.5">
                <Award className="w-3 h-3" /> +{card.points}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 sm:space-y-2 max-w-sm">
              <h2 className="text-lg sm:text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                {card.title}
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                {card.description}
              </p>
            </div>

            {/* Pro Tip if available */}
            {card.proTip && (
              <div className="w-full flex items-start gap-2 text-left bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-2 sm:p-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold">Tips Seru:</strong> {card.proTip}
                </span>
              </div>
            )}

            {/* Timer Component */}
            <div className="w-full pt-1">
              <Timer
                timeLeft={timer.timeLeft}
                totalDuration={timer.totalDuration}
                isRunning={timer.isRunning}
                isFinished={timer.isFinished}
                progressPercent={timer.progressPercent}
                onToggleTimer={timer.toggleTimer}
                onResetTimer={timer.resetTimer}
                onAddExtraTime={timer.addExtraTime}
              />
            </div>

            {/* Scoring Question Banner */}
            <div className="w-full pt-1.5 sm:pt-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                Bagaimana hasil tantangan {currentPlayer.name}?
              </p>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
                {/* 1. Success Button */}
                <button
                  onClick={() => onSubmitScore('success')}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-display font-extrabold text-[11px] sm:text-sm shadow-bubbly-teal active:scale-95 transition-all leading-tight"
                >
                  <Heart className="w-3.5 h-3.5 fill-white shrink-0 hidden xs:inline" />
                  <span>BERHASIL! +{card.points}</span>
                </button>

                {/* 2. Super Funny Button (+Bonus) */}
                <button
                  onClick={() => onSubmitScore('funny')}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-display font-extrabold text-[11px] sm:text-sm shadow-bubbly-yellow active:scale-95 transition-all leading-tight"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white shrink-0 hidden xs:inline" />
                  <span>LUCU! +{card.points + 1}</span>
                </button>

                {/* 3. Skip Button */}
                <button
                  onClick={() => onSubmitScore('skip')}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-[11px] sm:text-xs active:scale-95 transition-all leading-tight"
                >
                  <SkipForward className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
                  <span>LEWATI</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= CARD BACK (FACE DOWN DECK) ================= */}
        <div
          onClick={onFlipCard}
          className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-family-coral via-rose-500 to-family-purple p-6 border-4 border-white shadow-bubbly-lg backface-hidden rotate-y-180 flex flex-col items-center justify-between text-white cursor-pointer card-sheen"
        >
          {/* Decorative Corner Ornaments */}
          <div className="w-full flex justify-between text-2xl opacity-60">
            <span>✨</span>
            <span>❤️</span>
          </div>

          {/* Center Mascot & Logo */}
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl shadow-inner border border-white/30 animate-wiggle">
              🎴
            </div>
            <h3 className="font-display font-extrabold text-3xl tracking-tight drop-shadow-md">
              ASTA Family Time
            </h3>
            <p className="text-xs text-rose-100 font-bold max-w-[200px]">
              Tantangan Seru & Lucu Menantimu!
            </p>
          </div>

          {/* Tap Prompt */}
          <div className="bg-white/25 backdrop-blur-md px-5 py-2 rounded-full font-display font-extrabold text-sm tracking-wider shadow animate-pulse">
            👆 Sentuh untuk Buka Kartu
          </div>

          <div className="w-full flex justify-between text-2xl opacity-60">
            <span>🎉</span>
            <span>🌟</span>
          </div>
        </div>

      </div>
    </div>
  );
};
