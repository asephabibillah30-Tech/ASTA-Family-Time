import React, { useState } from 'react';
import type { FamilyHabit } from '../../types/family';
import { ArrowLeft, Flame, CheckCircle2, PlusCircle, Trash2, ShieldCheck, Filter } from 'lucide-react';
import { AddHabitModal } from './AddHabitModal';

interface FamilyHabitScreenProps {
  habits: FamilyHabit[];
  familyStreak: number;
  onToggleHabit: (id: string) => void;
  onAddHabit: (habitData: {
    title: string;
    emoji: string;
    category: 'spiritual' | 'health' | 'learning' | 'togetherness';
    description?: string;
    assignedTo?: string;
  }) => boolean;
  onDeleteHabit?: (id: string) => void;
  onBack: () => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua Kebiasaan', emoji: '🌟' },
  { id: 'togetherness', label: 'Kebersamaan', emoji: '💖' },
  { id: 'spiritual', label: 'Kerohanian', emoji: '🕌' },
  { id: 'health', label: 'Kesehatan', emoji: '🏃‍♂️' },
  { id: 'learning', label: 'Pembelajaran', emoji: '📚' },
];

export const FamilyHabitScreen: React.FC<FamilyHabitScreenProps> = ({
  habits,
  familyStreak,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onBack,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredHabits = habits.filter((h) => {
    if (activeCategory === 'all') return true;
    return h.category === activeCategory;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteHabit) {
      onDeleteHabit(id);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>🌱</span> Family Habit & Streak
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-bubbly-sm active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Kebiasaan</span>
          </button>

          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 px-3.5 py-1.5 rounded-2xl text-xs font-black text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{familyStreak} Hari</span>
          </div>
        </div>
      </div>

      {/* Streak Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 rounded-3xl text-white shadow-bubbly-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 tracking-wider">
              KEBIASAAN KELUARGA
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200 flex items-center gap-1 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              AES-256 E2EE & Anti-XSS Protected
            </span>
          </div>
          <h3 className="font-display font-black text-2xl">
            Streak Kebersamaan: {familyStreak} Hari 🔥
          </h3>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Keluarga yang konsisten membangun kebiasaan baik akan tumbuh lebih bahagia, harmonis, dan aman!
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs hover:bg-amber-50 shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-amber-600" />
          <span>+ Buat Kebiasaan Baru</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeCategory === tab.id
                ? 'bg-amber-500 text-white shadow-sm scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Habits Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Quick Add Habit Trigger Card */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="p-5 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-all cursor-pointer flex items-center justify-center gap-3 text-amber-700 dark:text-amber-400 group shadow-sm min-h-[84px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-black text-sm">Tambah Kebiasaan Baru</h4>
            <p className="text-[11px] font-bold text-amber-600/80 dark:text-amber-400/80">
              Formulir lengkap dengan keamanan siber E2EE
            </p>
          </div>
        </div>

        {filteredHabits.map((h) => (
          <div
            key={h.id}
            onClick={() => onToggleHabit(h.id)}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between relative group ${
              h.completedToday
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{h.emoji}</span>
              <div>
                <h4 className={`font-display font-bold text-sm ${
                  h.completedToday ? 'text-emerald-950 dark:text-emerald-100 line-through decoration-2' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {h.title}
                </h4>
                {h.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal line-clamp-1">
                    {h.description}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  Streak: {h.streakDays} hari berturut-turut
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDeleteHabit && (
                deleteConfirmId === h.id ? (
                  <div className="flex items-center gap-1 animate-fade-in">
                    <button
                      onClick={(e) => handleDelete(h.id, e)}
                      className="px-2 py-1 bg-rose-500 text-white font-bold text-[10px] rounded-lg shadow-sm"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] rounded-lg"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(h.id); }}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus kebiasaan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}

              <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                h.completedToday ? 'bg-emerald-500 border-emerald-500 text-white scale-105' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {h.completedToday && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={onAddHabit}
      />

    </div>
  );
};
