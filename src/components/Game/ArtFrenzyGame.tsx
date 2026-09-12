import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Player } from '../../types/game';
import { DrawingCanvas } from './DrawingCanvas';
import { 
  ArrowLeft, Clock, Send, 
  Sparkles, MessageSquare, Users, Crown, Pencil,
  Globe, Share2, Copy, Check, Play, Lightbulb, Zap, PlusCircle, RotateCcw, Home, Maximize
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

import type { UserAccount } from '../../types/auth';

interface ArtFrenzyGameProps {
  players: Player[];
  currentUser?: UserAccount;
  onBack: () => void;
}

export type PlayMode = 'solo_bot' | 'online_friends';

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isCorrect?: boolean;
  isSystem?: boolean;
  timestamp: string;
}

// Normalize strings for flexible guessing (removes spaces, hyphens, punctuation)
const normalizeWord = (str: string): string => {
  if (!str) return '';
  return str
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '');
};

// Database of family-friendly Indonesian secret words with categories
const SECRET_WORDS_DB = [
  { word: 'JERAPAH', category: 'Hewan 🐾', hint: 'Lehernya sangat panjang', colorClue: 'Kuning & Cokelat 🐆' },
  { word: 'KUCING', category: 'Hewan 🐾', hint: 'Suka nge-meow dan makan ikan', colorClue: 'Oranye / Abu-abu 🐈' },
  { word: 'KUE ULANG TAHUN', category: 'Makanan 🍕', hint: 'Ada lilin di atasnya saat merayakan umur', colorClue: 'Putih & Merah Muda 🎂' },
  { word: 'SEPEDA', category: 'Kendaraan 🚗', hint: 'Dikayuh dengan dua roda', colorClue: 'Biru & Hitam 🚲' },
  { word: 'RUMAH', category: 'Bangunan 🏠', hint: 'Tempat berkumpul keluarga', colorClue: 'Atap Merah & Dinding Kuning 🏠' },
  { word: 'PESAWAT', category: 'Kendaraan 🚗', hint: 'Terbang di udara dengan sayap', colorClue: 'Putih & Biru ✈️' },
  { word: 'PELANGI', category: 'Alam 🌺', hint: 'Muncul setelah hujan dengan 7 warna', colorClue: 'MeJiKuHiBiNiU 🌈' },
  { word: 'BUNGA', category: 'Tanaman 🌺', hint: 'Wangi dan mekar di taman', colorClue: 'Merah Muda & Hijau 🌸' },
  { word: 'KACAMATA', category: 'Benda 🏠', hint: 'Dipakai di mata untuk melihat lebih jelas', colorClue: 'Hitam / Transparan 👓' },
  { word: 'GAJAH', category: 'Hewan 🐾', hint: 'Punya belalai panjang dan telinga lebar', colorClue: 'Abu-abu 🐘' },
  { word: 'ES KRIM', category: 'Makanan 🍕', hint: 'Manis, dingin, dan cepat meleleh', colorClue: 'Cokelat & Merah Muda 🍦' },
  { word: 'MATAHARI', category: 'Alam 🌺', hint: 'Bersinar terang di siang hari', colorClue: 'Kuning Kunyit & Oranye ☀️' },
  { word: 'PIZZA', category: 'Makanan 🍕', hint: 'Roti bulat potongan segitiga dari Italia', colorClue: 'Kuning Keju & Red Pepperoni 🍕' },
  { word: 'KURA KURA', category: 'Hewan 🐾', hint: 'Jalannya lambat dan punya tempurung keras', colorClue: 'Hijau Tua & Cokelat 🐢' },
  { word: 'DONAT', category: 'Makanan 🍕', hint: 'Kue bulat bolong tengah berikat meses', colorClue: 'Cokelat & Merah Muda 🍩' },
  { word: 'NAGA', category: 'Mitos 🦸', hint: 'Makhluk mitos yang mengeluarkan api', colorClue: 'Merah Api & Emas 🐉' },
  { word: 'ROBOT', category: 'Teknologi 🤖', hint: 'Mesin canggih buatan manusia', colorClue: 'Perak & Biru 🤖' },
  { word: 'UFO ANGKASA', category: 'Angkasa 🛸', hint: 'Piring terbang makhluk alien', colorClue: 'Hijau & Perak 🛸' },
  { word: 'BERUANG TEDDY', category: 'Mainan 🧸', hint: 'Boneka beruang lucu empuk', colorClue: 'Cokelat Muda 🧸' },
  { word: 'MAHKOTA', category: 'Benda 👑', hint: 'Hiasan kepala raja dan ratu', colorClue: 'Kuning Emas & Permata 👑' },
  { word: 'BOLA SEPAK', category: 'Olahraga ⚽', hint: 'Ditendang ke gawang di lapangan', colorClue: 'Hitam & Putih ⚽' },
  { word: 'GITAR', category: 'Musik 🎸', hint: 'Alat musik petik 6 senar', colorClue: 'Cokelat Kayu 🎸' },
  { word: 'POHON KELAPA', category: 'Alam 🌴', hint: 'Tumbuh tinggi di pinggir pantai', colorClue: 'Hijau & Cokelat 🌴' },
  { word: 'DINOSAURUS', category: 'Mitos 🦕', hint: 'Hewan purba raksasa jutaan tahun lalu', colorClue: 'Hijau Tua 🦕' },
  { word: 'ROKET', category: 'Kendaraan 🚀', hint: 'Meluncur ke antariksa dan bulan', colorClue: 'Putih & Merah 🚀' },
  { word: 'PERAHU', category: 'Kendaraan ⛵', hint: 'Mengapung di laut dengan layar', colorClue: 'Cokelat & Putih ⛵' },
  { word: 'KUPU KUPU', category: 'Hewan 🦋', hint: 'Serangga cantik mengepakkan sayap', colorClue: 'Warna-Warni Indah 🦋' },
  { word: 'IKAN', category: 'Hewan 🐟', hint: 'Berenang di air menggunakan sirip', colorClue: 'Oranye / Biru 🐟' },
  { word: 'BUNGA MATAHARI', category: 'Tanaman 🌻', hint: 'Bunga besar berwarna kuning terang', colorClue: 'Kuning & Cokelat 🌻' },
];

