import React from 'react';
import type { GameModeId, Player } from '../types/game';
import { GAME_MODES, CATEGORIES } from '../data/cards';
import { Rocket, Check, ArrowLeft, Users } from 'lucide-react';
import { sound } from '../utils/sound';

interface ModeSelectorProps {
  selectedModeId: GameModeId;
  players: Player[];
  onSelectMode: (id: GameModeId) => void;
  onBackToPlayers: () => void;
  onStartGame: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedModeId,
  players,
  onSelectMode,
  onBackToPlayers,
  onStartGame,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">🎴</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Pilih Mode Permainan
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Tentukan suasana permainan keluarga yang ingin kamu mainkan hari ini!
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className="space-y-3">
        {GAME_MODES.map((mode) => {
          const isSelected = selectedModeId === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`p-4 rounded-3xl cursor-pointer border-3 transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-family-coral shadow-bubbly-coral scale-[1.01]'
                  : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700/60 shadow-sm'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-family-coral text-white flex items-center justify-center shadow-md animate-pop-in">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Mode Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mode.color} p-0.5 shadow-sm shrink-0`}>
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-3xl">
                    {mode.emoji}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100">
                      {mode.name}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {mode.tag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Included categories pill list */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {mode.allowedCategories.map((catKey) => {
                      const cat = CATEGORIES[catKey];
                      return (
                        <span
                          key={catKey}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1"
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Player Confirmation strip */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-family-teal" />
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {players.length} Pemain: {players.map(p => p.name).join(', ')}
          </span>
        </div>
        <button
          onClick={onBackToPlayers}
          className="text-family-coral hover:underline font-bold text-xs"
        >
          Ubah
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onBackToPlayers();
          }}
          className="px-5 py-4 rounded-3xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onStartGame();
          }}
          className="flex-1 py-4 px-8 rounded-3xl bg-gradient-to-r from-family-coral via-rose-500 to-family-pink hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xl shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse-fast"
        >
          <span>MULAI GAME</span>
          <Rocket className="w-6 h-6 fill-white" />
        </button>
      </div>

    </div>
  );
};
