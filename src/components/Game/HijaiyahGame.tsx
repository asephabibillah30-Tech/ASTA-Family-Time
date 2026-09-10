import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Award, Sparkles, HelpCircle, Grid, Play, Pause, RotateCcw, Info, Volume1 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface HijaiyahGameProps {
  onBack: () => void;
}

export interface HijaiyahItem {
  arabic: string;
  name: string;
  wordArabic: string;
  wordLatin: string;
  translation: string;
  emoji: string;
  color: string;
}

export const HIJAIYAH_DATA: HijaiyahItem[] = [
  { arabic: 'ا', name: 'Alif', wordArabic: 'أَسَد', wordLatin: 'Asad', translation: 'Singa', emoji: '🦁', color: 'from-amber-500 to-orange-600' },
  { arabic: 'ب', name: 'Ba\'', wordArabic: 'بَقَرَة', wordLatin: 'Baqarah', translation: 'Sapi', emoji: '🐮', color: 'from-rose-500 to-red-600' },
  { arabic: 'ت', name: 'Ta\'', wordArabic: 'تُفَّاحَة', wordLatin: 'Tuffahah', translation: 'Apel', emoji: '🍎', color: 'from-pink-500 to-rose-600' },
  { arabic: 'ث', name: 'Tsa\'', wordArabic: 'ثَعْلَب', wordLatin: 'Tsa\'lab', translation: 'Rubah', emoji: '🦊', color: 'from-orange-500 to-amber-600' },
  { arabic: 'ج', name: 'Jim', wordArabic: 'جَمَل', wordLatin: 'Jamal', translation: 'Unta', emoji: '🐫', color: 'from-emerald-500 to-teal-600' },
  { arabic: 'ح', name: 'Ha\'', wordArabic: 'حِصَان', wordLatin: 'Hisan', translation: 'Kuda', emoji: '🐴', color: 'from-sky-500 to-blue-600' },
  { arabic: 'خ', name: 'Kha\'', wordArabic: 'خُبْز', wordLatin: 'Khubz', translation: 'Roti', emoji: '🍞', color: 'from-amber-600 to-yellow-600' },
  { arabic: 'د', name: 'Dal', wordArabic: 'دَجَاجَة', wordLatin: 'Dajjajah', translation: 'Ayam', emoji: '🐔', color: 'from-red-500 to-rose-600' },
  { arabic: 'ذ', name: 'Dzal', wordArabic: 'ذَهَب', wordLatin: 'Dzahab', translation: 'Emas', emoji: '🪙', color: 'from-yellow-400 to-amber-500' },
  { arabic: 'ر', name: 'Ra\'', wordArabic: 'رُمَّان', wordLatin: 'Rumman', translation: 'Delima', emoji: '🍎', color: 'from-rose-500 to-pink-600' },
  { arabic: 'ز', name: 'Zai', wordArabic: 'زَهْرَة', wordLatin: 'Zahrah', translation: 'Bunga', emoji: '🌸', color: 'from-purple-500 to-indigo-600' },
  { arabic: 'س', name: 'Sin', wordArabic: 'سَمَكَة', wordLatin: 'Samakah', translation: 'Ikan', emoji: '🐟', color: 'from-blue-500 to-cyan-600' },
  { arabic: 'ش', name: 'Syin', wordArabic: 'شَمْس', wordLatin: 'Syams', translation: 'Matahari', emoji: '☀️', color: 'from-amber-400 to-orange-500' },
  { arabic: 'ص', name: 'Shad', wordArabic: 'صَقْر', wordLatin: 'Saqr', translation: 'Elang', emoji: '🦅', color: 'from-stone-500 to-amber-700' },
  { arabic: 'ض', name: 'Dhad', wordArabic: 'ضَفْدَع', wordLatin: 'Dhafda\'', translation: 'Katak', emoji: '🐸', color: 'from-emerald-500 to-green-600' },
  { arabic: 'ط', name: 'Tha\'', wordArabic: 'طَائِر', wordLatin: 'Thair', translation: 'Burung', emoji: '🐦', color: 'from-sky-400 to-indigo-600' },
  { arabic: 'ظ', name: 'Zha\'', wordArabic: 'ظَرْف', wordLatin: 'Zharf', translation: 'Amplop', emoji: '✉️', color: 'from-teal-500 to-emerald-600' },
  { arabic: 'ع', name: '\'Ain', wordArabic: 'عِنَب', wordLatin: '\'Inab', translation: 'Anggur', emoji: '🍇', color: 'from-purple-600 to-pink-600' },
  { arabic: 'غ', name: 'Ghain', wordArabic: 'غَزَال', wordLatin: 'Ghazal', translation: 'Rusa', emoji: '🦌', color: 'from-amber-600 to-orange-700' },
  { arabic: 'ف', name: 'Fa\'', wordArabic: 'فِيل', wordLatin: 'Fil', translation: 'Gajah', emoji: '🐘', color: 'from-indigo-500 to-blue-600' },
  { arabic: 'ق', name: 'Qaf', wordArabic: 'قَمَر', wordLatin: 'Qamar', translation: 'Bulan', emoji: '🌙', color: 'from-cyan-600 to-blue-700' },
  { arabic: 'ك', name: 'Kaf', wordArabic: 'كِتَاب', wordLatin: 'Kitab', translation: 'Buku', emoji: '📖', color: 'from-blue-500 to-teal-600' },
  { arabic: 'ل', name: 'Lam', wordArabic: 'لَبَن', wordLatin: 'Laban', translation: 'Susu', emoji: '🥛', color: 'from-teal-400 to-emerald-500' },
  { arabic: 'م', name: 'Mim', wordArabic: 'مَوْز', wordLatin: 'Mauz', translation: 'Pisang', emoji: '🍌', color: 'from-yellow-400 to-amber-500' },
  { arabic: 'ن', name: 'Nun', wordArabic: 'نَجْم', wordLatin: 'Najm', translation: 'Bintang', emoji: '⭐', color: 'from-indigo-400 to-purple-600' },
  { arabic: 'هـ', name: 'Ha\'', wordArabic: 'هِلَال', wordLatin: 'Hilal', translation: 'Bulan Sabit', emoji: '🌙', color: 'from-amber-500 to-orange-500' },
  { arabic: 'و', name: 'Wawu', wordArabic: 'وَرْدَة', wordLatin: 'Wardah', translation: 'Mawar', emoji: '🌹', color: 'from-rose-500 to-red-600' },
  { arabic: 'ء', name: 'Hamzah', wordArabic: 'أَرْنَب', wordLatin: 'Arnab', translation: 'Kelinci', emoji: '🐰', color: 'from-pink-400 to-purple-500' },
  { arabic: 'ي', name: 'Ya\'', wordArabic: 'يَد', wordLatin: 'Yad', translation: 'Tangan', emoji: '✋', color: 'from-emerald-500 to-teal-600' }
];

