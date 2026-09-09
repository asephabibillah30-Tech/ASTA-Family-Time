import React from 'react';
import type { TurnTransition } from '../types/game';
import { Heart } from 'lucide-react';

interface PlayerTurnModalProps {
  transition: TurnTransition;
  onContinue: () => void;
}

export const PlayerTurnModal: React.FC<PlayerTurnModalProps> = ({
  transition,
  onContinue,
}) => {
  if (!transition.show || !transition.nextPlayer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 text-center shadow-bubbly-lg border-4 border-rose-100 dark:border-slate-700 overflow-hidden">
        
        {/* Top Glow Background */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-family-yellow/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-family-coral/40 rounded-full blur-2xl pointer-events-none" />

        {/* Completed Player Feedback */}
        {transition.completedPlayer && (
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-3xl inline-block animate-bounce mb-1">
              {transition.isBonus ? '🤩' : transition.pointsEarned > 0 ? '🎉' : '👍'}
            </span>
            <h3 className="font-display font-black text-xl text-slate-800 dark:text-slate-100">
              {transition.isBonus
                ? `LUCU BANGET, ${transition.completedPlayer.name}!`
                : transition.pointsEarned > 0
                ? `Mantap, ${transition.completedPlayer.name}!`
                : `Semangat Terus, ${transition.completedPlayer.name}!`}
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              {transition.pointsEarned > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  +{transition.pointsEarned} Poin Berhasil Diraih! ⭐
                </span>
              ) : (
                'Kartu dilewati, giliran berikutnya!'
              )}
            </p>
          </div>
        )}

        {/* Next Player Highlight */}
        <div className="my-4 space-y-3">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-family-coral uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-family-coral" />
            <span>Giliran Berikutnya</span>
            <Heart className="w-3.5 h-3.5 fill-family-coral" />
          </div>

          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-family-coral to-family-pink p-1 shadow-bubbly-coral animate-float">
            <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-800 flex items-center justify-center text-5xl">
              {transition.nextPlayer.avatar}
            </div>
          </div>

          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
              {transition.nextPlayer.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Siap untuk tantangan seru berikutnya?
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-extrabold text-base shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>AMBIL KARTU</span>
          <span className="text-xl">🎴</span>
        </button>

      </div>
    </div>
  );
};
