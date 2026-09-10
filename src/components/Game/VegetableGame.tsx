import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Award, HelpCircle, Grid, Play, Pause, RotateCcw, Info, Volume1, HeartPulse } from 'lucide-react';
import { sound } from '../../utils/sound';

interface VegetableGameProps {
  onBack: () => void;
}

export interface VegetableItem {
  name: string;
  emoji: string;
  color: string;
  benefit: string;
  category: string;
}

export const VEGETABLE_DATA: VegetableItem[] = [
  { name: 'Wortel', emoji: '🥕', color: 'from-orange-500 to-amber-600', benefit: 'Kaya Vitamin A, sangat baik untuk kesehatan mata!', category: 'Sayur Umbi' },
  { name: 'Bayam', emoji: '🥬', color: 'from-emerald-500 to-teal-600', benefit: 'Kaya Zat Besi, membuat tubuh kuat dan berenergi!', category: 'Sayur Daun' },
  { name: 'Brokoli', emoji: '🥦', color: 'from-green-600 to-emerald-700', benefit: 'Superfood penuh Vitamin C dan serat penangkal sakit!', category: 'Sayur Bunga' },
  { name: 'Tomat', emoji: '🍅', color: 'from-red-500 to-rose-600', benefit: 'Menyegarkan, bikin kulit sehat dan kaya Antioksidan!', category: 'Sayur Buah' },
  { name: 'Jagung', emoji: '🌽', color: 'from-amber-400 to-yellow-500', benefit: 'Manis lezat, kaya serat dan memberi tenaga sehat!', category: 'Sayur Biji' },
  { name: 'Terong', emoji: '🍆', color: 'from-purple-600 to-indigo-700', benefit: 'Warna ungu cantik, menyehatkan jantung dan otak!', category: 'Sayur Buah' },
  { name: 'Cabai', emoji: '🌶️', color: 'from-red-600 to-rose-700', benefit: 'Sensasi pedas kaya Vitamin C dan membakar kalori!', category: 'Bumbu Dapur' },
  { name: 'Timun', emoji: '🥒', color: 'from-teal-500 to-emerald-600', benefit: 'Sangat segar, kaya air dan menjaga tubuh tetap sejuk!', category: 'Sayur Buah' },
  { name: 'Kentang', emoji: '🥔', color: 'from-amber-600 to-stone-700', benefit: 'Sumber karbohidrat sehat pemberi energi kuat!', category: 'Sayur Umbi' },
  { name: 'Bawang Putih', emoji: '🧄', color: 'from-stone-300 to-slate-400 text-slate-900', benefit: 'Bumbu ajaib meningkatkan kekebalan tubuh!', category: 'Bumbu Dapur' },
  { name: 'Bawang Merah', emoji: '🧅', color: 'from-rose-600 to-pink-700', benefit: 'Aroma wangi masakan dan menyehatkan pernapasan!', category: 'Bumbu Dapur' },
  { name: 'Jamur', emoji: '🍄', color: 'from-amber-700 to-orange-800', benefit: 'Gurih lezat, tinggi protein nabati dan serat!', category: 'Jamur Sehat' },
  { name: 'Labu', emoji: '🎃', color: 'from-orange-500 to-amber-600', benefit: 'Manis lembut, melancarkan pencernaan dan kenyang!', category: 'Sayur Buah' },
  { name: 'Kacang Polong', emoji: '🫛', color: 'from-emerald-400 to-teal-500', benefit: 'Imut manis, kaya protein dan vitamin B!', category: 'Sayur Biji' },
  { name: 'Paprika', emoji: '🫑', color: 'from-green-500 to-emerald-600', benefit: 'Renyah manis, sangat kaya Vitamin C!', category: 'Sayur Buah' },
  { name: 'Kubis', emoji: '🥬', color: 'from-lime-500 to-emerald-600', benefit: 'Renyah berserat, bagus untuk lambung dan pencernaan!', category: 'Sayur Daun' }
];

