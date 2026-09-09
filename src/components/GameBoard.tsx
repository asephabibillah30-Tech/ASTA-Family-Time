import React, { useState } from 'react';
import type { Card, GameMode, Player, TurnTransition } from '../types/game';
import { GameCard } from './GameCard';
import { CardDeck } from './CardDeck';
import { ScoreBoard } from './ScoreBoard';
import { PlayerTurnModal } from './PlayerTurnModal';
import { Flag, Trophy, Sparkles, Eye, EyeOff } from 'lucide-react';
import { sound } from '../utils/sound';

interface GameBoardProps {
  currentMode: GameMode;
  players: Player[];
  currentPlayer: Player;
  currentPlayerIndex: number;
  currentCard: Card | null;
  isCardFlipped: boolean;
  isShuffling: boolean;
  cardsRemaining: number;
  totalCardsInMode: number;
  turnTransition: TurnTransition;
  onDrawCard: () => void;
  onSubmitScore: (actionType: 'success' | 'funny' | 'skip') => void;
  onAdvanceTurn: () => void;
  onFinishGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  currentMode,
  players,
  currentPlayer,
  currentPlayerIndex,
  currentCard,
  isCardFlipped,
  isShuffling,
  cardsRemaining,
  totalCardsInMode,
  turnTransition,
  onDrawCard,
  onSubmitScore,
  onAdvanceTurn,
  onFinishGame,
}) => {
  const [showMobileScore, setShowMobileScore] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Game StatusBar */}
      <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl shadow-bubbly-sm border border-slate-100 dark:border-slate-700/60 mb-4">
        
        {/* Active Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentMode.emoji}</span>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Mode</span>
            <span className="text-xs sm:text-sm font-display font-extrabold text-slate-800 dark:text-slate-100">
              {currentMode.name}
            </span>
          </div>
        </div>

        {/* Current Active Player Pill */}
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 shadow-sm animate-pulse-fast">
          <span className="text-xl">{currentPlayer.avatar}</span>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider block -mb-0.5">
              Giliran Sekarang
            </span>
            <span className="font-display font-black text-xs sm:text-sm text-rose-900 dark:text-rose-200">
              {currentPlayer.name}
            </span>
          </div>
        </div>

        {/* Finish Game Early Button */}
        <button
          onClick={() => {
            sound.playClick();
            if (window.confirm('Yakin ingin mengakhiri permainan sekarang dan melihat skor akhir?')) {
              onFinishGame();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
          title="Selesaikan Game"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Selesai</span>
        </button>

      </div>

      {/* Main Grid: Responsive Arena (Left: Game Card / Deck, Right: Scoreboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Card Arena (Column 1-8) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[480px]">
          {currentCard ? (
            <GameCard
              card={currentCard}
              currentPlayer={currentPlayer}
              isFlipped={isCardFlipped}
              onSubmitScore={onSubmitScore}
            />
          ) : (
            <CardDeck
              cardsRemaining={cardsRemaining}
              totalCards={totalCardsInMode}
              currentPlayer={currentPlayer}
              isShuffling={isShuffling}
              onDrawCard={onDrawCard}
            />
          )}
        </div>

        {/* Desktop Sidebar: Real-time ScoreBoard & Mode Info (Column 9-12) */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <ScoreBoard
            players={players}
            currentPlayerIndex={currentPlayerIndex}
          />

          {/* Mode Highlights Info Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 shadow-bubbly-sm border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Info Permainan:</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {currentMode.description}
            </p>
            <div className="pt-2 flex justify-between text-slate-400 font-medium">
              <span>Sisa Kartu:</span>
              <strong className="text-family-coral">{cardsRemaining} dari {totalCardsInMode}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Floating Scoreboard Toggle Bar */}
      <div className="lg:hidden mt-6">
        <button
          onClick={() => {
            sound.playClick();
            setShowMobileScore(!showMobileScore);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 shadow-bubbly-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 font-display font-extrabold text-xs active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Lihat Papan Skor Real-Time ({players.length} Pemain)</span>
          </div>
          {showMobileScore ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {showMobileScore && (
          <div className="mt-3 animate-pop-in">
            <ScoreBoard
              players={players}
              currentPlayerIndex={currentPlayerIndex}
            />
          </div>
        )}
      </div>

      {/* Turn Transition Modal */}
      <PlayerTurnModal
        transition={turnTransition}
        onContinue={onAdvanceTurn}
      />

    </div>
  );
};
