import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PlusCircle, ShieldCheck, AlertTriangle, Check } from 'lucide-react';
import { sanitizeInput, rateLimiter } from '../../utils/security';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habitData: {
    title: string;
    emoji: string;
    category: 'spiritual' | 'health' | 'learning' | 'togetherness';
    description?: string;
    assignedTo?: string;
  }) => boolean;
}

const EMOJI_OPTIONS = [
  '📖', '🕌', '🏃‍♂️', '🍽️', '🧹', '🌙', '💧', '🧠',
  '🎨', '🧘', '👨‍👩‍👧‍👦', '❤️', '🍎', '📚', '⚽', '🪴',
  '🚲', '😴', '📝', '✨'
];

const CATEGORY_OPTIONS: { id: 'togetherness' | 'spiritual' | 'health' | 'learning'; label: string; emoji: string; color: string }[] = [
  { id: 'togetherness', label: 'Kebersamaan', emoji: '💖', color: 'bg-rose-500 text-white' },
  { id: 'spiritual', label: 'Kerohanian', emoji: '🕌', color: 'bg-emerald-500 text-white' },
  { id: 'health', label: 'Kesehatan', emoji: '🏃‍♂️', color: 'bg-blue-500 text-white' },
  { id: 'learning', label: 'Pembelajaran', emoji: '📚', color: 'bg-amber-500 text-white' },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📖');
  const [category, setCategory] = useState<'spiritual' | 'health' | 'learning' | 'togetherness'>('togetherness');
  const [description, setDescription] = useState('');
  const [assignedTo] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [securityWarning, setSecurityWarning] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSecurityWarning('');

    // 1. Rate Limiting Check (Anti-Spam / Anti-Flood Protection)
    const rateCheck = rateLimiter.checkLockout('add_habit_action');
    if (rateCheck.isLocked) {
      setSecurityWarning(`Keamanan Cyber: Terlalu banyak aksi. Harap tunggu ${rateCheck.remainingSeconds} detik.`);
      return;
    }

    // 2. Anti-XSS Sanitization & Security Validation
    const cleanTitle = sanitizeInput(title);
    const cleanDesc = sanitizeInput(description);
    const cleanEmoji = emoji.trim() || '🌱';

    if (!cleanTitle || cleanTitle.length < 3) {
      setErrorMsg('Judul kebiasaan harus diisi minimal 3 karakter yang valid.');
      return;
    }

    if (cleanTitle.length > 60) {
      setErrorMsg('Judul kebiasaan maksimal 60 karakter.');
      return;
    }

    // 3. Attempt creation
    const success = onAddHabit({
      title: cleanTitle,
      emoji: cleanEmoji,
      category,
      description: cleanDesc,
      assignedTo,
    });

    if (!success) {
      const res = rateLimiter.recordFailedAttempt('add_habit_action');
      if (res.isLocked) {
        setSecurityWarning(`Batas keamanan terlampaui. Harap tunggu ${res.remainingSeconds} detik.`);
      } else {
        setErrorMsg('Gagal menambahkan kebiasaan. Silakan periksa kembali input Anda.');
      }
      return;
    }

    // Reset form & close modal
    setTitle('');
    setDescription('');
    setEmoji('📖');
    setCategory('togetherness');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🌱
            </div>
            <div>
              <h3 className="font-display font-black text-lg">Tambah Kebiasaan Baru</h3>
              <p className="text-xs text-amber-100 font-medium">Bangun rutinitas positif keluarga ASTA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">

          {/* Security Alert Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Perlindungan Data Aman & Privat</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Semua data kebiasaan disimpan secara rahasia dan terlindungi otomatis agar hanya bisa diakses oleh keluarga Anda.
              </p>
            </div>
          </div>

          {/* Rate limit warning */}
          {securityWarning && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{securityWarning}</span>
            </div>
          )}

          {/* Error msg */}
          {errorMsg && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Habit Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Judul Kebiasaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Sholat Subuh Berjamaah, Olahraga Pagi..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
            <div className="flex justify-between items-center mt-1 px-1">
              <span className="text-[10px] text-slate-400">Teks otomatis dibersihkan dari simbol berbahaya</span>
              <span className="text-[10px] text-slate-400 font-bold">{title.length}/60</span>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Kategori Kebiasaan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? `${cat.color} border-transparent shadow-md scale-[1.02]`
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {category === cat.id && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Selection */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Ikon Emoji Kebiasaan
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 shadow-sm shrink-0">
                {emoji}
              </span>
              <input
                type="text"
                maxLength={4}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Emoji"
                className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Pilih dari list atau ketik sendiri</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 max-h-28 overflow-y-auto">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    emoji === em
                      ? 'bg-amber-400 text-slate-900 shadow-sm scale-110'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Deskripsi / Catatan Tambahan (Opsional)
            </label>
            <textarea
              maxLength={200}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Dilakukan setiap jam 6 pagi bersama-sama..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
            />
            <div className="text-right text-[10px] text-slate-400 font-bold">
              {description.length}/200
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-bubbly-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Kebiasaan</span>
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};
