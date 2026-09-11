import React, { useState } from 'react';
import type { FamilyChallenge } from '../../types/family';
import { QUALITY_TIME_ACTIVITIES } from '../../data/familyData';
import { Shuffle, CheckCircle2, Trophy } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface QualityTimeScreenProps {
  challenges: FamilyChallenge[];
  onToggleChallenge: (id: string) => void;
}

export const QualityTimeScreen: React.FC<QualityTimeScreenProps> = ({
  challenges,
  onToggleChallenge,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<'10' | '30' | '60'>('30');
  const [randomModal, setRandomModal] = useState<{ show: boolean; title: string; desc: string; emoji: string } | null>(null);

  const activities = selectedDuration === '10' 
    ? QUALITY_TIME_ACTIVITIES.minutes10 
    : selectedDuration === '30' 
    ? QUALITY_TIME_ACTIVITIES.minutes30 
    : QUALITY_TIME_ACTIVITIES.minutes60;

  const pickRandomActivity = () => {
    sound.playCardShuffle();
    const allActivities = [
      ...QUALITY_TIME_ACTIVITIES.minutes10,
      ...QUALITY_TIME_ACTIVITIES.minutes30,
      ...QUALITY_TIME_ACTIVITIES.minutes60
    ];
    const picked = allActivities[Math.floor(Math.random() * allActivities.length)];
    setRandomModal({
      show: true,
      title: picked.title,
      desc: picked.desc,
      emoji: picked.emoji
    });
    sound.playSuccess();
    fireBurstConfetti();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block animate-bounce">💕</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Quality Time & Rekomendasi
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto">
          Waktu berkualitas tidak harus lama. Pilih kegiatan berdasarkan durasi yang kamu miliki malam ini!
        </p>
      </div>

      {/* Random Activity Picker Button */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-6 rounded-3xl text-white shadow-bubbly-coral flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/20">
            🎲 BINGUNG MAU NGAPAIN?
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl">
            Pilihkan Aktivitas Spontan untuk Kami
          </h2>
          <p className="text-xs text-rose-100">
            Biarkan sistem memilihkan 1 kegiatan seru dan bermakna untuk sekeluarga sekarang!
          </p>
        </div>

        <button
          onClick={pickRandomActivity}
          className="px-6 py-3.5 rounded-2xl bg-white text-family-coral font-display font-black text-sm shadow-lg hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Shuffle className="w-4 h-4" />
          <span>PILIHKAN UNTUK KAMI</span>
        </button>
      </div>

      {/* Duration Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedDuration('10');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs transition-all ${
              selectedDuration === '10'
                ? 'bg-white dark:bg-slate-700 text-family-coral shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            ⏱️ Punya 10 Menit
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedDuration('30');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs transition-all ${
              selectedDuration === '30'
                ? 'bg-white dark:bg-slate-700 text-family-coral shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            ⏱️ Punya 30 Menit
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedDuration('60');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs transition-all ${
              selectedDuration === '60'
                ? 'bg-white dark:bg-slate-700 text-family-coral shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            ⏱️ Punya 1 Jam
          </button>
        </div>

        {/* Activities List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3.5 hover:border-rose-300 transition-all group"
            >
              <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                {act.emoji}
              </span>
              <div className="space-y-1 flex-1">
                <h3 className="font-display font-black text-sm text-slate-800 dark:text-slate-100">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {act.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Family Challenge Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-3xl border-3 border-amber-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="font-display font-black text-lg text-slate-800 dark:text-slate-100">
                🎯 Family Challenge Harian & Mingguan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tantangan seru membangun kebiasaan dan kekompakan keluarga
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              onClick={() => onToggleChallenge(ch.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                ch.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ch.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {ch.title}
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                      +{ch.rewardPoints} Poin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {ch.description}
                  </p>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                ch.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {ch.completed && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Random Picker Result Modal */}
      {randomModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border-3 border-rose-400/40 dark:border-slate-700 text-center flex flex-col overflow-hidden animate-pop-in mt-24 mb-20" style={{maxHeight: 'calc(100vh - 180px)'}}>
            <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-auto">
              <span className="text-6xl inline-block animate-bounce">{randomModal.emoji}</span>
              <div>
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600">
                  REKOMENDASI SPONTAN KELUARGA
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                {randomModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {randomModal.desc}
              </p>

              <button
                onClick={() => {
                  sound.playClick();
                  setRandomModal(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-sm shadow-md transition-all active:scale-95 mt-2"
              >
                SIAP, AYO KITA LAKUKAN! ❤️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
