import React, { useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types/game';
import { DrawingCanvas } from './DrawingCanvas';
import { 
  ArrowLeft, Clock, Award, Send, 
  Sparkles, MessageSquare, Users, Crown, Pencil
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface ArtFrenzyGameProps {
  players: Player[];
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isCorrect?: boolean;
  isSystem?: boolean;
  timestamp: string;
}

// Database of family-friendly Indonesian secret words with categories
const SECRET_WORDS_DB = [
  { word: 'JERAPAH', category: 'Hewan', hint: 'Lehernya sangat panjang' },
  { word: 'KUCING', category: 'Hewan', hint: 'Suka nge-meow dan makan ikan' },
  { word: 'KUE ULANG TAHUN', category: 'Makanan', hint: 'Ada lilin di atasnya saat merayakan umur' },
  { word: 'SEPEDA', category: 'Kendaraan', hint: 'Dikayuh dengan dua roda' },
  { word: 'RUMAH', category: 'Bangunan', hint: 'Tempat berkumpul keluarga' },
  { word: 'PESAWAT', category: 'Kendaraan', hint: 'Terbang di udara dengan sayap' },
  { word: 'PELANGI', category: 'Alam', hint: 'Muncul setelah hujan dengan 7 warna' },
  { word: 'BUNGA', category: 'Tanaman', hint: 'Wangi dan mekar di taman' },
  { word: 'KACAMATA', category: 'Benda', hint: 'Dipakai di mata untuk melihat lebih jelas' },
  { word: 'GAJAH', category: 'Hewan', hint: 'Punya belalai panjang dan telinga lebar' },
  { word: 'ES KRIM', category: 'Makanan', hint: 'Manis, dingin, dan cepat meleleh' },
  { word: 'MATAHARI', category: 'Alam', hint: 'Bersinar terang di siang hari' },
  { word: 'PIZZA', category: 'Makanan', hint: 'Roti bulat potongan segitiga dari Italia' },
  { word: 'KURA KURA', category: 'Hewan', hint: 'Jalannya lambat dan punya tempurung keras' },
  { word: 'PISANG', category: 'Buah', hint: 'Warna kuning kesukaan monyet' },
  { word: 'NAGA', category: 'Mitos', hint: 'Makhluk mitos yang mengeluarkan api' },
];

export const ArtFrenzyGame: React.FC<ArtFrenzyGameProps> = ({ players: initialPlayers, onBack }) => {
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers.length > 0
      ? initialPlayers
      : [
          { id: '1', name: 'Aris', avatar: '👦', score: 1250, cardsCompleted: 0, color: 'bg-blue-500' },
          { id: '2', name: 'Bella', avatar: '👧', score: 980, cardsCompleted: 0, color: 'bg-pink-500' },
          { id: '3', name: 'Papa Asep', avatar: '👨‍💼', score: 760, cardsCompleted: 0, color: 'bg-purple-500' },
          { id: '4', name: 'Mamah Ita', avatar: '👩‍💼', score: 550, cardsCompleted: 0, color: 'bg-amber-500' },
        ]
  );

  const [currentRound, setCurrentRound] = useState(1);
  const maxRounds = 10;
  const [drawerIndex, setDrawerIndex] = useState(0);

  const currentDrawer = players[drawerIndex % players.length];
  const [activeWordObj, setActiveWordObj] = useState(SECRET_WORDS_DB[0]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRoundActive, setIsRoundActive] = useState(true);
  
  // Chat & Guess Stream
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Bella', text: 'Semangat menggambar!', timestamp: '14:30' },
    { id: '2', senderName: 'Sistem', text: '🎮 Ronde baru dimulai! Tebak gambar lukisan Aris!', isSystem: true, timestamp: '14:30' },
  ]);

  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'players' | 'chat'>('canvas');
  const [roundWinnerMsg, setRoundWinnerMsg] = useState<string | null>(null);

  // Pick a new word for a new round
  const pickNewWord = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SECRET_WORDS_DB.length);
    setActiveWordObj(SECRET_WORDS_DB[randomIdx]);
    setRevealedHints([]);
    setTimeLeft(60);
    setIsRoundActive(true);
    setRoundWinnerMsg(null);
  }, []);

  // Handle Turn Rotation
  const advanceTurn = useCallback(() => {
    sound.playCardShuffle();
    if (currentRound >= maxRounds) {
      setIsRoundActive(false);
      sound.playVictory();
      fireBurstConfetti();
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setDrawerIndex((prev) => prev + 1);
    pickNewWord();

    const nextDrawer = players[(drawerIndex + 1) % players.length];
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderName: 'Sistem',
        text: `🎨 Giliran menggambar selanjutnya: ${nextDrawer.name}!`,
        isSystem: true,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentRound, drawerIndex, maxRounds, pickNewWord, players]);

  // Round Timer Countdown Loop
  useEffect(() => {
    if (!isRoundActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sound.playTimerEnd();
          setChatMessages((msg) => [
            ...msg,
            {
              id: Date.now().toString(),
              senderName: 'Sistem',
              text: `⏰ Waktu habis! Kata rahasianya adalah: ${activeWordObj.word}`,
              isSystem: true,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setTimeout(() => {
            advanceTurn();
          }, 2500);
          return 0;
        }

        // Auto-reveal letter hints at 40s and 20s
        if (prev === 40 || prev === 20) {
          const unrevealedIdxs = activeWordObj.word
            .split('')
            .map((char, i) => (char !== ' ' ? i : -1))
            .filter((i) => i !== -1 && !revealedHints.includes(i));
          
          if (unrevealedIdxs.length > 0) {
            const randomIdx = unrevealedIdxs[Math.floor(Math.random() * unrevealedIdxs.length)];
            setRevealedHints((h) => [...h, randomIdx]);
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, activeWordObj, revealedHints, advanceTurn]);

  // Handle Guess Submission
  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const cleanInput = guessInput.trim().toUpperCase();
    const cleanSecret = activeWordObj.word.toUpperCase();

    sound.playClick();
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Check if guess is correct
    if (cleanInput === cleanSecret) {
      sound.playSuccess();
      fireBurstConfetti();
      setIsRoundActive(false);

      const guesserName = 'Bella (Anda)'; // Current user guess
      const bonusGuesser = 100;
      const bonusDrawer = 50;

      // Update Scores
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === currentDrawer.id) return { ...p, score: p.score + bonusDrawer };
          return { ...p, score: p.score + bonusGuesser };
        })
      );

      const winnerText = `🎉 BENAR! Kata rahasianya: ${activeWordObj.word}! (+100 PTS)`;
      setRoundWinnerMsg(winnerText);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderName: guesserName,
          text: guessInput,
          isCorrect: true,
          timestamp: nowTime,
        },
        {
          id: (Date.now() + 1).toString(),
          senderName: 'Sistem',
          text: winnerText,
          isSystem: true,
          timestamp: nowTime,
        },
      ]);

      setGuessInput('');

      // Move to next turn after 3s
      setTimeout(() => {
        advanceTurn();
      }, 3000);
    } else {
      // Incorrect guess
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderName: 'Bella',
          text: guessInput,
          timestamp: nowTime,
        },
      ]);
      setGuessInput('');
    }
  };

  // Generate Masked Secret Word (e.g. "J E R A P A H" -> "_ E _ A _ A _")
  const renderMaskedWord = () => {
    return activeWordObj.word.split('').map((char, idx) => {
      if (char === ' ') return '   ';
      if (revealedHints.includes(idx)) return `${char} `;
      return '_ ';
    }).join('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 space-y-3 font-body select-none">
      
      {/* 1. TOP TITLE & HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border-3 border-indigo-200 dark:border-slate-800 shadow-bubbly-indigo flex items-center justify-between gap-3">
        
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all shadow-2xs"
            title="Kembali ke Hub Game"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base sm:text-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                ART FRENZY
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[9px] uppercase">
                🎨 GAYA DESAIN REFERENSI
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:block">
              Game Lukisan & Tebak Gambar Interaktif Keluarga
            </p>
          </div>
        </div>

        {/* Center/Right: Round & Score Badges */}
        <div className="flex items-center gap-2">
          {/* Round Badge */}
          <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-sm flex items-center gap-1">
            <span>ROUND</span>
            <span className="text-amber-300">{currentRound}/{maxRounds}</span>
          </div>

          {/* Leader Score */}
          <div className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-sm hidden sm:flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span>TOP: {Math.max(...players.map(p => p.score))} PTS</span>
          </div>
        </div>

      </div>

      {/* 2. GAME STATUS BAR (Drawer Name, Timer Countdown, Secret Word Display) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-3 sm:p-4 text-white border-2 border-indigo-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Current Drawer Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-2xl">
              {currentDrawer.avatar}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm sm:text-lg text-white">
                {currentDrawer.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Pelukis
              </span>
            </div>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Sisa Waktu: 00:{String(timeLeft).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Center: Secret Word for Drawer or Hint for Guessers */}
        <div className="bg-white/10 backdrop-blur-md px-4 sm:px-6 py-2 rounded-2xl border border-white/20 text-center w-full sm:w-auto">
          <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
            {currentDrawer.name === 'Aris' ? 'Kata Rahasia Anda (Lukis Ini!)' : `Kategori: ${activeWordObj.category}`}
          </div>
          <div className="font-display font-black text-lg sm:text-2xl text-amber-300 tracking-wider">
            {currentDrawer.name === 'Aris' ? activeWordObj.word : renderMaskedWord()}
          </div>
          {activeWordObj.hint && (
            <div className="text-[10px] text-slate-300 font-medium italic mt-0.5">
              Petunjuk: "{activeWordObj.hint}"
            </div>
          )}
        </div>

      </div>

      {/* Mobile Tab Toggle Buttons (Canvas / Players / Chat) */}
      <div className="flex sm:hidden items-center justify-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTabMobile('canvas')}
          className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
            activeTabMobile === 'canvas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          🎨 Canvas
        </button>
        <button
          onClick={() => setActiveTabMobile('players')}
          className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
            activeTabMobile === 'players' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          👥 Pemain ({players.length})
        </button>
        <button
          onClick={() => setActiveTabMobile('chat')}
          className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
            activeTabMobile === 'chat' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          💬 Tebakan ({chatMessages.length})
        </button>
      </div>

      {/* 3. MAIN GAMEPLAY BODY (Responsive 3-Column Layout on Desktop matching screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left/Center: DRAWING CANVAS AREA (Cols 1-8 on Desktop) */}
        <div className={`lg:col-span-8 space-y-3 ${activeTabMobile !== 'canvas' ? 'hidden sm:block' : 'block'}`}>
          {roundWinnerMsg && (
            <div className="bg-emerald-500 text-white p-3 rounded-2xl font-display font-black text-sm text-center shadow-lg animate-bounce flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>{roundWinnerMsg}</span>
            </div>
          )}

          <DrawingCanvas
            isReadOnly={false}
            width={800}
            height={520}
          />
        </div>

        {/* Right Sidebars: PLAYERS LEADERBOARD & CHAT STREAM (Cols 9-12 on Desktop) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* A. PLAYERS LEADERBOARD PANEL (Matching right side top card in screenshot) */}
          <div className={`bg-rose-50 dark:bg-slate-800 rounded-3xl p-4 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-3 ${activeTabMobile !== 'players' && activeTabMobile !== 'canvas' ? 'hidden sm:block' : 'block'}`}>
            <div className="flex items-center justify-between border-b pb-2 border-rose-200 dark:border-slate-700">
              <h3 className="font-display font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                <span>PEMAIN ({players.length})</span>
              </h3>
              <span className="text-[10px] font-black bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">
                LIVE SCORE
              </span>
            </div>

            <div className="space-y-2">
              {players.map((p, idx) => {
                const isCurrentDrawer = p.id === currentDrawer.id;
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-2xl flex items-center justify-between border transition-all ${
                      isCurrentDrawer
                        ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 font-extrabold shadow-sm scale-[1.02]'
                        : 'bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{p.avatar}</span>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
                          <span>{p.name}</span>
                          {idx === 0 && <Crown className="w-3 h-3 text-amber-500 inline" />}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          {p.score} pts
                        </div>
                      </div>
                    </div>

                    {isCurrentDrawer && (
                      <span className="p-1.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Melukis</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. CHAT & GUESS STREAM PANEL (Matching right side bottom card in screenshot) */}
          <div className={`bg-amber-50 dark:bg-slate-800 rounded-3xl p-4 border-3 border-amber-200 dark:border-slate-700 shadow-bubbly-amber flex flex-col h-80 sm:h-96 ${activeTabMobile !== 'chat' && activeTabMobile !== 'canvas' ? 'hidden sm:flex' : 'flex'}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2 border-amber-200 dark:border-slate-700 shrink-0">
              <h3 className="font-display font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>OBROLAN & TEBAKAN</span>
              </h3>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-2xl text-[11px] leading-tight ${
                    msg.isSystem
                      ? 'bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-black text-center border border-amber-300'
                      : msg.isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-black border border-emerald-300'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {!msg.isSystem && (
                    <span className="font-black text-amber-800 dark:text-amber-300 mr-1">
                      {msg.senderName}:
                    </span>
                  )}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Guess Input Box (Matching bottom input in screenshot) */}
            <form onSubmit={handleSendGuess} className="mt-2 pt-2 border-t border-amber-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Ketik tebakan di sini..."
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-amber-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs shadow-md flex items-center gap-1 active:scale-95 transition-all shrink-0"
              >
                <span>KIRIM</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
