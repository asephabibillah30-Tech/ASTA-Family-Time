import React from 'react';
import type { FamilyHabit } from '../../types/family';
import { ArrowLeft, Flame, CheckCircle2 } from 'lucide-react';


interface FamilyHabitScreenProps {
  habits: FamilyHabit[];
  familyStreak: number;
  onToggleHabit: (id: string) => void;
  onBack: () => void;
}

export const FamilyHabitScreen: React.FC<FamilyHabitScreenProps> = ({
  habits,
  familyStreak,
  onToggleHabit,
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
          <span>🌱</span> Family Habit & Streak
        </h2>

        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full text-xs font-black text-amber-700 dark:text-amber-300">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{familyStreak} Hari</span>
        </div>
      </div>

      {/* Streak Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-3xl text-white shadow-bubbly-sm flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/20">
            KEBIASAAN KELUARGA
          </span>
          <h3 className="font-display font-black text-2xl mt-1">
            Streak Kebersamaan: {familyStreak} Hari 🔥
          </h3>
          <p className="text-xs text-amber-100 mt-1">
            Keluarga yang konsisten membangun kebiasaan baik akan tumbuh lebih bahagia dan harmonis!
          </p>
        </div>
        <span className="text-5xl animate-bounce">🔥</span>
      </div>

      {/* Habits Checklist */}
      <div className="space-y-3">
        {habits.map((h) => (
          <div
            key={h.id}
            onClick={() => onToggleHabit(h.id)}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              h.completedToday
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{h.emoji}</span>
              <div>
                <h4 className={`font-display font-bold text-sm ${
                  h.completedToday ? 'text-emerald-950 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {h.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  Streak: {h.streakDays} hari berturut-turut
                </p>
              </div>
            </div>

            <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 ${
              h.completedToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {h.completedToday && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
