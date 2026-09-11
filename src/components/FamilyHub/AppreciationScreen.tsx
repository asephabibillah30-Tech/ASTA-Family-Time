import React, { useState } from 'react';
import type { Player } from '../../types/game';
import type { AppreciationItem } from '../../types/family';
import { ArrowLeft, Send } from 'lucide-react';


import { sanitizeInput } from '../../utils/security';

interface AppreciationScreenProps {
  players: Player[];
  appreciations: AppreciationItem[];
  totalLovePoints: number;
  onSendAppreciation: (
    fromId: string, fromName: string, fromAvatar: string,
    toId: string, toName: string, toAvatar: string,
    msg: string, badge?: string
  ) => void;
  onBack: () => void;
}

export const AppreciationScreen: React.FC<AppreciationScreenProps> = ({
  players,
  appreciations,
  totalLovePoints,
  onSendAppreciation,
  onBack,
}) => {
  const [fromId, setFromId] = useState(players[0]?.id || '');
  const [toId, setToId] = useState(players[1]?.id || '');
  const [message, setMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('Penuh Kasih ❤️');

  const sender = players.find(p => p.id === fromId) || players[0];
  const receiver = players.find(p => p.id === toId) || players[1] || players[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = sanitizeInput(message);
    if (!cleanMsg) return;

    onSendAppreciation(
      sender.id, sender.name, sender.avatar,
      receiver.id, receiver.name, receiver.avatar,
      cleanMsg,
      selectedBadge
    );

    setMessage('');
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
          <span>💕</span> Apresiasi & Love Points
        </h2>

        <div className="bg-rose-100 dark:bg-rose-950 px-3 py-1 rounded-full text-xs font-extrabold text-rose-700 dark:text-rose-300">
          {totalLovePoints} ⭐ Poin
        </div>
      </div>

      {/* Send Compliment Box */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-rose-200 dark:border-rose-900/60 shadow-bubbly-coral space-y-4">
        <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
          Kirim Apresiasi Hangat Hari Ini
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dari */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dari:</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
              ))}
            </select>
          </div>

          {/* Untuk */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ditujukan Untuk:</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Badge presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gelar Apresiasi:</label>
          <div className="flex gap-2 flex-wrap text-xs">
            {['Penuh Kasih ❤️', 'Koki Terbaik 👑', 'Kakak Teladan ⭐', 'Pahlawan Rumah 🦸‍♂️', 'Paling Sabar 🌸', 'Juara Rajin 🏆'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBadge(b)}
                className={`px-3 py-1 rounded-full font-bold border transition-all ${
                  selectedBadge === b ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 dark:bg-slate-700 border-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800/60">
            <span>🛡️ Perlindungan Keamanan Aktif — Pesan apresiasi disaring dari simbol & skrip berbahaya.</span>
          </div>

          <div>
            <textarea
              required
              rows={2}
              maxLength={200}
              placeholder="Tuliskan ucapan terima kasih atau pujian tulusmu..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
            <div className="flex justify-between items-center mt-1 px-1 text-[10px] text-slate-400 font-bold">
              <span>Teks otomatis dibersihkan dari simbol berbahaya</span>
              <span>{message.length}/200</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>KIRIM APRESIASI (+10 LOVE POINTS)</span>
          </button>
        </form>
      </div>

      {/* Feed Appreciations */}
      <div className="space-y-3">
        <h3 className="font-display font-black text-base text-slate-800 dark:text-slate-100">
          Dinding Apresiasi Keluarga
        </h3>

        {appreciations.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-slate-700 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.fromPlayerAvatar}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.fromPlayerName}</span>
                <span className="text-rose-500 font-bold">➔</span>
                <span className="text-xl">{item.toPlayerAvatar}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.toPlayerName}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 font-bold text-[10px]">
                {item.badge}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-2xl italic">
              "{item.message}"
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
