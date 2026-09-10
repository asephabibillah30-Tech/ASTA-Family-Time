import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArrowLeft, RotateCcw, HelpCircle, X, Sparkles, Layers, Sliders } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower, fireSmallPop } from '../../utils/confetti';

interface FamilyUnoGameProps {
  players: Player[];
  onBack: () => void;
}

export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoValue = 
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4' | 'asta_love';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

export interface UnoPlayer {
  id: string;
  name: string;
  avatar: string;
  hand: UnoCard[];
  hasSaidUno: boolean;
}

const COLOR_MAP: Record<UnoColor, {
  name: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  gradient: string;
  ring: string;
}> = {
  red: {
    name: 'Merah',
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    gradient: 'from-red-500 to-rose-600',
    ring: 'ring-red-500'
  },
  blue: {
    name: 'Biru',
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500'
  },
  green: {
    name: 'Hijau',
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500'
  },
  yellow: {
    name: 'Kuning',
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    gradient: 'from-amber-400 to-yellow-500',
    ring: 'ring-amber-400'
  },
  wild: {
    name: 'Bebas (Wild)',
    bg: 'bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500',
    border: 'border-purple-500',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    gradient: 'from-purple-600 to-pink-600',
    ring: 'ring-purple-500'
  }
};

// Generate Full UNO Deck
function createUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
  let idCounter = 1;

  colors.forEach(color => {
    deck.push({ id: `c-${idCounter++}`, color, value: '0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c-${idCounter++}`, color, value: `${i}` as UnoValue });
      deck.push({ id: `c-${idCounter++}`, color, value: `${i}` as UnoValue });
    }
    ['skip', 'reverse', 'draw2'].forEach(action => {
      deck.push({ id: `c-${idCounter++}`, color, value: action as UnoValue });
      deck.push({ id: `c-${idCounter++}`, color, value: action as UnoValue });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild4' });
  }

  deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'asta_love' });
  deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'asta_love' });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export const FamilyUnoGame: React.FC<FamilyUnoGameProps> = ({ players, onBack }) => {
  // Game setup
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [cardsPerHand, setCardsPerHand] = useState<5 | 7>(7);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [useFannedView, setUseFannedView] = useState(true);

  // Active play state
  const [unoPlayers, setUnoPlayers] = useState<UnoPlayer[]>([]);
  const [drawPile, setDrawPile] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [activeColor, setActiveColor] = useState<UnoColor>('red');
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [isClockwise, setIsClockwise] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<UnoCard | null>(null);
  const [specialActionText, setSpecialActionText] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState<UnoPlayer | null>(null);

  // Start & Deal
  const initializeGame = () => {
    const newDeck = createUnoDeck();
    const activeConfigs: UnoPlayer[] = [];

    for (let i = 0; i < playerCount; i++) {
      const p = players[i % players.length];
      const hand = newDeck.splice(0, cardsPerHand);
      activeConfigs.push({
        id: p?.id || `uno-p-${i}`,
        name: p?.name || `Pemain ${i + 1}`,
        avatar: p?.avatar || (i === 0 ? '👨‍💼' : i === 1 ? '👩‍🍳' : i === 2 ? '👦' : '👧'),
        hand,
        hasSaidUno: false
      });
    }

    let firstCard = newDeck.pop()!;
    while (firstCard.value === 'wild4' || firstCard.value === 'asta_love') {
      newDeck.unshift(firstCard);
      firstCard = newDeck.pop()!;
    }

    const startColor = firstCard.color === 'wild' ? 'red' : firstCard.color;

    setUnoPlayers(activeConfigs);
    setDrawPile(newDeck);
    setDiscardPile([firstCard]);
    setActiveColor(startColor);
    setCurrentTurnIdx(0);
    setIsClockwise(true);
    setWinner(null);
    setPendingWildCard(null);
    setShowColorPicker(false);
    setSpecialActionText(null);
    setIsGameStarted(true);
    setMessage(`Game dimulai! Giliran ${activeConfigs[0].name}. Cocokkan warna ${COLOR_MAP[startColor].name} atau angka ${firstCard.value.toUpperCase()}!`);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const activePlayer = unoPlayers[currentTurnIdx % (unoPlayers.length || 1)] || unoPlayers[0];
  const topDiscard = discardPile[discardPile.length - 1];

  const isCardPlayable = (card: UnoCard): boolean => {
    if (!topDiscard) return false;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topDiscard.value) return true;
    return false;
  };

  const sortHandByColor = () => {
    if (!activePlayer) return;
    sound.playClick();
    const colorOrder: Record<UnoColor, number> = { red: 1, blue: 2, green: 3, yellow: 4, wild: 5 };
    const sorted = [...activePlayer.hand].sort((a, b) => {
      if (colorOrder[a.color] !== colorOrder[b.color]) {
        return colorOrder[a.color] - colorOrder[b.color];
      }
      return a.value.localeCompare(b.value);
    });

    setUnoPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, hand: sorted } : p));
  };

  const handlePlayCard = (card: UnoCard) => {
    if (!activePlayer || !topDiscard || winner) return;

    if (!isCardPlayable(card)) {
      sound.playClick();
      setMessage(`Kartu tidak cocok! Pilih kartu berwarna ${COLOR_MAP[activeColor].name} atau bernilai ${topDiscard.value.toUpperCase()}.`);
      return;
    }

    if (card.color === 'wild') {
      sound.playCardFlip();
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    executePlayCard(card, card.color);
  };

  const executePlayCard = (card: UnoCard, chosenColor: UnoColor) => {
    sound.playCardFlip();

    const updatedHand = activePlayer.hand.filter(c => c.id !== card.id);
    const updatedPlayers = unoPlayers.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          hand: updatedHand,
          hasSaidUno: updatedHand.length === 1 ? p.hasSaidUno : false
        };
      }
      return p;
    });

    const newDiscard = [...discardPile, card];
    setDiscardPile(newDiscard);
    setActiveColor(chosenColor);
    setUnoPlayers(updatedPlayers);
    setShowColorPicker(false);
    setPendingWildCard(null);

    if (updatedHand.length === 0) {
      setWinner(activePlayer);
      sound.playVictory();
      fireVictoryShower();
      setMessage(`🎉 HOREEE! ${activePlayer.name} MENANG JUARA 1 UNO KELUARGA ASTA! 🏆`);
      return;
    }

    if (updatedHand.length === 1 && !activePlayer.hasSaidUno) {
      sound.playFunnyBonus();
      fireSmallPop(0.5, 0.4);
      setMessage(`📢 ${activePlayer.name} berseru "UNO!" (Tersisa 1 kartu lagi!)`);
    }

    processActionCard(card, updatedPlayers, chosenColor);
  };

  const processActionCard = (card: UnoCard, currentPlayersList: UnoPlayer[], chosenColor: UnoColor) => {
    let nextIdx = getNextPlayerIndex(1);
    let extraStep = 1;
    let effectMsg = `${activePlayer.name} memainkan ${card.value.toUpperCase()}.`;

    if (card.value === 'skip') {
      const skippedPlayer = currentPlayersList[nextIdx];
      effectMsg = `🚫 ${skippedPlayer.name} dilewati (Skip)!`;
      extraStep = 2;
      sound.playFunnyBonus();
    } else if (card.value === 'reverse') {
      if (playerCount === 2) {
        const skippedPlayer = currentPlayersList[nextIdx];
        effectMsg = `🔄 Putar Balik! ${skippedPlayer.name} dilewati gilirannya!`;
        extraStep = 2;
      } else {
        setIsClockwise(prev => !prev);
        effectMsg = `🔄 Arah putaran giliran dibalik (${!isClockwise ? 'Searah' : 'Berlawanan'} jarum jam)!`;
        extraStep = 1;
      }
      sound.playFunnyBonus();
    } else if (card.value === 'draw2') {
      const targetPlayer = currentPlayersList[nextIdx];
      drawCardsForPlayer(targetPlayer.id, 2);
      effectMsg = `➕2 ${targetPlayer.name} mengambil 2 kartu & dilewati!`;
      extraStep = 2;
      sound.playFunnyBonus();
    } else if (card.value === 'wild4') {
      const targetPlayer = currentPlayersList[nextIdx];
      drawCardsForPlayer(targetPlayer.id, 4);
      effectMsg = `🔥 WILD +4! Warna berganti ${COLOR_MAP[chosenColor].name}, ${targetPlayer.name} ambil 4 kartu & dilewati!`;
      extraStep = 2;
      sound.playFunnyBonus();
      fireBurstConfetti();
    } else if (card.value === 'asta_love') {
      effectMsg = `💖 KARTU KASIH SAYANG ASTA! Warna berganti ${COLOR_MAP[chosenColor].name}. Beri pelukan hangat ke keluarga! 🥰`;
      setSpecialActionText('💖 Kartu Kasih Sayang ASTA: Berikan pelukan hangat atau ucapkan kata cinta pada keluarga di sebelahmu!');
      extraStep = 1;
      sound.playSuccess();
      fireBurstConfetti();
    } else if (card.color === 'wild') {
      effectMsg = `🌈 Warna diubah menjadi ${COLOR_MAP[chosenColor].name}!`;
      extraStep = 1;
    }

    setMessage(effectMsg);

    setTimeout(() => {
      advanceTurn(extraStep);
    }, 900);
  };

  const getNextPlayerIndex = (steps: number): number => {
    const total = unoPlayers.length;
    if (total === 0) return 0;
    if (isClockwise) {
      return (currentTurnIdx + steps) % total;
    } else {
      return (currentTurnIdx - steps + total * 10) % total;
    }
  };

  const advanceTurn = (steps: number) => {
    const nextIdx = getNextPlayerIndex(steps);
    setCurrentTurnIdx(nextIdx);
    const nextP = unoPlayers[nextIdx];
    if (nextP) {
      setMessage(prev => `${prev} Sekarang giliran ${nextP.name}.`);
    }
  };

  const drawCardsForPlayer = (playerId: string, count: number) => {
    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDraw.length === 0) {
        if (currentDiscard.length > 1) {
          const top = currentDiscard.pop()!;
          currentDraw = [...currentDiscard];
          for (let k = currentDraw.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [currentDraw[k], currentDraw[j]] = [currentDraw[j], currentDraw[k]];
          }
          currentDiscard = [top];
        }
      }
      if (currentDraw.length > 0) {
        drawn.push(currentDraw.pop()!);
      }
    }

    setDrawPile(currentDraw);
    setDiscardPile(currentDiscard);

    setUnoPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, hand: [...p.hand, ...drawn], hasSaidUno: false };
      }
      return p;
    }));
  };

  const handlePlayerDrawCard = () => {
    if (!activePlayer || winner) return;

    sound.playCardFlip();
    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile];

    if (currentDraw.length === 0) {
      if (currentDiscard.length > 1) {
        const top = currentDiscard.pop()!;
        currentDraw = [...currentDiscard];
        for (let k = currentDraw.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [currentDraw[k], currentDraw[j]] = [currentDraw[j], currentDraw[k]];
        }
        currentDiscard = [top];
      } else {
        setMessage('Tumpukan kartu habis! Lanjutkan giliran.');
        advanceTurn(1);
        return;
      }
    }

    const drawnCard = currentDraw.pop()!;
    setDrawPile(currentDraw);
    setDiscardPile(currentDiscard);

    const updatedHand = [...activePlayer.hand, drawnCard];
    setUnoPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return { ...p, hand: updatedHand, hasSaidUno: false };
      }
      return p;
    }));

    setMessage(`${activePlayer.name} mengambil 1 kartu.`);
    sound.playClick();

    setTimeout(() => {
      advanceTurn(1);
    }, 700);
  };

  const handleShoutUno = () => {
    if (!activePlayer) return;
    setUnoPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return { ...p, hasSaidUno: true };
      }
      return p;
    }));
    sound.playFunnyBonus();
    fireBurstConfetti();
    setMessage(`🗣️ "${activePlayer.name} BERTERIAK: UNOOO!" ❤️`);
  };

  const hasAnyPlayableCard = activePlayer?.hand?.some(c => isCardPlayable(c));

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 space-y-2.5 sm:space-y-3 animate-pop-in select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <h2 className="font-display font-black text-xs sm:text-base text-slate-900 dark:text-white truncate">
            🃏 UNO Keluarga ASTA
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold truncate">
            {isGameStarted ? `${unoPlayers.length} Pemain • ${isClockwise ? 'Searah ↻' : 'Berlawanan ↺'}` : 'Pilih Jumlah Pemain'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 transition-all active:scale-90"
            title="Cara Main & Aturan Kartu UNO"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {isGameStarted && (
            <button
              onClick={() => {
                sound.playClick();
                setIsGameStarted(false);
              }}
              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-family-coral transition-all active:scale-90"
              title="Mulai Ulang / Ganti Pemain"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SETUP SCREEN */}
      {!isGameStarted ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-4 animate-pop-in">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-red-500 via-yellow-400 to-blue-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🃏
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              Pengaturan Game UNO Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Permainan kartu UNO seru dengan kartu Skip, Reverse, Draw 2, Wild Draw 4, & Kartu Spesial Kasih Sayang ASTA!
            </p>
          </div>

          {/* 1. Pilih Jumlah Pemain */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              1. Pilih Jumlah Pemain
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    sound.playClick();
                    setPlayerCount(num as 2 | 3 | 4);
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    playerCount === num
                      ? 'border-family-coral bg-rose-50 dark:bg-rose-950/50 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{num === 2 ? '👥' : num === 3 ? '👨‍👩‍👦' : '👨‍👩‍👧‍👦'}</span>
                  <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    {num} Pemain
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Jumlah Kartu Awal */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              2. Jumlah Kartu Awal di Tangan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setCardsPerHand(5);
                }}
                className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 ${
                  cardsPerHand === 5
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-xl">⚡</div>
                <div className="text-left min-w-0">
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Mode Cepat (5 Kartu)
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCardsPerHand(7);
                }}
                className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 ${
                  cardsPerHand === 7
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-xl">👑</div>
                <div className="text-left min-w-0">
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Mode Standar (7 Kartu)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={initializeGame}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 hover:opacity-95 text-white font-display font-black text-xs sm:text-sm shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>BAGIKAN KARTU & MULAI MAIN</span>
          </button>
        </div>
      ) : (
        /* ACTIVE UNO GAMEPLAY - FULL 1-SCREEN MOBILE ARENA */
        <div className="space-y-2.5">
          
          {/* Top Player Turn Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
            {unoPlayers.map((p) => {
              const isCurrentTurn = p.id === activePlayer.id;

              return (
                <div
                  key={p.id}
                  className={`px-2.5 py-1.5 rounded-xl border-2 transition-all flex items-center gap-2 shrink-0 ${
                    isCurrentTurn
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/80 shadow-md ring-2 ring-rose-400/40 scale-102'
                      : 'border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 opacity-75'
                  }`}
                >
                  <span className="text-base">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="font-display font-black text-[11px] text-slate-900 dark:text-white leading-none">
                      {p.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold mt-0.5">
                      {p.hand.length} Kartu {p.hand.length === 1 && <span className="text-rose-600 font-black animate-pulse">UNO! 🔥</span>}
                    </div>
                  </div>
                  {isCurrentTurn && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase">
                      Turn
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Announcement Bar */}
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-0 flex-1">
              <span className="text-sm shrink-0">📢</span>
              <span className="leading-tight truncate text-[11px] sm:text-xs">{message}</span>
            </div>

            {activePlayer.hand.length === 2 && (
              <button
                onClick={handleShoutUno}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 animate-bounce text-center"
              >
                "UNO!" 🗣️
              </button>
            )}
          </div>

          {/* Center Game Arena (Discard Deck + Draw Deck + Active Color Ring) */}
          <div className={`bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-2.5 sm:p-4 border-3 shadow-xl flex flex-col items-center justify-center gap-2 text-white relative transition-colors ${COLOR_MAP[activeColor].ring}`}>
            
            {/* Active Color Pill */}
            <div className="flex items-center justify-center gap-2 text-[11px]">
              <span className="font-extrabold text-slate-400">WARNA AKTIF:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black uppercase shadow-sm ${COLOR_MAP[activeColor].bg} text-white text-[11px]`}>
                {COLOR_MAP[activeColor].name}
              </span>
              <span className="text-slate-400 font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                Arah: {isClockwise ? 'Searah ↻' : 'Berlawanan ↺'}
              </span>
            </div>

            {/* Piles Side-by-Side */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 my-0.5">
              
              {/* Draw Deck */}
              <div className="flex flex-col items-center gap-1">
                <div
                  onClick={handlePlayerDrawCard}
                  className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 border-2 border-amber-400 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group relative shrink-0"
                  title="Klik untuk ambil 1 kartu"
                >
                  <div className="w-10 h-16 sm:w-14 sm:h-20 rounded-md bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center text-white font-black text-xs sm:text-base shadow-inner transform -rotate-6 group-hover:rotate-0 transition-transform">
                    UNO
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-black text-amber-300 mt-1 uppercase">
                    (+1) Ambil
                  </span>
                </div>
                <span className="text-[9px] text-amber-300 font-extrabold">
                  {drawPile.length} Kartu
                </span>
              </div>

              <div className="text-xl font-black text-slate-600 animate-pulse">
                ➔
              </div>

              {/* Top Discard Card */}
              {topDiscard && (
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-16 h-24 sm:w-20 sm:h-30 rounded-xl bg-gradient-to-br ${COLOR_MAP[topDiscard.color === 'wild' ? activeColor : topDiscard.color].gradient} border-2 border-white shadow-lg flex flex-col items-center justify-between p-1.5 text-white relative animate-pop-in shrink-0`}>
                    <div className="self-start font-black text-[10px] leading-none">
                      {topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '❤️' : topDiscard.value.toUpperCase()}
                    </div>
                    <div className="w-9 h-13 sm:w-12 sm:h-17 rounded-md bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-base sm:text-xl drop-shadow-md">
                      {topDiscard.value === 'skip' ? '🚫' : topDiscard.value === 'reverse' ? '🔄' : topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '💖' : topDiscard.value === 'wild' ? '🌈' : topDiscard.value}
                    </div>
                    <div className="self-end font-black text-[9px] leading-none">
                      {topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '❤️' : topDiscard.value.toUpperCase()}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold">
                    Kartu Meja
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Active Player Hand Area (Overlapping Fan / Grid View) */}
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5">
            
            {/* Hand Header */}
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{activePlayer.avatar}</span>
                <span className="font-display font-black text-xs text-slate-900 dark:text-white">
                  Tangan {activePlayer.name} ({activePlayer.hand.length} Kartu)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUseFannedView(!useFannedView)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95"
                  title="Ganti Tampilan Kartu"
                >
                  <Sliders className="w-3 h-3 text-indigo-500" />
                  <span>{useFannedView ? 'Kipas 🎴' : 'Baris 📜'}</span>
                </button>

                <button
                  onClick={sortHandByColor}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95"
                  title="Urutkan Warna"
                >
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Urutkan</span>
                </button>

                {!hasAnyPlayableCard && (
                  <button
                    onClick={handlePlayerDrawCard}
                    className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black shadow-xs active:scale-95 transition-all animate-pulse"
                  >
                    <span>➕ AMBIL (+1)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cards Deck Rendering: Fanned Overlapping vs Scrollable Row */}
            <div
              className={`pt-2 pb-1 px-1 flex items-end min-h-[110px] sm:min-h-[135px] ${
                useFannedView
                  ? 'justify-center -space-x-3.5 sm:-space-x-4 overflow-x-auto custom-scrollbar'
                  : 'gap-1.5 overflow-x-auto custom-scrollbar'
              }`}
            >
              {activePlayer.hand.map((card, idx) => {
                const playable = isCardPlayable(card);

                return (
                  <button
                    key={card.id}
                    onClick={() => handlePlayCard(card)}
                    style={{ zIndex: playable ? 30 + idx : 10 + idx }}
                    className={`w-15 h-23 sm:w-20 sm:h-29 rounded-xl bg-gradient-to-br ${COLOR_MAP[card.color].gradient} p-1 text-white flex flex-col justify-between items-center shrink-0 transition-all border-2 border-white/95 shadow-md active:scale-95 relative ${
                      playable
                        ? '-translate-y-2 hover:-translate-y-3.5 ring-3 ring-amber-400 cursor-pointer scale-105 shadow-xl'
                        : 'opacity-55 grayscale-20 cursor-not-allowed hover:opacity-80'
                    }`}
                  >
                    {/* Top corner label */}
                    <div className="self-start font-black text-[9px] leading-none">
                      {card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '❤️' : card.value.toUpperCase()}
                    </div>

                    {/* Big Center Symbol */}
                    <div className="w-7 h-10 sm:w-10 sm:h-14 rounded-md bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm sm:text-lg drop-shadow-sm">
                      {card.value === 'skip' ? '🚫' : card.value === 'reverse' ? '🔄' : card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '💖' : card.value === 'wild' ? '🌈' : card.value}
                    </div>

                    {/* Bottom corner label */}
                    <div className="self-end font-black text-[8px] leading-none opacity-90">
                      {card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '❤️' : card.value.toUpperCase()}
                    </div>

                    {/* Playable Badge */}
                    {playable && (
                      <span className="absolute -top-2.5 px-1 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black text-[7px] uppercase shadow-xs">
                        Bisa
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* COLOR PICKER MODAL (When Wild Card is played) */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-5 text-center space-y-3 border-4 border-purple-500 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
              🌈
            </div>
            <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Pilih Warna Berikutnya!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pilih warna kartu yang harus dimainkan selanjutnya:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {(['red', 'blue', 'green', 'yellow'] as UnoColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (pendingWildCard) {
                      executePlayCard(pendingWildCard, c);
                    }
                  }}
                  className={`p-3 rounded-2xl font-display font-black text-xs sm:text-sm text-white shadow-md active:scale-95 transition-all ${COLOR_MAP[c].bg}`}
                >
                  {COLOR_MAP[c].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASTA SPECIAL ACTION POPUP */}
      {specialActionText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-5 text-center space-y-3 border-4 border-rose-500 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md animate-bounce">
              💖
            </div>
            <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Kasih Sayang Keluarga ASTA!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed bg-rose-50 dark:bg-rose-950/50 p-3 rounded-2xl border border-rose-200 dark:border-rose-900">
              {specialActionText}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setSpecialActionText(null);
                fireSmallPop(0.5, 0.4);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
            >
              SUDAH KAMI LAKUKAN! 🥰
            </button>
          </div>
        </div>
      )}

      {/* WINNER MODAL 🏆 */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-5 text-center space-y-3 border-4 border-rose-500 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-family-coral">
                JUARA 1 UNO KELUARGA ASTA
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-0.5">
                {winner.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Kartu di tangan habis lebih dahulu! Kemenangan luar biasa untuk keluarga 🎉
              </p>
            </div>

            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2.5">
              <span className="text-2xl">{winner.avatar}</span>
              <div className="text-left">
                <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                  Pemenang Utama UNO 🥇
                </div>
                <div className="text-[10px] text-family-coral font-bold">
                  +100 Poin Kasih Sayang Keluarga
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={initializeGame}
                className="py-2.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
              >
                MAIN LAGI 🔄
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsGameStarted(false);
                }}
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-display font-black text-xs active:scale-95 transition-all"
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
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-5 space-y-3 border-2 border-slate-200 dark:border-slate-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Aturan Main UNO Keluarga
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 space-y-0.5">
                <div className="font-bold text-family-coral">🎨 1. Mencocokkan Kartu</div>
                <p>Keluarkan kartu yang memiliki <strong>warna yang sama</strong> ATAU <strong>angka/simbol yang sama</strong> dengan kartu teratas di meja.</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 space-y-0.5">
                <div className="font-bold text-amber-700 dark:text-amber-400">⚡ 2. Kartu Aksi Seru</div>
                <p>• <strong>🚫 Skip</strong>: Pemain berikutnya dilewati.</p>
                <p>• <strong>🔄 Reverse</strong>: Arah putaran giliran dibalik.</p>
                <p>• <strong>➕2 Draw Two</strong>: Lawan ambil 2 kartu & dilewati.</p>
                <p>• <strong>🔥 Wild Draw 4</strong>: Ganti warna & lawan ambil 4 kartu!</p>
                <p>• <strong>💖 Kasih Sayang ASTA</strong>: Ganti warna & beri pelukan keluarga!</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-0.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">🗣️ 3. Teriak "UNO!"</div>
                <p>Ketika kartu di tangan Anda tersisa <strong>1 kartu</strong>, tekan tombol <strong>"UNO!"</strong> untuk mengumumkan ke lawan!</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-0.5">
                <div className="font-bold text-blue-700 dark:text-blue-400">🏆 4. Kemenangan</div>
                <p>Pemain pertama yang menghabiskan seluruh kartu di tangan dinobatkan sebagai <strong>Juara 1</strong>!</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-2xl bg-family-coral hover:bg-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
            >
              MENGERTI, SIAP MAIN! 👍
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
