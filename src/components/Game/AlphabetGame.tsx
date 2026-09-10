import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Award, Sparkles, HelpCircle, Grid, Play, Pause, RotateCcw, Info, Volume1 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface AlphabetGameProps {
  onBack: () => void;
}

export interface AlphabetItem {
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

export const ALPHABET_DATA: AlphabetItem[] = [
  { letter: 'A', word: 'Apel', emoji: '🍎', color: 'from-rose-500 to-red-600' },
  { letter: 'B', word: 'Bola', emoji: '⚽', color: 'from-blue-500 to-indigo-600' },
  { letter: 'C', word: 'Ceri', emoji: '🍒', color: 'from-pink-500 to-rose-600' },
  { letter: 'D', word: 'Domba', emoji: '🐑', color: 'from-emerald-500 to-teal-600' },
  { letter: 'E', word: 'Elang', emoji: '🦅', color: 'from-amber-500 to-orange-600' },
  { letter: 'F', word: 'Foto', emoji: '📷', color: 'from-purple-500 to-indigo-600' },
  { letter: 'G', word: 'Gajah', emoji: '🐘', color: 'from-sky-500 to-blue-600' },
  { letter: 'H', word: 'Harimau', emoji: '🐯', color: 'from-orange-500 to-amber-600' },
  { letter: 'I', word: 'Ikan', emoji: '🐟', color: 'from-cyan-500 to-blue-600' },
  { letter: 'J', word: 'Jeruk', emoji: '🍊', color: 'from-amber-400 to-orange-500' },
  { letter: 'K', word: 'Kucing', emoji: '🐱', color: 'from-yellow-400 to-amber-500' },
  { letter: 'L', word: 'Lebah', emoji: '🐝', color: 'from-amber-500 to-yellow-500' },
  { letter: 'M', word: 'Monyet', emoji: '🐒', color: 'from-stone-500 to-amber-700' },
  { letter: 'N', word: 'Nanas', emoji: '🍍', color: 'from-lime-500 to-emerald-600' },
  { letter: 'O', word: 'Onta', emoji: '🐫', color: 'from-amber-600 to-orange-700' },
  { letter: 'P', word: 'Pisang', emoji: '🍌', color: 'from-yellow-400 to-amber-500' },
  { letter: 'Q', word: 'Qur\'an', emoji: '📖', color: 'from-teal-500 to-emerald-600' },
  { letter: 'R', word: 'Roti', emoji: '🍞', color: 'from-amber-500 to-orange-600' },
  { letter: 'S', word: 'Sapi', emoji: '🐮', color: 'from-rose-400 to-pink-600' },
  { letter: 'T', word: 'Topi', emoji: '🧢', color: 'from-blue-600 to-indigo-700' },
  { letter: 'U', word: 'Ular', emoji: '🐍', color: 'from-emerald-600 to-teal-700' },
  { letter: 'V', word: 'Vas', emoji: '🏺', color: 'from-purple-500 to-violet-600' },
  { letter: 'W', word: 'Wortel', emoji: '🥕', color: 'from-orange-500 to-amber-600' },
  { letter: 'X', word: 'Xilofon', emoji: '🎼', color: 'from-indigo-500 to-purple-600' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀', color: 'from-pink-500 to-rose-600' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', color: 'from-slate-700 to-slate-900' }
];

export const AlphabetGame: React.FC<AlphabetGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'grid' | 'quiz' | 'word'>('grid');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1400);
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [showMobileTip, setShowMobileTip] = useState<boolean>(false);

  // Quiz mode state
  const [quizTarget, setQuizTarget] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<AlphabetItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Word mode state
  const [wordTarget, setWordTarget] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
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

  // Speech Helper for Letters
  const speakLetterItem = (item: AlphabetItem) => {
    if (muted) return;

    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.cancel();

        const text = `Huruf ${item.letter}! ${item.letter} untuk ${item.word}! ${item.emoji}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1.25;

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
    speakLetterItem(ALPHABET_DATA[index]);
  };

  // Auto play A-Z
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setTimeout(() => {
        setSelectedIndex((prev) => {
          const next = prev >= ALPHABET_DATA.length - 1 ? 0 : prev + 1;
          speakLetterItem(ALPHABET_DATA[next]);
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
      if (selectedIndex >= ALPHABET_DATA.length - 1) {
        setSelectedIndex(0);
        speakLetterItem(ALPHABET_DATA[0]);
      } else {
        speakLetterItem(ALPHABET_DATA[selectedIndex]);
      }
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying(false);
    }
  };

  // Setup Quiz mode
  const generateNewQuiz = () => {
    const targetIdx = Math.floor(Math.random() * ALPHABET_DATA.length);
    const target = ALPHABET_DATA[targetIdx];
    setQuizTarget(target);
    setQuizFeedback(null);

    const optionsSet = new Set<AlphabetItem>([target]);
    while (optionsSet.size < 4) {
      const randomItem = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      optionsSet.add(randomItem);
    }

    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  // Setup Word mode
  const generateNewWord = () => {
    const targetIdx = Math.floor(Math.random() * ALPHABET_DATA.length);
    const target = ALPHABET_DATA[targetIdx];
    setWordTarget(target);
    setWordFeedback(null);

    const optionsSet = new Set<string>([target.letter]);
    while (optionsSet.size < 4) {
      const randomItem = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      optionsSet.add(randomItem.letter);
    }

    setWordOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (mode === 'quiz') generateNewQuiz();
    if (mode === 'word') generateNewWord();
    if (mode !== 'grid') setIsAutoPlaying(false);
  }, [mode]);

  const speakQuizPrompt = (item: AlphabetItem) => {
    unlockAudioEngine();
    if (muted) return;
    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Coba tebak, mana huruf ${item.letter}? ${item.letter} untuk ${item.word}!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.25;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const handleQuizAnswer = (item: AlphabetItem) => {
    unlockAudioEngine();
    if (quizFeedback !== null) return;

    if (item.letter === quizTarget.letter) {
      setQuizFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Hore! Benar sekali! Huruf ${item.letter} untuk ${item.word}!`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.3;
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
          const utterance = new SpeechSynthesisUtterance(`Belum tepat! Ayo coba tebak lagi!`);
          utterance.lang = 'id-ID';
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1200);
    }
  };

  const handleWordAnswer = (letter: string) => {
    unlockAudioEngine();
    if (wordFeedback !== null) return;

    if (letter === wordTarget.letter) {
      setWordFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Hebat! ${wordTarget.letter} untuk ${wordTarget.word}!`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.3;
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

  const activeItem = ALPHABET_DATA[selectedIndex] || ALPHABET_DATA[0];

  return (
    <div
      onClick={unlockAudioEngine}
      onTouchStart={unlockAudioEngine}
      className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-pop-in select-none"
    >
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-pink-400 via-rose-500 to-indigo-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
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
              <span className="text-2xl animate-bounce">🔤</span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                Game Abjad Ceria A - Z
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              Belajar mengenal & mengucapkan huruf A sampai Z dengan Suara Bahasa Indonesia!
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
        <div className="bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pop-in">
          <div className="flex items-start gap-2.5">
            <Volume1 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block text-sm">💡 Solusi Suara Abjad di Handphone:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                <li><strong>Matikan Mode Hening (Silent Switch)</strong> di bodi HP Anda.</li>
                <li><strong>Naikkan Volume Media / Musik HP</strong>.</li>
                <li><strong>Ketuk salah satu kartu huruf</strong> di bawah untuk membunyikan suara!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              unlockAudioEngine();
              setShowMobileTip(false);
              speakLetterItem(activeItem);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display font-black rounded-xl text-xs shadow-md shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tes Suara Huruf 🔊</span>
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
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Papan Abjad A-Z</span>
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
          <span>Tebak Huruf Ceria</span>
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
          <span>Lengkapi Kata</span>
        </button>
      </div>

      {/* MODE 1: GRID & EXPLORATION */}
      {mode === 'grid' && (
        <div className="space-y-5">
          {/* Active Big Highlight Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-rose-300 dark:border-rose-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Big Active Letter Card */}
            <div className="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
              <div
                onClick={() => handleSelectLetter(selectedIndex)}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${activeItem.color} text-white font-display font-black text-5xl sm:text-6xl flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-700 relative group shrink-0`}
                title="Klik untuk dengarkan suara huruf & kata!"
              >
                <span>{activeItem.letter}</span>
                <span className="text-xs font-bold opacity-90">{activeItem.letter.toLowerCase()}</span>
                <div className="absolute bottom-1 right-2 text-xs bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider">
                  Pengucapan Bahasa Indonesia
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white capitalize">
                  {activeItem.letter} untuk {activeItem.word} {activeItem.emoji}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tekan huruf atau kartu di atas untuk membunyikan suara!
                </p>
              </div>
            </div>

            {/* Object Emoji Display */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-5xl sm:text-6xl animate-bounce mb-1">
                {activeItem.emoji}
              </span>
              <span className="font-display font-black text-base text-slate-900 dark:text-white">
                {activeItem.word}
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
                <span>{isAutoPlaying ? 'Hentikan Putar A-Z' : 'Putar Otomatis (A-Z)'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Kecepatan:</span>
                <button
                  onClick={() => setAutoSpeed(1800)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1800
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Pelan
                </button>
                <button
                  onClick={() => setAutoSpeed(1400)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1400
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setAutoSpeed(900)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 900
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Cepat
                </button>
              </div>
            </div>

          </div>

          {/* 26 Alphabet Grid (A - Z) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>Pilih huruf A sampai Z di bawah ini:</span>
              <span>26 Huruf Abjad Lengkap 🔤</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-2">
              {ALPHABET_DATA.map((item, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.letter}
                    onClick={() => handleSelectLetter(idx)}
                    className={`h-14 sm:h-16 rounded-2xl font-display font-black transition-all transform active:scale-90 flex flex-col items-center justify-center border-2 ${
                      isSelected
                        ? `bg-gradient-to-tr ${item.color} text-white border-white shadow-lg scale-105 z-10 ring-4 ring-pink-300 dark:ring-pink-900`
                        : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-800'
                    }`}
                  >
                    <span className="text-lg sm:text-xl leading-none">{item.letter}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUIZ TEBAK HURUF */}
      {mode === 'quiz' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-amber-300 dark:border-amber-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">❓</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Tebak Huruf Ceria!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Dengarkan suaranya, lalu pilih tombol huruf yang benar di bawah ini:
            </p>
          </div>

          {/* Voice Prompt Box */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => speakQuizPrompt(quizTarget)}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-display font-black text-sm"
            >
              <Volume2 className="w-7 h-7 text-yellow-200 animate-pulse" />
              <span>Dengarkan Suara Huruf 🔊</span>
            </button>

            <div className="text-xl sm:text-2xl font-display font-black tracking-wide">
              "Mana huruf {quizTarget.letter}? ({quizTarget.word} {quizTarget.emoji})"
            </div>
          </div>

          {/* Feedback Banner */}
          {quizFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🎉 HEBAT SEKALI! BENAR! +10 POIN ✨
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
                key={item.letter}
                onClick={() => handleQuizAnswer(item)}
                className={`py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.color} text-white font-display font-black text-4xl sm:text-5xl shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-3 border-white`}
              >
                <span>{item.letter}</span>
                <span className="text-xs font-bold opacity-90">{item.word} {item.emoji}</span>
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
              className="text-amber-600 dark:text-amber-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Soal
            </button>
          </div>

        </div>
      )}

      {/* MODE 3: LENGKAPI KATA */}
      {mode === 'word' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-indigo-300 dark:border-indigo-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">🔤</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Lengkapi Huruf Depan Kata!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Pilih huruf yang tepat untuk melengkapi kata bergambar berikut:
            </p>
          </div>

          {/* Picture Word Card */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <span className="text-6xl sm:text-7xl animate-bounce">
              {wordTarget.emoji}
            </span>

            <div className="text-3xl sm:text-4xl font-display font-black tracking-widest bg-white/20 px-6 py-2 rounded-2xl backdrop-blur-md">
              <span className="border-b-4 border-yellow-300 text-yellow-300 inline-block px-1">_</span>
              <span>{wordTarget.word.slice(1)}</span>
            </div>
          </div>

          {/* Feedback Banner */}
          {wordFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🌟 HEBAT SEKALI! HURUF {wordTarget.letter} BENAR! +10 POIN ✨
            </div>
          )}
          {wordFeedback === 'wrong' && (
            <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-lg animate-shake shadow-md">
              ❌ Belum pas! Perhatikan huruf awal kata ini ya! 💡
            </div>
          )}

          {/* Choices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wordOptions.map((letter) => (
              <button
                key={letter}
                onClick={() => handleWordAnswer(letter)}
                className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border-2 border-slate-300 dark:border-slate-600 font-display font-black text-3xl text-slate-800 dark:text-white active:scale-95 transition-all shadow-sm"
              >
                {letter}
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
              className="text-indigo-600 dark:text-indigo-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Kata
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
