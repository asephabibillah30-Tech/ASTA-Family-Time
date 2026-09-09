import React, { useMemo } from 'react';
import type { GameModeId, Player, CategoryType } from '../types/game';
import { GAME_MODES, CATEGORIES, INITIAL_CARDS } from '../data/cards';
import { ALL_CATEGORIES } from '../hooks/useGame';
import { Rocket, Check, ArrowLeft, Users, Layers, Sparkles, CheckSquare } from 'lucide-react';
import { sound } from '../utils/sound';

interface ModeSelectorProps {
  selectedModeId: GameModeId;
  selectedCategories: CategoryType[];
  players: Player[];
  onSelectMode: (id: GameModeId) => void;
  onToggleCategory: (cat: CategoryType) => void;
  onSelectAllCategories: () => void;
  onBackToPlayers: () => void;
  onStartGame: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedModeId,
  selectedCategories,
  players,
  onSelectMode,
  onToggleCategory,
  onSelectAllCategories,
  onBackToPlayers,
  onStartGame,
}) => {
  // Calculate card counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      expression: 0,
      charades: 0,
      word_guess: 0,
      activity: 0,
      trivia: 0,
      affection: 0,
      creative: 0,
    };
    INITIAL_CARDS.forEach(c => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      }
    });
    return counts;
  }, []);

  // Calculate total cards in currently selected categories
  const totalCardsInSelection = useMemo(() => {
    return INITIAL_CARDS.filter(c => selectedCategories.includes(c.category)).length;
  }, [selectedCategories]);

  // Actual cards that will be in the deck (capped at 100)
  const actualDeckCount = Math.min(100, totalCardsInSelection);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">🎴</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Pilih Mode & Kategori
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Pilih mode preset seru atau tentukan sendiri kombinasi kategori kartu favoritmu!
        </p>
      </div>

      {/* 100 Cards Session Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-purple-950/40 p-4 rounded-3xl border-2 border-amber-300/60 dark:border-amber-700/50 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xl font-bold shadow-sm">
          🎲
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-display font-bold text-slate-900 dark:text-white">
            Sesi Permainan: <span className="text-family-coral font-extrabold">{actualDeckCount} Kartu Acak</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-xs">
            {totalCardsInSelection > 100 
              ? `Dari total ${totalCardsInSelection} kartu terpilih, sistem akan mengacak 100 kartu pilihan terbaik untuk setiap sesi.`
              : `Semua ${totalCardsInSelection} kartu pada kategori terpilih akan dimainkan secara acak.`}
          </p>
        </div>
      </div>

      {/* Multi-Category Custom Picker Section */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-3 border-purple-200 dark:border-purple-900/60 shadow-bubbly-purple space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Kustomisasi Kategori Kartu
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                  {selectedCategories.length} Dipilih
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih lebih dari satu kategori kartu yang ingin kamu mainkan bersama keluarga
              </p>
            </div>
          </div>

          <button
            onClick={onSelectAllCategories}
            className="text-xs font-extrabold text-purple-600 dark:text-purple-300 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/70 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Pilih Semua</span>
          </button>
        </div>

        {/* Categories Grid Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_CATEGORIES.map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isChecked = selectedCategories.includes(catKey);
            const count = categoryCounts[catKey] || 0;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => onToggleCategory(catKey)}
                className={`p-3 rounded-2xl text-left border-2 transition-all duration-200 flex items-center justify-between group active:scale-98 ${
                  isChecked
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-purple-400 dark:border-purple-600 shadow-sm scale-[1.01]'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-display font-extrabold text-xs sm:text-sm truncate ${
                      isChecked ? 'text-purple-950 dark:text-purple-100' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      {count} Kartu Tersedia
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  isChecked
                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Mode Selector Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Atau Pilih Mode Preset Cepat:
          </h3>
        </div>

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
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${mode.color} p-0.5 shadow-sm shrink-0`}>
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-2xl sm:text-3xl">
                    {mode.emoji}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100">
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
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
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
          className="flex-1 py-4 px-8 rounded-3xl bg-gradient-to-r from-family-coral via-rose-500 to-family-pink hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-lg sm:text-xl shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse-fast"
        >
          <span>MULAI ({actualDeckCount} KARTU)</span>
          <Rocket className="w-6 h-6 fill-white" />
        </button>
      </div>

    </div>
  );
};
