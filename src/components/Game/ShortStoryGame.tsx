import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Award, BookOpen, Play, Pause, Info, Volume1, ChevronRight, ChevronLeft, Heart } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ShortStoryGameProps {
  onBack: () => void;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  emoji: string;
  illustration: string;
}

export interface StoryBook {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  moralLesson: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  pages: StoryPage[];
}

export const STORIES_DATA: StoryBook[] = [
  {
    id: 'lion-mouse',
    title: 'Singa Baik Hati & Tikus Kecil',
    category: 'Persahabatan & Kebaikan',
    icon: '🦁',
    color: 'from-amber-500 to-orange-600',
    moralLesson: 'Kebaikan sekecil apapun tidak akan pernah sia-sia. Saling membantu membuat hidup indah!',
    quizQuestion: 'Mengapa Tikus Kecil membantu Singa?',
    quizOptions: [
      'Karena Singa dulu pernah memaafkan & melepaskannya',
      'Karena Tikus ingin mengambil mahkota Singa',
      'Karena Tikus takut pada hutan',
      'Karena Tikus ingin makan buah'
    ],
    correctOptionIndex: 0,
    pages: [
      {
        pageNumber: 1,
        text: 'Di sebuah hutan yang indah, hiduplah seekor Singa yang perkasa. Suatu hari, seekor Tikus kecil tidak sengaja melintas di depan Singa.',
        emoji: '🦁',
        illustration: '🌲🦁🐭🌲'
      },
      {
        pageNumber: 2,
        text: 'Singa tersenyum ramah dan berkata: "Kecil, jangan takut! Aku tidak akan menyakitimu." Tikus sangat berterima kasih atas kebaikan Singa.',
        emoji: '🤝',
        illustration: '✨🦁❤️🐭✨'
      },
      {
        pageNumber: 3,
        text: 'Beberapa hari kemudian, Singa terperangkap di dalam jala pemburu. Singa meraung meminta bantuan ke seluruh hutan!',
        emoji: '🕸️',
        illustration: '🕸️🦁🕸️'
      },
      {
        pageNumber: 4,
        text: 'Tikus kecil mendengar raungan Singa dan segera berlari cepat. Dengan giginya yang tajam, Tikus menggigit jala sampai terputus!',
        emoji: '🐭',
        illustration: '✂️🐭🕸️🦁✨'
      },
      {
        pageNumber: 5,
        text: 'Singa pun bebas! Singa dan Tikus tersenyum bahagia dan menjadi sahabat sejati selamanya.',
        emoji: '🎉',
        illustration: '🏆🦁❤️🐭🎉'
      }
    ]
  },
  {
    id: 'rabbit-turtle',
    title: 'Kelinci Ceria & Kura-kura Gigih',
    category: 'Ketekunan & Rendah Hati',
    icon: '🐰',
    color: 'from-emerald-500 to-teal-600',
    moralLesson: 'Ketekunan, kesabaran, dan sifat tidak sombong akan selalu membuahkan hasil terbaik!',
    quizQuestion: 'Mengapa Kura-kura bisa memenangkan perlombaan?',
    quizOptions: [
      'Karena Kura-kura terus berjalan tekun tanpa menyerah',
      'Karena Kelinci terbang di angkasa',
      'Karena Kura-kura berlari sangat cepat',
      'Karena Kura-kura membawa sepeda'
    ],
    correctOptionIndex: 0,
    pages: [
      {
        pageNumber: 1,
        text: 'Kelinci yang lincah mengajak Kura-kura untuk berlomba lari santai di padang rumput yang hijau ceria.',
        emoji: '🐰',
        illustration: '🌱🐰🐢🌱'
      },
      {
        pageNumber: 2,
        text: 'Saat lomba dimulai, Kelinci berlari sangat cepat melesat ke depan, sedangkan Kura-kura berjalan pelan tapi pasti.',
        emoji: '⚡',
        illustration: '💨🐰 ....... 🐢'
      },
      {
        pageNumber: 3,
        text: 'Kelinci merasa sudah sangat jauh di depan, lalu ia tertidur santai di bawah pohon rindang yang sejuk.',
        emoji: '😴',
        illustration: '🌳😴🐰🌳'
      },
      {
        pageNumber: 4,
        text: 'Kura-kura terus melangkah langkah demi langkah tanpa berhenti dan tanpa mengeluh.',
        emoji: '🐢',
        illustration: '🚶‍♂️🐢💨 (Melangkah Tekun)'
      },
      {
        pageNumber: 5,
        text: 'Kura-kura akhirnya mencapai garis finish lebih dulu! Kelinci terbangun dan memberi selamat dengan senyuman hangat.',
        emoji: '🏁',
        illustration: '🏁🏆🐢👏🐰🎉'
      }
    ]
  },
  {
    id: 'ant-grasshopper',
    title: 'Semut Rajin & Belalang Pemusik',
    category: 'Kerjasama & Kerajinan',
    icon: '🐜',
    color: 'from-pink-500 to-rose-600',
    moralLesson: 'Bekerja rajin dan bersiap diri akan mendatangkan kedamaian dan kebahagiaan di masa depan!',
    quizQuestion: 'Apa yang dilakukan Kawanan Semut di musim panas?',
    quizOptions: [
      'Bekerja sama mengumpulkan makanan dengan gembira',
      'Bermain di dalam air laut',
      'Tidur sepanjang hari',
      'Terbang ke awan'
    ],
    correctOptionIndex: 0,
    pages: [
      {
        pageNumber: 1,
        text: 'Di musim panas yang cerah, kawanan Semut rajin bekerja sama mengumpulkan makanan segar untuk persiapan musim hujan.',
        emoji: '🐜',
        illustration: '☀️🐜🌾🐜🌾'
      },
      {
        pageNumber: 2,
        text: 'Belalang pemusik menyanyi ceria sambil memainkan biola. Ia mengajak Semut untuk ikut bernyanyi bersama.',
        emoji: '🎻',
        illustration: '🎶🦗🎻✨'
      },
      {
        pageNumber: 3,
        text: 'Semut menjawab ramah: "Ayo kita kumpulkan makanan dulu yuk, agar saat hujan tiba kita punya cukup persediaan!"',
        emoji: '🌾',
        illustration: '🐜💬 "Yuk siapkan makanan!"'
      },
      {
        pageNumber: 4,
        text: 'Saat musim hujan tiba, rumah Semut sangat hangat dan penuh dengan makanan lezat yang melimpah.',
        emoji: '🌧️',
        illustration: '🌧️🏠🍞🍇🍎 (Rumah Hangat)'
      },
      {
        pageNumber: 5,
        text: 'Semut mengajak Belalang masuk ke rumah hangat mereka, berbagi makanan lezat, dan bernyanyi bersama dengan gembira!',
        emoji: '🥳',
        illustration: '🥳🐜❤️🦗🎶🎉'
      }
    ]
  },
  {
    id: 'elephant-bird',
    title: 'Gajah Penolong & Burung Pipit',
    category: 'Tolong Menolong',
    icon: '🐘',
    color: 'from-indigo-500 to-purple-600',
    moralLesson: 'Gunakan kekuatan kita untuk menolong dan melindungi sesama yang membutuhkan!',
    quizQuestion: 'Bagaimana Gajah menolong Burung Pipit?',
    quizOptions: [
      'Mengambilkan buah di pohon tinggi dengan belalainya yang panjang',
      'Mengajak Burung menyelam di laut',
      'Membuatkan mobil-mobilan',
      'Membawa Burung ke bulan'
    ],
    correctOptionIndex: 0,
    pages: [
      {
        pageNumber: 1,
        text: 'Gajah yang ramah berjalan-jalan di hutan sambil menyapa kawan-kawannya dengan ceria.',
        emoji: '🐘',
        illustration: '🌳🐘🌸🌳'
      },
      {
        pageNumber: 2,
        text: 'Burung Pipit kecil tampak kebingungan karena buah manis idamannya ada di dahan pohon yang sangat tinggi.',
        emoji: '🐦',
        illustration: '🌳🍎 (Tinggi) 🐦'
      },
      {
        pageNumber: 3,
        text: 'Gajah tersenyum dan memanjangkan belalainya yang kuat untuk mengambilkan buah manis itu.',
        emoji: '🍎',
        illustration: '🐘✨🌾🍎 ➔ 🐦'
      },
      {
        pageNumber: 4,
        text: 'Burung Pipit bernyanyi merdu mengungkapkan rasa bahagianya kepada Gajah yang baik hati.',
        emoji: '🎶',
        illustration: '🎶🐦❤️🐘🎶'
      },
      {
        pageNumber: 5,
        text: 'Mereka berdua menikmati buah manis bersama-sama di bawah naungan pohon yang sejuk.',
        emoji: '🥰',
        illustration: '🥰🐘🍎🐦🌳✨'
      }
    ]
  }
];

