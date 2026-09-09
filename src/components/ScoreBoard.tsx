import React from 'react';
import type { Player } from '../types/game';
import { Trophy, Star } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  className?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerIndex,
  className = '',
}) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const highestScore = sortedPlayers[0]?.score || 0;

  return (
    <div className={`bg-white/90 dark:bg-slate-800/90 rounded-3xl p-4 shadow-bubbly-sm border border-slate-100 dark:border-slate-700/60 ${className}`}>
      
      {/* Title */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
            Papan Skor Keluarga
          </h3>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-bold text-slate-500 dark:text-slate-300">
          Real-time
        </span>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {sortedPlayers.map((player, rank) => {
          const isTurn = players[currentPlayerIndex]?.id === player.id;
          const isLeader = player.score === highestScore && highestScore > 0;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-300 ${
                isTurn
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-2 border-family-coral scale-[1.02] shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/80'
              }`}
            >
              {/* Rank & Avatar */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-display font-black text-xs w-4 text-center text-slate-400">
                  {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}
                </span>

                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-lg shadow-inner">
                    {player.avatar}
                  </div>
                  {isLeader && (
                    <span className="absolute -top-1.5 -right-1 text-xs">
                      👑
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs sm:text-sm truncate text-slate-800 dark:text-slate-100">
                      {player.name}
                    </span>
                    {isTurn && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-family-coral text-white rounded-full font-extrabold uppercase">
                        Giliran
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {player.cardsCompleted} kartu selesai
                  </span>
                </div>
              </div>

              {/* Score & Stars */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="font-display font-black text-sm text-amber-900 dark:text-amber-200">
                    {player.score}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
