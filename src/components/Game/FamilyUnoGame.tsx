import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArrowLeft, RotateCcw, HelpCircle, X, Sparkles } from 'lucide-react';
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
}> = {
  red: {
    name: 'Merah',
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    gradient: 'from-red-500 to-rose-600'
  },
  blue: {
    name: 'Biru',
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    gradient: 'from-blue-500 to-indigo-600'
  },
  green: {
    name: 'Hijau',
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-600'
  },
  yellow: {
    name: 'Kuning',
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    gradient: 'from-amber-400 to-yellow-500'
  },
  wild: {
    name: 'Bebas (Wild)',
    bg: 'bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500',
    border: 'border-purple-500',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    gradient: 'from-purple-600 to-pink-600'
  }
};

// Generate Full UNO Deck
function createUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
  let idCounter = 1;

  colors.forEach(color => {
    // One '0' per color
    deck.push({ id: `c-${idCounter++}`, color, value: '0' });

    // Two of 1-9 per color
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c-${idCounter++}`, color, value: `${i}` as UnoValue });
      deck.push({ id: `c-${idCounter++}`, color, value: `${i}` as UnoValue });
    }

    // Two of each action card per color
    ['skip', 'reverse', 'draw2'].forEach(action => {
      deck.push({ id: `c-${idCounter++}`, color, value: action as UnoValue });
      deck.push({ id: `c-${idCounter++}`, color, value: action as UnoValue });
    });
  });

  // 4 Wild and 4 Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild4' });
  }

  // 2 Special ASTA Love Wild cards
  deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'asta_love' });
  deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'asta_love' });

  // Shuffle Deck Fisher-Yates
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

    // First card on discard pile (must not be wild4 to start fair)
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
    setMessage(`Game dimulai! Giliran ${activeConfigs[0].name}. Cocokkan warna ${COLOR_MAP[startColor].name} atau angka ${firstCard.value}!`);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const activePlayer = unoPlayers[currentTurnIdx % (unoPlayers.length || 1)] || unoPlayers[0];
  const topDiscard = discardPile[discardPile.length - 1];

  // Check if a card is valid to play
  const isCardPlayable = (card: UnoCard): boolean => {
    if (!topDiscard) return false;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topDiscard.value) return true;
    return false;
  };

  // Play a Card
  const handlePlayCard = (card: UnoCard) => {
    if (!activePlayer || !topDiscard || winner) return;

    if (!isCardPlayable(card)) {
      sound.playClick();
      setMessage(`Kartu tidak cocok! Pilih kartu berwarna ${COLOR_MAP[activeColor].name} atau bernilai ${topDiscard.value}.`);
      return;
    }

    // If Wild card, prompt color picker first
    if (card.color === 'wild') {
      sound.playCardFlip();
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    executePlayCard(card, card.color);
  };

  // Execute playing card after color confirmed
  const executePlayCard = (card: UnoCard, chosenColor: UnoColor) => {
    sound.playCardFlip();

    // Remove from active player's hand
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

    // Check Win Condition
    if (updatedHand.length === 0) {
      setWinner(activePlayer);
      sound.playVictory();
      fireVictoryShower();
      setMessage(`🎉 HOREEE! ${activePlayer.name} MENANG JUARA 1 UNO KELUARGA ASTA! 🏆`);
      return;
    }

    // Check UNO shout warning
    if (updatedHand.length === 1 && !activePlayer.hasSaidUno) {
      sound.playFunnyBonus();
      fireSmallPop(0.5, 0.4);
      setMessage(`📢 ${activePlayer.name} berseru "UNO!" (Tersisa 1 kartu lagi!)`);
    }

    // Process Action Card effects
    processActionCard(card, updatedPlayers, chosenColor);
  };

  // Process Card effects like Skip, Reverse, Draw2, Wild4, ASTA Love
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
        // In 2 player UNO, reverse acts like a Skip
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
      effectMsg = `➕2 ${targetPlayer.name} mengambil 2 kartu dan dilewati gilirannya!`;
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

  // Draw cards from draw pile (replenishing if needed)
  const drawCardsForPlayer = (playerId: string, count: number) => {
    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDraw.length === 0) {
        if (currentDiscard.length > 1) {
          const top = currentDiscard.pop()!;
          currentDraw = [...currentDiscard];
          // Reshuffle
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

  // Active Player taps Deck to draw 1 card
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

  // Shout UNO Button
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
            <span>🃏 UNO Keluarga ASTA</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
            {isGameStarted ? `${unoPlayers.length} Pemain • Arah ${isClockwise ? 'Searah ↻' : 'Berlawanan ↺'}` : 'Pilih Jumlah Pemain'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 transition-all active:scale-90"
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
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-500 via-yellow-400 to-blue-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🃏
            </div>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Pengaturan Game UNO Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Permainan kartu UNO penuh keseruan, aksi Skip, Reverse, Draw 2, Wild Draw 4, dan Kartu Spesial Kasih Sayang ASTA!
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
                  <span className="text-2xl">{num === 2 ? '👥' : num === 3 ? '👨‍👩‍👦' : '👨‍👩‍👧‍👦'}</span>
                  <span className="font-display font-black text-base text-slate-900 dark:text-white">
                    {num} Pemain
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {num === 2 ? 'Duel 1 lawan 1' : num === 3 ? 'Segitiga Seru' : 'Keluarga Lengkap'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Jumlah Kartu Awal */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              2. Jumlah Kartu di Tangan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setCardsPerHand(5);
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${
                  cardsPerHand === 5
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-2xl">⚡</div>
                <div className="text-left">
                  <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Mode Kilat (5 Kartu)
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Selesai cepat ~5-10 menit.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCardsPerHand(7);
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${
                  cardsPerHand === 7
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-2xl">👑</div>
                <div className="text-left">
                  <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Mode Standar (7 Kartu)
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Aturan resmi UNO dunia.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={initializeGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 hover:opacity-95 text-white font-display font-black text-base shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>BAGIKAN KARTU & MULAI MAIN</span>
          </button>
        </div>
      ) : (
        /* ACTIVE UNO GAMEPLAY */
        <div className="space-y-4">
          
          {/* Players Turn Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {unoPlayers.map((p) => {
              const isCurrentTurn = p.id === activePlayer.id;

              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 relative ${
                    isCurrentTurn
                      ? 'border-family-coral bg-rose-50 dark:bg-rose-950/60 shadow-md scale-102 ring-2 ring-rose-400/50'
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
                      <span>{p.hand.length} Kartu</span>
                      {p.hand.length === 1 && (
                        <span className="text-rose-600 font-extrabold animate-pulse">UNO! 🔥</span>
                      )}
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

          {/* Action Message Bar */}
          <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-2xl border-2 border-rose-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              <span className="text-lg">📢</span>
              <span>{message}</span>
            </div>
            {activePlayer.hand.length === 2 && (
              <button
                onClick={handleShoutUno}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 animate-bounce"
              >
                TERIAK "UNO!" 🗣️
              </button>
            )}
          </div>

          {/* Table Center (Discard Pile & Draw Deck & Active Color) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-5 sm:p-6 border-4 border-slate-700 shadow-bubbly-lg flex flex-col items-center justify-center space-y-4 text-white relative min-h-[220px]">
            
            {/* Active Color Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-300">Warna Aktif:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${COLOR_MAP[activeColor].bg} text-white`}>
                {COLOR_MAP[activeColor].name}
              </span>
              <span className="text-xs text-slate-400 font-bold ml-2">
                Arah: {isClockwise ? 'Searah ↻' : 'Berlawanan ↺'}
              </span>
            </div>

            {/* Piles Center */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              
              {/* Draw Deck */}
              <div
                onClick={handlePlayerDrawCard}
                className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border-3 border-amber-400/80 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group relative"
                title="Klik untuk ambil 1 kartu"
              >
                <div className="w-16 h-24 rounded-xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-inner transform -rotate-6 group-hover:rotate-0 transition-transform">
                  UNO
                </div>
                <span className="text-[10px] font-black text-amber-300 mt-2 uppercase tracking-wide">
                  Ambil (+1)
                </span>
                <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-sm">
                  {drawPile.length} Kartu
                </span>
              </div>

              {/* Top Discard Card */}
              {topDiscard && (
                <div className={`w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-br ${COLOR_MAP[topDiscard.color === 'wild' ? activeColor : topDiscard.color].gradient} border-4 border-white shadow-2xl flex flex-col items-center justify-between p-2 text-white relative animate-pop-in`}>
                  <div className="self-start font-black text-sm">
                    {topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '❤️' : topDiscard.value.toUpperCase()}
                  </div>
                  <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-2xl sm:text-3xl drop-shadow-md">
                    {topDiscard.value === 'skip' ? '🚫' : topDiscard.value === 'reverse' ? '🔄' : topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '💖' : topDiscard.value === 'wild' ? '🌈' : topDiscard.value}
                  </div>
                  <div className="self-end font-black text-sm transform rotate-180">
                    {topDiscard.value === 'draw2' ? '+2' : topDiscard.value === 'wild4' ? '+4' : topDiscard.value === 'asta_love' ? '❤️' : topDiscard.value.toUpperCase()}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Active Player Hand */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border-3 border-rose-100 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activePlayer.avatar}</span>
                <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Tangan {activePlayer.name} ({activePlayer.hand.length} Kartu)
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                Pilih kartu yang cocok untuk dimainkan:
              </span>
            </div>

            {/* Cards Scroll List */}
            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-2 px-1">
              {activePlayer.hand.map((card) => {
                const playable = isCardPlayable(card);

                return (
                  <button
                    key={card.id}
                    onClick={() => handlePlayCard(card)}
                    className={`w-20 h-32 sm:w-24 sm:h-36 rounded-2xl bg-gradient-to-br ${COLOR_MAP[card.color].gradient} p-2 text-white flex flex-col justify-between items-center shrink-0 transition-all border-2 border-white shadow-md active:scale-95 ${
                      playable
                        ? 'hover:-translate-y-2 hover:shadow-xl ring-3 ring-amber-400 cursor-pointer animate-pulse-subtle'
                        : 'opacity-50 grayscale-30 cursor-not-allowed'
                    }`}
                  >
                    <div className="self-start font-black text-xs">
                      {card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '❤️' : card.value.toUpperCase()}
                    </div>
                    <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl sm:text-2xl">
                      {card.value === 'skip' ? '🚫' : card.value === 'reverse' ? '🔄' : card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '💖' : card.value === 'wild' ? '🌈' : card.value}
                    </div>
                    <div className="self-end font-black text-xs transform rotate-180">
                      {card.value === 'draw2' ? '+2' : card.value === 'wild4' ? '+4' : card.value === 'asta_love' ? '❤️' : card.value.toUpperCase()}
                    </div>
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
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-4 border-4 border-purple-500 shadow-bubbly-lg">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🌈
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Pilih Warna Berikutnya!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pilih warna kartu yang harus dimainkan oleh pemain selanjutnya:
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['red', 'blue', 'green', 'yellow'] as UnoColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (pendingWildCard) {
                      executePlayCard(pendingWildCard, c);
                    }
                  }}
                  className={`p-4 rounded-2xl font-display font-black text-sm text-white shadow-md active:scale-95 transition-all ${COLOR_MAP[c].bg}`}
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
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-4 border-4 border-rose-500 shadow-bubbly-coral">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md animate-bounce">
              💖
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Kasih Sayang Keluarga ASTA!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed bg-rose-50 dark:bg-rose-950/50 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900">
              {specialActionText}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setSpecialActionText(null);
                fireSmallPop(0.5, 0.4);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-sm shadow-md active:scale-95 transition-all"
            >
              SUDAH KAMI LAKUKAN! 🥰
            </button>
          </div>
        </div>
      )}

      {/* WINNER MODAL 🏆 */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 text-center space-y-5 border-4 border-rose-500 shadow-bubbly-lg">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-family-coral">
                JUARA 1 UNO KELUARGA ASTA
              </span>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
                {winner.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Kartu di tangan habis lebih dahulu! Kemenangan spektakuler untuk keluarga tercinta 🎉
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-3">
              <span className="text-3xl">{winner.avatar}</span>
              <div className="text-left">
                <div className="font-display font-black text-sm text-slate-900 dark:text-white">
                  Pemenang Utama UNO 🥇
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
                  Aturan Main UNO Keluarga
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
                <div className="font-bold text-family-coral">🎨 1. Mencocokkan Kartu</div>
                <p>Keluarkan kartu yang memiliki <strong>warna yang sama</strong> ATAU <strong>angka/simbol yang sama</strong> dengan kartu teratas di meja.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400">⚡ 2. Kartu Aksi Seru</div>
                <p>• <strong>🚫 Skip</strong>: Pemain berikutnya dilewati.</p>
                <p>• <strong>🔄 Reverse</strong>: Arah putaran giliran dibalik.</p>
                <p>• <strong>➕2 Draw Two</strong>: Lawan ambil 2 kartu dan dilewati.</p>
                <p>• <strong>🔥 Wild Draw 4</strong>: Ganti warna & lawan ambil 4 kartu!</p>
                <p>• <strong>💖 Kasih Sayang ASTA</strong>: Ganti warna & beri pelukan keluarga!</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">🗣️ 3. Teriak "UNO!"</div>
                <p>Ketika kartu di tangan Anda tersisa tinggal <strong>1 kartu</strong>, tekan tombol <strong>"UNO!"</strong> untuk mengumumkan ke seluruh pemain!</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-1">
                <div className="font-bold text-blue-700 dark:text-blue-400">🏆 4. Kemenangan</div>
                <p>Pemain pertama yang menghabiskan seluruh kartu di tangan dinobatkan sebagai <strong>Juara 1</strong>!</p>
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