export const HijaiyahGame: React.FC<HijaiyahGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'grid' | 'quiz' | 'word'>('grid');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1600);
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [showMobileTip, setShowMobileTip] = useState<boolean>(false);

  // Quiz mode state
  const [quizTarget, setQuizTarget] = useState<HijaiyahItem>(HIJAIYAH_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<HijaiyahItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Word mode state
  const [wordTarget, setWordTarget] = useState<HijaiyahItem>(HIJAIYAH_DATA[0]);
  const [wordOptions, setWordOptions] = useState<HijaiyahItem[]>([]);
  const [wordFeedback, setWordFeedback] = useState<'correct' | 'wrong' | null>(null);

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

  // Speech Helper for Hijaiyah Letters
  const speakHijaiyahItem = (item: HijaiyahItem) => {
    if (muted) return;

    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.cancel();

        const text = `Huruf ${item.name}! ${item.name} untuk ${item.wordLatin}, ${item.translation}! ${item.emoji}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.88; // Calm clear pace for Hijaiyah recitation
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

  const handleSelectLetter = (index: number) => {
    unlockAudioEngine();
    setSelectedIndex(index);
    speakHijaiyahItem(HIJAIYAH_DATA[index]);
  };

  // Auto play A-Z Hijaiyah
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setTimeout(() => {
        setSelectedIndex((prev) => {
          const next = prev >= HIJAIYAH_DATA.length - 1 ? 0 : prev + 1;
          speakHijaiyahItem(HIJAIYAH_DATA[next]);
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
      if (selectedIndex >= HIJAIYAH_DATA.length - 1) {
        setSelectedIndex(0);
        speakHijaiyahItem(HIJAIYAH_DATA[0]);
      } else {
        speakHijaiyahItem(HIJAIYAH_DATA[selectedIndex]);
      }
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying(false);
    }
  };

  // Setup Quiz mode
  const generateNewQuiz = () => {
    const targetIdx = Math.floor(Math.random() * HIJAIYAH_DATA.length);
    const target = HIJAIYAH_DATA[targetIdx];
    setQuizTarget(target);
    setQuizFeedback(null);

    const optionsSet = new Set<HijaiyahItem>([target]);
    while (optionsSet.size < 4) {
      const randomItem = HIJAIYAH_DATA[Math.floor(Math.random() * HIJAIYAH_DATA.length)];
      optionsSet.add(randomItem);
    }

    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  // Setup Word mode
  const generateNewWord = () => {
    const targetIdx = Math.floor(Math.random() * HIJAIYAH_DATA.length);
    const target = HIJAIYAH_DATA[targetIdx];
    setWordTarget(target);
    setWordFeedback(null);

    const optionsSet = new Set<HijaiyahItem>([target]);
    while (optionsSet.size < 4) {
      const randomItem = HIJAIYAH_DATA[Math.floor(Math.random() * HIJAIYAH_DATA.length)];
      optionsSet.add(randomItem);
    }

    setWordOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (mode === 'quiz') generateNewQuiz();
    if (mode === 'word') generateNewWord();
    if (mode !== 'grid') setIsAutoPlaying(false);
  }, [mode]);

  const speakQuizPrompt = (item: HijaiyahItem) => {
    unlockAudioEngine();
    if (muted) return;
    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Coba tebak, mana huruf Hijaiyah ${item.name}? (${item.wordLatin} ${item.translation})`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const handleQuizAnswer = (item: HijaiyahItem) => {
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
          const utterance = new SpeechSynthesisUtterance(`Masya Allah! Benar sekali! Huruf ${item.name} untuk ${item.wordLatin}!`);
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
          const utterance = new SpeechSynthesisUtterance(`Belum tepat! Ayo coba lagi!`);
          utterance.lang = 'id-ID';
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1200);
    }
  };

  const handleWordAnswer = (item: HijaiyahItem) => {
    unlockAudioEngine();
    if (wordFeedback !== null) return;

    if (item.name === wordTarget.name) {
      setWordFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Alhamdulillah! Benar! Huruf ${wordTarget.name} untuk ${wordTarget.wordLatin}!`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.25;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        generateNewWord();
      }, 1800);
    } else {
      setWordFeedback('wrong');
      sound.playClick();
      setStreak(0);

      setTimeout(() => {
        setWordFeedback(null);
      }, 1200);
    }
  };

  const activeItem = HIJAIYAH_DATA[selectedIndex] || HIJAIYAH_DATA[0];

  return (
    <div
      onClick={unlockAudioEngine}
      onTouchStart={unlockAudioEngine}
      className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-pop-in select-none"
    >
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
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
              <span className="text-2xl animate-bounce">🕌</span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                Game Hijaiyah Ceria 29 Huruf
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              Belajar mengenal & mengaji Huruf Hijaiyah dengan Suara Bahasa Indonesia!
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
              <span className="font-extrabold block text-sm">💡 Solusi Suara Hijaiyah di Handphone:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                <li><strong>Matikan Mode Hening (Silent Switch)</strong> di bodi HP Anda.</li>
                <li><strong>Naikkan Volume Media / Musik HP</strong>.</li>
                <li><strong>Ketuk salah satu huruf Hijaiyah</strong> di bawah untuk membunyikan suara mengaji!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              unlockAudioEngine();
              setShowMobileTip(false);
              speakHijaiyahItem(activeItem);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black rounded-xl text-xs shadow-md shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tes Suara Hijaiyah 🔊</span>
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
          <span>Papan Hijaiyah 29 Huruf</span>
        </button>

        <button
          onClick={() => {
            unlockAudioEngine();
            sound.playClick();
            setMode('quiz');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'quiz'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tebak Hijaiyah Ceria</span>
        </button>

        <button
          onClick={() => {
            unlockAudioEngine();
            sound.playClick();
            setMode('word');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'word'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Lengkapi Kata Arab</span>
        </button>
      </div>

      {/* MODE 1: GRID & EXPLORATION */}
      {mode === 'grid' && (
        <div className="space-y-5">
          {/* Active Big Highlight Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-emerald-300 dark:border-emerald-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Big Active Hijaiyah Letter Card */}
            <div className="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
              <div
                onClick={() => handleSelectLetter(selectedIndex)}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${activeItem.color} text-white font-serif font-black text-6xl sm:text-7xl flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-700 relative group shrink-0`}
                title="Klik untuk dengarkan pengucapan huruf Hijaiyah!"
              >
                <span>{activeItem.arabic}</span>
                <span className="text-xs font-sans font-bold opacity-90">{activeItem.name}</span>
                <div className="absolute bottom-1 right-2 text-xs bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                  Huruf Hijaiyah ke-{selectedIndex + 1}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white capitalize">
                  {activeItem.name} ({activeItem.arabic}) - {activeItem.wordLatin} ({activeItem.wordArabic}) {activeItem.emoji}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeItem.name} untuk <strong>{activeItem.wordLatin}</strong> ({activeItem.translation}). Tekan tombol huruf di bawah!
                </p>
              </div>
            </div>

            {/* Arabic Word & Emoji Box */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-w-[150px]">
              <span className="text-5xl sm:text-6xl animate-bounce mb-1">
                {activeItem.emoji}
              </span>
              <span className="font-serif font-black text-2xl text-emerald-600 dark:text-emerald-400">
                {activeItem.wordArabic}
              </span>
              <span className="font-display font-bold text-xs text-slate-600 dark:text-slate-300">
                {activeItem.wordLatin} ({activeItem.translation})
              </span>
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
                <span>{isAutoPlaying ? 'Hentikan Mengaji' : 'Putar Mengaji (Alif-Ya)'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Kecepatan:</span>
                <button
                  onClick={() => setAutoSpeed(2000)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 2000
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Pelan
                </button>
                <button
                  onClick={() => setAutoSpeed(1600)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1600
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setAutoSpeed(1100)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1100
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Cepat
                </button>
              </div>
            </div>

          </div>

          {/* 29 Hijaiyah Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>Pilih huruf Hijaiyah di bawah ini (Alif sampai Ya):</span>
              <span>29 Huruf Hijaiyah Lengkap 🕌</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2 dir-rtl">
              {HIJAIYAH_DATA.map((item, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelectLetter(idx)}
                    className={`h-15 sm:h-17 rounded-2xl font-serif font-black transition-all transform active:scale-90 flex flex-col items-center justify-center border-2 ${
                      isSelected
                        ? `bg-gradient-to-tr ${item.color} text-white border-white shadow-lg scale-105 z-10 ring-4 ring-emerald-300 dark:ring-emerald-900`
                        : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">{item.arabic}</span>
                    <span className="font-sans text-[10px] font-bold opacity-80 mt-0.5">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUIZ TEBAK HIJAIYAH */}
      {mode === 'quiz' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-amber-300 dark:border-amber-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">❓</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Tebak Hijaiyah Ceria!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Dengarkan suaranya, lalu pilih tombol huruf Hijaiyah yang benar di bawah ini:
            </p>
          </div>

          {/* Voice Prompt Box */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => speakQuizPrompt(quizTarget)}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-display font-black text-sm"
            >
              <Volume2 className="w-7 h-7 text-yellow-200 animate-pulse" />
              <span>Dengarkan Suara Hijaiyah 🔊</span>
            </button>

            <div className="text-xl sm:text-2xl font-display font-black tracking-wide">
              "Mana huruf {quizTarget.name}? ({quizTarget.wordLatin} {quizTarget.emoji})"
            </div>
          </div>

          {/* Feedback Banner */}
          {quizFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🎉 MASYA ALLAH! BENAR! +10 POIN ✨
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
                <span className="font-serif text-5xl sm:text-6xl">{item.arabic}</span>
                <span className="text-xs font-bold opacity-90">{item.name} ({item.wordLatin} {item.emoji})</span>
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
              className="text-emerald-600 dark:text-emerald-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Soal
            </button>
          </div>

        </div>
      )}

      {/* MODE 3: LENGKAPI KATA ARAB */}
      {mode === 'word' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-indigo-300 dark:border-indigo-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">🕌</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Lengkapi Kata Hijaiyah!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Pilih huruf Hijaiyah yang tepat untuk melengkapi kata berikut:
            </p>
          </div>

          {/* Picture Word Card */}
          <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <span className="text-6xl sm:text-7xl animate-bounce">
              {wordTarget.emoji}
            </span>

            <div className="text-3xl sm:text-4xl font-serif font-black tracking-widest bg-white/20 px-6 py-2 rounded-2xl backdrop-blur-md">
              <span className="border-b-4 border-yellow-300 text-yellow-300 inline-block px-1">_</span>
              <span>{wordTarget.wordArabic.slice(1)}</span>
            </div>

            <div className="text-sm font-display font-bold text-yellow-200">
              {wordTarget.wordLatin} ({wordTarget.translation})
            </div>
          </div>

          {/* Feedback Banner */}
          {wordFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🌟 ALHAMDULILLAH! HURUF {wordTarget.name} BENAR! +10 POIN ✨
            </div>
          )}
          {wordFeedback === 'wrong' && (
            <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-lg animate-shake shadow-md">
              ❌ Belum pas! Perhatikan huruf awal kata ini ya! 💡
            </div>
          )}

          {/* Choices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wordOptions.map((item) => (
              <button
                key={item.name}
                onClick={() => handleWordAnswer(item)}
                className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border-2 border-slate-300 dark:border-slate-600 font-serif font-black text-4xl text-slate-800 dark:text-white active:scale-95 transition-all shadow-sm"
              >
                {item.arabic}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold pt-2">
            <span>Level Kata: 🔥 {streak}</span>
            <button
              onClick={() => {
                sound.playClick();
                generateNewWord();
              }}
              className="text-emerald-600 dark:text-emerald-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Kata
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
