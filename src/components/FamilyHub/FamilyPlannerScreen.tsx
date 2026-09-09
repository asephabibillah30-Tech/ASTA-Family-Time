import React, { useState } from 'react';
import type { PlannerEvent } from '../../types/family';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, X } from 'lucide-react';
import { sound } from '../../utils/sound';

interface FamilyPlannerScreenProps {
  events: PlannerEvent[];
  onAddEvent: (event: Omit<PlannerEvent, 'id'>) => void;
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onBack: () => void;
}

export const FamilyPlannerScreen: React.FC<FamilyPlannerScreenProps> = ({
  events,
  onAddEvent,
  onToggleEvent,
  onDeleteEvent,
  onBack,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const category: PlannerEvent['category'] = 'family_time';
  const [emoji, setEmoji] = useState('🎮');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      date,
      time,
      category,
      emoji: emoji || '📅',
      completed: false
    });

    setTitle('');
    setIsAddOpen(false);
  };

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
          <span>📅</span> Family Planner
        </h2>

        <button
          onClick={() => {
            sound.playClick();
            setIsAddOpen(true);
          }}
          className="p-2 rounded-2xl bg-family-coral text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Agenda</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((ev) => (
          <div
            key={ev.id}
            className={`p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
              ev.completed
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 opacity-75'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleEvent(ev.id)}
                className="text-slate-400 hover:text-emerald-500 transition-colors"
              >
                {ev.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>

              <span className="text-2xl">{ev.emoji}</span>

              <div>
                <h3 className={`font-display font-bold text-sm ${
                  ev.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ev.date} {ev.time ? `ull; ${ev.time}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Hapus agenda ini?')) {
                  onDeleteEvent(ev.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-bubbly-lg border-4 border-blue-200 dark:border-slate-700">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-4">
              Tambah Agenda Keluarga
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kegiatan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Sholat Berjamaah / Family Game"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal:
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Waktu / Jam:
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Emoji Ikon:
                </label>
                <div className="flex gap-2 text-2xl">
                  {['🕌', '🍽️', '🎮', '📖', '🎉', '🏖️', '⚽', '🚗'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`p-2 rounded-xl border ${emoji === em ? 'bg-blue-100 border-blue-500' : 'bg-slate-50'}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-display font-black text-sm shadow-md"
              >
                SIMPAN AGENDA
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
