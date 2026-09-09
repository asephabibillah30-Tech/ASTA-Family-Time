import React from 'react';
import type { DifficultyLevel } from '../../types/game';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  points: number;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, points }) => {
  const getDifficultyLabel = (diff: DifficultyLevel) => {
    switch (diff) {
      case 1:
        return { label: 'Mudah', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200' };
      case 2:
        return { label: 'Sedang', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200' };
      case 3:
        return { label: 'Menantang', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200' };
      default:
        return { label: 'Mudah', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const diffConfig = getDifficultyLabel(difficulty);
  const stars = '⭐'.repeat(difficulty);

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${diffConfig.color}`}>
        {stars} {diffConfig.label}
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full font-extrabold bg-family-yellow/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
        +{points} Poin
      </span>
    </div>
  );
};
