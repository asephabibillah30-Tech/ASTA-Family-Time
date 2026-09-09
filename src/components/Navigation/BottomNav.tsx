import React from 'react';
import type { MainTab } from '../../types/game';
import { Home, Gamepad2, Heart, Camera, Users } from 'lucide-react';
import { sound } from '../../utils/sound';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: MainTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'quality_time', label: 'Aktivitas', icon: <Heart className="w-5 h-5" /> },
    { id: 'memories', label: 'Kenangan', icon: <Camera className="w-5 h-5" /> },
    { id: 'family_hub', label: 'Keluarga', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-rose-100 dark:border-slate-800 shadow-bubbly-lg"
      style={{
        paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-lg mx-auto px-3 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-2xl transition-all active:scale-90 ${
                isActive
                  ? 'text-family-coral dark:text-rose-400 font-extrabold -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/60 shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-family-coral mt-0.5 animate-pulse-fast" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
