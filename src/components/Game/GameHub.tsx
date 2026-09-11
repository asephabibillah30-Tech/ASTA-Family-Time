import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArtFrenzyGame } from './ArtFrenzyGame';
import { SnakeLaddersGame } from './SnakeLaddersGame';
import { FamilyMonopolyGame } from './FamilyMonopolyGame';
import { FamilyLudoGame } from './FamilyLudoGame';
import { FamilyUnoGame } from './FamilyUnoGame';
import { CountingGame } from './CountingGame';
import { AlphabetGame } from './AlphabetGame';
import { HijaiyahGame } from './HijaiyahGame';
import { VegetableGame } from './VegetableGame';
import { AnimalGame } from './AnimalGame';
import { VehicleGame } from './VehicleGame';
import { ShortStoryGame } from './ShortStoryGame';
import { Play } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GameHubProps {
  players: Player[];
  onStartCardGame: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({ players, onStartCardGame }) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'card' | 'art_frenzy' | 'ludo' | 'uno' | 'snake' | 'monopoly' | 'counting' | 'alphabet' | 'hijaiyah' | 'vegetable' | 'animal' | 'vehicle' | 'story'>('hub');

  if (activeGame === 'art_frenzy') {
    return <ArtFrenzyGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'story') {
    return <ShortStoryGame onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'vehicle') {
    return <VehicleGame onBack={() => setActiveGame('hub')} />;
  }

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

      {/* Main Games Grid: 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* 0. ASTA Art Frenzy (Menggambar & Tebak Gambar) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('art_frenzy');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-700 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all relative overflow-hidden group"
        >
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider animate-bounce shadow-xs">
            TERBARU 🎨
          </div>
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🎨
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              ART FRENZY • SERU & INTERAKTIF
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              ASTA Art Frenzy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Game menggambar & tebak gambar interaktif! Pilih pensil, kuas, warna, isi cat, dan tebak lukisan anggota keluarga!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN ART FRENZY</span>
          </div>
        </div>

        {/* 1. Kartu Keluarga ASTA */}
        <div 
          onClick={() => {
            sound.playClick();
            onStartCardGame();
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-rose-200 dark:border-rose-900/60 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🎴
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              350 KARTU LENGKAP
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Kartu Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Permainan kartu utama: Kasih Sayang, Suara Binatang, Tebak Kata, Tebak Gaya Profesi, & Gerakan Seru!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN GAME KARTU</span>
          </div>
        </div>

        {/* 2. UNO Keluarga ASTA (Baru: 2, 3, 4 Pemain) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('uno');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-red-300 dark:border-red-800 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-500 via-amber-400 to-blue-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🃏
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              BARU • 2, 3, 4 PEMAIN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              UNO Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Game kartu UNO seru! Cocokkan warna & angka, keluarkan kartu Skip, Reverse, Draw 2, Wild Draw 4, dan Kartu Kasih Sayang!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN UNO KELUARGA</span>
          </div>
        </div>

        {/* 3. Ludo Keluarga ASTA (2, 3, 4 Pemain) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('ludo');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-700 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🎲
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              2, 3, 4 PEMAIN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Ludo Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Main Ludo bersama 2, 3, atau 4 pemain! Kocok dadu 6 untuk keluar kandang, makan pion lawan, dan capai mahkota juara!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN LUDO KELUARGA</span>
          </div>
        </div>

        {/* 4. Ular Tangga Keluarga */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('snake');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-teal-200 dark:border-teal-900/60 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🐍
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              INTERAKTIF & AKSI
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Ular Tangga Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Kocok dadu 3D, naiki tangga kebaikan, dan lakukan aksi tantangan seru di setiap petak papan hingga garis finish!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN ULAR TANGGA</span>
          </div>
        </div>

        {/* 5. Monopoli Keluarga */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('monopoly');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-indigo-200 dark:border-indigo-900/60 shadow-bubbly-indigo flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🎩
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              EDUKASI & TABUNGAN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Monopoli Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Kelilingi papan aset keluarga, kumpulkan koin tabungan kebaikan, dan raih penghargaan keluarga teladan!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN MONOPOLI</span>
          </div>
        </div>

        {/* 6. Game Berhitung Ceria (1-100) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('counting');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-800 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🔢
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA INDONESIA • 1-100
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Berhitung Ceria 1-100
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Belajar mengenal & mengucapkan angka 1 sampai 100 dengan audio Bahasa Indonesia, hitung otomatis, kuis tebak angka, & urutan bintang!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN BERHITUNG CERIA</span>
          </div>
        </div>

        {/* 7. Game Abjad Ceria (A-Z) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('alphabet');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-pink-300 dark:border-pink-800 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🔤
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA INDONESIA • A-Z
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Abjad Ceria A - Z
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Belajar mengenal & mengucapkan huruf A sampai Z dengan audio Bahasa Indonesia, contoh kata bergambar, putar otomatis, & kuis tebak huruf!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN ABJAD CERIA</span>
          </div>
        </div>

        {/* 8. Game Hijaiyah Ceria (29 Huruf) */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('hijaiyah');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🕌
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA MENGAJI • 29 HURUF
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Hijaiyah Ceria (29 Huruf)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Belajar mengenal & mengaji 29 Huruf Hijaiyah lengkap dengan audio Bahasa Indonesia, harakat, kata Arab bergambar, putar otomatis, & kuis tebak Hijaiyah!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN HIJAIYAH CERIA</span>
          </div>
        </div>

        {/* 9. Game Sayur-Sayuran Ceria */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('vegetable');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🥦
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA INDONESIA • MANFAAT SEHAT
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Sayur-Sayuran Ceria 🥕
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Mengenal 16 jenis sayuran sehat lengkap dengan audio Bahasa Indonesia, manfaat kesehatan tubuh, putar otomatis, & kuis tebak sayur!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN SAYURAN CERIA</span>
          </div>
        </div>

        {/* 10. Game Nama Binatang Ceria */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('animal');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-amber-300 dark:border-amber-800 shadow-bubbly-amber flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🦁
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA INDONESIA • FAKTA UNIK
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Nama Binatang Ceria 🐘
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Mengenal 20 jenis binatang unik lengkap dengan audio Bahasa Indonesia, suara tiruan hewan, fakta menarik, putar otomatis, & kuis tebak binatang!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN BINATANG CERIA</span>
          </div>
        </div>

        {/* 11. Game Dunia Kendaraan Ceria */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('vehicle');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-blue-300 dark:border-blue-800 shadow-bubbly-sky flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              🚗
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA KENDARAAN • 21 KENDARAAN
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Dunia Kendaraan ✈️🚢
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Mengenal 21 jenis kendaraan darat, udara, laut & konstruksi lengkap dengan audio Bahasa Indonesia, suara mesin, fakta edukatif, putar otomatis, kuis & teka-teki!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>MAIN KENDARAAN CERIA</span>
          </div>
        </div>

        {/* 12. Game Cerita Pendek Ceria */}
        <div 
          onClick={() => {
            sound.playClick();
            setActiveGame('story');
          }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 border-rose-300 dark:border-rose-800 shadow-bubbly-coral flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform">
              📚
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
              SUARA PENDONGENG • PESAN MORAL
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              Cerita Pendek Ceria 📖
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
              Kumpulan cerita dongeng edukatif dengan suara pendongeng Bahasa Indonesia, ilustrasi emoji, pesan kebaikan, & kuis kebaikan!
            </p>
          </div>

          <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>BACAKAN CERITA CERIA</span>
          </div>
        </div>

      </div>

    </div>
  );
};
