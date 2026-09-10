import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Award, Sparkles, HelpCircle, Grid } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CountingGameProps {
  onBack: () => void;
}

// Convert numbers 1..100 to Indonesian text
export function numberToIndonesianWords(num: number): string {
  if (num === 100) return 'Seratus';
  
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
  
  if (num < 10) return units[num];
  if (num === 10) return 'Sepuluh';
  if (num === 11) return 'Sebelas';
  if (num < 20) return units[num % 10] + ' Belas';
  
  const tens = Math.floor(num / 10);
  const remainder = num % 10;
  
  if (remainder === 0) {
    return units[tens] + ' Puluh';
  }
  return units[tens] + ' Puluh ' + units[remainder];
}

// Emojis for item visualization
const ITEM_EMOJIS = ['🍎', '⭐', '🎈', '🚗', '🐱', '🌸', '🍭', '🚀', '🦆', '🍓', '🐶', '⚽', '🍦', '🎨', '🦁'];

export const CountingGame: React.FC<CountingGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'grid' | 'quiz' | 'sequence'>('grid');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1200); // ms per step
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Quiz Mode state
  const [quizTarget, setQuizTarget] = useState<number>(1);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Sequence Mode state
  const [seqStart, setSeqStart] = useState<number>(1);
  const [seqMissingIndex, setSeqMissingIndex] = useState<number>(2); // 0, 1, 2, or 3
  const [seqOptions, setSeqOptions] = useState<number[]>([]);
  const [seqFeedback, setSeqFeedback] = useState<'correct' | 'wrong' | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speech synthesis helper
  const speakNumber = (num: number) => {
    if (muted) return;

    // Use Web Speech API if available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const text = `${num}! ${numberToIndonesianWords(num)}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.2; // Cheerful higher pitch for children
      
      // Fallback: try finding an Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback beep tone
      sound.playClick();
    }
  };

  const handleSelectNumber = (num: number) => {
    setSelectedNumber(num);
    speakNumber(num);
  };

  // Auto count 1 to 100 logic
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setTimeout(() => {
        setSelectedNumber((prev) => {
          const next = (prev || 0) >= 100 ? 1 : (prev || 0) + 1;
          speakNumber(next);
          return next;
        });
      }, autoSpeed);
    } else {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    }

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [isAutoPlaying, selectedNumber, autoSpeed]);

  const toggleAutoPlay = () => {
    sound.playClick();
    if (!isAutoPlaying) {
      if (!selectedNumber || selectedNumber >= 100) {
        setSelectedNumber(1);
        speakNumber(1);
      }
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying(false);
    }
  };

  // Setup Quiz mode
  const generateNewQuiz = () => {
    const target = Math.floor(Math.random() * 100) + 1;
    setQuizTarget(target);
    setQuizFeedback(null);

    // Generate 3 wrong options
    const optionsSet = new Set<number>([target]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
      let wrong = target + offset;
      if (wrong < 1) wrong = Math.floor(Math.random() * 100) + 1;
      if (wrong > 100) wrong = Math.floor(Math.random() * 100) + 1;
      optionsSet.add(wrong);
    }

    // Shuffle options
    const optionsArr = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    setQuizOptions(optionsArr);

    // Speak prompt after a brief delay
    setTimeout(() => {
      if (!muted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Coba tebak mana angka ${target}? ${numberToIndonesianWords(target)}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.25;
        window.speechSynthesis.speak(utterance);
      }
    }, 200);
  };

  // Setup Sequence mode
  const generateNewSequence = () => {
    const start = Math.floor(Math.random() * 94) + 1; // start between 1 and 94
    const missing = Math.floor(Math.random() * 4); // index 0..3
    setSeqStart(start);
    setSeqMissingIndex(missing);
    setSeqFeedback(null);

    const correctAns = start + missing;
    const optionsSet = new Set<number>([correctAns]);
    while (optionsSet.size < 4) {
      const wrong = Math.floor(Math.random() * 100) + 1;
      if (wrong !== correctAns) optionsSet.add(wrong);
    }
    setSeqOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (mode === 'quiz') generateNewQuiz();
    if (mode === 'sequence') generateNewSequence();
    if (mode !== 'grid') setIsAutoPlaying(false);
  }, [mode]);

  const handleQuizAnswer = (num: number) => {
    if (quizFeedback !== null) return;

    if (num === quizTarget) {
      setQuizFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Hore! Benar sekali! Ini angka ${num}, ${numberToIndonesianWords(num)}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.3;
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => {
        generateNewQuiz();
      }, 1800);
    } else {
      setQuizFeedback('wrong');
      sound.playClick();
      setStreak(0);

      if (!muted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Belum tepat! Coba lagi yuk!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1200);
    }
  };

  const handleSeqAnswer = (num: number) => {
    if (seqFeedback !== null) return;
    const correctAns = seqStart + seqMissingIndex;

    if (num === correctAns) {
      setSeqFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 10);
      setStreak((st) => st + 1);

      if (!muted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Hebat! Urutan angka ${correctAns} benar!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.25;
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => {
        generateNewSequence();
      }, 1800);
    } else {
      setSeqFeedback('wrong');
      sound.playClick();
      setStreak(0);
      setTimeout(() => {
        setSeqFeedback(null);
      }, 1200);
    }
  };

  const chosenEmoji = ITEM_EMOJIS[(selectedNumber || 1) % ITEM_EMOJIS.length];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-pop-in select-none">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
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
              <span className="text-2xl animate-bounce">🔢</span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                Game Berhitung Ceria 1-100
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              Belajar angka 1 sampai 100 dengan Suara Bahasa Indonesia & Audio Interaktif!
            </p>
          </div>
        </div>

        {/* Controls Header */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
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

      {/* Mode Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
        <button
          onClick={() => {
            sound.playClick();
            setMode('grid');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'grid'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Papan Angka 1-100</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setMode('quiz');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'quiz'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tebak Angka Ceria</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setMode('sequence');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'sequence'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Urutan Bintang</span>
        </button>
      </div>

      {/* MODE 1: GRID & EXPLORATION */}
      {mode === 'grid' && (
        <div className="space-y-5">
          {/* Active Highlight Display Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-amber-300 dark:border-amber-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Big Active Number */}
            <div className="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
              <div
                onClick={() => selectedNumber && speakNumber(selectedNumber)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 text-white font-display font-black text-4xl sm:text-5xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-700 relative group"
                title="Klik untuk dengarkan suara angka!"
              >
                {selectedNumber || '?'}
                <div className="absolute bottom-1 right-2 text-xs bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-0.5">
                  <Volume2 className="w-3 h-3 text-yellow-200" />
                </div>
              </div>

              <div className="space-y-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                  Pengucapan Bahasa Indonesia
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white capitalize">
                  {selectedNumber ? numberToIndonesianWords(selectedNumber) : 'Pilih Angka'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tekan tombol angka di bawah untuk mendengarkan suaranya!
                </p>
              </div>
            </div>

            {/* Visual Item Counter (e.g. 5 Apples) */}
            {selectedNumber && selectedNumber <= 30 && (
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-72 flex flex-col items-center">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Jumlah Objek ({selectedNumber}):
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto p-1 custom-scrollbar">
                  {Array.from({ length: selectedNumber }).map((_, idx) => (
                    <span key={idx} className="text-xl sm:text-2xl animate-pop-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      {chosenEmoji}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-Play Count Controls */}
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
                <span>{isAutoPlaying ? 'Hentikan Berhitung' : 'Hitung Otomatis (1-100)'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Kecepatan:</span>
                <button
                  onClick={() => setAutoSpeed(1600)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1600
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Pelan
                </button>
                <button
                  onClick={() => setAutoSpeed(1100)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 1100
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setAutoSpeed(700)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                    autoSpeed === 700
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Cepat
                </button>
              </div>
            </div>

          </div>

          {/* 100 Numbers Grid (10x10) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>Pilih angka 1 sampai 100:</span>
              <span>100 Angka Lengkap 🎯</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
              {Array.from({ length: 100 }).map((_, idx) => {
                const num = idx + 1;
                const isSelected = selectedNumber === num;

                // Alternate cheerful color hues per row
                const row = Math.floor((num - 1) / 10);
                const bgHues = [
                  'hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 border-rose-200',
                  'hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 border-amber-200',
                  'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 border-emerald-200',
                  'hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 border-sky-200',
                  'hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 border-indigo-200',
                  'hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 border-purple-200',
                  'hover:bg-pink-50 dark:hover:bg-pink-950/40 text-pink-600 border-pink-200',
                  'hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-600 border-teal-200',
                  'hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 border-orange-200',
                  'hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-600 border-cyan-200',
                ];

                return (
                  <button
                    key={num}
                    onClick={() => handleSelectNumber(num)}
                    className={`h-11 sm:h-12 rounded-xl sm:rounded-2xl font-display font-black text-sm sm:text-base transition-all transform active:scale-90 flex items-center justify-center border-2 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white border-orange-400 shadow-lg scale-105 z-10'
                        : `bg-slate-50 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-700/60 ${bgHues[row % bgHues.length]}`
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUIZ TEBAK ANGKA */}
      {mode === 'quiz' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-pink-300 dark:border-pink-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">❓</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Tebak Angka Ceria!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Dengarkan suaranya, lalu pilih tombol angka yang benar di bawah ini:
            </p>
          </div>

          {/* Voice Prompt Box */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const text = `Coba tebak mana angka ${quizTarget}? ${numberToIndonesianWords(quizTarget)}`;
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.lang = 'id-ID';
                  utterance.pitch = 1.25;
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-display font-black text-sm"
            >
              <Volume2 className="w-7 h-7 text-yellow-200 animate-pulse" />
              <span>Dengarkan Lagi Suara Angka</span>
            </button>

            <div className="text-xl sm:text-2xl font-display font-black tracking-wide">
              "Mana angka {numberToIndonesianWords(quizTarget)}?"
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
            {quizOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleQuizAnswer(option)}
                className="py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-slate-700/80 hover:bg-pink-100 dark:hover:bg-pink-950/50 border-3 border-slate-200 dark:border-slate-600 font-display font-black text-3xl sm:text-4xl text-slate-800 dark:text-white shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
              >
                <span>{option}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {numberToIndonesianWords(option)}
                </span>
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
              className="text-pink-600 dark:text-pink-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Soal
            </button>
          </div>

        </div>
      )}

      {/* MODE 3: URUTAN BINTANG */}
      {mode === 'sequence' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-indigo-300 dark:border-indigo-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="space-y-2">
            <span className="text-4xl inline-block animate-bounce">⭐</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Lengkapi Urutan Bintang!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Temukan angka berurutan yang hilang pada deret bintang berikut:
            </p>
          </div>

          {/* Sequence Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
            {[0, 1, 2, 3].map((idx) => {
              const numVal = seqStart + idx;
              const isMissing = idx === seqMissingIndex;

              return (
                <div
                  key={idx}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-md border-3 transition-all ${
                    isMissing
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-dashed border-amber-500 text-amber-600 dark:text-amber-300 animate-pulse scale-105'
                      : 'bg-indigo-600 text-white border-indigo-400'
                  }`}
                >
                  {isMissing ? '?' : numVal}
                  <span className="text-[9px] font-bold opacity-80 mt-0.5">
                    {isMissing ? 'Cari Me' : '⭐'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {seqFeedback === 'correct' && (
            <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-lg animate-bounce shadow-md">
              🌟 BINTANG HEBAT! URUTAN BENAR! +10 POIN ✨
            </div>
          )}
          {seqFeedback === 'wrong' && (
            <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-lg animate-shake shadow-md">
              ❌ Kurang pas! Perhatikan urutan angkanya ya! 💡
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {seqOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSeqAnswer(opt)}
                className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border-2 border-slate-300 dark:border-slate-600 font-display font-black text-2xl text-slate-800 dark:text-white active:scale-95 transition-all shadow-sm"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold pt-2">
            <span>Level Urutan: 🔥 {streak}</span>
            <button
              onClick={() => {
                sound.playClick();
                generateNewSequence();
              }}
              className="text-indigo-600 dark:text-indigo-400 underline font-extrabold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ganti Urutan
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
