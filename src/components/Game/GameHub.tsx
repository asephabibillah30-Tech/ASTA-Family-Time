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
import { Play, Search, X, Gamepad2, BookOpen, LayoutGrid, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GameHubProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onStartCardGame: () => void;
}

export type CategoryFilter = 'all' | 'play' | 'learn';

export const GameHub: React.FC<GameHubProps> = ({ players, currentUser, familyCode, onStartCardGame }) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'card' | 'art_frenzy' | 'ludo' | 'uno' | 'snake' | 'monopoly' | 'counting' | 'alphabet' | 'hijaiyah' | 'vegetable' | 'animal' | 'vehicle' | 'story'>('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

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
    return <FamilyMonopolyGame players={players} currentUser={currentUser} familyCode={familyCode} onBack={() => setActiveGame('hub')} />;
  }

  // Master List Categorized cleanly into 'play' (Bermain) and 'learn' (Belajar)
  const GAMES_LIST = [
    // --- CATEGORY: PLAY (BERMAIN) ---
    {
      id: 'art_frenzy',
      type: 'play' as const,
      title: 'ASTA Art Frenzy',
      category: 'Bermain',
      chip: '🎨 Melukis & Tebak',
      chipBg: 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
      desc: 'Game melukis & tebak gambar interaktif! Pilih kuas, warna, cat, dan tebak hasil karya lukisan keluarga.',
      emoji: '🎨',
      cardGradient: 'from-amber-400 via-rose-500 to-indigo-600',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
      btnGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600',
      btnText: 'MAIN ART FRENZY',
      isNew: true,
      tags: ['gambar', 'melukis', 'sketsa', 'tebak', 'frenzy', 'warna', 'art'],
      onClick: () => { sound.playClick(); setActiveGame('art_frenzy'); }
    },
    {
      id: 'card',
      type: 'play' as const,
      title: 'Kartu Keluarga ASTA',
      category: 'Bermain',
      chip: '🎴 350 Kartu Seru',
      chipBg: 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
      desc: 'Permainan kartu utama: Kasih Sayang, Suara Binatang, Tebak Kata, Tebak Gaya Profesi, & Gerakan Seru!',
      emoji: '🎴',
      cardGradient: 'from-rose-500 to-pink-500',
      hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
      btnGradient: 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700',
      btnText: 'MAIN GAME KARTU',
      tags: ['kartu', '350', 'kasih sayang', 'profesi', 'gaya', 'tebak kata'],
      onClick: () => { sound.playClick(); onStartCardGame(); }
    },
    {
      id: 'uno',
      type: 'play' as const,
      title: 'UNO Keluarga ASTA',
      category: 'Bermain',
      chip: '🃏 2 - 4 Pemain',
      chipBg: 'bg-red-100 text-red-900 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800',
      desc: 'Game kartu UNO seru! Cocokkan warna & angka, kartu Skip, Reverse, Draw 2, Wild, & Kartu Kasih Sayang.',
      emoji: '🃏',
      cardGradient: 'from-red-500 via-amber-400 to-blue-500',
      hoverBorder: 'hover:border-red-400 dark:hover:border-red-500',
      btnGradient: 'bg-gradient-to-r from-red-500 via-orange-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
      btnText: 'MAIN UNO KELUARGA',
      tags: ['uno', 'kartu', 'skip', 'reverse', 'draw 2', 'wild'],
      onClick: () => { sound.playClick(); setActiveGame('uno'); }
    },
    {
      id: 'ludo',
      type: 'play' as const,
      title: 'Ludo Keluarga ASTA',
      category: 'Bermain',
      chip: '🎲 Game Papan',
      chipBg: 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
      desc: 'Main Ludo bersama 2, 3, atau 4 pemain! Kocok dadu 6, makan pion lawan, dan capai mahkota juara.',
      emoji: '🎲',
      cardGradient: 'from-amber-400 to-rose-500',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
      btnGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600',
      btnText: 'MAIN LUDO KELUARGA',
      tags: ['ludo', 'dadu', 'pion', 'kandang', 'papan'],
      onClick: () => { sound.playClick(); setActiveGame('ludo'); }
    },
    {
      id: 'snake',
      type: 'play' as const,
      title: 'Ular Tangga Keluarga',
      category: 'Bermain',
      chip: '🐍 Dadu & Aksi',
      chipBg: 'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800',
      desc: 'Kocok dadu 3D, naiki tangga kebaikan, dan lakukan aksi tantangan seru di setiap petak papan.',
      emoji: '🐍',
      cardGradient: 'from-orange-400 via-amber-500 to-rose-500',
      hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
      btnGradient: 'bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-600 hover:to-purple-700',
      btnText: 'MAIN ULAR TANGGA',
      tags: ['ular', 'tangga', 'snake', 'dadu', 'tantangan', 'papan'],
      onClick: () => { sound.playClick(); setActiveGame('snake'); }
    },
    {
      id: 'monopoly',
      type: 'play' as const,
      title: 'Monopoli Keluarga',
      category: 'Bermain',
      chip: '🎩 Tabungan & Aset',
      chipBg: 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
      desc: 'Kelilingi papan aset keluarga, kumpulkan koin tabungan kebaikan, dan raih penghargaan keluarga teladan.',
      emoji: '🎩',
      cardGradient: 'from-purple-500 via-rose-500 to-indigo-600',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
      btnGradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      btnText: 'MAIN MONOPOLI',
      tags: ['monopoli', 'monopoly', 'papan', 'tabungan', 'koin'],
      onClick: () => { sound.playClick(); setActiveGame('monopoly'); }
    },

    // --- CATEGORY: LEARN (BELAJAR) ---
    {
      id: 'counting',
      type: 'learn' as const,
      title: 'Berhitung Ceria 1-100',
      category: 'Belajar',
      chip: '🔢 Angka 1-100',
      chipBg: 'bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800',
      desc: 'Belajar mengenal & mengucapkan angka 1 sampai 100 dengan audio Bahasa Indonesia & kuis tebak angka.',
      emoji: '🔢',
      cardGradient: 'from-teal-500 via-emerald-500 to-cyan-600',
      hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
      btnGradient: 'bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 hover:from-teal-600 hover:to-cyan-700',
      btnText: 'BELAJAR BERHITUNG',
      tags: ['berhitung', 'angka', 'matematika', '1-100', 'kuis', 'hitung'],
      onClick: () => { sound.playClick(); setActiveGame('counting'); }
    },
    {
      id: 'alphabet',
      type: 'learn' as const,
      title: 'Abjad Ceria A - Z',
      category: 'Belajar',
      chip: '🔤 Huruf A-Z',
      chipBg: 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800',
      desc: 'Belajar mengenal & mengucapkan huruf A sampai Z dengan audio Bahasa Indonesia, contoh kata, & kuis tebak huruf.',
      emoji: '🔤',
      cardGradient: 'from-sky-500 via-blue-500 to-indigo-600',
      hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
      btnGradient: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700',
      btnText: 'BELAJAR ABJAD',
      tags: ['abjad', 'huruf', 'a-z', 'membaca', 'bahasa', 'edukasi'],
      onClick: () => { sound.playClick(); setActiveGame('alphabet'); }
    },
    {
      id: 'hijaiyah',
      type: 'learn' as const,
      title: 'Hijaiyah Ceria (29 Huruf)',
      category: 'Belajar',
      chip: '🕌 29 Huruf Mengaji',
      chipBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
      desc: 'Belajar mengenal & mengaji 29 Huruf Hijaiyah lengkap dengan audio Bahasa Indonesia, harakat, & kuis Hijaiyah.',
      emoji: '🕌',
      cardGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      btnGradient: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800',
      btnText: 'BELAJAR HIJAIYAH',
      tags: ['hijaiyah', 'mengaji', 'iqro', 'agama', 'alif', 'ba', 'ta', '29 huruf'],
      onClick: () => { sound.playClick(); setActiveGame('hijaiyah'); }
    },
    {
      id: 'vegetable',
      type: 'learn' as const,
      title: 'Sayur-Sayuran Ceria 🥕',
      category: 'Belajar',
      chip: '🥦 Manfaat Sehat',
      chipBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
      desc: 'Mengenal 16 jenis sayuran sehat dengan audio Bahasa Indonesia, manfaat kesehatan tubuh, & kuis tebak sayur.',
      emoji: '🥦',
      cardGradient: 'from-emerald-500 via-green-500 to-teal-600',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      btnGradient: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-green-700 hover:from-emerald-600 hover:to-green-800',
      btnText: 'BELAJAR SAYURAN',
      tags: ['sayur', 'sayuran', 'wortel', 'kesehatan', 'makanan', 'sehat'],
      onClick: () => { sound.playClick(); setActiveGame('vegetable'); }
    },
    {
      id: 'animal',
      type: 'learn' as const,
      title: 'Nama Binatang Ceria 🐘',
      category: 'Belajar',
      chip: '🦁 Fakta Unik',
      chipBg: 'bg-cyan-100 text-cyan-900 border border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800',
      desc: 'Mengenal 20 jenis binatang unik lengkap dengan audio Bahasa Indonesia, suara tiruan hewan, & kuis tebak binatang.',
      emoji: '🦁',
      cardGradient: 'from-cyan-500 via-teal-500 to-blue-600',
      hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-500',
      btnGradient: 'bg-gradient-to-r from-cyan-500 via-teal-600 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
      btnText: 'BELAJAR BINATANG',
      tags: ['binatang', 'hewan', 'suara hewan', 'singa', 'gajah', 'kucing'],
      onClick: () => { sound.playClick(); setActiveGame('animal'); }
    },
    {
      id: 'vehicle',
      type: 'learn' as const,
      title: 'Dunia Kendaraan ✈️🚢',
      category: 'Belajar',
      chip: '🚗 Suara Mesin',
      chipBg: 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
      desc: 'Mengenal 21 jenis kendaraan darat, udara, & laut lengkap dengan audio Bahasa Indonesia & suara mesin.',
      emoji: '🚗',
      cardGradient: 'from-blue-500 via-indigo-500 to-sky-600',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
      btnGradient: 'bg-gradient-to-r from-blue-500 via-indigo-600 to-sky-600 hover:from-blue-600 hover:to-sky-700',
      btnText: 'BELAJAR KENDARAAN',
      tags: ['kendaraan', 'mobil', 'pesawat', 'kapal', 'mesin', 'transportasi'],
      onClick: () => { sound.playClick(); setActiveGame('vehicle'); }
    },
    {
      id: 'story',
      type: 'learn' as const,
      title: 'Cerita Pendek Ceria 📖',
      category: 'Belajar',
      chip: '📖 Dongeng Moral',
      chipBg: 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
      desc: 'Kumpulan cerita dongeng edukatif dengan suara pendongeng Bahasa Indonesia, ilustrasi emoji, & pesan kebaikan.',
      emoji: '📚',
      cardGradient: 'from-indigo-500 via-purple-500 to-pink-600',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      btnGradient: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700',
      btnText: 'BACA CERITA CERIA',
      tags: ['cerita', 'dongeng', 'buku', 'pesan moral', 'baca', 'kisah'],
      onClick: () => { sound.playClick(); setActiveGame('story'); }
    },
  ];

  // Filter games based on category tab & search query
  const filteredGames = GAMES_LIST.filter(game => {
    // 1. Category Filter
    if (activeCategory === 'play' && game.type !== 'play') return false;
    if (activeCategory === 'learn' && game.type !== 'learn') return false;

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      game.title.toLowerCase().includes(q) ||
      game.desc.toLowerCase().includes(q) ||
      game.category.toLowerCase().includes(q) ||
      game.chip.toLowerCase().includes(q) ||
      game.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  const playGames = filteredGames.filter(g => g.type === 'play');
  const learnGames = filteredGames.filter(g => g.type === 'learn');

  // Render individual card helper (100% full-card touch area & uniform height)
  const renderCard = (game: typeof GAMES_LIST[0]) => (
    <div 
      key={game.id}
      onClick={game.onClick}
      className={`bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 ${game.hoverBorder} shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group`}
    >
      {game.isNew && (
        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider animate-bounce shadow-xs">
          TERBARU 🎨
        </div>
      )}

      <div>
        {/* Emoji Icon Badge */}
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${game.cardGradient} text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-3 border border-white/30 group-hover:rotate-3 transition-transform`}>
          {game.emoji}
        </div>

        {/* Simplified Chip Tag */}
        <div className={`inline-block px-2.5 py-0.5 rounded-full ${game.chipBg} text-[10px] font-black tracking-wide mb-2 shadow-2xs`}>
          {game.chip}
        </div>

        {/* Title */}
        <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {game.title}
        </h3>

        {/* Description (Truncated max 2 lines for perfect grid alignment) */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2 min-h-[2.5rem]">
          {game.desc}
        </p>
      </div>

      {/* Button Action (Entire card is clickable target) */}
      <div className={`w-full py-3 sm:py-3.5 rounded-2xl ${game.btnGradient} text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all group-hover:shadow-lg group-hover:opacity-95`}>
        <Play className="w-4 h-4 fill-white" />
        <span>{game.btnText}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-5 sm:space-y-6 animate-pop-in">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">🎮</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Arena Game & Edukasi Keluarga
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto">
          Pilih permainan interaktif atau aktivitas edukatif favorit untuk menghangatkan suasana di rumah!
        </p>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-rose-500 absolute left-4 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pencarian game / aktivitas (misal: Art Frenzy, UNO, Hijaiyah, Berhitung...)"
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-slate-700 shadow-sm font-bold text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all"
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

        {/* TAB NAVIGATION (Segmented Control: Semua, Bermain, Belajar) */}
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-md mx-auto border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('all');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('play');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'play'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Bermain ({GAMES_LIST.filter(g => g.type === 'play').length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('learn');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'learn'
                ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Belajar ({GAMES_LIST.filter(g => g.type === 'learn').length})</span>
          </button>
        </div>
      </div>

      {/* Search Result Counter */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1 max-w-4xl mx-auto">
          <span>Menampilkan {filteredGames.length} aktivitas untuk "{searchQuery}"</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-rose-500 hover:underline text-[11px]"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* MAIN CONTENT DISPLAY (Row-by-Row Category Sections or Filtered Grid) */}
      <div className="space-y-8">
        
        {/* 1. BARIS KATEGORI: BERMAIN 🎲 */}
        {playGames.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎲</span>
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Waktunya Bermain</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Game interaktif seru untuk dimainkan bersama seluruh anggota keluarga
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-[10px]">
                {playGames.length} Game
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {playGames.map((game) => renderCard(game))}
            </div>
          </div>
        )}

        {/* 2. BARIS KATEGORI: BELAJAR & EDUKASI 📚 */}
        {learnGames.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Mari Belajar & Edukasi</span>
                    <Sparkles className="w-4 h-4 text-teal-500" />
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Aktivitas edukatif mengenal angka, huruf, mengaji, sains & dongeng
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-black text-[10px]">
                {learnGames.length} Edukasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {learnGames.map((game) => renderCard(game))}
            </div>
          </div>
        )}

      </div>

      {/* Empty Search Result Message */}
      {filteredGames.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3 max-w-xl mx-auto">
          <span className="text-5xl block">🔍</span>
          <h3 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
            Aktivitas "{searchQuery}" tidak ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Coba gunakan kata kunci lain seperti <strong>Art Frenzy</strong>, <strong>Kartu</strong>, <strong>UNO</strong>, <strong>Hijaiyah</strong>, atau <strong>Berhitung</strong>.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-display font-bold text-xs shadow-sm active:scale-95"
            >
              Tampilkan Semua Aktivitas
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
