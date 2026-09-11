import React from 'react';
import type { Player, MainTab } from '../../types/game';
import type { DailyIdea, PlannerEvent, FamilyHabit } from '../../types/family';
import { Play, Flame, Star, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/sound';
import { formatIndonesianDate } from '../../utils/dateUtils';

interface DashboardHomeProps {
  players: Player[];
  dailyIdea: DailyIdea;
  familyStreak: number;
  totalLovePoints: number;
  plannerEvents: PlannerEvent[];
  habits: FamilyHabit[];
  onNextIdea: () => void;
  onNavigateTab: (tab: MainTab) => void;
  onStartCardGame: () => void;
  onStartSnakeLadders: () => void;
  onOpenJournal: () => void;
  onOpenAppreciation: () => void;
  onOpenPlanner: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  players,
  dailyIdea,
  familyStreak,
  totalLovePoints,
  plannerEvents,
  habits,
  onNextIdea,
  onNavigateTab,
  onStartCardGame,
  onStartSnakeLadders,
  onOpenJournal,
  onOpenAppreciation,
  onOpenPlanner,
}) => {
  const completedHabits = habits.filter(h => h.completedToday).length;
  const todayEvents = plannerEvents.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Top Greeting & Stats Bar */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-4 sm:p-6 text-white shadow-bubbly-coral relative overflow-hidden">
        {/* Floating subtle emojis */}
        <span className="absolute -top-4 -right-4 text-7xl opacity-20 pointer-events-none">❤️</span>
        <span className="absolute bottom-1 right-24 text-4xl opacity-25 pointer-events-none">✨</span>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
              <span>👨‍👩‍👧‍👦</span> ASTA Family Dashboard
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-snug">
              Selamat Datang, Keluarga! ❤️
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm font-medium mt-1">
              Hari ini sudahkah kita punya 30 menit berkualitas untuk bersama?
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Streak */}
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 border border-white/30">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
              <div>
                <span className="text-[10px] text-rose-100 font-bold block leading-none">Streak</span>
                <span className="font-display font-black text-base leading-none text-white">{familyStreak} Hari</span>
              </div>
            </div>

            {/* Love Points */}
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 border border-white/30">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <div>
                <span className="text-[10px] text-rose-100 font-bold block leading-none">Love Points</span>
                <span className="font-display font-black text-base leading-none text-white">{totalLovePoints} ⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Family Avatars Strip */}
        <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-rose-100 shrink-0">Anggota:</span>
          {players.map((p) => {
            const isOnline = p.isOnline ?? false;
            return (
              <div
                key={p.id}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 shrink-0 relative transition-all"
                title={isOnline ? `${p.name} (Online & Sedang Login)` : `${p.name} (Offline / Belum Login)`}
              >
                <div className="relative flex items-center justify-center">
                  <span className="text-base">{p.avatar}</span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isOnline 
                        ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]' 
                        : 'bg-red-500'
                    }`}
                  />
                </div>
                <span>{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 ${
                  isOnline 
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' 
                    : 'bg-red-500/30 text-red-200 border border-red-400/40'
                }`}>
                  <span>{isOnline ? '🟢' : '🔴'}</span>
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💡 Rekomendasi Ide Family Time Malam Ini (Feature #12) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border-3 border-amber-200 dark:border-amber-900/60 shadow-bubbly-sm relative space-y-4 max-w-full overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span className="text-2xl animate-bounce shrink-0 mt-0.5">🌙</span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                IDE FAMILY TIME MALAM INI
              </span>
              <h2 className="font-display font-black text-base sm:text-xl text-slate-800 dark:text-slate-100 leading-snug break-words">
                {dailyIdea.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onNextIdea}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 transition-all flex items-center gap-1 text-xs font-bold active:scale-95 shrink-0"
            title="Ganti Ide Lainnya"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Ganti Ide</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {dailyIdea.description}
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1">
            <span>⏱️</span> {dailyIdea.duration}
          </span>
          <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 font-bold flex items-center gap-1">
            <span>👨‍👩‍👧‍👦</span> {dailyIdea.participants}
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-bold flex items-center gap-1">
            <span>💰</span> {dailyIdea.cost}
          </span>
        </div>

        {/* Steps */}
        <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-2xl space-y-1.5">
          <p className="text-[11px] font-extrabold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
            Langkah Cepat Bersama:
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
            {dailyIdea.steps.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onNavigateTab('quality_time')}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-display font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>MULAI AKTIVITAS SEKARANG</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Grid: Game & Quality Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* ASTA Art Frenzy Shortcut */}
        <div className="bg-gradient-to-br from-indigo-50 via-amber-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-3xl border-2 border-indigo-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[8px] font-black uppercase tracking-wider shadow-2xs">
            BARU 🎨
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center text-xl shadow-sm mb-3">
              🎨
            </div>
            <h3 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
              ASTA Art Frenzy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Game melukis & tebak gambar interaktif! Pilih pensil, kuas, warna & tebak lukisan keluarga!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateTab('game');
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 text-white font-display font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Main Art Frenzy (Menggambar)</span>
          </button>
        </div>

        {/* Game Card Shortcut */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-3xl border-2 border-rose-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-sm mb-3">
              🎴
            </div>
            <h3 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
              Kartu Keluarga ASTA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Mainkan 350 kartu seru: Kasih Sayang, Tebak Gaya, Suara Binatang & Ekspresi!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartCardGame();
            }}
            className="w-full py-3 rounded-2xl bg-family-coral hover:bg-rose-600 text-white font-display font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Main Kartu (350 Kartu)</span>
          </button>
        </div>

        {/* Ular Tangga / Monopoli Shortcut */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-3xl border-2 border-teal-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-xl shadow-sm mb-3">
              🎲
            </div>
            <h3 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
              Ular Tangga & Board
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Board game klasik interaktif penuh aksi kejutan dan tantangan seru!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartSnakeLadders();
            }}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-display font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Main Ular Tangga</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Quick Features: Journal, Apresiasi, Habit, Planner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Jurnal Emosi */}
        <button
          onClick={onOpenJournal}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:border-emerald-300 text-left transition-all active:scale-95 group"
        >
          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">😊</span>
          <p className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">Jurnal Emosi</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Kondisi hati hari ini</p>
        </button>

        {/* Apresiasi */}
        <button
          onClick={onOpenAppreciation}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:border-rose-300 text-left transition-all active:scale-95 group"
        >
          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">❤️</span>
          <p className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">Apresiasi</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pujian & Love Points</p>
        </button>

        {/* Habit */}
        <button
          onClick={() => onNavigateTab('family_hub')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:border-purple-300 text-left transition-all active:scale-95 group"
        >
          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🌱</span>
          <p className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">Kebiasaan</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{completedHabits}/{habits.length} Selesai</p>
        </button>

        {/* Planner */}
        <button
          onClick={onOpenPlanner}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:border-blue-300 text-left transition-all active:scale-95 group"
        >
          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📅</span>
          <p className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">Agenda</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Jadwal & Family Time</p>
        </button>
      </div>

      {/* Agenda Hari Ini Preview */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-family-teal" />
            <h3 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
              Agenda & Kegiatan Terdekat
            </h3>
          </div>
          <button
            onClick={onOpenPlanner}
            className="text-xs font-bold text-family-coral hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <div className="space-y-2">
          {todayEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{ev.emoji}</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {formatIndonesianDate(ev.date, ev.time)}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                ev.completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {ev.completed ? 'Selesai ✓' : 'Mendatang'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
