import React, { useState } from 'react';
import type { Player } from '../types/game';
import { AVATAR_PRESETS } from '../hooks/useGame';
import { Plus, Trash2, ArrowRight, Users, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface PlayerSetupProps {
  players: Player[];
  onAddPlayer: (name: string, rolePreset?: string, avatar?: string) => void;
  onRemovePlayer: (id: string) => void;
  onProceedToMode: () => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  players,
  onAddPlayer,
  onRemovePlayer,
  onProceedToMode,
}) => {
  const [inputName, setInputName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].emoji);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;

    onAddPlayer(inputName.trim(), inputName.trim(), selectedAvatar);
    setInputName('');
    // Cycle to next avatar preset
    const currentIndex = AVATAR_PRESETS.findIndex(a => a.emoji === selectedAvatar);
    const nextAvatar = AVATAR_PRESETS[(currentIndex + 1) % AVATAR_PRESETS.length].emoji;
    setSelectedAvatar(nextAvatar);
    setShowAvatarPicker(false);
  };

  const quickAddPreset = (name: string, emoji: string) => {
    // Check if player with this name already exists
    const existing = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    const finalName = existing ? `${name} ${players.length + 1}` : name;
    onAddPlayer(finalName, name, emoji);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pop-in">
      
      {/* Title Section */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">👨‍👩‍👧‍👦</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Siapa yang Ikut Bermain?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Tambahkan nama seluruh anggota keluarga yang siap seru-seruan! (Minimal 2 pemain)
        </p>
      </div>

      {/* Quick Family Presets */}
      <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Klik Cepat Tambah Anggota Keluarga:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Ayah', emoji: '👨‍💼' },
            { name: 'Ibu', emoji: '👩‍🍳' },
            { name: 'Kakak', emoji: '👦' },
            { name: 'Adik', emoji: '👧' },
            { name: 'Kakek', emoji: '👴' },
            { name: 'Nenek', emoji: '👵' },
          ].map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                sound.playClick();
                quickAddPreset(preset.name, preset.emoji);
              }}
              className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm border border-amber-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>{preset.emoji}</span>
              <span>+ {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Add Player Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-bubbly-sm border border-slate-100 dark:border-slate-700 space-y-3">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
          Ketik Nama Pemain / Nama Panggilan:
        </label>
        
        <div className="flex items-center gap-2">
          {/* Avatar Selector Button */}
          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-2xl shadow-inner active:scale-95 transition-all shrink-0"
            title="Pilih Karakter"
          >
            {selectedAvatar}
          </button>

          {/* Name Input */}
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Contoh: Om Budi, Tante Rina..."
            maxLength={20}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-family-coral"
          />

          {/* Add Button */}
          <button
            type="submit"
            disabled={!inputName.trim()}
            className="px-5 py-3 rounded-2xl bg-family-coral hover:bg-rose-600 disabled:opacity-40 text-white font-display font-extrabold text-sm shadow-bubbly-coral active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Avatar Picker Dropdown Grid */}
        {showAvatarPicker && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 animate-pop-in">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Pilih Karakter Avatar:
            </span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(item.emoji);
                    setShowAvatarPicker(false);
                    sound.playClick();
                  }}
                  className={`p-2 rounded-xl text-2xl hover:bg-white dark:hover:bg-slate-600 transition-transform ${
                    selectedAvatar === item.emoji ? 'bg-amber-100 dark:bg-amber-950 scale-110 shadow-sm' : ''
                  }`}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Players List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-family-teal" />
            <span>Daftar Pemain ({players.length})</span>
          </h3>
          {players.length < 2 && (
            <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
              Wajib minimal 2 pemain
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-family-coral transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-black text-slate-400">
                  #{idx + 1}
                </span>
                <div className={`w-10 h-10 rounded-xl ${p.color} p-0.5 flex items-center justify-center text-xl shadow-inner`}>
                  <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-800 flex items-center justify-center">
                    {p.avatar}
                  </div>
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 block">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {p.rolePreset || 'Pemain'}
                  </span>
                </div>
              </div>

              {/* Remove button (allowed if > 2 players) */}
              <button
                type="button"
                onClick={() => onRemovePlayer(p.id)}
                disabled={players.length <= 2}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-20 transition-colors"
                title={players.length <= 2 ? 'Minimal 2 pemain' : 'Hapus Pemain'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            sound.playClick();
            onProceedToMode();
          }}
          disabled={players.length < 2}
          className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral disabled:opacity-40 text-white font-display font-black text-lg shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>PILIH MODE PERMAINAN</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