export const VegetableGame: React.FC<VegetableGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'grid' | 'quiz' | 'riddle'>('grid');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1800);
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [showMobileTip, setShowMobileTip] = useState<boolean>(false);

  // Quiz mode state
  const [quizTarget, setQuizTarget] = useState<VegetableItem>(VEGETABLE_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<VegetableItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Riddle mode state
  const [riddleTarget, setRiddleTarget] = useState<VegetableItem>(VEGETABLE_DATA[0]);
  const [riddleOptions, setRiddleOptions] = useState<VegetableItem[]>([]);
  const [riddleFeedback, setRiddleFeedback] = useState<'correct' | 'wrong' | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile Audio Unlocker
  const unlockAudioEngine = () => {
    sound.unlock();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        setAudioUnlocked(true);
      } catch (e) {
        console.warn('Audio unlock warning:', e);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  }, []);

  // Speech Helper for Vegetables
  const speakVegetableItem = (item: VegetableItem) => {
    if (muted) return;

    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.cancel();

        const text = `Sayur ${item.name}! ${item.emoji}. ${item.benefit}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1.2;

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('id') ||
            v.lang.toLowerCase().includes('indonesia') ||
            v.name.toLowerCase().includes('indonesia')
        );

        if (idVoice) {
          utterance.voice = idVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech playback warning:', e);
      }
    }
  };

  const handleSelectVegetable = (index: number) => {
    unlockAudioEngine();
    setSelectedIndex(index);
    speakVegetableItem(VEGETABLE_DATA[index]);
  };

  // Auto play Vegetables
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setTimeout(() => {
        setSelectedIndex((prev) => {
          const next = prev >= VEGETABLE_DATA.length - 1 ? 0 : prev + 1;
          speakVegetableItem(VEGETABLE_DATA[next]);
          return next;
        });
      }, autoSpeed);
    } else {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    }

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [isAutoPlaying, selectedIndex, autoSpeed]);

  const toggleAutoPlay = () => {
    unlockAudioEngine();
    sound.playClick();
    if (!isAutoPlaying) {
      if (selectedIndex >= VEGETABLE_DATA.length - 1) {
        setSelectedIndex(0);
        speakVegetableItem(VEGETABLE_DATA[0]);
      } else {
        speakVegetableItem(VEGETABLE_DATA[selectedIndex]);
      }
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying(false);
    }
  };

  // Setup Quiz mode
  const generateNewQuiz = () => {
    const targetIdx = Math.floor(Math.random() * VEGETABLE_DATA.length);
    const target = VEGETABLE_DATA[targetIdx];
    setQuizTarget(target);
    setQuizFeedback(null);

    const optionsSet = new Set<VegetableItem>([target]);
    while (optionsSet.size < 4) {
      const randomItem = VEGETABLE_DATA[Math.floor(Math.random() * VEGETABLE_DATA.length)];
      optionsSet.add(randomItem);
    }

    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  // Setup Riddle mode
  const generateNewRiddle = () => {
    const targetIdx = Math.floor(Math.random() * VEGETABLE_DATA.length);
    const target = VEGETABLE_DATA[targetIdx];
    setRiddleTarget(target);
    setRiddleFeedback(null);

    const optionsSet = new Set<VegetableItem>([target]);
    while (optionsSet.size < 4) {
      const randomItem = VEGETABLE_DATA[Math.floor(Math.random() * VEGETABLE_DATA.length)];
      optionsSet.add(randomItem);
    }

    setRiddleOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (mode === 'quiz') generateNewQuiz();
    if (mode === 'riddle') generateNewRiddle();
    if (mode !== 'grid') setIsAutoPlaying(false);
  }, [mode]);

  const speakQuizPrompt = (item: VegetableItem) => {
    unlockAudioEngine();
    if (muted) return;
    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Coba tebak, mana sayur ${item.name}? ${item.benefit}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const handleQuizAnswer = (item: VegetableItem) => {
    unlockAudioEngine();
    if (quizFeedback !== null) return;

    if (item.name === quizTarget.name) {
      setQuizFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Hore! Benar sekali! Ini sayur ${item.name}! ${item.benefit}`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.25;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        generateNewQuiz();
      }, 1800);
    } else {
      setQuizFeedback('wrong');
      sound.playClick();
      setStreak(0);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Belum tepat! Coba lagi yuk!`);
          utterance.lang = 'id-ID';
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1200);
    }
  };

  const handleRiddleAnswer = (item: VegetableItem) => {
    unlockAudioEngine();
    if (riddleFeedback !== null) return;

    if (item.name === riddleTarget.name) {
      setRiddleFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Hebat sekali! Tebakanmu benar! Jawabannya adalah sayur ${riddleTarget.name}!`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.25;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        generateNewRiddle();
      }, 1800);
    } else {
      setRiddleFeedback('wrong');
      sound.playClick();
      setStreak(0);

      setTimeout(() => {
        setRiddleFeedback(null);
      }, 1200);
    }
  };

  const activeItem = VEGETABLE_DATA[selectedIndex] || VEGETABLE_DATA[0];

  return (
    <div
      onClick={unlockAudioEngine}
      onTouchStart={unlockAudioEngine}
      className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-pop-in select-none"
    >
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md active:scale-95 transition-all text-white"
            title="Kembali ke Arena Game"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🥦</span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                Game Sayur-Sayuran Ceria 🥕
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              Mengenal manfaat sayuran sehat untuk tubuh dengan Suara Bahasa Indonesia!
            </p>
          </div>
        </div>

        {/* Controls Header */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Mobile Sound Tip Button */}
          <button
            onClick={() => setShowMobileTip(!showMobileTip)}
            className="p-2.5 sm:p-3 rounded-2xl bg-amber-300/30 hover:bg-amber-300/40 backdrop-blur-md font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white transition-all"
            title="Bantuan Suara di HP"
          >
            <Info className="w-5 h-5 text-yellow-200" />
            <span className="hidden sm:inline">Tips HP</span>
          </button>

          {/* Mute button */}
          <button
            onClick={() => {
              setMuted(!muted);
              sound.playClick();
            }}
            className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              muted ? 'bg-rose-500/80 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="hidden sm:inline">{muted ? 'Suara Mati' : 'Suara Aktif'}</span>
          </button>

          {/* Score Badge */}
          <div className="bg-white/25 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 border border-white/30">
            <Award className="w-5 h-5 text-yellow-200 animate-spin-slow" />
            <div>
              <div className="text-[10px] text-white/80 font-bold uppercase leading-none">Skor</div>
              <div className="font-black text-base text-yellow-200 leading-tight">{score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sound Troubleshooting Banner */}
      {(showMobileTip || !audioUnlocked) && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pop-in">
          <div className="flex items-start gap-2.5">
            <Volume1 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block text-sm">💡 Solusi Suara Sayuran di Handphone:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                <li><strong>Matikan Mode Hening (Silent Switch)</strong> di bodi HP Anda.</li>
                <li><strong>Naikkan Volume Media / Musik HP</strong>.</li>
                <li><strong>Ketuk salah satu kartu sayuran</strong> di bawah untuk membunyikan suara!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              unlockAudioEngine();
              setShowMobileTip(false);
              speakVegetableItem(activeItem);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black rounded-xl text-xs shadow-md shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tes Suara Sayur 🔊</span>
          </button>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
        <button
          onClick={() => {
            unlockAudioEngine();
            sound.playClick();
            setMode('grid');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'grid'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Taman Sayur Sehat</span>
        </button>

        <button
          onClick={() => {
            unlockAudioEngine();
            sound.playClick();
            setMode('quiz');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'quiz'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tebak Sayur Ceria</span>
        </button>

        <button
          onClick={() => {
            unlockAudioEngine();
            sound.playClick();
            setMode('riddle');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'riddle'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Manfaat Sayuran</span>
        </button>
      </div>

      {/* MODE 1: GRID & EXPLORATION */}
      {mode === 'grid' && (
        <div className="space-y-5">
          {/* Active Big Highlight Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-emerald-300 dark:border-emerald-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Big Active Vegetable Emoji Card */}
            <div className="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
              <div
                onClick={() => handleSelectVegetable(selectedIndex)}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${activeItem.color} text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-700 relative group shrink-0`}
                title="Klik untuk dengarkan nama & manfaat sayuran!"
              >
                <span className="text-5xl sm:text-6xl animate-bounce">{activeItem.emoji}</span>
                <div className="absolute bottom-1 right-2 text-xs bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                  {activeItem.category}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white capitalize">
                  Sayur {activeItem.name} {activeItem.emoji}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 max-w-md leading-relaxed bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                  💡 <strong>Manfaat Sehat:</strong> {activeItem.benefit}
                </p>
              </div>
            </div>

            {/* Auto Play Controls */}
            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
              <button
                onClick={toggleAutoPlay}
                className={`w-full md:w-auto px-5 py-3 rounded-2xl font-display font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-white ${
                  isAutoPlaying
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                <span>{isAutoPlaying ? 'Hentikan Mengenal Sayur' : 'Putar Otomatis (Taman Sayur)'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Kecepatan:</span>
                <button
                  onClick={() => setAutoSpeed(2200)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 2200
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Pelan
                </button>
                <button
                  onClick={() => setAutoSpeed(1800)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1800
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setAutoSpeed(1200)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1200
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Cepat
                </button>
              </div>
            </div>

          </div>

          {/* Vegetable Cards Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>Pilih jenis sayuran sehat di bawah ini:</span>
              <span>16 Sayuran Lengkap 🥦</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
              {VEGETABLE_DATA.map((item, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelectVegetable(idx)}
                    className={`h-22 sm:h-24 rounded-2xl font-display font-black transition-all transform active:scale-90 flex flex-col items-center justify-center p-2 border-2 ${
                      isSelected
                        ? `bg-gradient-to-tr ${item.color} text-white border-white shadow-lg scale-105 z-10 ring-4 ring-emerald-300 dark:ring-emerald-900`
                        : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-bold leading-none">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUIZ TEBAK SAYUR */}
      {mode === 'quiz' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-orange-300 dark:border-orange-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">❓</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Tebak Sayur Ceria!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Dengarkan petunjuk suaranya, lalu pilih gambar sayuran yang benar:
            </p>
          </div>

          {/* Voice Prompt Box */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => speakQuizPrompt(quizTarget)}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-display font-black text-sm"
            >
              <Volume2 className="w-7 h-7 text-yellow-200 animate-pulse" />
              <span>Dengarkan Suara Petunjuk Sayur 🔊</span>
            </button>

            <div className="text-xl sm:text-2xl font-display font-black tracking-wide">
              "Mana sayur {quizTarget.name}? {quizTarget.emoji}"
            </div>
          </div>

          {/* Feedback Banner */}
          {quizFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🎉 MASYA ALLAH! BENAR! SAYUR {quizTarget.name.toUpperCase()} SEHAT SEKALI! +10 POIN ✨
            </div>
          )}
          {quizFeedback === 'wrong' && (
            <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-lg animate-shake shadow-md">
              ❌ Belum tepat, ayo coba tebak lagi! 💪
            </div>
          )}

          {/* 4 Choices Grid */}
          <div className="grid grid-cols-2 gap-4">
            {quizOptions.map((item) => (
              <button
                key={item.name}
                onClick={() => handleQuizAnswer(item)}
                className={`py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.color} text-white font-display font-black shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-3 border-white`}
              >
                <span className="text-5xl sm:text-6xl">{item.emoji}</span>
                <span className="text-sm font-bold opacity-90">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Streak indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold pt-2">
            <span>Beruntun: 🔥 {streak} kali</span>
            <button
              onClick={() => {
                sound.playClick();
                generateNewQuiz();
              }}
              className="text-orange-600 dark:text-orange-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Soal
            </button>
          </div>

        </div>
      )}

      {/* MODE 3: TEBAK MANFAAT SAYURAN */}
      {mode === 'riddle' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-rose-300 dark:border-rose-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">💡</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Tebak Manfaat Sayuran Sehat!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Baca atau dengarkan manfaat kesehatan berikut, lalu pilih sayurannya:
            </p>
          </div>

          {/* Riddle Card */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-600 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <HeartPulse className="w-12 h-12 text-yellow-200 animate-pulse" />

            <div className="text-base sm:text-xl font-display font-black leading-relaxed bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              "{riddleTarget.benefit}"
            </div>
            <span className="text-xs font-bold opacity-90 text-yellow-200">
              Sayuran sehat manakah yang memiliki manfaat di atas?
            </span>
          </div>

          {/* Feedback Banner */}
          {riddleFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🌟 HEBAT SEKALI! BENAR! JAWABANNYA SAYUR {riddleTarget.name.toUpperCase()} {riddleTarget.emoji}! +10 POIN ✨
            </div>
          )}
          {riddleFeedback === 'wrong' && (
            <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-lg animate-shake shadow-md">
              ❌ Belum pas! Baca lagi manfaat sehatnya ya! 💡
            </div>
          )}

          {/* Choices */}
          <div className="grid grid-cols-2 gap-4">
            {riddleOptions.map((item) => (
              <button
                key={item.name}
                onClick={() => handleRiddleAnswer(item)}
                className={`py-4 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border-2 border-slate-300 dark:border-slate-600 font-display font-black text-xl text-slate-800 dark:text-white active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2`}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold pt-2">
            <span>Level Manfaat: 🔥 {streak}</span>
            <button
              onClick={() => {
                sound.playClick();
                generateNewRiddle();
              }}
              className="text-rose-600 dark:text-rose-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Soal
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
