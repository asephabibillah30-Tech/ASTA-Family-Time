import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Volume1, VolumeX, Award, HelpCircle, Grid, Play, Pause, Sparkles, Filter, Flame } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface VehicleGameProps {
  onBack: () => void;
}

export interface VehicleItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  soundText: string;
  fact: string;
  category: 'Darat' | 'Udara' | 'Laut' | 'Konstruksi';
  riddle: string;
}

export const VEHICLE_DATA: VehicleItem[] = [
  {
    id: 'v-1',
    name: 'Mobil',
    emoji: '🚗',
    color: 'from-rose-500 to-red-600',
    soundText: 'Brumm brumm!',
    fact: 'Kendaraan roda empat favorit keluarga untuk bepergian ke mana saja!',
    category: 'Darat',
    riddle: 'Aku punya 4 roda, bisa membawa keluarga bepergian dengan aman dan nyaman di jalan raya. Siapakah aku?'
  },
  {
    id: 'v-2',
    name: 'Bus',
    emoji: '🚌',
    color: 'from-amber-500 to-orange-600',
    soundText: 'Telolet telolet brumm!',
    fact: 'Kendaraan besar yang dapat mengangkut banyak penumpang bersama-sama!',
    category: 'Darat',
    riddle: 'Badanku panjang dan besar, bisa mengangkut puluhan penumpang sekaligus di jalan raya. Siapakah aku?'
  },
  {
    id: 'v-3',
    name: 'Kereta Api',
    emoji: '🚂',
    color: 'from-slate-700 to-slate-900',
    soundText: 'Tut tut gujes gujes!',
    fact: 'Berjalan cepat di atas rel baja yang sangat panjang!',
    category: 'Darat',
    riddle: 'Aku punya banyak gerbong dan hanya bisa berjalan di atas lintasan rel khusus. Siapakah aku?'
  },
  {
    id: 'v-4',
    name: 'Sepeda Motor',
    emoji: '🏍️',
    color: 'from-blue-600 to-indigo-700',
    soundText: 'Ngeeng ngeeng!',
    fact: 'Kendaraan roda dua yang lincah dan hemat bahan bakar!',
    category: 'Darat',
    riddle: 'Aku beroda dua, digerakkan mesin kencang, dan pengendaranya wajib memakai helm. Siapakah aku?'
  },
  {
    id: 'v-5',
    name: 'Sepeda',
    emoji: '🚲',
    color: 'from-emerald-500 to-teal-600',
    soundText: 'Kring kring!',
    fact: 'Kendaraan ramah lingkungan tanpa mesin yang dikayuh dengan kaki!',
    category: 'Darat',
    riddle: 'Aku punya dua roda dan rantai, dikayuh pakai kaki untuk menyehatkan tubuh. Siapakah aku?'
  },
  {
    id: 'v-6',
    name: 'Truk Besar',
    emoji: '🚛',
    color: 'from-amber-600 to-orange-700',
    soundText: 'Brumm brumm berat!',
    fact: 'Mengangkut barang-barang berat dan muatan besar antar kota!',
    category: 'Darat',
    riddle: 'Aku membawa bak besar di belakang untuk mengangkut barang berat antar kota. Siapakah aku?'
  },
  {
    id: 'v-7',
    name: 'Mobil Pemadam',
    emoji: '🚒',
    color: 'from-red-600 to-rose-700',
    soundText: 'Nwiuu nwiuu siren pemadam!',
    fact: 'Mobil pahlawan yang membawa tangga dan selang air untuk memadamkan api!',
    category: 'Darat',
    riddle: 'Warnaku merah, punya sirine keras dan selang air besar untuk memadamkan kebakaran. Siapakah aku?'
  },
  {
    id: 'v-8',
    name: 'Mobil Ambulans',
    emoji: '🚑',
    color: 'from-sky-500 to-blue-600',
    soundText: 'Nwiuu nwiuu sirine darurat!',
    fact: 'Membawa orang sakit dan terluka cepat sampai ke rumah sakit!',
    category: 'Darat',
    riddle: 'Aku membawa pasien sakit ke rumah sakit dengan sirine darurat di atas atapku. Siapakah aku?'
  },
  {
    id: 'v-9',
    name: 'Mobil Polisi',
    emoji: '🚓',
    color: 'from-indigo-600 to-blue-800',
    soundText: 'Nwiuu nwiuu sirine patroli!',
    fact: 'Digunakan petugas kepolisian menjaga keamanan dan ketertiban jalan raya!',
    category: 'Darat',
    riddle: 'Aku dikendarai polisi untuk menjaga keamanan warga dan patroli jalan raya. Siapakah aku?'
  },
  {
    id: 'v-10',
    name: 'Taksi',
    emoji: '🚕',
    color: 'from-yellow-400 to-amber-500',
    soundText: 'Brumm jemput penumpang!',
    fact: 'Kendaraan umum yang menjemput dan mengantar penumpang ke mana saja!',
    category: 'Darat',
    riddle: 'Warnaku sering kuning, mengantar penumpang ke tujuan sesuai permintaan. Siapakah aku?'
  },
  {
    id: 'v-11',
    name: 'Pesawat Terbang',
    emoji: '✈️',
    color: 'from-cyan-500 to-blue-600',
    soundText: 'Wuuussh terbang tinggi!',
    fact: 'Terbang tinggi menembus awan mengarungi antar kota dan negara!',
    category: 'Udara',
    riddle: 'Memiliki dua sayap besar dan bisa terbang cepat menembus awan di langit. Siapakah aku?'
  },
  {
    id: 'v-12',
    name: 'Helikopter',
    emoji: '🚁',
    color: 'from-teal-500 to-emerald-600',
    soundText: 'Brak-brak-brak baling-baling!',
    fact: 'Memiliki baling-baling di atasnya dan bisa mendarat tegak lurus!',
    category: 'Udara',
    riddle: 'Aku punya baling-baling berputar di atas kepala dan bisa terbang tanpa landasan pacu. Siapakah aku?'
  },
  {
    id: 'v-13',
    name: 'Balon Udara',
    emoji: '🎈',
    color: 'from-pink-500 to-rose-600',
    soundText: 'Melayang tenang di udara!',
    fact: 'Melayang indah di langit menggunakan udara panas yang dihembuskan!',
    category: 'Udara',
    riddle: 'Aku melayang di langit menggunakan balon raksasa berisi udara panas. Siapakah aku?'
  },
  {
    id: 'v-14',
    name: 'Roket',
    emoji: '🚀',
    color: 'from-violet-600 to-purple-800',
    soundText: '3.. 2.. 1.. Meluncur ke luar angkasa!',
    fact: 'Meluncur super cepat menembus atmosfer menuju bulan dan antariksa!',
    category: 'Udara',
    riddle: 'Aku mengeluarkan api kencang di ekor untuk meluncur sampai ke bulan dan planet. Siapakah aku?'
  },
  {
    id: 'v-15',
    name: 'Kapal Laut',
    emoji: '🚢',
    color: 'from-blue-600 to-sky-700',
    soundText: 'Nguuut tuuud sirine laut!',
    fact: 'Berlayar mengarungi samudra luas membawa penumpang dan kargo besar!',
    category: 'Laut',
    riddle: 'Aku berlayar di atas samudra air laut membawa ratusan penumpang dan kargo. Siapakah aku?'
  },
  {
    id: 'v-16',
    name: 'Kapal Selam',
    emoji: '🤿',
    color: 'from-slate-800 to-slate-950',
    soundText: 'Glub glub menyelam dalam!',
    fact: 'Kendaraan canggih yang bisa menyelam jauh di bawah permukaan laut!',
    category: 'Laut',
    riddle: 'Aku bisa menyelam jauh di dasar samudra tanpa kemasukan air laut. Siapakah aku?'
  },
  {
    id: 'v-17',
    name: 'Perahu Kayuh',
    emoji: '🚣',
    color: 'from-amber-700 to-stone-800',
    soundText: 'Keprak keprik mendayung!',
    fact: 'Digerakkan dengan tenaga kayuhan tangan manusia di atas sungai atau danau!',
    category: 'Laut',
    riddle: 'Aku mengapung di danau atau sungai dan digerakkan dengan dua dayung kayu. Siapakah aku?'
  },
  {
    id: 'v-18',
    name: 'Kapal Layar',
    emoji: '⛵',
    color: 'from-sky-400 to-blue-500',
    soundText: 'Terbang diterpa angin laut!',
    fact: 'Berlayar di laut memanfaatkan dorongan angin pada layarnya!',
    category: 'Laut',
    riddle: 'Aku punya layar putih besar yang mengembang ketika ditiup angin laut. Siapakah aku?'
  },
  {
    id: 'v-19',
    name: 'Jet Ski',
    emoji: '🛥️',
    color: 'from-orange-500 to-red-600',
    soundText: 'Wush kencang di air!',
    fact: 'Motor air kencang yang sangat seru untuk olahraga air di pantai!',
    category: 'Laut',
    riddle: 'Aku seperti sepeda motor tapi khusus meluncur kencang di atas air laut. Siapakah aku?'
  },
  {
    id: 'v-20',
    name: 'Ekskavator (Bego)',
    emoji: '🏗️',
    color: 'from-yellow-500 to-amber-600',
    soundText: 'Brumm pengeruk tanah!',
    fact: 'Alat berat dengan lengan pengeruk besar untuk menggali tanah dan pondasi!',
    category: 'Konstruksi',
    riddle: 'Aku punya lengan robot pengeruk besar untuk menggali tanah di proyek bangunan. Siapakah aku?'
  },
  {
    id: 'v-21',
    name: 'Traktor Sawah',
    emoji: '🚜',
    color: 'from-green-600 to-emerald-700',
    soundText: 'Brumm bajak sawah!',
    fact: 'Kendaraan tangguh pembantu petani membajak sawah dan ladang!',
    category: 'Konstruksi',
    riddle: 'Rodaku besar dan bergerigi, bertugas membajak tanah sawah Pak Tani. Siapakah aku?'
  }
];

