import React from 'react';
import { Play, Pause, RotateCcw, Plus, Clock } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  isFinished: boolean;
  progressPercent: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddExtraTime: (seconds?: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  timeLeft,
  totalDuration,
  isRunning,
  isFinished,
  progressPercent,
  onToggleTimer,
  onResetTimer,
  onAddExtraTime,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isUrgent = timeLeft <= 3 && timeLeft > 0;

  // Determine stroke color based on remaining time
  const getStrokeColor = () => {
    if (isFinished) return '#EF4444'; // Red
    if (isUrgent) return '#F97316'; // Orange pulse
    if (progressPercent > 60) return '#EAB308'; // Yellow
    return '#10B981'; // Emerald
  };

  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-bubbly-sm border border-slate-100 dark:border-slate-700/60 max-w-xs mx-auto w-full transition-all">
      
      {/* Title */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        <Clock className="w-3.5 h-3.5 text-family-coral" />
        <span>Hitungan Waktu</span>
      </div>

      {/* Circular SVG Timer */}
      <div className="relative w-28 h-28 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100 dark:text-slate-700/80 fill-none"
          />
          {/* Progress Stroke */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className={`absolute flex flex-col items-center justify-center ${isUrgent ? 'animate-bounce' : ''}`}>
          <span
            className={`font-display font-extrabold text-3xl transition-colors ${
              isFinished
                ? 'text-red-500'
                : isUrgent
                ? 'text-orange-500 scale-110'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {isFinished ? '⏰ 0' : timeLeft}
          </span>
          <span className="text-[10px] text-slate-400 font-bold -mt-1">
            {isFinished ? 'Waktu Habis!' : `dari ${totalDuration}s`}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-2 mt-2">
        {/* Play/Pause */}
        <button
          onClick={onToggleTimer}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white shadow-bubbly-sm transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-bubbly-yellow'
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-bubbly-teal'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Jeda
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> {timeLeft === totalDuration ? 'Mulai Timer' : 'Lanjut'}
            </>
          )}
        </button>

        {/* +5s Extension */}
        <button
          onClick={() => onAddExtraTime(5)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 active:scale-95 transition-all"
          title="Tambah 5 Detik"
        >
          <Plus className="w-3.5 h-3.5" /> 5s
        </button>

        {/* Reset */}
        <button
          onClick={onResetTimer}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