const getSketchIdForWord = (word: string): string | null => {
  const w = word.toUpperCase();
  if (w.includes('RUMAH')) return 'house';
  if (w.includes('KUCING')) return 'cat';
  if (w.includes('KUE')) return 'cake';
  if (w.includes('MOBIL')) return 'car';
  if (w.includes('ES KRIM')) return 'ice_cream';
  if (w.includes('BUNGA MATAHARI')) return 'sunflower';
  if (w.includes('BUNGA')) return 'flower';
  if (w.includes('ROKET')) return 'rocket';
  if (w.includes('PERAHU')) return 'boat';
  if (w.includes('KUPU')) return 'butterfly';
  if (w.includes('IKAN')) return 'fish';
  if (w.includes('JERAPAH')) return 'giraffe';
  if (w.includes('GAJAH')) return 'elephant';
  if (w.includes('KURA')) return 'turtle';
  if (w.includes('PESAWAT')) return 'airplane';
  if (w.includes('SEPEDA')) return 'bicycle';
  if (w.includes('PIZZA')) return 'pizza';
  if (w.includes('DONAT')) return 'donut';
  if (w.includes('PELANGI')) return 'rainbow';
  if (w.includes('MATAHARI')) return 'sun_cloud';
  if (w.includes('DINOSAURUS')) return 'dinosaur';
  if (w.includes('NAGA')) return 'dragon';
  if (w.includes('ROBOT')) return 'robot';
  if (w.includes('UFO')) return 'alien_ufo';
  if (w.includes('BERUANG')) return 'teddy_bear';
  if (w.includes('MAHKOTA')) return 'crown';
  if (w.includes('KACAMATA')) return 'glasses';
  if (w.includes('BOLA')) return 'football';
  if (w.includes('GITAR')) return 'guitar';
  if (w.includes('KELAPA')) return 'palm_tree';
  return null;
};

