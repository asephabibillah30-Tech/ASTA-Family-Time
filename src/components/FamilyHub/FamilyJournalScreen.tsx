import React, { useState } from 'react';
import type { Player } from '../../types/game';
import type { JournalEntry, JournalMood } from '../../types/family';
import { JOURNAL_MOODS } from '../../data/familyData';
import { ArrowLeft, Send } from 'lucide-react';
import { sound } from '../../utils/sound';

import { sanitizeInput } from '../../utils/security';
import { formatIndonesianDate } from '../../utils/dateUtils';

interface FamilyJournalScreenProps {
  players: Player[];
  entries: JournalEntry[];
  onAddEntry: (playerId: string, playerName: string, playerAvatar: string, mood: JournalMood, reason: string) => void;
  onBack: () => void;
}

export const FamilyJournalScreen: React.FC<FamilyJournalScreenProps> = ({
  players,
  entries,
  onAddEntry,
  onBack,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || '');
  const [selectedMood, setSelectedMood] = useState<JournalMood>('happy');
  const [reason, setReason] = useState('');

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = sanitizeInput(reason);
    if (!cleanReason) return;

    onAddEntry(
      activePlayer.id,
      activePlayer.name,
      activePlayer.avatar,
      selectedMood,
      cleanReason
    );

    setReason('');
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
          <span>📝</span> Family Journal (Emosi Hati)
        </h2>

        <div className="w-8" />
      </div>

      {/* Write Entry Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-emerald-200 dark:border-emerald-900/60 shadow-bubbly-sm space-y-4">
        
        {/* Choose Player */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Siapa yang sedang menulis catatan hari ini?
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedPlayerId(p.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border-2 transition-all ${
                  selectedPlayerId === p.id
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 scale-105'
                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                }`}
              >
                <span className="text-xl">{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Hari ini aku merasa:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {JOURNAL_MOODS.map((m) => (
              <button
                key={m.mood}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMood(m.mood);
                }}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedMood === m.mood
                    ? `${m.bgColor} border-2 border-emerald-500 scale-105 shadow-sm`
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 opacity-70'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <span>🛡️ Perlindungan Keamanan Aktif — Jurnal emosi disaring dari skrip berbahaya & disimpan privat.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Apa yang membuatmu merasa seperti itu? (Ceritakan dengan santai):
            </label>
            <textarea
              required
              rows={3}
              maxLength={250}
              placeholder="Contoh: Tadi di sekolah senang sekali bisa bermain bola bersama teman..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none focus:border-emerald-500"
            />
            <div className="flex justify-between items-center mt-1 px-1 text-[10px] text-slate-400 font-bold">
              <span>Teks otomatis dibersihkan dari simbol berbahaya</span>
              <span>{reason.length}/250</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>KIRIM KE JURNAL KELUARGA</span>
          </button>
        </form>
      </div>

      {/* Feed Journal Entries */}
      <div className="space-y-3">
        <h3 className="font-display font-black text-base text-slate-800 dark:text-slate-100">
          Catatan Hati Keluarga Terbaru
        </h3>

        {entries.map((item) => {
          const moodInfo = JOURNAL_MOODS.find(m => m.mood === item.mood) || JOURNAL_MOODS[0];

          return (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.playerAvatar}</span>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">
                      {item.playerName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatIndonesianDate(item.createdAt || item.date)}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${moodInfo.bgColor}`}>
                  <span>{moodInfo.emoji}</span>
                  <span className={moodInfo.color}>{moodInfo.label}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
                "{item.reason}"
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
