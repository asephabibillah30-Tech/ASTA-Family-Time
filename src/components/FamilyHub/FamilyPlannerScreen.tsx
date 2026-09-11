import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {ev.date} {ev.time ? `• ${ev.time} WIB` : '• Sepanjang Hari'}
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

      {/* Add Modal - Rendered at document.body level via Portal */}
      {isAddOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
          <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-2xl border-3 border-blue-400/40 dark:border-slate-700 my-auto animate-pop-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span>📅</span>
                <span>Tambah Agenda Keluarga</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
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
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal:
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-bold outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Emoji Ikon:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {['🕌', '🍽️', '🎮', '📖', '🎉', '🏖️', '⚽', '🚗'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`p-2 rounded-xl text-xl sm:text-2xl border flex items-center justify-center transition-all ${
                        emoji === em 
                          ? 'bg-blue-100 dark:bg-blue-950 border-blue-500 scale-105 shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-black text-sm shadow-md active:scale-95 transition-all mt-2"
              >
                SIMPAN AGENDA
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
