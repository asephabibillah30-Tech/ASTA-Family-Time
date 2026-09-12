import React, { useState } from 'react';
import type { Player } from '../../types/game';
import type { UserAccount } from '../../types/auth';
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
import { Play, Search, X } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GameHubProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onStartCardGame: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({ players, currentUser, familyCode, onStartCardGame }) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'card' | 'art_frenzy' | 'ludo' | 'uno' | 'snake' | 'monopoly' | 'counting' | 'alphabet' | 'hijaiyah' | 'vegetable' | 'animal' | 'vehicle' | 'story'>('hub');
  const [searchQuery, setSearchQuery] = useState('');

  if (activeGame === 'art_frenzy') {
    return <ArtFrenzyGame players={players} currentUser={currentUser} familyCode={familyCode} onBack={() => setActiveGame('hub')} />;
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
    return <FamilyUnoGame players={players} currentUser={currentUser} familyCode={familyCode} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'ludo') {
    return <FamilyLudoGame players={players} currentUser={currentUser} familyCode={familyCode} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'snake') {
    return <SnakeLaddersGame players={players} currentUser={currentUser} familyCode={familyCode} onBack={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'monopoly') {
    return <FamilyMonopolyGame players={players} onBack={() => setActiveGame('hub')} />;
  }

  // Master Games List for Search & Filtering
  const GAMES_LIST = [
    {
      id: 'art_frenzy',
      title: 'ASTA Art Frenzy',
      category: 'Kreativitas',
      badge: 'ART FRENZY • SERU & INTERAKTIF',
      badgeBg: 'bg-indigo-600',
      desc: 'Game menggambar & tebak gambar interaktif! Pilih pensil, kuas, warna, isi cat, dan tebak lukisan anggota keluarga!',
      emoji: '🎨',
      color: 'from-amber-400 via-rose-500 to-indigo-600',
      borderColor: 'border-amber-300 dark:border-amber-700 shadow-bubbly-amber',
      btnText: 'MAIN ART FRENZY',
      isNew: true,
      tags: ['gambar', 'melukis', 'sketsa', 'tebak', 'frenzy', 'warna', 'pensil', 'kuas', 'art'],
      onClick: () => { sound.playClick(); setActiveGame('art_frenzy'); }
    },
    {
      id: 'card',
      title: 'Kartu Keluarga ASTA',
      category: 'Kartu',
      badge: '350 KARTU LENGKAP',
      badgeBg: 'bg-rose-600',
      desc: 'Permainan kartu utama: Kasih Sayang, Suara Binatang, Tebak Kata, Tebak Gaya Profesi, & Gerakan Seru!',
      emoji: '🎴',
      color: 'from-rose-500 to-pink-500',
      borderColor: 'border-rose-200 dark:border-rose-900/60 shadow-bubbly-coral',
      btnText: 'MAIN GAME KARTU',
      tags: ['kartu', '350', 'kasih sayang', 'profesi', 'gaya', 'tebak kata'],
      onClick: () => { sound.playClick(); onStartCardGame(); }
    },
    {
      id: 'uno',
      title: 'UNO Keluarga ASTA',
      category: 'Kartu',
      badge: 'BARU • 2, 3, 4 PEMAIN',
      badgeBg: 'bg-red-600',
      desc: 'Game kartu UNO seru! Cocokkan warna & angka, keluarkan kartu Skip, Reverse, Draw 2, Wild Draw 4, dan Kartu Kasih Sayang!',
      emoji: '🃏',
      color: 'from-red-500 via-amber-400 to-blue-500',
      borderColor: 'border-red-300 dark:border-red-800 shadow-bubbly-coral',
      btnText: 'MAIN UNO KELUARGA',
      tags: ['uno', 'kartu', 'skip', 'reverse', 'draw 2', 'wild'],
      onClick: () => { sound.playClick(); setActiveGame('uno'); }
    },
    {
      id: 'ludo',
      title: 'Ludo Keluarga ASTA',
      category: 'Papan',
      badge: '2, 3, 4 PEMAIN',
      badgeBg: 'bg-amber-600',
      desc: 'Main Ludo bersama 2, 3, atau 4 pemain! Kocok dadu 6 untuk keluar kandang, makan pion lawan, dan capai mahkota juara!',
      emoji: '🎲',
      color: 'from-amber-400 to-rose-500',
      borderColor: 'border-amber-300 dark:border-amber-700 shadow-bubbly-amber',
      btnText: 'MAIN LUDO KELUARGA',
      tags: ['ludo', 'dadu', 'pion', 'kandang', 'papan'],
      onClick: () => { sound.playClick(); setActiveGame('ludo'); }
    },
    {
      id: 'snake',
      title: 'Ular Tangga Keluarga',
      category: 'Papan',
      badge: 'INTERAKTIF & AKSI',
      badgeBg: 'bg-teal-600',
      desc: 'Kocok dadu 3D, naiki tangga kebaikan, dan lakukan aksi tantangan seru di setiap petak papan hingga garis finish!',
      emoji: '🐍',
      color: 'from-teal-500 to-emerald-500',
      borderColor: 'border-teal-200 dark:border-teal-900/60 shadow-bubbly-teal',
      btnText: 'MAIN ULAR TANGGA',
      tags: ['ular', 'tangga', 'snake', 'dadu', 'tantangan', 'papan'],
      onClick: () => { sound.playClick(); setActiveGame('snake'); }
    },
    {
      id: 'monopoly',
      title: 'Monopoli Keluarga',
      category: 'Papan',
      badge: 'EDUKASI & TABUNGAN',
      badgeBg: 'bg-indigo-600',
      desc: 'Kelilingi papan aset keluarga, kumpulkan koin tabungan kebaikan, dan raih penghargaan keluarga teladan!',
      emoji: '🎩',
      color: 'from-indigo-500 to-purple-500',
      borderColor: 'border-indigo-200 dark:border-indigo-900/60 shadow-bubbly-indigo',
      btnText: 'MAIN MONOPOLI',
      tags: ['monopoli', 'monopoly', 'papan', 'tabungan', 'koin'],
      onClick: () => { sound.playClick(); setActiveGame('monopoly'); }
    },
    {
      id: 'counting',
      title: 'Berhitung Ceria 1-100',
      category: 'Edukasi',
      badge: 'SUARA INDONESIA • 1-100',
      badgeBg: 'bg-amber-600',
      desc: 'Belajar mengenal & mengucapkan angka 1 sampai 100 dengan audio Bahasa Indonesia, hitung otomatis, kuis tebak angka, & urutan bintang!',
      emoji: '🔢',
      color: 'from-amber-400 via-orange-500 to-pink-500',
      borderColor: 'border-amber-300 dark:border-amber-800 shadow-bubbly-amber',
      btnText: 'MAIN BERHITUNG CERIA',
      tags: ['berhitung', 'angka', 'matematika', '1-100', 'kuis', 'hitung'],
      onClick: () => { sound.playClick(); setActiveGame('counting'); }
    },
    {
      id: 'alphabet',
      title: 'Abjad Ceria A - Z',
      category: 'Edukasi',
      badge: 'SUARA INDONESIA • A-Z',
      badgeBg: 'bg-rose-600',
      desc: 'Belajar mengenal & mengucapkan huruf A sampai Z dengan audio Bahasa Indonesia, contoh kata bergambar, putar otomatis, & kuis tebak huruf!',
      emoji: '🔤',
      color: 'from-pink-500 via-rose-500 to-purple-600',
      borderColor: 'border-pink-300 dark:border-pink-800 shadow-bubbly-coral',
      btnText: 'MAIN ABJAD CERIA',
      tags: ['abjad', 'huruf', 'a-z', 'membaca', 'bahasa', 'edukasi'],
      onClick: () => { sound.playClick(); setActiveGame('alphabet'); }
    },
    {
      id: 'hijaiyah',
      title: 'Hijaiyah Ceria (29 Huruf)',
      category: 'Edukasi',
      badge: 'SUARA MENGAJI • 29 HURUF',
      badgeBg: 'bg-emerald-600',
      desc: 'Belajar mengenal & mengaji 29 Huruf Hijaiyah lengkap dengan audio Bahasa Indonesia, harakat, kata Arab bergambar, putar otomatis, & kuis tebak Hijaiyah!',
      emoji: '🕌',
      color: 'from-emerald-500 via-teal-500 to-indigo-600',
      borderColor: 'border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal',
      btnText: 'MAIN HIJAIYAH CERIA',
      tags: ['hijaiyah', 'mengaji', 'iqro', 'agama', 'alif', 'ba', 'ta', '29 huruf'],
      onClick: () => { sound.playClick(); setActiveGame('hijaiyah'); }
    },
    {
      id: 'vegetable',
      title: 'Sayur-Sayuran Ceria 🥕',
      category: 'Edukasi',
      badge: 'SUARA INDONESIA • MANFAAT SEHAT',
      badgeBg: 'bg-emerald-600',
      desc: 'Mengenal 16 jenis sayuran sehat lengkap dengan audio Bahasa Indonesia, manfaat kesehatan tubuh, putar otomatis, & kuis tebak sayur!',
      emoji: '🥦',
      color: 'from-emerald-500 via-teal-500 to-green-600',
      borderColor: 'border-emerald-300 dark:border-emerald-800 shadow-bubbly-teal',
      btnText: 'MAIN SAYURAN CERIA',
      tags: ['sayur', 'sayuran', 'wortel', 'kesehatan', 'makanan', 'sehat'],
      onClick: () => { sound.playClick(); setActiveGame('vegetable'); }
    },
    {
      id: 'animal',
      title: 'Nama Binatang Ceria 🐘',
      category: 'Edukasi',
      badge: 'SUARA INDONESIA • FAKTA UNIK',
      badgeBg: 'bg-amber-600',
      desc: 'Mengenal 20 jenis binatang unik lengkap dengan audio Bahasa Indonesia, suara tiruan hewan, fakta menarik, putar otomatis, & kuis tebak binatang!',
      emoji: '🦁',
      color: 'from-amber-500 via-orange-500 to-rose-600',
      borderColor: 'border-amber-300 dark:border-amber-800 shadow-bubbly-amber',
      btnText: 'MAIN BINATANG CERIA',
      tags: ['binatang', 'hewan', 'suara hewan', 'singa', 'gajah', 'kucing'],
      onClick: () => { sound.playClick(); setActiveGame('animal'); }
    },
    {
      id: 'vehicle',
      title: 'Dunia Kendaraan ✈️🚢',
      category: 'Edukasi',
      badge: 'SUARA KENDARAAN • 21 KENDARAAN',
      badgeBg: 'bg-blue-600',
      desc: 'Mengenal 21 jenis kendaraan darat, udara, laut & konstruksi lengkap dengan audio Bahasa Indonesia, suara mesin, fakta edukatif, putar otomatis, kuis & teka-teki!',
      emoji: '🚗',
      color: 'from-blue-600 via-sky-500 to-indigo-600',
      borderColor: 'border-blue-300 dark:border-blue-800 shadow-bubbly-sky',
      btnText: 'MAIN KENDARAAN CERIA',
      tags: ['kendaraan', 'mobil', 'pesawat', 'kapal', 'mesin', 'transportasi'],
      onClick: () => { sound.playClick(); setActiveGame('vehicle'); }
    },
    {
      id: 'story',
      title: 'Cerita Pendek Ceria 📖',
      category: 'Cerita',
      badge: 'SUARA PENDONGENG • PESAN MORAL',
      badgeBg: 'bg-rose-600',
      desc: 'Kumpulan cerita dongeng edukatif dengan suara pendongeng Bahasa Indonesia, ilustrasi emoji, pesan kebaikan, & kuis kebaikan!',
      emoji: '📚',
      color: 'from-amber-500 via-rose-500 to-purple-600',
      borderColor: 'border-rose-300 dark:border-rose-800 shadow-bubbly-coral',
      btnText: 'BACAKAN CERITA CERIA',
      tags: ['cerita', 'dongeng', 'buku', 'pesan moral', 'baca', 'kisah'],
      onClick: () => { sound.playClick(); setActiveGame('story'); }
    },
  ];

  // Filter games based on search query
  const filteredGames = GAMES_LIST.filter(game => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      game.title.toLowerCase().includes(q) ||
      game.desc.toLowerCase().includes(q) ||
      game.category.toLowerCase().includes(q) ||
      game.badge.toLowerCase().includes(q) ||
      game.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-5 sm:space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">🎮</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Arena Game Keluarga
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          Pilih permainan interaktif favorit untuk menghangatkan suasana di rumah!
        </p>
      </div>

      {/* SEARCH INPUT BAR (Matching screenshot location) */}
      <div className="max-w-2xl mx-auto w-full relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-rose-500 absolute left-4 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pencarian game favorit (misal: Art Frenzy, Kartu, UNO, Ular Tangga, Hijaiyah...)"
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border-2 border-rose-300 dark:border-slate-700 shadow-bubbly-coral font-bold text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              title="Hapus Pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Result Counter / Filter Pills */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
          <span>Menampilkan {filteredGames.length} permainan untuk "{searchQuery}"</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-rose-500 hover:underline text-[11px]"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* Main Games Grid: 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredGames.map((game) => (
          <div 
            key={game.id}
            onClick={game.onClick}
            className={`bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-3 ${game.borderColor} flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all relative overflow-hidden group`}
          >
            {game.isNew && (
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider animate-bounce shadow-xs">
                TERBARU 🎨
              </div>
            )}
            <div>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform`}>
                {game.emoji}
              </div>
              <div className={`inline-block px-2.5 py-1 rounded-full ${game.badgeBg} text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs`}>
                {game.badge}
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
                {game.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
                {game.desc}
              </p>
            </div>

            <div className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 group-hover:from-rose-600 group-hover:to-indigo-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all">
              <Play className="w-4 h-4 fill-white" />
              <span>{game.btnText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Search Result Message */}
      {filteredGames.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
          <span className="text-5xl block">🔍</span>
          <h3 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
            Permainan "{searchQuery}" tidak ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Coba gunakan kata kunci lain seperti <strong>Art Frenzy</strong>, <strong>Kartu</strong>, <strong>UNO</strong>, <strong>Ular Tangga</strong>, atau <strong>Hijaiyah</strong>.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-display font-bold text-xs shadow-sm active:scale-95"
          >
            Tampilkan Semua Game
          </button>
        </div>
      )}

    </div>
  );
};
