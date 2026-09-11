import React from 'react';
import { X, Sparkles, Award } from 'lucide-react';
import { CATEGORIES } from '../data/cards';
import type { CategoryType } from '../types/game';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryType[];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-2xl border-3 border-amber-300 dark:border-slate-700 my-auto animate-pop-in text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📖</span> Cara Bermain ASTA
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-rose-100 hover:text-family-coral transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Easy Steps */}
        <div className="space-y-3 mb-6">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Alur Permainan Sangat Mudah:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Ambil Kartu 🎴
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Pemain yang mendapat giliran menekan tombol "Ambil Kartu".
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Lakukan Tantangan ⏱️
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Lakukan aksi di kartu sebelum timer hitungan waktu habis.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Beri Penilaian ❤️
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Keluarga menilai apakah berhasil atau super lucu (+bonus poin)!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Giliran Otomatis 🔄
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Giliran berpindah otomatis ke anggota keluarga berikutnya!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Categories Guide */}
        <div className="space-y-3 mb-6">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-family-coral" />
            <span>7 Kategori Kartu Seru:</span>
          </h3>

          <div className="space-y-2">
            {categoryKeys.map((catKey) => {
              const cat = CATEGORIES[catKey];
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"
                >
                  <span className="text-2xl shrink-0">{cat.emoji}</span>
                  <div>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {cat.name}
                    </strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Poin Guide */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1 mb-6">
          <h4 className="font-display font-extrabold text-sm text-amber-950 dark:text-amber-200">
            Sistem Poin & Bintang ⭐
          </h4>
          <p className="text-xs text-amber-900 dark:text-amber-300">
            ⭐ <strong>Mudah</strong> = 1 Poin | ⭐⭐ <strong>Sedang</strong> = 2 Poin | ⭐⭐⭐ <strong>Menantang</strong> = 3 Poin
          </p>
          <p className="text-[11px] text-orange-700 dark:text-orange-300 font-bold">
            Bonus Spesial: Tombol "😄 LUCU BANGET!" memberikan +1 poin ekstra!
          </p>
        </div>

        {/* Close Button at bottom */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-extrabold text-base shadow-bubbly-coral active:scale-95 transition-all mt-4"
        >
          Siap Bermain! 🚀
        </button>
      </div>
    </div>
  );
};