export const ArtFrenzyGame: React.FC<ArtFrenzyGameProps> = ({ players: initialPlayers, currentUser, onBack }) => {
  const [playMode, setPlayMode] = useState<PlayMode>('solo_bot');
  const [showModeModal, setShowModeModal] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isForcedLandscapeMode, setIsForcedLandscapeMode] = useState(false);

  // Power-Up Boosters usage state per round
  const [hasUsedExtraLetters, setHasUsedExtraLetters] = useState(false);
  const [hasUsedAddTime, setHasUsedAddTime] = useState(false);

  // Dynamically resolve logged in user name and avatar
  const userFullName = currentUser?.fullName || (initialPlayers.length > 0 ? initialPlayers[0].name : 'Papa Asep');
  const userAvatar = currentUser?.avatar || (initialPlayers.length > 0 ? initialPlayers[0].avatar : '👨‍💼');
  const userDisplayName = userFullName.includes('(Anda)') ? userFullName : `${userFullName} (Anda)`;

  const getSoloPlayers = useCallback((): Player[] => [
    { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-blue-500', isOnline: true },
    { id: '2', name: 'Bot Bella 🤖', avatar: '👧', score: 0, cardsCompleted: 0, color: 'bg-pink-500', isOnline: true },
    { id: '3', name: 'Bot Papa 🤖', avatar: '👨‍💼', score: 0, cardsCompleted: 0, color: 'bg-purple-500', isOnline: true },
    { id: '4', name: 'Bot Mamah 🤖', avatar: '👩‍💼', score: 0, cardsCompleted: 0, color: 'bg-amber-500', isOnline: true },
  ], [userDisplayName, userAvatar]);

  const getOnlinePlayers = useCallback((): Player[] => {
    if (initialPlayers.length > 0) {
      const activeId = currentUser?.id || '';
      const activeName = (currentUser?.fullName || '').toLowerCase();
      
      const loggedInIndex = initialPlayers.findIndex(
        (p) => (activeId && p.id === activeId) || (activeName && p.name.toLowerCase().includes(activeName))
      );
      const activeIdx = loggedInIndex !== -1 ? loggedInIndex : 0;

      // Filter ONLY family members who are actually logged in and online
      const trulyOnlineMembers = initialPlayers.filter((p, idx) => Boolean(p.isOnline) || idx === activeIdx);

      return trulyOnlineMembers.map((p) => {
        const isMe = (activeId && p.id === activeId) || p.name.toLowerCase().includes(activeName);
        const cleanName = p.name.replace(/\s*\(Anda\)/gi, '');
        return {
          ...p,
          name: isMe ? `${cleanName} (Anda)` : cleanName,
          score: 0,
          cardsCompleted: 0,
          isOnline: isMe ? true : Boolean(p.isOnline),
        };
      });
    }
    return [
      { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-blue-500', isOnline: true },
      { id: '2', name: 'Bella', avatar: '👧', score: 0, cardsCompleted: 0, color: 'bg-pink-500', isOnline: true },
      { id: '3', name: 'Papa Asep', avatar: '👨‍💼', score: 0, cardsCompleted: 0, color: 'bg-purple-500', isOnline: true },
      { id: '4', name: 'Mamah Ita', avatar: '👩‍💼', score: 0, cardsCompleted: 0, color: 'bg-amber-500', isOnline: true },
    ];
  }, [initialPlayers, currentUser, userDisplayName, userAvatar]);

  const [players, setPlayers] = useState<Player[]>(getSoloPlayers());

  const getActiveUserPlayer = useCallback((playerList: Player[]): Player => {
    if (playerList.length === 0) return { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-blue-500', isOnline: true };
    return (
      playerList.find((p) => (currentUser?.id && p.id === currentUser.id) || p.name.includes('(Anda)')) ||
      playerList[0]
    );
  }, [currentUser, userDisplayName, userAvatar]);

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
    { id: '1', senderName: 'Bot Bella 🤖', text: 'Semangat menggambar!', timestamp: '14:30' },
    { id: '2', senderName: 'Sistem', text: '🎮 Mode Main Sendiri vs AI Bot Aktif! Tebak gambar lukisan!', isSystem: true, timestamp: '14:30' },
  ]);

  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'players' | 'chat'>('canvas');
  const [roundWinnerMsg, setRoundWinnerMsg] = useState<string | null>(null);

  // Keep ref for immediate round active check inside intervals to prevent race conditions
  const roundActiveRef = useRef<boolean>(isRoundActive);
  useEffect(() => {
    roundActiveRef.current = isRoundActive;
  }, [isRoundActive]);

  // Pick a new word for a new round
  const pickNewWord = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SECRET_WORDS_DB.length);
    setActiveWordObj(SECRET_WORDS_DB[randomIdx]);
    setRevealedHints([]);
    setHasUsedExtraLetters(false);
    setHasUsedAddTime(false);
    setTimeLeft(60);
    setIsRoundActive(true);
    roundActiveRef.current = true;
    setRoundWinnerMsg(null);
  }, []);

  // Force & Request Landscape Screen Orientation on Mobile/Tablet
  const handleRequestLandscape = useCallback(() => {
    sound.playClick();
    setIsForcedLandscapeMode((prev) => !prev);
    try {
      if (typeof window !== 'undefined') {
        const docEl = document.documentElement as any;
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {});
          } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen().catch(() => {});
          }
          if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
            (window.screen.orientation as any).lock('landscape').catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen().catch(() => {});
          }
          if (window.screen && window.screen.orientation && 'unlock' in window.screen.orientation) {
            window.screen.orientation.unlock();
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {}

    return () => {
      try {
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation && 'unlock' in window.screen.orientation) {
          window.screen.orientation.unlock();
        }
      } catch {}
    };
  }, []);

  const [showOnlineErrorModal, setShowOnlineErrorModal] = useState<boolean>(false);

  // Handle Mode Change
  const handleSelectMode = (mode: PlayMode) => {
    sound.playClick();

    if (mode === 'online_friends') {
      const onlineMembers = getOnlinePlayers();

      if (onlineMembers.length < 2) {
        sound.playSkip();
        setShowOnlineErrorModal(true);
        return;
      }
    }

    setPlayMode(mode);
    setShowModeModal(false);
    setShowOnlineErrorModal(false);
    setIsGameOver(false);
    setCurrentRound(1);
    setDrawerIndex(0);

    if (mode === 'solo_bot') {
      setPlayers(getSoloPlayers());
      setChatMessages([
        { id: '1', senderName: 'Sistem', text: '🤖 Mode Bermain Sendiri (vs AI Bot) dimulai! Nikmati permainan solo!', isSystem: true, timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } else {
      setPlayers(getOnlinePlayers());
      setChatMessages([
        { id: '1', senderName: 'Sistem', text: '🌐 Mode Teman Online Aktif! Kode Keluarga: ASTA-2026', isSystem: true, timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }

    pickNewWord();
  };

  // Handle Turn Rotation
  const advanceTurn = useCallback(() => {
    sound.playCardShuffle();
    if (currentRound >= maxRounds) {
      setIsRoundActive(false);
      roundActiveRef.current = false;
      setIsGameOver(true);
      sound.playVictory();
      fireBurstConfetti();

      // Persist final match bonus (+200 Love Points)
      try {
        const currentLovePoints = Number(localStorage.getItem('asta_family_love_points') || 100);
        localStorage.setItem('asta_family_love_points', String(currentLovePoints + 200));
        localStorage.setItem('asta_art_frenzy_last_match_complete', new Date().toISOString());
      } catch {}
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

  // Round Timer Countdown Loop & AI Bot Auto-Guessing in Solo Mode
  useEffect(() => {
    if (!isRoundActive || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Prevent interval tick if round has already been won/halted
        if (!roundActiveRef.current) return prev;

        if (prev <= 1) {
          clearInterval(timer);
          sound.playTimerEnd();
          roundActiveRef.current = false;
          setIsRoundActive(false);
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

        // AI Bot Automated Chat & Smart Guessing Logic when in Solo Mode
        if (playMode === 'solo_bot' && prev % 8 === 0 && prev > 5 && roundActiveRef.current) {
          const userPlayer = getActiveUserPlayer(players);
          const nonDrawerBots = players.filter((p) => p.id !== currentDrawer.id && p.id !== userPlayer.id);
          if (nonDrawerBots.length > 0) {
            const randomBot = nonDrawerBots[Math.floor(Math.random() * nonDrawerBots.length)];

            // Increased chance to guess correctly when user is drawing as time elapses
            const shouldGuessCorrectly = currentDrawer.id === userPlayer.id && prev <= 30 && Math.random() < 0.40;

            if (shouldGuessCorrectly && roundActiveRef.current) {
              roundActiveRef.current = false;
              setIsRoundActive(false);
              sound.playSuccess();
              fireBurstConfetti();

              const bonusGuesser = 100;
              const bonusDrawer = 50;

              // Give Bot +100 PTS (Guesser), User +50 PTS (Drawer)
              setPlayers((prevPlayers) =>
                prevPlayers.map((p) => {
                  if (p.id === randomBot.id) return { ...p, score: p.score + bonusGuesser, cardsCompleted: (p.cardsCompleted || 0) + 1 };
                  if (p.id === currentDrawer.id) return { ...p, score: p.score + bonusDrawer };
                  return p;
                })
              );

              const winnerText = `🎉 BENAR! ${randomBot.name} menebak lukisan Anda: ${activeWordObj.word}! (+100 PTS)`;
              setRoundWinnerMsg(winnerText);

              setChatMessages((msg) => [
                ...msg,
                {
                  id: Date.now().toString(),
                  senderName: randomBot.name,
                  text: activeWordObj.word,
                  isCorrect: true,
                  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                },
                {
                  id: (Date.now() + 1).toString(),
                  senderName: 'Sistem',
                  text: winnerText,
                  isSystem: true,
                  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                },
              ]);

              setTimeout(() => {
                advanceTurn();
              }, 3000);
            } else {
              // Incorrect attempt or hint question
              const wrongGuesses = [
                'Kucing?', 'Mobil?', 'Rumah?', 'Kue?', 'Matahari?', 'Gajah?', 'Pelangi?', 'Bunga?',
                'Donat?', 'Bintang?', 'Awan?', 'Sepeda?', 'Pohon?'
              ];
              const randomWrong = wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)];

              setChatMessages((msg) => [
                ...msg,
                {
                  id: Date.now().toString(),
                  senderName: randomBot.name,
                  text: randomWrong,
                  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, isGameOver, activeWordObj, revealedHints, advanceTurn, playMode, players, currentDrawer.id, getActiveUserPlayer]);

  // Power-Up 1: Extra Letters Hint (+2 Huruf)
  const handleUseExtraLetters = () => {
    if (hasUsedExtraLetters) return;
    sound.playFunnyBonus();
    setHasUsedExtraLetters(true);

    const unrevealedIdxs = activeWordObj.word
      .split('')
      .map((char, i) => (char !== ' ' ? i : -1))
      .filter((i) => i !== -1 && !revealedHints.includes(i));

    if (unrevealedIdxs.length > 0) {
      const picks = unrevealedIdxs.sort(() => 0.5 - Math.random()).slice(0, 2);
      setRevealedHints((prev) => [...prev, ...picks]);
    }
  };

  // Power-Up 2: Add Time (+15 Seconds)
  const handleUseAddTime = () => {
    if (hasUsedAddTime) return;
    sound.playClick();
    setHasUsedAddTime(true);
    setTimeLeft((prev) => prev + 15);
  };

  // Power-Up 3: Color Clue
  const handleUseColorClue = () => {
    sound.playClick();
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderName: 'Sistem',
        text: `🎨 Petunjuk Warna Khas Objek: ${activeWordObj.colorClue || 'Warna Warni'}`,
        isSystem: true,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Handle Guess Submission
  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const normInput = normalizeWord(guessInput);
    const normSecret = normalizeWord(activeWordObj.word);

    sound.playClick();
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Flexible normalized matching (handles spaces, hyphens, and partial matches like "kupu-kupu" vs "kupu kupu")
    const isCorrectGuess = 
      normInput === normSecret || 
      (normSecret.length >= 4 && (normInput === normSecret || normInput.includes(normSecret) || normSecret.includes(normInput)));

    if (isCorrectGuess) {
      roundActiveRef.current = false;
      setIsRoundActive(false);
      sound.playSuccess();
      fireBurstConfetti();

      const userPlayer = getActiveUserPlayer(players);
      const guesserId = userPlayer.id;
      const guesserName = userPlayer.name;
      const bonusGuesser = 100;
      const bonusDrawer = 50;

      // Update Scores strictly for Guesser and Drawer ONLY
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === guesserId && p.id === currentDrawer.id) {
            return { ...p, score: p.score + bonusGuesser + bonusDrawer, cardsCompleted: (p.cardsCompleted || 0) + 1 };
          }
          if (p.id === guesserId) {
            return { ...p, score: p.score + bonusGuesser, cardsCompleted: (p.cardsCompleted || 0) + 1 };
          }
          if (p.id === currentDrawer.id) {
            return { ...p, score: p.score + bonusDrawer };
          }
          return p;
        })
      );

      const winnerText = `🎉 BENAR! ${guesserName} menebak kata rahasia: ${activeWordObj.word}! (+100 PTS)`;
      setRoundWinnerMsg(winnerText);

      // Persist love points locally
      try {
        const currentLovePoints = Number(localStorage.getItem('asta_family_love_points') || 100);
        localStorage.setItem('asta_family_love_points', String(currentLovePoints + bonusGuesser));
      } catch {}

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
      const userPlayer = getActiveUserPlayer(players);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderName: userPlayer.name,
          text: guessInput,
          timestamp: nowTime,
        },
      ]);
      setGuessInput('');
    }
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText('ASTA-2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWA = () => {
    sound.playClick();
    const message = `🎨 *Main ASTA Art Frenzy (Tebak Gambar) Bersama!*\n` +
      `Yuk bergabung melukis & menebak gambar bareng keluarga sekarang di ASTA Family Time!\n\n` +
      `🔑 *Kode Ruang Keluarga:* ASTA-2026\n` +
      `👉 https://asta-family-time.vercel.app/`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Generate Masked Secret Word (e.g. "J E R A P A H" -> "_ E _ A _ A _")
  const renderMaskedWord = () => {
    return activeWordObj.word.split('').map((char, idx) => {
      if (char === ' ') return '   ';
      if (revealedHints.includes(idx)) return `${char} `;
      return '_ ';
    }).join('');
  };

  // Sorted players for Podium Ceremony
  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);

  return (
    <div
      className={
        isForcedLandscapeMode
          ? 'fixed inset-0 z-[9999] bg-slate-950 p-1.5 sm:p-2.5 w-screen h-screen overflow-y-auto touch-pan-y select-none font-body text-white flex flex-col justify-start gap-1.5'
          : 'w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 pb-32 sm:pb-16 space-y-3 font-body select-none'
      }
    >
      {/* 0. MULTIPLAYER ONLINE REQUIREMENT WARNING MODAL */}
      {showOnlineErrorModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 max-w-md w-full border-4 border-rose-400 dark:border-rose-600 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-md border-2 border-rose-300">
              🌐
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-[10px] uppercase tracking-wider">
                ⚠️ SYARAT MULTIPLAYER ONLINE
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-1.5">
                Minimal 2 Pemain Online & Login!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">
                Permainan <span className="font-bold text-rose-500">Teman Online</span> tidak dapat dimulai karena saat ini hanya <span className="font-black text-slate-900 dark:text-white">{getOnlinePlayers().length} pemain</span> yang sedang online.
              </p>
            </div>

            {/* List of Family Members & Online Status */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-left text-xs max-h-48 overflow-y-auto">
              <div className="font-black text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                Status Pemain Keluarga ({initialPlayers.length}):
              </div>
              {initialPlayers.map((p) => {
                const isUser = (currentUser?.id && p.id === currentUser.id) || p.name.includes('(Anda)');
                return (
                  <div key={p.id} className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{p.avatar}</span>
                      <span className="font-bold truncate text-slate-800 dark:text-slate-200">
                        {p.name} {isUser && '(Anda)'}
                      </span>
                    </div>
                    {p.isOnline ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-black">
                        🔴 OFFLINE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleShareWA}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>AJAK ANGGOTA KELUARGA (WHATSAPP)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowOnlineErrorModal(false);
                    handleSelectMode('solo_bot');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-xs shadow-sm flex items-center justify-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>MAIN SOLO (VS BOT)</span>
                </button>
                <button
                  onClick={() => setShowOnlineErrorModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs hover:bg-slate-300"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 0. MODE SELECTION MODAL */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl w-full border-4 border-amber-300 dark:border-slate-700 shadow-2xl space-y-5">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
                🎨
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                ASTA Art Frenzy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Pilih mode permainan favorit Anda untuk mulai melukis dan menebak gambar!
              </p>
            </div>

            {/* Mode Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              
              {/* Option 1: Bermain Sendiri (vs AI Bot) */}
              <button
                onClick={() => handleSelectMode('solo_bot')}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-700/80 border-3 border-amber-300 dark:border-amber-600 hover:scale-[1.02] active:scale-95 transition-all text-left space-y-2 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-amber-400 text-slate-900 text-xl font-black shadow-xs">
                      🤖
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[9px] font-black uppercase">
                      MAIN SENDIRI
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white mt-3">
                    Bermain Sendiri (vs AI Bot)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
                    Latihan melukis & menebak gambar secara solo melawan AI Bot Keluarga (Bot Bella, Bot Papa, Bot Mamah).
                  </p>
                </div>

                <div className="w-full py-2.5 rounded-xl bg-amber-500 group-hover:bg-amber-600 text-white font-display font-black text-xs text-center shadow-xs flex items-center justify-center gap-1.5">
                  <Play className="w-4 h-4 fill-white" />
                  <span>MULAI MAIN SENDIRI</span>
                </div>
              </button>

              {/* Option 2: Bermain Sama Teman Online */}
              <button
                onClick={() => handleSelectMode('online_friends')}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-700/80 border-3 border-indigo-300 dark:border-indigo-600 hover:scale-[1.02] active:scale-95 transition-all text-left space-y-2 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-indigo-600 text-white text-xl font-black shadow-xs">
                      🌐
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 text-[9px] font-black uppercase">
                      TEMAN ONLINE
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white mt-3">
                    Main Teman Online
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
                    Bermain bersama keluarga & teman online secara real-time menggunakan Kode Keluarga.
                  </p>
                </div>

                <div className="w-full py-2.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-display font-black text-xs text-center shadow-xs flex items-center justify-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>MAIN TEMAN ONLINE</span>
                </div>
              </button>

            </div>

            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200"
            >
              Kembali ke Arena Game
            </button>

          </div>
        </div>
      )}

      {/* 0. PODIUM WINNER CEREMONY SCREEN */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 max-w-lg w-full border-4 border-amber-400 dark:border-amber-600 shadow-2xl text-center space-y-5">
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce border-4 border-white">
              👑
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                🎉 UPACARA KEMENANGAN SELESAI
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-2">
                Pemenang Art Frenzy! 🏆
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Selamat! Keluarga mendapatkan <span className="font-black text-amber-500">+200 ⭐ Love Points</span>!
              </p>
            </div>

            {/* Podium Ranks */}
            <div className="grid grid-cols-3 gap-2 items-end pt-4">
              {/* 2nd Place */}
              {sortedLeaderboard[1] && (
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl border-2 border-slate-300 text-center space-y-1">
                  <span className="text-2xl">🥈</span>
                  <div className="font-black text-xs truncate">{sortedLeaderboard[1].name}</div>
                  <div className="text-[10px] font-bold text-slate-500">{sortedLeaderboard[1].score} pts</div>
                </div>
              )}

              {/* 1st Place */}
              {sortedLeaderboard[0] && (
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900 p-4 rounded-2xl border-3 border-amber-400 text-center space-y-1 shadow-md scale-105">
                  <span className="text-3xl">🥇</span>
                  <div className="font-black text-sm text-slate-900 dark:text-white truncate">{sortedLeaderboard[0].name}</div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-300">{sortedLeaderboard[0].score} pts</div>
                </div>
              )}

              {/* 3rd Place */}
              {sortedLeaderboard[2] && (
                <div className="bg-amber-50 dark:bg-slate-700 p-3 rounded-2xl border-2 border-amber-300 text-center space-y-1">
                  <span className="text-2xl">🥉</span>
                  <div className="font-black text-xs truncate">{sortedLeaderboard[2].name}</div>
                  <div className="text-[10px] font-bold text-slate-500">{sortedLeaderboard[2].score} pts</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleSelectMode(playMode)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-90 text-white font-display font-black text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>MAIN LAGI</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-black text-xs hover:bg-slate-200 flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>ARENA GAME</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SPECIAL UNIFIED COMPACT LAYOUT WHEN IN FORCED LANDSCAPE MODE */}
      {isForcedLandscapeMode ? (
        <div className="flex flex-col h-screen w-screen bg-slate-950 p-1.5 sm:p-2 gap-1.5 overflow-hidden text-white font-body">
          {/* 1. TOP HEADER BAR */}
          <div className="bg-slate-900/90 rounded-2xl px-3 py-1 border border-indigo-500/30 flex items-center justify-between gap-2 shrink-0 h-10 shadow-md">
            {/* Left: Logo & Back */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all"
                title="Kembali ke Hub Game"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-display font-black text-sm sm:text-base bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
                ART FRENZY 🎨
              </span>
            </div>

            {/* Center: Power-Up Boosters */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUseExtraLetters}
                disabled={hasUsedExtraLetters}
                className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[10px] sm:text-xs shadow-xs disabled:opacity-40 flex items-center gap-1"
                title="Buka +2 Huruf Petunjuk"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>+2H</span>
              </button>
              <button
                onClick={handleUseAddTime}
                disabled={hasUsedAddTime}
                className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-[10px] sm:text-xs shadow-xs disabled:opacity-40 flex items-center gap-1"
                title="Tambah +15 Waktu"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+15s</span>
              </button>
            </div>

            {/* Right: Round + Score + Exit Landscape */}
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-lg bg-purple-700/80 text-purple-200 text-[10px] font-black uppercase tracking-wide border border-purple-500/30">
                ROUND {currentRound}/{maxRounds}
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-indigo-900/80 text-amber-300 text-[10px] font-black uppercase tracking-wide border border-indigo-600/40">
                SCORE: {players.find(p => p.id === '1')?.score || 1250}
              </div>
              <button
                onClick={handleRequestLandscape}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] flex items-center gap-1 shadow-sm border border-rose-400 active:scale-95"
                title="Keluar dari mode landscape"
              >
                <span>❌ Keluar</span>
              </button>
            </div>
          </div>

          {/* 2. MAIN 2-COLUMN LANDSCAPE CONTENT GRID */}
          <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">
            
            {/* LEFT / CENTER REGION: 75% Width (Cols 1-9 on sm/md/lg) */}
            <div className="col-span-9 flex flex-col flex-1 min-h-0 bg-slate-900/60 rounded-2xl p-1.5 border border-slate-800 shadow-inner overflow-hidden">
              
              {/* Tablet Frame Header */}
              <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-700/80 flex items-center justify-between gap-2 shrink-0 mb-1">
                {/* Left: Drawer Avatar & Name & Timer */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shrink-0 shadow-sm">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold">
                      {currentDrawer.avatar}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display font-black text-xs text-white truncate max-w-[100px] sm:max-w-[140px]">
                      {currentDrawer.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shrink-0">
                      Pelukis
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs font-black flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-rose-400 animate-pulse" />
                    <span>⏱️ 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
                  </div>
                </div>

                {/* Right / Center: Secret Word Title */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-sky-500/40 shrink-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">KATA RAHASIA:</span>
                  <span className="font-display font-black text-sm sm:text-base text-sky-300 tracking-wider">
                    {currentDrawer.id === '1' ? activeWordObj.word : renderMaskedWord()}
                  </span>
                </div>
              </div>

              {/* Round winner banner if any */}
              {roundWinnerMsg && (
                <div className="bg-emerald-500 text-white py-1 px-3 rounded-xl font-display font-black text-xs text-center shadow-md animate-bounce mb-1 shrink-0">
                  {roundWinnerMsg}
                </div>
              )}

              {/* Canvas Canvas Area */}
              <div className="flex-1 min-h-0 w-full relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <DrawingCanvas
                  isReadOnly={false}
                  width={800}
                  height={520}
                  initialSketchId={getSketchIdForWord(activeWordObj.word)}
                />
              </div>
            </div>

            {/* RIGHT REGION: 25% Width (Cols 10-12) */}
            <div className="col-span-3 flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
              
              {/* TOP CARD: PLAYERS PANEL */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 flex flex-col flex-1 min-h-0 overflow-hidden shadow-sm">
                {/* Coral Rounded Header */}
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-1 flex items-center justify-between shrink-0">
                  <span className="font-display font-black text-xs text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> PEMAIN ({players.length})
                  </span>
                  <span className="text-[9px] font-black text-amber-100 bg-amber-900/40 px-1.5 py-0.2 rounded-full">
                    LIVE
                  </span>
                </div>

                {/* Player List */}
                <div className="p-1.5 space-y-1 overflow-y-auto flex-1 text-xs">
                  {players.map((p) => {
                    const isDrawer = p.id === currentDrawer.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-1.5 rounded-xl flex items-center justify-between gap-1 transition-all ${
                          isDrawer
                            ? 'bg-amber-500/20 border border-amber-400/50 text-white font-black'
                            : 'bg-slate-800/80 text-slate-200 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{p.avatar}</span>
                          <span className="truncate text-[11px]">{p.name}</span>
                          {isDrawer && (
                            <Pencil className="w-3 h-3 text-amber-400 animate-bounce shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-amber-300 shrink-0">
                          {p.score} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM CARD: CHAT & GUESS PANEL */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 flex flex-col flex-1 min-h-0 overflow-hidden shadow-sm">
                {/* Orange/Indigo Rounded Header */}
                <div className="bg-gradient-to-r from-amber-500 to-indigo-600 px-2.5 py-1 flex items-center justify-between shrink-0">
                  <span className="font-display font-black text-xs text-white flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> CHAT & TEBAKAN
                  </span>
                </div>

                {/* Chat Log Stream */}
                <div className="p-1.5 space-y-1 overflow-y-auto flex-1 text-[11px] pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-1.5 rounded-xl leading-tight ${
                        msg.isSystem
                          ? 'bg-amber-950/70 text-amber-200 font-extrabold text-center border border-amber-700/40 text-[10px]'
                          : msg.isCorrect
                          ? 'bg-emerald-900/80 text-emerald-100 font-black border border-emerald-500/40'
                          : 'bg-slate-800/90 text-slate-200'
                      }`}
                    >
                      {!msg.isSystem && (
                        <span className="font-black text-amber-300 mr-1">
                          {msg.senderName}:
                        </span>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input & Submit Form */}
                <form
                  onSubmit={handleSendGuess}
                  className="p-1.5 bg-slate-950 border-t border-slate-800 flex items-center gap-1 shrink-0"
                >
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Ketik tebakan..."
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-[11px] border border-slate-700 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-[10px] flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <span>TEBAK</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* STANDARD PORTRAIT LAYOUT */
        <>
          {/* 1. TOP TITLE & HEADER BAR WITH MODE SWITCHER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border-3 border-indigo-200 dark:border-slate-800 shadow-bubbly-indigo flex items-center justify-between gap-3 flex-wrap">
            
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all shadow-2xs shrink-0"
                title="Kembali ke Hub Game"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-display font-black text-base sm:text-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                    ART FRENZY
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowModeModal(true);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-2xs active:scale-95 transition-all ${
                      playMode === 'solo_bot'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300'
                    }`}
                  >
                    <span>{playMode === 'solo_bot' ? '🤖 Main Sendiri (Bot AI)' : '🌐 Teman Online (ASTA-2026)'}</span>
                    <span className="underline">Ubah</span>
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:block">
                  {playMode === 'solo_bot' ? 'Mode Solo vs AI Bot Keluarga' : 'Mode Multiplayer Teman Online (Kode: ASTA-2026)'}
                </p>
              </div>
            </div>

            {/* Center/Right: Round & Score Badges + Share Online */}
            <div className="flex items-center gap-2">
              {playMode === 'online_friends' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 text-[10px] font-black flex items-center gap-1"
                    title="Salin Kode Keluarga"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>ASTA-2026</span>
                  </button>
                  <button
                    onClick={handleShareWA}
                    className="p-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black hover:bg-emerald-600"
                    title="Bagikan ke WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Landscape Orientation Toggle Button */}
              <button
                onClick={handleRequestLandscape}
                className="px-2.5 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-display font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs border border-amber-300"
                title="Putar ke Mode Layar Landscape Miring (Layar Lebar)"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>📱 LANDSCAPE</span>
              </button>

              {/* Round Badge */}
              <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-sm flex items-center gap-1">
                <span>ROUND</span>
                <span className="text-amber-300">{currentRound}/{maxRounds}</span>
              </div>
            </div>

          </div>

          {/* LANDSCAPE ORIENTATION RECOMMENDATION BANNER FOR MOBILE */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-900 p-2.5 rounded-2xl font-display font-black text-xs flex items-center justify-between gap-2 shadow-md sm:hidden border border-amber-300/60">
            <div className="flex items-center gap-2">
              <span className="text-lg animate-bounce">📱🔄</span>
              <span>Game ini disarankan dalam posisi Landscape (Miring)!</span>
            </div>
            <button
              onClick={handleRequestLandscape}
              className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 text-[10px] font-black uppercase shrink-0 shadow-sm active:scale-95 flex items-center gap-1"
            >
              <Maximize className="w-3 h-3 text-amber-300" />
              <span>Putar Layar</span>
            </button>
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
            <div className="bg-white/10 backdrop-blur-md px-4 sm:px-6 py-2 rounded-2xl border border-white/20 text-center w-full sm:w-auto space-y-1">
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                {currentDrawer.id === '1' ? 'Kata Rahasia Anda (Lukis Ini!)' : `Kategori: ${activeWordObj.category}`}
              </div>
              <div className="font-display font-black text-lg sm:text-2xl text-amber-300 tracking-wider">
                {currentDrawer.id === '1' ? activeWordObj.word : renderMaskedWord()}
              </div>
              
              {/* POWER-UP HINT BOOSTERS STRIP */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  onClick={handleUseExtraLetters}
                  disabled={hasUsedExtraLetters}
                  className="px-2 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-900 font-black text-[10px] flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                  title="Buka 2 Huruf Rahasia Extra"
                >
                  <Lightbulb className="w-3 h-3 text-slate-900" />
                  <span>+2 Huruf</span>
                </button>

                <button
                  onClick={handleUseAddTime}
                  disabled={hasUsedAddTime}
                  className="px-2 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-black text-[10px] flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                  title="Tambah Waktu 15 Detik"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+15s</span>
                </button>

                <button
                  onClick={handleUseColorClue}
                  className="px-2 py-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-[10px] flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                  title="Tampilkan Petunjuk Warna Objek"
                >
                  <Zap className="w-3 h-3" />
                  <span>Petunjuk Warna</span>
                </button>
              </div>
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
                initialSketchId={getSketchIdForWord(activeWordObj.word)}
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
                  <span className="text-[10px] font-black bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{playMode === 'solo_bot' ? 'VS BOT AI' : 'ONLINE'}</span>
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
        </>
      )}

    </div>
  );
};