export const VehicleGame: React.FC<VehicleGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'grid' | 'quiz' | 'riddle'>('grid');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(2000);
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);

  // Quiz state
  const [quizTarget, setQuizTarget] = useState<VehicleItem>(VEHICLE_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<VehicleItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Riddle state
  const [riddleTarget, setRiddleTarget] = useState<VehicleItem>(VEHICLE_DATA[0]);
  const [riddleOptions, setRiddleOptions] = useState<VehicleItem[]>([]);
  const [riddleFeedback, setRiddleFeedback] = useState<'correct' | 'wrong' | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredVehicles = VEHICLE_DATA.filter((v) => {
    if (selectedCategory === 'all') return true;
    return v.category === selectedCategory;
  });

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
    }
  }, []);

  const speakVehicleItem = (item: VehicleItem) => {
    if (muted) return;
    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const text = `Kendaraan ${item.name}! ${item.emoji}. Suara: ${item.soundText}. ${item.fact}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('id') ||
            v.lang.toLowerCase().includes('indonesia') ||
            v.name.toLowerCase().includes('indonesia')
        );
        if (idVoice) utterance.voice = idVoice;

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech error:', e);
      }
    }
  };

  const speakText = (text: string) => {
    if (muted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1.15;
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.toLowerCase().includes('id'));
        if (idVoice) utterance.voice = idVoice;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const handleSelectVehicle = (item: VehicleItem) => {
    unlockAudioEngine();
    const idx = VEHICLE_DATA.findIndex((v) => v.id === item.id);
    if (idx !== -1) setSelectedIndex(idx);
    speakVehicleItem(item);
  };

  // Auto-play slideshow logic
  useEffect(() => {
    if (isAutoPlaying && mode === 'grid') {
      autoTimerRef.current = setTimeout(() => {
        setSelectedIndex((prev) => {
          const next = prev >= VEHICLE_DATA.length - 1 ? 0 : prev + 1;
          speakVehicleItem(VEHICLE_DATA[next]);
          return next;
        });
      }, autoSpeed);
    } else {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    }
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [isAutoPlaying, selectedIndex, autoSpeed, mode]);

  // Quiz setup
  const generateQuiz = () => {
    setQuizFeedback(null);
    const target = VEHICLE_DATA[Math.floor(Math.random() * VEHICLE_DATA.length)];
    setQuizTarget(target);

    const distractors: VehicleItem[] = [];
    while (distractors.length < 3) {
      const rand = VEHICLE_DATA[Math.floor(Math.random() * VEHICLE_DATA.length)];
      if (rand.id !== target.id && !distractors.some((d) => d.id === rand.id)) {
        distractors.push(rand);
      }
    }

    const allOpts = [...distractors, target].sort(() => Math.random() - 0.5);
    setQuizOptions(allOpts);

    setTimeout(() => {
      speakText(`Coba tebak, mana kendaraan ${target.name}? ${target.soundText}`);
    }, 200);
  };

  // Riddle setup
  const generateRiddle = () => {
    setRiddleFeedback(null);
    const target = VEHICLE_DATA[Math.floor(Math.random() * VEHICLE_DATA.length)];
    setRiddleTarget(target);

    const distractors: VehicleItem[] = [];
    while (distractors.length < 3) {
      const rand = VEHICLE_DATA[Math.floor(Math.random() * VEHICLE_DATA.length)];
      if (rand.id !== target.id && !distractors.some((d) => d.id === rand.id)) {
        distractors.push(rand);
      }
    }

    const allOpts = [...distractors, target].sort(() => Math.random() - 0.5);
    setRiddleOptions(allOpts);

    setTimeout(() => {
      speakText(`Dengarkan teka-teki: ${target.riddle}`);
    }, 200);
  };

  const handleModeChange = (newMode: 'grid' | 'quiz' | 'riddle') => {
    unlockAudioEngine();
    sound.playClick();
    setIsAutoPlaying(false);
    setMode(newMode);

    if (newMode === 'quiz') generateQuiz();
    if (newMode === 'riddle') generateRiddle();
  };

  const handleAnswerQuiz = (item: VehicleItem) => {
    if (quizFeedback !== null) return;

    if (item.id === quizTarget.id) {
      setQuizFeedback('correct');
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      sound.playSuccess();
      fireBurstConfetti();
      speakText(`Hore! Benar sekali! Ini kendaraan ${item.name}! ${item.fact}`);

      setTimeout(() => {
        generateQuiz();
      }, 3000);
    } else {
      setQuizFeedback('wrong');
      setStreak(0);
      sound.playTimerWarning();
      speakText(`Tetot! Belum tepat, coba pilih kendaraan lainnya ya!`);

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1500);
    }
  };

  const handleAnswerRiddle = (item: VehicleItem) => {
    if (riddleFeedback !== null) return;

    if (item.id === riddleTarget.id) {
      setRiddleFeedback('correct');
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      sound.playSuccess();
      fireBurstConfetti();
      speakText(`Hebat luar biasa! Jawabanmu benar! Ini adalah ${item.name}!`);

      setTimeout(() => {
        generateRiddle();
      }, 3000);
    } else {
      setRiddleFeedback('wrong');
      setStreak(0);
      sound.playTimerWarning();
      speakText(`Tetot! Belum tepat, baca baik-baik teka-tekinya!`);

      setTimeout(() => {
        setRiddleFeedback(null);
      }, 1500);
    }
  };

  const currentHeroVehicle = VEHICLE_DATA[selectedIndex] || VEHICLE_DATA[0];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-5 animate-pop-in">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🚗✈️🚢</span>
          <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
            Mengenal Kendaraan
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-950 px-3 py-1.5 rounded-2xl text-xs font-black text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Streak: {streak}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 px-3 py-1.5 rounded-2xl text-xs font-black text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Skor: {score}</span>
          </div>

          <button
            onClick={() => {
              if (!audioUnlocked) setAudioUnlocked(true);
              setMuted(!muted);
            }}
            className={`p-2 rounded-2xl border transition-all ${
              muted
                ? 'bg-rose-100 dark:bg-rose-950 border-rose-300 text-rose-600'
                : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-700'
            }`}
            title={muted ? 'Suara Hening' : 'Suara Aktif'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Mode Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800/90 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleModeChange('grid')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              mode === 'grid'
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Galeri Kendaraan</span>
          </button>

          <button
            onClick={() => handleModeChange('quiz')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              mode === 'quiz'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Kuis Tebak Gambar</span>
          </button>

          <button
            onClick={() => handleModeChange('riddle')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              mode === 'riddle'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Teka-Teki Kendaraan</span>
          </button>
        </div>

        {/* Auto Play Controls (only in Grid Mode) */}
        {mode === 'grid' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                unlockAudioEngine();
                setIsAutoPlaying(!isAutoPlaying);
                sound.playClick();
              }}
              className={`px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                isAutoPlaying
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoPlaying ? 'Hentikan Putar Otomatis' : 'Putar Otomatis'}</span>
            </button>

            <select
              value={autoSpeed}
              onChange={(e) => setAutoSpeed(Number(e.target.value))}
              className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none border border-slate-300 dark:border-slate-600"
            >
              <option value={3000}>Pelan (3 dtk)</option>
              <option value={2000}>Sedang (2 dtk)</option>
              <option value={1200}>Cepat (1.2 dtk)</option>
            </select>
          </div>
        )}
      </div>

      {/* MODE 1: GALERI KENDARAAN */}
      {mode === 'grid' && (
        <div className="space-y-5">
          
          {/* Active Highlight Card */}
          <div className={`bg-gradient-to-r ${currentHeroVehicle.color} p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300`}>
            <div className="space-y-2 text-center md:text-left z-10">
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/20 tracking-wider">
                Kategori: {currentHeroVehicle.category}
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl">
                {currentHeroVehicle.name}
              </h3>
              <p className="text-sm text-white/90 font-extrabold flex items-center justify-center md:justify-start gap-2">
                <Volume1 className="w-4 h-4" /> Suara: "{currentHeroVehicle.soundText}"
              </p>
              <p className="text-xs sm:text-sm text-white/95 max-w-xl font-medium bg-black/10 p-3 rounded-2xl backdrop-blur-xs">
                💡 {currentHeroVehicle.fact}
              </p>
              <button
                onClick={() => speakVehicleItem(currentHeroVehicle)}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-100 flex items-center justify-center md:justify-start gap-2 transition-all active:scale-95 mx-auto md:mx-0"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Dengarkan Nama & Suara</span>
              </button>
            </div>

            <div className="text-8xl sm:text-9xl drop-shadow-2xl animate-bounce shrink-0 z-10">
              {currentHeroVehicle.emoji}
            </div>

            {/* Background Accent */}
            <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10 select-none pointer-events-none">
              {currentHeroVehicle.emoji}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Kategori:
            </span>
            {[
              { id: 'all', label: 'Semua Kendaraan', emoji: '🚀' },
              { id: 'Darat', label: 'Darat', emoji: '🚗' },
              { id: 'Udara', label: 'Udara', emoji: '✈️' },
              { id: 'Laut', label: 'Laut', emoji: '🚢' },
              { id: 'Konstruksi', label: 'Konstruksi', emoji: '🚜' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredVehicles.map((item) => {
              const isSelected = item.id === currentHeroVehicle.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectVehicle(item)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 relative ${
                    isSelected
                      ? 'bg-gradient-to-tr from-blue-50 to-sky-100 dark:from-slate-800 dark:to-slate-700 border-blue-500 shadow-md scale-105'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:scale-102'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl transition-transform group-hover:scale-110 drop-shadow-sm">
                    {item.emoji}
                  </span>
                  <div>
                    <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[120px]">
                      {item.soundText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODE 2: KUIS TEBAK KENDARAAN */}
      {mode === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-3xl text-white shadow-lg text-center space-y-3">
            <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-white/20 tracking-wider">
              KUIS TEBAK KENDARAAN
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl">
              "Mana kendaraan {quizTarget.name}?" {quizTarget.emoji}
            </h3>
            <p className="text-xs text-amber-100 max-w-md mx-auto">
              Dengarkan petunjuk suara: "{quizTarget.soundText}" lalu ketuk gambar yang tepat di bawah ini!
            </p>
            <button
              onClick={() => speakText(`Mana kendaraan ${quizTarget.name}? ${quizTarget.soundText}`)}
              className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-100 flex items-center gap-1.5 mx-auto active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Putar Suara Ulang</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {quizFeedback === 'correct' && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-black text-center text-sm shadow-md animate-bounce">
              🎉 HORE! BENAR SEAKALI! (+10 SKOR) 🌟
            </div>
          )}
          {quizFeedback === 'wrong' && (
            <div className="p-4 rounded-2xl bg-rose-500 text-white font-black text-center text-sm shadow-md animate-shake">
              ❌ WADUH! BELUM TEPAT. COBA LAGI YA!
            </div>
          )}

          {/* Quiz Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {quizOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswerQuiz(opt)}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-sm group"
              >
                <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </span>
                <span className="font-display font-black text-base text-slate-900 dark:text-white">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: TEKA-TEKI KENDARAAN */}
      {mode === 'riddle' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 rounded-3xl text-white shadow-lg text-center space-y-4">
            <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-white/20 tracking-wider">
              TEKA-TEKI KENDARAAN
            </span>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mx-auto shadow-inner">
              🧩
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto">
              "{riddleTarget.riddle}"
            </h3>
            <button
              onClick={() => speakText(`Dengarkan teka-teki: ${riddleTarget.riddle}`)}
              className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-purple-100 flex items-center gap-1.5 mx-auto active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Bacakan Teka-Teki</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {riddleFeedback === 'correct' && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-black text-center text-sm shadow-md animate-bounce">
              🌟 JAWABANMU TEPAT SEKALI! KAMU HEBAT! (+10 SKOR) 🎉
            </div>
          )}
          {riddleFeedback === 'wrong' && (
            <div className="p-4 rounded-2xl bg-rose-500 text-white font-black text-center text-sm shadow-md animate-shake">
              ❌ BELUM TEPAT. BACA KEMBALI TEKA-TEKINYA YA!
            </div>
          )}

          {/* Riddle Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {riddleOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswerRiddle(opt)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-sm group"
              >
                <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </span>
                <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
