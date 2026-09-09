import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArrowLeft, Dices, RotateCcw, Users, HelpCircle, X } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower, fireSmallPop } from '../../utils/confetti';

interface FamilyLudoGameProps {
  players: Player[];
  onBack: () => void;
}

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayerConfig {
  id: string;
  name: string;
  avatar: string;
  color: LudoColor;
}

export interface LudoToken {
  id: number; // 0, 1, 2, 3
  color: LudoColor;
  step: number; // -1: in base, 0..50: on track, 51..55: in home path, 56: finished
}

// 52 track coordinate definitions on a 15x15 grid (0..14)
const TRACK_COORDS: { x: number; y: number }[] = [
  { x: 1, y: 6 },  // 0  - Red Start (Star)
  { x: 2, y: 6 },  // 1
  { x: 3, y: 6 },  // 2
  { x: 4, y: 6 },  // 3
  { x: 5, y: 6 },  // 4
  { x: 6, y: 5 },  // 5
  { x: 6, y: 4 },  // 6
  { x: 6, y: 3 },  // 7
  { x: 6, y: 2 },  // 8  - Star
  { x: 6, y: 1 },  // 9
  { x: 6, y: 0 },  // 10
  { x: 7, y: 0 },  // 11
  { x: 8, y: 0 },  // 12
  { x: 8, y: 1 },  // 13 - Green Start (Star)
  { x: 8, y: 2 },  // 14
  { x: 8, y: 3 },  // 15
  { x: 8, y: 4 },  // 16
  { x: 8, y: 5 },  // 17
  { x: 9, y: 6 },  // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21 - Star
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23
  { x: 14, y: 7 }, // 24
  { x: 14, y: 8 }, // 25
  { x: 13, y: 8 }, // 26 - Yellow Start (Star)
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 },  // 30
  { x: 8, y: 9 },  // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34 - Star
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36
  { x: 7, y: 14 }, // 37
  { x: 6, y: 14 }, // 38
  { x: 6, y: 13 }, // 39 - Blue Start (Star)
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 },  // 43
  { x: 5, y: 8 },  // 44
  { x: 4, y: 8 },  // 45
  { x: 3, y: 8 },  // 46
  { x: 2, y: 8 },  // 47 - Star
  { x: 1, y: 8 },  // 48
  { x: 0, y: 8 },  // 49
  { x: 0, y: 7 },  // 50
  { x: 0, y: 6 },  // 51
];

// Safe Star Indices on main track
const SAFE_STAR_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Start offsets on track for each color
const COLOR_START_OFFSET: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

// Home columns (5 steps for step 51..55)
const HOME_PATHS: Record<LudoColor, { x: number; y: number }[]> = {
  red: [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }
  ],
  green: [
    { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }
  ],
  yellow: [
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }
  ],
  blue: [
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }
  ]
};

// Center Goal coordinate
const GOAL_COORDS: Record<LudoColor, { x: number; y: number }> = {
  red: { x: 6, y: 7 },
  green: { x: 7, y: 6 },
  yellow: { x: 8, y: 7 },
  blue: { x: 7, y: 8 }
};

// Base yard token slot coordinates
const BASE_SLOTS: Record<LudoColor, { x: number; y: number }[]> = {
  red: [
    { x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }
  ],
  green: [
    { x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }
  ],
  yellow: [
    { x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 },
    { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 }
  ],
  blue: [
    { x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 },
    { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 }
  ]
};

const COLOR_INFO: Record<LudoColor, {
  name: string;
  label: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  lightBg: string;
}> = {
  red: {
    name: 'Merah',
    label: '❤️ Merah',
    hex: '#ef4444',
    bgClass: 'bg-red-500',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    lightBg: 'bg-red-50 dark:bg-red-950/50'
  },
  green: {
    name: 'Hijau',
    label: '💚 Hijau',
    hex: '#10b981',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/50'
  },
  yellow: {
    name: 'Kuning',
    label: '💛 Kuning',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/50'
  },
  blue: {
    name: 'Biru',
    label: '💙 Biru',
    hex: '#3b82f6',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-950/50'
  }
};

