import React from 'react';
import type { AppScreen, Player } from '../../types/game';
import { Settings, ChevronRight } from 'lucide-react';
import { sound } from '../../utils/sound';

interface FamilyHubScreenProps {
  players: Player[];
  familyStreak: number;
  totalLovePoints: number;
  onNavigateScreen: (screen: AppScreen) => void;
  onOpenSettings: () => void;
  onOpenPlayerSetup: () => void;
}

export const FamilyHubScreen: React.FC<FamilyHubScreenProps> = ({
  players,
  familyStreak,
  totalLovePoints,
  onNavigateScreen,
  onOpenSettings,
  onOpenPlayerSetup,
}) => {
  const menuItems = [
    {
      id: 'planner' as AppScreen,
      title: 'Family Planner',
      desc: 'Kalender & Agenda kegiatan harian/mingguan keluarga',
      emoji: '📅',
      color: 'from-blue-500 to-indigo-500',
      badge: 'Kalender'
    },
    {
      id: 'journal' as AppScreen,
      title: 'Family Journal',
      desc: 'Jurnal emosi harian: "Hari ini aku merasa..."',
      emoji: '📝',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Mood Tracker'
    },
    {
      id: 'appreciation' as AppScreen,
      title: 'Apresiasi & Love Points',
      desc: 'Kirim pujian & rasa terima kasih antar anggota keluarga',
      emoji: '💕',
      color: 'from-pink-500 to-rose-500',
      badge: `${totalLovePoints} ⭐ Poin`
    },
    {
      id: 'habits' as AppScreen,
      title: 'Family Habit & Streak',
      desc: 'Bangun kebiasaan baik keluarga dengan streak harian',
      emoji: '🌱',
      color: 'from-amber-500 to-orange-500',
      badge: `${familyStreak} Hari 🔥`
    },
    {
      id: 'finance' as AppScreen,
      title: 'Family Finance & Belajar Uang',
      desc: 'Catat keuangan keluarga & literasi uang untuk anak',
      emoji: '💰',
      color: 'from-teal-500 to-cyan-500',
      badge: 'Keuangan'
    },
    {
      id: 'learning' as AppScreen,
      title: 'Belajar Bersama',
      desc: 'Edukasi seru: Agama, Bahasa Inggris, Sains & Keterampilan',
      emoji: '📚',
      color: 'from-violet-500 to-purple-500',
      badge: 'Kuis Cerdas'
    },
    {
      id: 'achievements' as AppScreen,
      title: 'Family Achievement',
      desc: 'Koleksi medali dan pencapaian keluarga harmonis',
      emoji: '🏆',
      color: 'from-yellow-400 to-amber-500',
      badge: 'Medali'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">👨‍👩‍👧‍👦</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Pusat Keluarga
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Membangun kebiasaan, komunikasi hangat, dan pertumbuhan keluarga (GROW & CONNECT)
        </p>
      </div>

      {/* Players Profile Strip */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border-2 border-rose-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/60 px-3 py-1.5 rounded-2xl shrink-0">
              <span className="text-xl">{p.avatar}</span>
              <span className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">{p.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenPlayerSetup}
          className="text-xs font-extrabold text-family-coral hover:underline shrink-0 ml-2"
        >
          Kelola Profil
        </button>
      </div>

      {/* Feature Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              sound.playClick();
              onNavigateScreen(item.id);
            }}
            className="w-full p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/80 shadow-sm hover:border-family-coral dark:hover:border-rose-500 flex items-center justify-between text-left transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform`}>
                {item.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-family-coral transition-colors" />
          </button>
        ))}

        {/* Settings button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="w-full p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-all active:scale-98"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xl shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Pengaturan Aplikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Suara, Efek Musik, Dark Mode, & Atur Profil Pemain
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

    </div>
  );
};
