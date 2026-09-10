import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { SnakeLaddersGame } from './SnakeLaddersGame';
import { FamilyMonopolyGame } from './FamilyMonopolyGame';
import { FamilyLudoGame } from './FamilyLudoGame';
import { FamilyUnoGame } from './FamilyUnoGame';
import { CountingGame } from './CountingGame';
import { AlphabetGame } from './AlphabetGame';
import { HijaiyahGame } from './HijaiyahGame';
import { VegetableGame } from './VegetableGame';
import { AnimalGame } from './AnimalGame';
import { Play } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GameHubProps {
  players: Player[];
  onStartCardGame: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({ players, onStartCardGame }) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'card' | 'ludo' | 'uno' | 'snake' | 'monopoly' | 'counting' | 'alphabet' | 'hijaiyah' | 'vegetable' | 'animal'>('hub');

  if (activeGame === 'animal') {
    return <AnimalGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'vegetable') {
    return <VegetableGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'hijaiyah') {
    return <HijaiyahGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'alphabet') {
    return <AlphabetGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'counting') {
    return <CountingGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'uno') {
    return <FamilyUnoGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'ludo') {
    return <FamilyLudoGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'snake') {
    return <SnakeLaddersGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'monopoly') {
    return <FamilyMonopolyGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">🎮</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Arena Game Keluarga
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Pilih permainan interaktif favorit untuk menghangatkan suasana di rumah!
        </p>
      </div>

      {/* 4 Main Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* 1. Kartu Keluarga ASTA */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-rose-200 dark:border-rose-900/60 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🎴
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold mb-1">
              350 KARTU LENGKAP
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Kartu Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Permainan kartu utama: Kasih Sayang, Suara Binatang, Tebak Kata, Tebak Gaya Profesi, & Gerakan Seru!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartCardGame();
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN GAME KARTU</span>
          </button>
        </div>

        {/* 2. UNO Keluarga ASTA (Baru: 2, 3, 4 Pemain) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-red-300 dark:border-red-800 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-500 via-amber-400 to-blue-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🃏
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-[10px] font-extrabold mb-1">
              BARU • 2, 3, 4 PEMAIN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              UNO Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Game kartu UNO seru! Cocokkan warna & angka, keluarkan kartu Skip, Reverse, Draw 2, Wild Draw 4, dan Kartu Kasih Sayang!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('uno');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN UNO KELUARGA</span>
          </button>
        </div>

        {/* 3. Ludo Keluarga ASTA (2, 3, 4 Pemain) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-700 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🎲
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold mb-1">
              2, 3, 4 PEMAIN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Ludo Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Main Ludo bersama 2, 3, atau 4 pemain! Kocok dadu 6 untuk keluar kandang, makan pion lawan, dan capai mahkota juara!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('ludo');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN LUDO KELUARGA</span>
          </button>
        </div>

        {/* 3. Ular Tangga Keluarga */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-teal-200 dark:border-teal-900/60 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🐍
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold mb-1">
              INTERAKTIF & AKSI
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Ular Tangga Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Kocok dadu 3D, naiki tangga kebaikan, dan lakukan aksi tantangan seru di setiap petak papan hingga garis finish!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('snake');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN ULAR TANGGA</span>
          </button>
        </div>

        {/* 4. Monopoli Keluarga */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-indigo-200 dark:border-indigo-900/60 shadow-bubbly-indigo flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🎩
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold mb-1">
              EDUKASI & TABUNGAN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Monopoli Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Kelilingi papan aset keluarga, kumpulkan koin tabungan kebaikan, dan raih penghargaan keluarga teladan!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('monopoly');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN MONOPOLI</span>
          </button>
        </div>

        {/* 5. Game Berhitung Ceria (1-100) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-800 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🔢
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold mb-1">
              SUARA INDONESIA • 1-100
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Berhitung Ceria 1-100
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Belajar mengenal & mengucapkan angka 1 sampai 100 dengan audio Bahasa Indonesia, hitung otomatis, kuis tebak angka, & urutan bintang!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('counting');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN BERHITUNG CERIA</span>
          </button>
        </div>

        {/* 6. Game Abjad Ceria (A-Z) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-pink-300 dark:border-pink-800 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🔤
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300 text-[10px] font-extrabold mb-1">
              SUARA INDONESIA • A-Z
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Abjad Ceria A - Z
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Belajar mengenal & mengucapkan huruf A sampai Z dengan audio Bahasa Indonesia, contoh kata bergambar, putar otomatis, & kuis tebak huruf!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('alphabet');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN ABJAD CERIA</span>
          </button>
        </div>

        {/* 7. Game Hijaiyah Ceria (29 Huruf) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🕌
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold mb-1">
              SUARA MENGAJI • 29 HURUF
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Hijaiyah Ceria (29 Huruf)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Belajar mengenal & mengaji 29 Huruf Hijaiyah lengkap dengan audio Bahasa Indonesia, harakat, kata Arab bergambar, putar otomatis, & kuis tebak Hijaiyah!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('hijaiyah');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN HIJAIYAH CERIA</span>
          </button>
        </div>

        {/* 8. Game Sayur-Sayuran Ceria */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🥦
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold mb-1">
              SUARA INDONESIA • MANFAAT SEHAT
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Sayur-Sayuran Ceria 🥕
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Mengenal 16 jenis sayuran sehat lengkap dengan audio Bahasa Indonesia, manfaat kesehatan tubuh, putar otomatis, & kuis tebak sayur!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('vegetable');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN SAYURAN CERIA</span>
          </button>
        </div>

        {/* 9. Game Nama Binatang Ceria */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-800 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3">
              🦁
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold mb-1">
              SUARA INDONESIA • FAKTA UNIK
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Nama Binatang Ceria 🐘
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium">
              Mengenal 20 jenis binatang unik lengkap dengan audio Bahasa Indonesia, suara tiruan hewan, fakta menarik, putar otomatis, & kuis tebak binatang!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setActiveGame('animal');
            }}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:opacity-90 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN BINATANG CERIA</span>
          </button>
        </div>

      </div>

    </div>
  );
};