const FAMILY_STAR_ACTIONS = [
  '🌟 Bintang Kasih: Berikan pelukan hangat pada pemain di sebelahmu!',
  '🌟 Bintang Senyum: Tunjukkan senyuman paling manis selama 5 detik!',
  '🌟 Bintang Apresiasi: Ucapkan satu pujian tulus untuk keluarga hari ini!',
  '🌟 Bintang Semangat: Teriakkan bersama: "Keluarga ASTA Juara!"',
  '🌟 Bintang Pijat: Beri pijatan pundak santai 5 detik ke pemain lain.',
  '🌟 Bintang Ceria: Tirukan tawa paling heboh yang membuat semua tersenyum!',
  '🌟 Bintang Syukur: Sebutkan satu hal yang paling kamu syukuri dari keluarga!'
];

export const FamilyLudoGame: React.FC<FamilyLudoGameProps> = ({ players, onBack }) => {
  // Setup configuration state
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [tokensPerPlayer, setTokensPerPlayer] = useState<2 | 4>(2);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [starActionPopup, setStarActionPopup] = useState<string | null>(null);

  // Active game state
  const [gamePlayers, setGamePlayers] = useState<LudoPlayerConfig[]>([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [tokens, setTokens] = useState<LudoToken[]>([]);
  const [message, setMessage] = useState('Kocok dadu untuk memulai giliran!');
  const [winner, setWinner] = useState<LudoPlayerConfig | null>(null);

  // Initialize Players based on selection
  const initializeGame = () => {
    let assignedColors: LudoColor[] = [];
    if (playerCount === 2) {
      assignedColors = ['red', 'yellow'];
    } else if (playerCount === 3) {
      assignedColors = ['red', 'green', 'yellow'];
    } else {
      assignedColors = ['red', 'green', 'yellow', 'blue'];
    }

    const configs: LudoPlayerConfig[] = assignedColors.map((color, idx) => {
      const p = players[idx % players.length];
      return {
        id: p?.id || `ludo-p-${idx}`,
        name: p?.name || `Pemain ${idx + 1}`,
        avatar: p?.avatar || (color === 'red' ? '👨‍💼' : color === 'green' ? '👩‍🍳' : color === 'yellow' ? '👦' : '👧'),
        color
      };
    });

    // Initialize tokens
    const initTokens: LudoToken[] = [];
    assignedColors.forEach((color) => {
      for (let i = 0; i < tokensPerPlayer; i++) {
        initTokens.push({
          id: i,
          color,
          step: -1 // -1 means in base
        });
      }
    });

    setGamePlayers(configs);
    setTokens(initTokens);
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setHasRolled(false);
    setWinner(null);
    setIsGameStarted(true);
    setMessage(`Giliran ${configs[0].name} (${COLOR_INFO[configs[0].color].name}). Kocok dadu! 🎲`);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const activePlayer = gamePlayers[currentTurnIdx % (gamePlayers.length || 1)] || gamePlayers[0];

  // Check which tokens of active player can move
  const getMovableTokens = (roll: number): LudoToken[] => {
    if (!activePlayer) return [];
    const playerTokens = tokens.filter(t => t.color === activePlayer.color);

    return playerTokens.filter(token => {
      if (token.step === 56) return false;
      if (token.step === -1) {
        return roll === 6;
      }
      return token.step + roll <= 56;
    });
  };

  // Roll Dice Action
  const handleRollDice = () => {
    if (isRolling || hasRolled || winner || !activePlayer) return;

    setIsRolling(true);
    sound.playCardShuffle();

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        setHasRolled(true);

        if (finalRoll === 6) {
          sound.playSuccess();
          fireSmallPop(0.5, 0.4);
        }

        processRollResult(finalRoll);
      }
    }, 70);
  };

  const processRollResult = (roll: number) => {
    const movable = getMovableTokens(roll);

    if (movable.length === 0) {
      setMessage(`${activePlayer.name} melempar ${roll}. Tidak ada pion yang bisa melangkah.`);
      setTimeout(() => {
        passTurn(false);
      }, 1200);
      return;
    }

    if (movable.length === 1) {
      setMessage(`${activePlayer.name} melempar ${roll}! Pion bergerak otomatis.`);
      setTimeout(() => {
        moveToken(movable[0], roll);
      }, 600);
      return;
    }

    setMessage(`${activePlayer.name} melempar ${roll}! Pilih pion yang ingin digerakkan.`);
  };

  // Move a selected token
  const moveToken = (token: LudoToken, roll: number) => {
    sound.playCardFlip();

    let newStep = token.step;
    if (token.step === -1) {
      newStep = 0;
      sound.playSuccess();
    } else {
      newStep = token.step + roll;
    }

    let isCaptured = false;
    let capturedPlayerName = '';

    let updatedTokens = tokens.map(t => {
      if (t.color === token.color && t.id === token.id) {
        return { ...t, step: newStep };
      }
      return t;
    });

    if (newStep >= 0 && newStep <= 50) {
      const globalTrackIndex = (COLOR_START_OFFSET[token.color] + newStep) % 52;
      const isSafeStar = SAFE_STAR_INDICES.includes(globalTrackIndex);

      if (!isSafeStar) {
        const opponentTokensAtSpot = updatedTokens.filter(t => {
          if (t.color === token.color || t.step < 0 || t.step > 50) return false;
          const oppGlobalIdx = (COLOR_START_OFFSET[t.color] + t.step) % 52;
          return oppGlobalIdx === globalTrackIndex;
        });

        if (opponentTokensAtSpot.length === 1) {
          const opp = opponentTokensAtSpot[0];
          const oppConfig = gamePlayers.find(p => p.color === opp.color);
          capturedPlayerName = oppConfig?.name || COLOR_INFO[opp.color].name;
          isCaptured = true;

          updatedTokens = updatedTokens.map(t => {
            if (t.color === opp.color && t.id === opp.id) {
              return { ...t, step: -1 };
            }
            return t;
          });

          sound.playFunnyBonus();
          fireBurstConfetti();
        }
      } else {
        const randomAction = FAMILY_STAR_ACTIONS[Math.floor(Math.random() * FAMILY_STAR_ACTIONS.length)];
        setStarActionPopup(randomAction);
      }
    }

    setTokens(updatedTokens);

    // Check Win Condition for active player
    const playerTokens = updatedTokens.filter(t => t.color === activePlayer.color);
    const allFinished = playerTokens.every(t => t.step === 56);

    if (allFinished) {
      setWinner(activePlayer);
      sound.playVictory();
      fireVictoryShower();
      setMessage(`🏆 HOREEE! ${activePlayer.name} (${COLOR_INFO[activePlayer.color].name}) MENANG JUARA 1 LUDO KELUARGA! 🎉`);
      return;
    }

    const getsExtraTurn = roll === 6 || isCaptured;

    if (isCaptured) {
      setMessage(`💥 SERU! ${activePlayer.name} memakan pion ${capturedPlayerName} & dapat bonus kocok dadu lagi!`);
    } else if (roll === 6) {
      setMessage(`🎲 Dadu 6! ${activePlayer.name} berhak kocok dadu sekali lagi!`);
    } else {
      setMessage(`${activePlayer.name} berhasil melangkah.`);
    }

    setTimeout(() => {
      passTurn(getsExtraTurn);
    }, getsExtraTurn ? 800 : 600);
  };

  // Pass turn to next player
  const passTurn = (extraTurn: boolean) => {
    setHasRolled(false);
    setDiceValue(null);

    if (!extraTurn) {
      const nextIdx = (currentTurnIdx + 1) % gamePlayers.length;
      setCurrentTurnIdx(nextIdx);
      const nextP = gamePlayers[nextIdx];
      setMessage(`Giliran ${nextP.name} (${COLOR_INFO[nextP.color].name}). Kocok dadu! 🎲`);
    } else {
      setMessage(`Giliran bonus untuk ${activePlayer.name}! Silakan kocok dadu lagi 🎲`);
    }
  };

  // Calculate SVG coordinate for a token
  const getTokenCoords = (token: LudoToken): { cx: number; cy: number } => {
    if (token.step === -1) {
      const slot = BASE_SLOTS[token.color][token.id % 4];
      return { cx: (slot.x + 0.5) * 40, cy: (slot.y + 0.5) * 40 };
    }

    if (token.step >= 0 && token.step <= 50) {
      const globalIdx = (COLOR_START_OFFSET[token.color] + token.step) % 52;
      const coord = TRACK_COORDS[globalIdx];
      return { cx: (coord.x + 0.5) * 40, cy: (coord.y + 0.5) * 40 };
    }

    if (token.step >= 51 && token.step <= 55) {
      const homeIdx = token.step - 51;
      const coord = HOME_PATHS[token.color][homeIdx];
      return { cx: (coord.x + 0.5) * 40, cy: (coord.y + 0.5) * 40 };
    }

    const goal = GOAL_COORDS[token.color];
    return { cx: (goal.x + 0.5) * 40, cy: (goal.y + 0.5) * 40 };
  };

  const movableTokens = hasRolled && diceValue ? getMovableTokens(diceValue) : [];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4 animate-pop-in">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border-2 border-rose-100 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>🎲 Ludo Keluarga ASTA</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
            {isGameStarted ? `${gamePlayers.length} Pemain • ${tokensPerPlayer} Pion per Pemain` : 'Pilih Jumlah Pemain'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 transition-all active:scale-90"
            title="Cara Bermain & Aturan Ludo"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {isGameStarted && (
            <button
              onClick={() => {
                sound.playClick();
                setIsGameStarted(false);
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-family-coral transition-all active:scale-90"
              title="Mulai Ulang / Ganti Pemain"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SETUP SCREEN */}
      {!isGameStarted ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-6 animate-pop-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🎲
            </div>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Pengaturan Game Ludo
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Mainkan Ludo klasik keluarga dengan opsi 2, 3, atau 4 pemain. Cocok untuk seru-seruan bareng Ayah, Ibu, Kakak, dan Adik!
            </p>
          </div>

          {/* 1. Pilih Jumlah Pemain */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              1. Pilih Jumlah Pemain
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    sound.playClick();
                    setPlayerCount(num as 2 | 3 | 4);
                  }}
                  className={`p-4 rounded-2xl border-3 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                    playerCount === num
                      ? 'border-family-coral bg-rose-50 dark:bg-rose-950/50 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  <Users className={`w-6 h-6 ${playerCount === num ? 'text-family-coral' : 'text-slate-400'}`} />
                  <span className="font-display font-black text-base text-slate-900 dark:text-white">
                    {num} Pemain
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {num === 2 ? '❤️ Merah vs 💛 Kuning' : num === 3 ? '❤️, 💚, 💛 (3 Warna)' : '❤️, 💚, 💛, 💙 (4 Warna)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Mode Kecepatan Pion */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              2. Pilih Mode Durasi Permainan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setTokensPerPlayer(2);
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${
                  tokensPerPlayer === 2
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-2xl">⚡</div>
                <div className="text-left">
                  <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Mode Cepat (2 Pion)
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Durasi ~10-15 menit, seru dan dinamis.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setTokensPerPlayer(4);
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${
                  tokensPerPlayer === 4
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-2xl">👑</div>
                <div className="text-left">
                  <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Mode Klasik (4 Pion)
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Durasi ~20-30 menit, penuh taktik keluarga!
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={initializeGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-base shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Dices className="w-5 h-5" />
            <span>MULAI MAIN LUDO SEKARANG</span>
          </button>
        </div>
      ) : (
        /* ACTIVE LUDO GAMEPLAY */
        <div className="space-y-4">
          
          {/* Players Turn & Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gamePlayers.map((p) => {
              const isCurrentTurn = p.id === activePlayer.id;
              const colorConfig = COLOR_INFO[p.color];
              const playerTokens = tokens.filter(t => t.color === p.color);
              const finishedCount = playerTokens.filter(t => t.step === 56).length;

              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 relative ${
                    isCurrentTurn
                      ? `${colorConfig.borderClass} ${colorConfig.lightBg} shadow-md scale-102 ring-2 ring-rose-400/50`
                      : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 opacity-80'
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span className={colorConfig.textClass}>{colorConfig.name}</span>
                      <span>{finishedCount}/{tokensPerPlayer} 🏆</span>
                    </div>
                  </div>
                  {isCurrentTurn && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase shadow-xs">
                      Giliran
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Message Bar & Dice Roller */}
          <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-2xl border-2 border-rose-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className={`w-9 h-9 rounded-xl ${COLOR_INFO[activePlayer.color].bgClass} text-white flex items-center justify-center text-xl shadow-xs shrink-0`}>
                {activePlayer.avatar}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                {message}
              </p>
            </div>

            {/* Big 3D Dice Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRollDice}
                disabled={isRolling || hasRolled || !!winner}
                className={`px-5 py-3 rounded-2xl font-display font-black text-sm flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${
                  hasRolled || isRolling || winner
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white shadow-amber-300/50 animate-bounce'
                }`}
              >
                <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Mengocok...' : hasRolled ? 'Pilih Pion' : 'KOCOK DADU'}</span>
              </button>

              {/* Dice Display */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-600 shadow-bubbly-sm flex items-center justify-center font-display font-black text-2xl text-amber-600 dark:text-amber-400">
                {diceValue !== null ? diceValue : '🎲'}
              </div>
            </div>
          </div>

          {/* Interactive LUDO BOARD SVG */}
          <div className="w-full max-w-[540px] mx-auto bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-3xl border-4 border-slate-300 dark:border-slate-700 shadow-bubbly-lg">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-auto select-none rounded-2xl drop-shadow-sm"
            >
              {/* Background Grid Lines & Base Colors */}
              <rect x="0" y="0" width="600" height="600" fill="#f8fafc" />

              {/* Red Home Base (Top-Left) */}
              <rect x="0" y="0" width="240" height="240" fill="#ef4444" rx="16" />
              <rect x="30" y="30" width="180" height="180" fill="#ffffff" rx="12" />
              <circle cx="70" cy="70" r="22" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />
              <circle cx="170" cy="70" r="22" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />
              <circle cx="70" cy="170" r="22" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />
              <circle cx="170" cy="170" r="22" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />

              {/* Green Home Base (Top-Right) */}
              <rect x="360" y="0" width="240" height="240" fill="#10b981" rx="16" />
              <rect x="390" y="30" width="180" height="180" fill="#ffffff" rx="12" />
              <circle cx="430" cy="70" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="3" />
              <circle cx="530" cy="70" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="3" />
              <circle cx="430" cy="170" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="3" />
              <circle cx="530" cy="170" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="3" />

              {/* Yellow Home Base (Bottom-Right) */}
              <rect x="360" y="360" width="240" height="240" fill="#f59e0b" rx="16" />
              <rect x="390" y="390" width="180" height="180" fill="#ffffff" rx="12" />
              <circle cx="430" cy="430" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="530" cy="430" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="430" cy="530" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="530" cy="530" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />

              {/* Blue Home Base (Bottom-Left) */}
              <rect x="0" y="360" width="240" height="240" fill="#3b82f6" rx="16" />
              <rect x="30" y="390" width="180" height="180" fill="#ffffff" rx="12" />
              <circle cx="70" cy="430" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="170" cy="430" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="70" cy="530" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="170" cy="530" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3" />

              {/* Center Finish Triangles */}
              <polygon points="240,240 360,240 300,300" fill="#10b981" />
              <polygon points="360,240 360,360 300,300" fill="#f59e0b" />
              <polygon points="360,360 240,360 300,300" fill="#3b82f6" />
              <polygon points="240,360 240,240 300,300" fill="#ef4444" />
              <circle cx="300" cy="300" r="24" fill="#ffffff" stroke="#f59e0b" strokeWidth="4" />
              <text x="300" y="307" textAnchor="middle" fontSize="18" fontWeight="bold">👑</text>

              {/* 52 Track Tiles */}
              {TRACK_COORDS.map((coord, idx) => {
                const isStartRed = idx === 0;
                const isStartGreen = idx === 13;
                const isStartYellow = idx === 26;
                const isStartBlue = idx === 39;
                const isStar = SAFE_STAR_INDICES.includes(idx);

                let fill = '#ffffff';
                if (isStartRed) fill = '#fee2e2';
                else if (isStartGreen) fill = '#d1fae5';
                else if (isStartYellow) fill = '#fef3c7';
                else if (isStartBlue) fill = '#dbeafe';

                return (
                  <g key={`track-${idx}`}>
                    <rect
                      x={coord.x * 40}
                      y={coord.y * 40}
                      width="40"
                      height="40"
                      fill={fill}
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                    />
                    {isStar && (
                      <text
                        x={coord.x * 40 + 20}
                        y={coord.y * 40 + 26}
                        textAnchor="middle"
                        fontSize="18"
                        fill="#eab308"
                      >
                        ⭐
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Colored Home Paths */}
              {HOME_PATHS.red.map((c, i) => (
                <rect key={`red-hp-${i}`} x={c.x * 40} y={c.y * 40} width="40" height="40" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              ))}
              {HOME_PATHS.green.map((c, i) => (
                <rect key={`green-hp-${i}`} x={c.x * 40} y={c.y * 40} width="40" height="40" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              ))}
              {HOME_PATHS.yellow.map((c, i) => (
                <rect key={`yellow-hp-${i}`} x={c.x * 40} y={c.y * 40} width="40" height="40" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              ))}
              {HOME_PATHS.blue.map((c, i) => (
                <rect key={`blue-hp-${i}`} x={c.x * 40} y={c.y * 40} width="40" height="40" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              ))}

              {/* Render Animated Ludo Tokens */}
              {tokens.map((token) => {
                const isMovable = movableTokens.some(m => m.color === token.color && m.id === token.id);
                const { cx, cy } = getTokenCoords(token);
                const playerCfg = gamePlayers.find(p => p.color === token.color);

                return (
                  <g
                    key={`${token.color}-${token.id}`}
                    onClick={() => {
                      if (isMovable && diceValue !== null) {
                        moveToken(token, diceValue);
                      }
                    }}
                    className={`transition-all duration-300 ${
                      isMovable ? 'cursor-pointer animate-bounce' : ''
                    }`}
                  >
                    {isMovable && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="20"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="4 2"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r="14"
                      fill={COLOR_INFO[token.color].hex}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      fontSize="12"
                      style={{ pointerEvents: 'none' }}
                    >
                      {playerCfg?.avatar || '♟️'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Movable Tokens Quick Selection Buttons */}
          {hasRolled && movableTokens.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/60 p-3 rounded-2xl border-2 border-amber-300 dark:border-amber-700 flex flex-wrap items-center justify-center gap-2 animate-pop-in">
              <span className="text-xs font-black text-amber-800 dark:text-amber-200">
                Pilih Pion untuk Melangkah (+{diceValue}):
              </span>
              {movableTokens.map((m) => (
                <button
                  key={`btn-m-${m.id}`}
                  onClick={() => moveToken(m, diceValue!)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>Pion {m.id + 1}</span>
                  <span className="text-[10px] opacity-80">
                    ({m.step === -1 ? 'Keluar Base' : `Petak ${m.step}`})
                  </span>
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* POPUP: Family Star Action Prompt 🌟 */}
      {starActionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-4 border-4 border-amber-400 shadow-bubbly-amber">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md animate-bounce">
              ⭐
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Bintang Kebaikan Keluarga!
            </h3>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
              {starActionPopup}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setStarActionPopup(null);
                fireSmallPop(0.5, 0.4);
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-sm shadow-md active:scale-95 transition-all"
            >
              KAMI SUDAH LAKUKAN! ❤️
            </button>
          </div>
        </div>
      )}

      {/* WINNER PODIUM MODAL 🏆 */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-5 border-4 border-rose-500 shadow-bubbly-lg">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-family-coral">
                JUARA LUDO KELUARGA ASTA
              </span>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
                {winner.name} ({COLOR_INFO[winner.color].name})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Selamat atas kemenangan gemilang! Seluruh pion berhasil masuk ke Mahkota Juara 👑
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-3">
              <span className="text-3xl">{winner.avatar}</span>
              <div className="text-left">
                <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                  Pemenang Utama 🥇
                </div>
                <div className="text-xs text-family-coral font-bold">
                  +100 Poin Kasih Sayang Keluarga
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={initializeGame}
                className="py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
              >
                MAIN LAGI 🔄
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsGameStarted(false);
                }}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-display font-black text-xs active:scale-95 transition-all"
              >
                GANTI PEMAIN 👥
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-4 border-2 border-slate-200 dark:border-slate-700 shadow-bubbly-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📜</span>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                  Aturan Main Ludo Keluarga
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 space-y-1">
                <div className="font-bold text-family-coral">🎲 1. Keluar Base dengan Dadu 6</div>
                <p>Pion di dalam kandang (base) hanya bisa keluar ke petak awal jika Anda melempar angka <strong>6</strong>.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400">🔄 2. Bonus Giliran (Extra Roll)</div>
                <p>Mendapatkan angka <strong>6</strong> atau berhasil <strong>memakan pion lawan</strong> memberikan Anda 1 kesempatan kocok dadu lagi!</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">⭐ 3. Petak Bintang Aman (Safe Zone)</div>
                <p>Pion yang berada di petak berbintang (⭐) tidak dapat dimakan oleh pion lawan.</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-1">
                <div className="font-bold text-blue-700 dark:text-blue-400">👑 4. Menang & Mahkota Juara</div>
                <p>Pemain pertama yang berhasil memasukkan seluruh pionnya ke segitiga tengah (Mahkota Juara) dinyatakan sebagai <strong>Juara 1</strong>!</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 rounded-2xl bg-family-coral hover:bg-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
            >
              MENGERTI, SIAP MAIN! 👍
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
