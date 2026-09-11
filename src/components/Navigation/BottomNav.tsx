import React from 'react';
import type { MainTab } from '../../types/game';
import { Home, MessageCircleHeart, Gamepad2, Heart, Camera, Users } from 'lucide-react';
import { sound } from '../../utils/sound';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" strokeWidth={2.5} /> },
    { id: 'chat', label: 'Obrolan', icon: <MessageCircleHeart className="w-5 h-5" strokeWidth={2.5} /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 className="w-5 h-5" strokeWidth={2.5} /> },
    { id: 'quality_time', label: 'Aktivitas', icon: <Heart className="w-5 h-5" strokeWidth={2.5} /> },
    { id: 'memories', label: 'Kenangan', icon: <Camera className="w-5 h-5" strokeWidth={2.5} /> },
    { id: 'family_hub', label: 'Keluarga', icon: <Users className="w-5 h-5" strokeWidth={2.5} /> },
  ];

  return (
    <nav
      className="fixed bottom-0 sm:bottom-3 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-40 w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t sm:border border-rose-100 dark:border-slate-800 shadow-bubbly-lg sm:rounded-3xl transition-all"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="px-1.5 sm:px-4 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center relative py-1 px-1.5 sm:px-3 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black shadow-md -translate-y-0.5 scale-105'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 font-extrabold'
              }`}
            >
              <div
                className={`p-1 sm:p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md'
                    : 'bg-transparent'
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[9px] sm:text-[10px] tracking-tight mt-0.5 truncate max-w-[54px] sm:max-w-none ${isActive ? 'font-black text-white' : 'font-extrabold'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
