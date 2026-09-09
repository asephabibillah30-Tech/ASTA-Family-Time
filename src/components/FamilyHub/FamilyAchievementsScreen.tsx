import React from 'react';
import type { FamilyAchievement } from '../../types/family';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

interface FamilyAchievementsScreenProps {
  achievements: FamilyAchievement[];
  onBack: () => void;
}

export const FamilyAchievementsScreen: React.FC<FamilyAchievementsScreenProps> = ({
  achievements,
  onBack,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-pop-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>🏆</span> Family Achievements
        </h2>

        <div className="w-8" />
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border-2 space-y-3 transition-all ${
                ach.unlocked
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {ach.unlocked ? (
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Progres: {ach.progress} / {ach.maxProgress}</span>
                  <span>+{ach.rewardPoints} Poin</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