export const ShortStoryGame: React.FC<ShortStoryGameProps> = ({ onBack }) => {
  const [activeStory, setActiveStory] = useState<StoryBook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isReadingAudio, setIsReadingAudio] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [showMobileTip, setShowMobileTip] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

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

  // Story Narration Speech Helper
  const speakCurrentPage = (story: StoryBook, pageIdx: number) => {
    if (muted) return;

    sound.playClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.cancel();

        const page = story.pages[pageIdx];
        if (!page) return;

        const text = `Halaman ${page.pageNumber}. ${page.text}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.88; // Calm storytelling pace
        utterance.pitch = 1.15; // Cheerful friendly pitch

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

        utterance.onstart = () => setIsReadingAudio(true);
        utterance.onend = () => setIsReadingAudio(false);
        utterance.onerror = () => setIsReadingAudio(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech playback warning:', e);
        setIsReadingAudio(false);
      }
    }
  };

  const handleSelectStory = (story: StoryBook) => {
    unlockAudioEngine();
    setActiveStory(story);
    setCurrentPageIndex(0);
    setShowQuizModal(false);
    setQuizFeedback(null);
    speakCurrentPage(story, 0);
  };

  const handleNextPage = () => {
    unlockAudioEngine();
    if (!activeStory) return;

    if (currentPageIndex < activeStory.pages.length - 1) {
      const nextIdx = currentPageIndex + 1;
      setCurrentPageIndex(nextIdx);
      speakCurrentPage(activeStory, nextIdx);
    } else {
      // Story finished! Show moral quiz
      sound.playVictory();
      setShowQuizModal(true);
    }
  };

  const handlePrevPage = () => {
    unlockAudioEngine();
    if (!activeStory) return;

    if (currentPageIndex > 0) {
      const prevIdx = currentPageIndex - 1;
      setCurrentPageIndex(prevIdx);
      speakCurrentPage(activeStory, prevIdx);
    }
  };

  const toggleNarration = () => {
    unlockAudioEngine();
    if (isReadingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsReadingAudio(false);
    } else if (activeStory) {
      speakCurrentPage(activeStory, currentPageIndex);
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    unlockAudioEngine();
    if (!activeStory || quizFeedback !== null) return;

    if (optionIdx === activeStory.correctOptionIndex) {
      setQuizFeedback('correct');
      sound.playSuccess();
      setScore((s) => s + 20);

      if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Masya Allah! Jawabanmu tepat sekali! Kamu mendapat 20 poin kebaikan!`);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.25;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
    } else {
      setQuizFeedback('wrong');
      sound.playClick();
      setTimeout(() => setQuizFeedback(null), 1200);
    }
  };

  const currentPage = activeStory?.pages[currentPageIndex];

  return (
    <div
      onClick={unlockAudioEngine}
      onTouchStart={unlockAudioEngine}
      className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-pop-in select-none"
    >
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              if (activeStory) {
                setActiveStory(null);
              } else {
                onBack();
              }
            }}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md active:scale-95 transition-all text-white"
            title="Kembali"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">📚</span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                {activeStory ? activeStory.title : 'Cerita Pendek & Dongeng Ceria'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              {activeStory ? activeStory.category : 'Cerita edukatif penuh pesan kebaikan & audio pendongeng!'}
            </p>
          </div>
        </div>

        {/* Controls Header */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowMobileTip(!showMobileTip)}
            className="p-2.5 sm:p-3 rounded-2xl bg-amber-300/30 hover:bg-amber-300/40 backdrop-blur-md font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white transition-all"
            title="Bantuan Suara di HP"
          >
            <Info className="w-5 h-5 text-yellow-200" />
            <span className="hidden sm:inline">Tips HP</span>
          </button>

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
              <span className="font-extrabold block text-sm">💡 Solusi Suara Dongeng di Handphone:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                <li><strong>Matikan Mode Hening (Silent Switch)</strong> di bodi HP Anda.</li>
                <li><strong>Naikkan Volume Media / Musik HP</strong>.</li>
                <li><strong>Ketuk tombol "Bacakan Cerita 🔊"</strong> di bawah untuk mendengarkan dongeng!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              unlockAudioEngine();
              setShowMobileTip(false);
              if (activeStory) speakCurrentPage(activeStory, currentPageIndex);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display font-black rounded-xl text-xs shadow-md shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tes Suara Dongeng 🔊</span>
          </button>
        </div>
      )}

      {/* STORY SELECTOR GRID */}
      {!activeStory ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
            <span>Pilih judul cerita dongeng ceria di bawah ini:</span>
            <span>4 Dongeng Favorit 📚</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STORIES_DATA.map((story) => (
              <div
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-rose-200 dark:border-slate-700 shadow-md flex flex-col justify-between space-y-4 hover:scale-[1.02] cursor-pointer transition-all group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${story.color} text-white flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                      {story.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black">
                      {story.pages.length} Halaman 📖
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {story.category}
                    </span>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-0.5">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 font-medium line-clamp-2">
                      💡 <em>"{story.moralLesson}"</em>
                    </p>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${story.color} text-white font-display font-black text-xs shadow-md flex items-center justify-center gap-2 group-hover:opacity-95 transition-all`}
                >
                  <BookOpen className="w-4 h-4 fill-white" />
                  <span>BACA & DENGARKAN CERITA</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE STORYBOOK READER */
        <div className="space-y-5 animate-pop-in">
          
          {/* Storybook Display Box */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border-3 border-amber-300 dark:border-amber-800 shadow-xl space-y-6 text-center relative">
            
            {/* Page Number & Audio Control Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                  Halaman {currentPageIndex + 1} dari {activeStory.pages.length}
                </span>
              </div>

              <button
                onClick={toggleNarration}
                className={`px-4 py-2 rounded-2xl font-display font-black text-xs flex items-center gap-2 transition-all shadow-sm ${
                  isReadingAudio
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isReadingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isReadingAudio ? 'Hentikan Suara ⏸️' : 'Bacakan Halaman Ini 🔊'}</span>
              </button>
            </div>

            {/* Illustration Display */}
            {currentPage && (
              <div className="space-y-5 py-4">
                <div className="text-6xl sm:text-8xl tracking-widest animate-bounce drop-shadow-md">
                  {currentPage.illustration}
                </div>

                {/* Story Paragraph Card */}
                <div className="bg-amber-50 dark:bg-slate-900/60 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900 max-w-2xl mx-auto shadow-inner">
                  <p className="font-display font-bold text-lg sm:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed sm:leading-loose">
                    "{currentPage.text}"
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className={`px-5 py-3 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                  currentPageIndex === 0
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white active:scale-95'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Halaman Sebelum</span>
              </button>

              <button
                onClick={handleNextPage}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:opacity-95 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>{currentPageIndex === activeStory.pages.length - 1 ? 'Selesai & Kuis Kebaikan 🏆' : 'Halaman Lanjut'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Moral Lesson Footer Card */}
          <div className="bg-rose-50 dark:bg-rose-950/60 p-4 sm:p-5 rounded-3xl border-2 border-rose-200 dark:border-rose-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 shrink-0 animate-pulse" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Pesan Kebaikan Cerita:
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                "{activeStory.moralLesson}"
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MORAL QUIZ MODAL */}
      {showQuizModal && activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-5 border-4 border-amber-400 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                Kuis Kebaikan Cerita (+20 Poin)
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                {activeStory.quizQuestion}
              </h3>
            </div>

            {/* Quiz Feedback */}
            {quizFeedback === 'correct' && (
              <div className="p-3 bg-emerald-500 text-white font-display font-black rounded-2xl text-base animate-bounce shadow-md">
                🎉 MASYA ALLAH! BENAR SEKALI! +20 POIN KEBAIKAN! ✨
              </div>
            )}
            {quizFeedback === 'wrong' && (
              <div className="p-3 bg-rose-500 text-white font-display font-black rounded-2xl text-base animate-shake shadow-md">
                ❌ Coba ingat lagi isi ceritanya ya! 💪
              </div>
            )}

            {/* Options */}
            <div className="space-y-2.5 text-left">
              {activeStory.quizOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/80 hover:bg-amber-100 dark:hover:bg-amber-950/60 border-2 border-slate-200 dark:border-slate-600 font-display font-bold text-xs sm:text-sm text-slate-800 dark:text-white transition-all active:scale-98 flex items-center gap-3"
                >
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentPageIndex(0);
                  setShowQuizModal(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-display font-black text-xs active:scale-95 transition-all"
              >
                BACA LAGI 🔄
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveStory(null);
                  setShowQuizModal(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
              >
                PILIH CERITA LAIN 📚
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
