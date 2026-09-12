import React, { useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types/game';
import type { UserAccount } from '../../types/auth';
import { 
  ArrowLeft, RotateCcw, HelpCircle, X, Sparkles, Layers, Sliders,
  Globe, Check, Copy, Share2, Play, Clock, MessageSquare,
  Send, CheckCircle2
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower, fireSmallPop } from '../../utils/confetti';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';

interface FamilyUnoGameProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onBack: () => void;
}

export type PlayMode = 'solo_bot' | 'online_friends';
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
  isLeft?: boolean;
  status?: 'playing' | 'keluar';
}

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isCorrect?: boolean;
  isSystem?: boolean;
  timestamp: string;
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

export const FamilyUnoGame: React.FC<FamilyUnoGameProps> = ({ players: initialPlayers, currentUser, familyCode, onBack }) => {
  // Play Mode & Navigation
  const [playMode, setPlayMode] = useState<PlayMode>('solo_bot');
  const [showModeModal, setShowModeModal] = useState<boolean>(true);
  const [showOnlineErrorModal, setShowOnlineErrorModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Ready Room & 3-2-1 Synchronous Start States
  const [isWaitingLobby, setIsWaitingLobby] = useState(false);
  const [readyPlayerIds, setReadyPlayerIds] = useState<string[]>([]);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [lobbyNoticeMsg, setLobbyNoticeMsg] = useState<string | null>(null);

  // Active Family Code
  const activeFamilyCode = familyCode || db.getSavedSession()?.family?.familyCode || 'ASTA-2026';

  // Logged-in user information
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
      const activeName = (currentUser?.fullName || '').toLowerCase().trim();
      
      const loggedInIndex = initialPlayers.findIndex(
        (p) => (activeId && p.id === activeId) || (activeName && activeName.length >= 2 && p.name.toLowerCase().includes(activeName))
      );
      const activeIdx = loggedInIndex !== -1 ? loggedInIndex : 0;

      // Filter ONLY family members who are actually logged in and online (strictly exclude bot accounts)
      const trulyOnlineMembers = initialPlayers.filter(
        (p, idx) => !p.name.toLowerCase().includes('bot') && (Boolean(p.isOnline) || idx === activeIdx)
      );

      return trulyOnlineMembers.map((p, idx) => {
        const isMe = Boolean(
          (activeId && p.id === activeId) ||
          (activeName && activeName.length >= 2 && p.name.toLowerCase().includes(activeName)) ||
          (idx === activeIdx && Boolean(activeId || activeName))
        );
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
    ];
  }, [initialPlayers, currentUser, userDisplayName, userAvatar]);

  const [players, setPlayers] = useState<Player[]>(getSoloPlayers());

  const getActiveUserPlayer = useCallback((playerList: Player[]): Player => {
    if (playerList.length === 0) return { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-blue-500', isOnline: true };
    const activeId = currentUser?.id || '';
    const activeName = (currentUser?.fullName || '').toLowerCase().trim();

    const matched = playerList.find((p) => {
      if (activeId && p.id === activeId) return true;
      if (activeName && activeName.length >= 2 && p.name.toLowerCase().includes(activeName)) return true;
      if (p.name.includes('(Anda)')) return true;
      return false;
    });

    return matched || playerList[0];
  }, [currentUser, userDisplayName, userAvatar]);

  const getActiveUserUnoPlayer = useCallback((playerList: UnoPlayer[]): UnoPlayer => {
    if (playerList.length === 0) return { id: '1', name: userDisplayName, avatar: userAvatar, hand: [], hasSaidUno: false };
    const activeId = currentUser?.id || '';
    const activeName = (currentUser?.fullName || '').toLowerCase().trim();

    const matched = playerList.find((p) => {
      if (activeId && p.id === activeId) return true;
      if (activeName && activeName.length >= 2 && p.name.toLowerCase().includes(activeName)) return true;
      if (p.name.includes('(Anda)')) return true;
      return false;
    });

    return matched || playerList[0];
  }, [currentUser, userDisplayName, userAvatar]);

  // Game configuration
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

  // Chat Stream State
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Sistem', text: '🃏 Selamat datang di UNO Keluarga ASTA!', isSystem: true, timestamp: '14:30' },
  ]);

  // Broadcast Realtime Game Event across devices (Supabase) & tabs (BroadcastChannel)
  const broadcastGameEvent = useCallback((event: string, payload: any) => {
    if (!activeFamilyCode) return;
    const roomCode = activeFamilyCode.toUpperCase();

    // 1. Cross-Device WebSocket Broadcast via Supabase
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        const channel = supabase.channel(`uno_${roomCode}`);
        channel.send({
          type: 'broadcast',
          event,
          payload,
        }).catch(() => {});
      }
    } catch {}

    // 2. Same-Device BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`asta_uno_${roomCode}`);
        bc.postMessage({ event, payload });
        bc.close();
      } catch {}
    }
  }, [activeFamilyCode]);

  // Synchronize full game state to all devices in multiplayer mode
  const broadcastGameState = useCallback((stateUpdate: Partial<{
    unoPlayers: UnoPlayer[];
    drawPile: UnoCard[];
    discardPile: UnoCard[];
    activeColor: UnoColor;
    currentTurnIdx: number;
    isClockwise: boolean;
    winner: UnoPlayer | null;
    message: string;
    specialActionText: string | null;
    chatMessages: ChatMessage[];
  }>) => {
    if (playMode === 'online_friends') {
      broadcastGameEvent('UNO_GAME_SYNC', stateUpdate);
    }
  }, [playMode, broadcastGameEvent]);

  // Initialize & Deal Cards
  const initializeGame = useCallback((initialState?: any) => {
    if (initialState) {
      setUnoPlayers(initialState.unoPlayers);
      setDrawPile(initialState.drawPile);
      setDiscardPile(initialState.discardPile);
      setActiveColor(initialState.activeColor);
      setCurrentTurnIdx(initialState.currentTurnIdx);
      setIsClockwise(initialState.isClockwise);
      setWinner(initialState.winner);
      setMessage(initialState.message);
      setSpecialActionText(initialState.specialActionText);
      setIsGameStarted(true);
      return;
    }

    const newDeck = createUnoDeck();
    const activeConfigs: UnoPlayer[] = [];
    const playerList = playMode === 'online_friends' ? getOnlinePlayers() : getSoloPlayers();

    playerList.forEach((p, i) => {
      const hand = newDeck.splice(0, cardsPerHand);
      activeConfigs.push({
        id: p.id,
        name: p.name,
        avatar: p.avatar || (i === 0 ? '👨‍💼' : i === 1 ? '👩‍🍳' : i === 2 ? '👦' : '👧'),
        hand,
        hasSaidUno: false
      });
    });

    let firstCard = newDeck.pop()!;
    while (firstCard.value === 'wild4' || firstCard.value === 'asta_love') {
      newDeck.unshift(firstCard);
      firstCard = newDeck.pop()!;
    }

    const startColor = firstCard.color === 'wild' ? 'red' : firstCard.color;
    const startMsg = `Game dimulai! Giliran ${activeConfigs[0].name}. Cocokkan warna ${COLOR_MAP[startColor].name} atau angka ${firstCard.value.toUpperCase()}!`;

    const freshState = {
      unoPlayers: activeConfigs,
      drawPile: newDeck,
      discardPile: [firstCard],
      activeColor: startColor,
      currentTurnIdx: 0,
      isClockwise: true,
      winner: null,
      message: startMsg,
      specialActionText: null,
    };

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
    setMessage(startMsg);

    sound.playSuccess();
    fireBurstConfetti();

    if (playMode === 'online_friends') {
      broadcastGameEvent('GAME_START_COUNTDOWN', { initialGameState: freshState });
    }
  }, [playMode, cardsPerHand, getOnlinePlayers, getSoloPlayers, broadcastGameEvent]);

  // 3-2-1 Synchronous Start Countdown Sequence
  const startCountdownSequence = useCallback((initialState?: any) => {
    setIsWaitingLobby(false);
    setShowModeModal(false);
    setCountdownNumber(3);
    sound.playTimerTick();

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNumber(count);
        sound.playTimerTick();
      } else if (count === 0) {
        setCountdownNumber(0);
        sound.playSuccess();
      } else {
        clearInterval(interval);
        setCountdownNumber(null);
        initializeGame(initialState);
      }
    }, 1000);
  }, [initializeGame]);

  // Real-time Event Listener for Cross-Device Supabase WebSocket & BroadcastChannel
  useEffect(() => {
    if (!activeFamilyCode) return;

    const roomCode = activeFamilyCode.toUpperCase();
    const channelName = `uno_${roomCode}`;
    let supabaseChannel: any = null;
    let localBc: BroadcastChannel | null = null;

    const handleIncomingEvent = (event: string, payload: any) => {
      if (event === 'GAME_START_COUNTDOWN') {
        setIsWaitingLobby(false);
        setShowModeModal(false);
        startCountdownSequence(payload?.initialGameState);
      } else if (event === 'READY_STATUS_CHANGE') {
        if (Array.isArray(payload?.readyPlayerIds)) {
          setReadyPlayerIds(payload.readyPlayerIds);
          sound.playTimerTick();
          if (payload.readyPlayerIds.length >= players.length && players.length >= 2) {
            setTimeout(() => {
              setIsWaitingLobby(false);
              setShowModeModal(false);
              startCountdownSequence(payload?.initialGameState);
            }, 500);
          }
        }
      } else if (event === 'UNO_GAME_SYNC') {
        if (payload?.unoPlayers) setUnoPlayers(payload.unoPlayers);
        if (payload?.drawPile) setDrawPile(payload.drawPile);
        if (payload?.discardPile) setDiscardPile(payload.discardPile);
        if (payload?.activeColor) setActiveColor(payload.activeColor);
        if (typeof payload?.currentTurnIdx === 'number') setCurrentTurnIdx(payload.currentTurnIdx);
        if (typeof payload?.isClockwise === 'boolean') setIsClockwise(payload.isClockwise);
        if (payload?.winner !== undefined) setWinner(payload.winner);
        if (payload?.message) setMessage(payload.message);
        if (payload?.specialActionText !== undefined) setSpecialActionText(payload.specialActionText);
        if (Array.isArray(payload?.chatMessages)) {
          setChatMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = payload.chatMessages.filter((m: ChatMessage) => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
      } else if (event === 'NEW_CHAT_MESSAGE') {
        if (payload?.msg) {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === payload.msg.id)) return prev;
            return [...prev, payload.msg];
          });
        }
      } else if (event === 'PLAYER_LEFT') {
        if (payload?.playerId) {
          handlePlayerLeftGame(payload.playerId, payload.playerName);
        }
      }
    };

    // 1. Supabase Realtime Listener
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        supabaseChannel = supabase
          .channel(channelName, {
            config: {
              presence: { key: activeUserUnoPlayer?.id || 'guest' }
            }
          })
          .on('broadcast', { event: '*' }, ({ event, payload }: any) => {
            handleIncomingEvent(event, payload);
          })
          .on('presence', { event: 'leave' }, ({ key }: any) => {
            if (key) {
              handlePlayerLeftGame(key);
            }
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED' && activeUserUnoPlayer?.id) {
              supabaseChannel.track({
                id: activeUserUnoPlayer.id,
                name: activeUserUnoPlayer.name,
                online_at: new Date().toISOString()
              }).catch(() => {});
            }
          });
      }
    } catch {}

    // 2. BroadcastChannel Listener (same-device)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        localBc = new BroadcastChannel(`asta_uno_${roomCode}`);
        localBc.onmessage = (evt) => {
          if (evt.data?.event) {
            handleIncomingEvent(evt.data.event, evt.data.payload);
          }
        };
      } catch {}
    }

    return () => {
      if (supabaseChannel && postgresService.getClient()) {
        postgresService.getClient()?.removeChannel(supabaseChannel);
      }
      if (localBc) {
        localBc.close();
      }
    };
  }, [activeFamilyCode, startCountdownSequence, players]);

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

      setPlayMode('online_friends');
      setShowModeModal(false);
      setShowOnlineErrorModal(false);
      setPlayers(onlineMembers);

      const activeUser = getActiveUserPlayer(onlineMembers);
      const initialReady = [activeUser.id];
      setReadyPlayerIds(initialReady);
      setIsWaitingLobby(true);
      setChatMessages([
        {
          id: Date.now().toString(),
          senderName: 'Sistem',
          text: `🌐 Mode Teman Online Aktif (Kode: ${activeFamilyCode})! Selamat bergabung, permainan dimulai serempak ketika semua siap.`,
          isSystem: true,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

      broadcastGameEvent('READY_STATUS_CHANGE', { readyPlayerIds: initialReady });
      return;
    }

    setPlayMode(mode);
    setShowModeModal(false);
    setShowOnlineErrorModal(false);
    setPlayers(getSoloPlayers());
    setChatMessages([
      { id: '1', senderName: 'Sistem', text: '🤖 Mode Bermain Sendiri (vs AI Bot) dimulai! Nikmati permainan solo!', isSystem: true, timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const handleToggleReady = (playerId: string) => {
    sound.playClick();
    setLobbyNoticeMsg(null);

    setReadyPlayerIds((prev) => {
      const updated = prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId];
      
      broadcastGameEvent('READY_STATUS_CHANGE', { readyPlayerIds: updated });

      if (updated.length >= players.length && players.length >= 2) {
        setTimeout(() => {
          startCountdownSequence();
        }, 500);
      }
      return updated;
    });
  };

  const handleStartSynchronousGame = () => {
    sound.playClick();

    const activeUser = getActiveUserPlayer(players);
    let currentReady = [...readyPlayerIds];

    if (!currentReady.includes(activeUser.id)) {
      currentReady = [...currentReady, activeUser.id];
      setReadyPlayerIds(currentReady);
      broadcastGameEvent('READY_STATUS_CHANGE', { readyPlayerIds: currentReady });
    }

    const unreadyMembers = players.filter((p) => !currentReady.includes(p.id));

    if (unreadyMembers.length > 0) {
      sound.playTimerWarning();
      const names = unreadyMembers.map((p) => p.name).join(', ');
      setLobbyNoticeMsg(`⏳ Menunggu ${names} mengklik tombol SIAP terlebih dahulu agar dapat mulai serempak! (${currentReady.length}/${players.length} Siap)`);
      return;
    }

    setLobbyNoticeMsg(null);
    startCountdownSequence();
  };

  // Turn & User helpers
  const activePlayer = unoPlayers[currentTurnIdx % (unoPlayers.length || 1)] || unoPlayers[0];
  const activeUserUnoPlayer = getActiveUserUnoPlayer(unoPlayers);
  const activeUserPlayer = activeUserUnoPlayer;
  const topDiscard = discardPile[discardPile.length - 1];

  const isCardPlayable = (card: UnoCard): boolean => {
    if (!topDiscard) return false;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topDiscard.value) return true;
    return false;
  };

  const hasAnyPlayableCard = activeUserUnoPlayer ? activeUserUnoPlayer.hand.some(c => isCardPlayable(c)) : false;

  const sortHandByColor = () => {
    if (!activeUserUnoPlayer) return;
    sound.playClick();
    const colorOrder: Record<UnoColor, number> = { red: 1, blue: 2, green: 3, yellow: 4, wild: 5 };
    const sorted = [...activeUserUnoPlayer.hand].sort((a, b) => {
      if (colorOrder[a.color] !== colorOrder[b.color]) {
        return colorOrder[a.color] - colorOrder[b.color];
      }
      return a.value.localeCompare(b.value);
    });

    const updatedPlayers = unoPlayers.map(p => p.id === activeUserUnoPlayer.id ? { ...p, hand: sorted } : p);
    setUnoPlayers(updatedPlayers);
    broadcastGameState({ unoPlayers: updatedPlayers });
  };

  const handlePlayCard = (card: UnoCard) => {
    if (!activePlayer || !topDiscard || winner) return;

    // Check if it's the current user's turn in multiplayer
    if (playMode === 'online_friends' && activePlayer.id !== activeUserUnoPlayer.id) {
      sound.playClick();
      setMessage(`⏳ Masih giliran ${activePlayer.name}! Harap tunggu giliran Anda.`);
      return;
    }

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
      const winMsg = `🎉 HOREEE! ${activePlayer.name} MENANG JUARA 1 UNO KELUARGA ASTA! 🏆`;
      setMessage(winMsg);

      broadcastGameState({
        unoPlayers: updatedPlayers,
        discardPile: newDiscard,
        activeColor: chosenColor,
        winner: activePlayer,
        message: winMsg,
      });
      return;
    }

    let actionMsg = message;
    if (updatedHand.length === 1 && !activePlayer.hasSaidUno) {
      sound.playFunnyBonus();
      fireSmallPop(0.5, 0.4);
      actionMsg = `📢 ${activePlayer.name} berseru "UNO!" (Tersisa 1 kartu lagi!)`;
      setMessage(actionMsg);
    }

    processActionCard(card, updatedPlayers, chosenColor, newDiscard);
  };

  const processActionCard = (card: UnoCard, currentPlayersList: UnoPlayer[], chosenColor: UnoColor, newDiscardPile: UnoCard[]) => {
    let nextIdx = getNextPlayerIndex(1);
    let extraStep = 1;
    let effectMsg = `${activePlayer.name} memainkan ${card.value.toUpperCase()}.`;

    if (card.value === 'skip') {
      const skippedPlayer = currentPlayersList[nextIdx];
      effectMsg = `🚫 ${skippedPlayer.name} dilewati (Skip)!`;
      extraStep = 2;
      sound.playFunnyBonus();
    } else if (card.value === 'reverse') {
      if (unoPlayers.length === 2) {
        const skippedPlayer = currentPlayersList[nextIdx];
        effectMsg = `🔄 Putar Balik! ${skippedPlayer.name} dilewati gilirannya!`;
        extraStep = 2;
      } else {
        const nextClockwise = !isClockwise;
        setIsClockwise(nextClockwise);
        effectMsg = `🔄 Arah putaran giliran dibalik (${nextClockwise ? 'Searah' : 'Berlawanan'} jarum jam)!`;
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

    const nextPlayerIdx = getNextPlayerIndex(extraStep);
    setCurrentTurnIdx(nextPlayerIdx);

    const nextP = currentPlayersList[nextPlayerIdx];
    const fullMsg = `${effectMsg} Sekarang giliran ${nextP?.name || 'Pemain'}.`;
    setMessage(fullMsg);

    broadcastGameState({
      unoPlayers: currentPlayersList,
      discardPile: newDiscardPile,
      activeColor: chosenColor,
      currentTurnIdx: nextPlayerIdx,
      isClockwise: isClockwise,
      message: fullMsg,
    });
  };

  const getNextPlayerIndex = (steps: number, playersList = unoPlayers): number => {
    const total = playersList.length;
    if (total === 0) return 0;
    let idx = currentTurnIdx;
    let stepCount = 0;
    let attempts = 0;
    while (stepCount < steps && attempts < total * 2) {
      attempts++;
      if (isClockwise) {
        idx = (idx + 1) % total;
      } else {
        idx = (idx - 1 + total) % total;
      }
      if (!playersList[idx]?.isLeft) {
        stepCount++;
      }
    }
    return idx;
  };

  const handlePlayerLeftGame = useCallback((leavingId: string, leavingName?: string) => {
    if (!isGameStarted) return;
    setUnoPlayers((prevPlayers) => {
      const targetPlayer = prevPlayers.find(p => p.id === leavingId);
      if (!targetPlayer || targetPlayer.isLeft) return prevPlayers;

      const pName = leavingName || targetPlayer.name;
      const updatedPlayers = prevPlayers.map((p) =>
        p.id === leavingId ? { ...p, isLeft: true, status: 'keluar' as const } : p
      );

      const activePlayers = updatedPlayers.filter((p) => !p.isLeft);

      // Rule: If game started with >= 2 players and only 1 active player remains -> Automatic Win!
      if (prevPlayers.length >= 2 && activePlayers.length === 1) {
        const winnerPlayer = activePlayers[0];
        setWinner(winnerPlayer);
        const winMsg = `🎉 ${winnerPlayer.name} MENANG JUARA 1! (${pName} keluar dari permainan) 🏆`;
        setMessage(winMsg);
        sound.playVictory();
        fireVictoryShower();

        broadcastGameState({
          unoPlayers: updatedPlayers,
          winner: winnerPlayer,
          message: winMsg,
        });
      } else if (activePlayers.length > 1) {
        const exitMsg = `📢 ${pName} telah keluar dari permainan (Status: Keluar). Permainan berlanjut!`;
        setMessage(exitMsg);

        let nextTurn = currentTurnIdx;
        if (prevPlayers[currentTurnIdx]?.id === leavingId) {
          nextTurn = getNextPlayerIndex(1, updatedPlayers);
          setCurrentTurnIdx(nextTurn);
        }

        broadcastGameState({
          unoPlayers: updatedPlayers,
          currentTurnIdx: nextTurn,
          message: exitMsg,
        });
      }

      return updatedPlayers;
    });
  }, [isGameStarted, currentTurnIdx, isClockwise, broadcastGameState]);

  const advanceTurn = (steps: number) => {
    const nextIdx = getNextPlayerIndex(steps);
    setCurrentTurnIdx(nextIdx);
    const nextP = unoPlayers[nextIdx];
    if (nextP) {
      const turnMsg = `Sekarang giliran ${nextP.name}.`;
      setMessage(turnMsg);
      broadcastGameState({ currentTurnIdx: nextIdx, message: turnMsg });
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

    const updatedPlayers = unoPlayers.map(p => {
      if (p.id === playerId) {
        return { ...p, hand: [...p.hand, ...drawn], hasSaidUno: false };
      }
      return p;
    });

    setUnoPlayers(updatedPlayers);
    broadcastGameState({
      unoPlayers: updatedPlayers,
      drawPile: currentDraw,
      discardPile: currentDiscard,
    });
  };

  const handlePlayerDrawCard = () => {
    if (!activePlayer || winner) return;

    if (playMode === 'online_friends' && activePlayer.id !== activeUserUnoPlayer.id) {
      sound.playClick();
      setMessage(`⏳ Masih giliran ${activePlayer.name}! Harap tunggu giliran Anda.`);
      return;
    }

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
        const emptyMsg = 'Tumpukan kartu habis! Lanjutkan giliran.';
        setMessage(emptyMsg);
        advanceTurn(1);
        return;
      }
    }

    const drawnCard = currentDraw.pop()!;
    setDrawPile(currentDraw);
    setDiscardPile(currentDiscard);

    const updatedHand = [...activePlayer.hand, drawnCard];
    const updatedPlayers = unoPlayers.map(p => {
      if (p.id === activePlayer.id) {
        return { ...p, hand: updatedHand, hasSaidUno: false };
      }
      return p;
    });

    setUnoPlayers(updatedPlayers);
    const drawMsg = `${activePlayer.name} mengambil 1 kartu.`;
    setMessage(drawMsg);
    sound.playClick();

    const nextPlayerIdx = getNextPlayerIndex(1);
    setCurrentTurnIdx(nextPlayerIdx);
    const nextP = updatedPlayers[nextPlayerIdx];
    const fullMsg = `${drawMsg} Sekarang giliran ${nextP?.name || 'Pemain'}.`;

    broadcastGameState({
      unoPlayers: updatedPlayers,
      drawPile: currentDraw,
      discardPile: currentDiscard,
      currentTurnIdx: nextPlayerIdx,
      message: fullMsg,
    });
  };

  const handleShoutUno = () => {
    if (!activePlayer) return;
    const updatedPlayers = unoPlayers.map(p => {
      if (p.id === activePlayer.id) {
        return { ...p, hasSaidUno: true };
      }
      return p;
    });

    setUnoPlayers(updatedPlayers);
    sound.playFunnyBonus();
    fireBurstConfetti();
    const shoutMsg = `🗣️ "${activePlayer.name} BERTERIAK: UNOOO!" ❤️`;
    setMessage(shoutMsg);

    broadcastGameState({
      unoPlayers: updatedPlayers,
      message: shoutMsg,
    });
  };

  // AI Bot Automated Turns in Solo Mode
  useEffect(() => {
    if (playMode !== 'solo_bot' || !isGameStarted || winner || showColorPicker || !activePlayer) return;

    const isBotTurn = activePlayer.id.startsWith('bot') || !activePlayer.name.includes('(Anda)');
    if (!isBotTurn) return;

    const timer = setTimeout(() => {
      // Find playable card
      const playableCards = activePlayer.hand.filter(c => isCardPlayable(c));

      if (playableCards.length > 0) {
        const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
        const chosenColor = cardToPlay.color === 'wild' ? colors[Math.floor(Math.random() * colors.length)] : cardToPlay.color;

        executePlayCard(cardToPlay, chosenColor);
      } else {
        handlePlayerDrawCard();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [playMode, isGameStarted, currentTurnIdx, winner, showColorPicker, activePlayer]);

  // Share helpers
  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(activeFamilyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWA = () => {
    sound.playClick();
    const messageText = `🃏 *Main UNO Kartu Keluarga ASTA Bersama!*\n` +
      `Yuk bergabung main UNO bareng keluarga sekarang di ASTA Family Time!\n\n` +
      `🔑 *Kode Ruang Keluarga:* ${activeFamilyCode}\n` +
      `👉 https://asta-family-time.vercel.app/`;
    window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const activeUser = getActiveUserPlayer(players);
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: activeUser.name,
      text: guessInput,
      timestamp: nowTime,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setGuessInput('');

    if (playMode === 'online_friends') {
      broadcastGameEvent('NEW_CHAT_MESSAGE', { msg: newMsg });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 space-y-2.5 sm:space-y-3 animate-pop-in select-none">
      
      {/* ONLINE REQUIRED ERROR MODAL */}
      {showOnlineErrorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-4 border-rose-500 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-md">
              ⚠️
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                Membutuhkan Minimal 2 Pemain Online
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Untuk bermain mode <strong>Teman Online</strong>, Anda harus login dahulu dan minimal harus ada <strong>2 anggota keluarga</strong> yang sedang online.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleSelectMode('solo_bot')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-xs shadow-sm flex items-center gap-1.5 active:scale-95"
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
      )}

      {/* 0. MODE SELECTION MODAL */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl w-full border-4 border-amber-300 dark:border-slate-700 shadow-2xl space-y-5">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
                🃏
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                ASTA UNO Kartu Keluarga
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Pilih mode permainan favorit Anda untuk mulai bermain UNO bersama!
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
                    Latihan bermain UNO secara solo melawan AI Bot Keluarga (Bot Bella, Bot Papa, Bot Mamah).
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

      {/* 0. LOBBY WAITING ROOM FOR MULTIPLAYER */}
      {isWaitingLobby && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-pop-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full border-4 border-indigo-500 shadow-2xl space-y-4 text-center">
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🌐
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-black text-xs uppercase tracking-wider">
                RUANG TUNGGU MULTIPLAYER ONLINE
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-1.5">
                Ruang UNO Keluarga ({activeFamilyCode})
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                Semua pemain yang sedang online harus mengklik tombol <strong>SIAP</strong> untuk mulai bersama!
              </p>
            </div>

            {lobbyNoticeMsg && (
              <div className="bg-amber-100 dark:bg-amber-950/80 border border-amber-400 text-amber-900 dark:text-amber-200 p-2.5 rounded-2xl font-bold text-xs animate-shake">
                {lobbyNoticeMsg}
              </div>
            )}

            {/* Online Members Ready Status List */}
            <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                ANGGOTA KELUARGA ONLINE ({players.length}):
              </span>
              {players.map((p) => {
                const isReady = readyPlayerIds.includes(p.id);
                const activeUser = getActiveUserPlayer(players);
                const isMe = p.id === activeUser.id;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between border transition-all ${
                      isReady
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isReady ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SIAP
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> MENUNGGU
                        </span>
                      )}

                      {isMe && (
                        <button
                          onClick={() => handleToggleReady(p.id)}
                          className={`px-3 py-1 rounded-lg font-black text-[10px] transition-all active:scale-95 ${
                            isReady
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                          }`}
                        >
                          {isReady ? 'Batal Siap' : 'Klik SIAP!'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleStartSynchronousGame}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>MULAI GAME SEREMPAK 🚀</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsWaitingLobby(false);
                  setShowModeModal(true);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
              >
                Ubah Mode
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 0. 3-2-1 COUNTDOWN OVERLAY */}
      {countdownNumber !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center text-white animate-pop-in">
          <div className="text-center space-y-4">
            <span className="text-2xl font-black uppercase tracking-widest text-amber-400 animate-pulse">
              PERMAINAN UNO SEREMPAK DIMULAI!
            </span>
            <div className="text-8xl sm:text-9xl font-display font-black text-amber-300 drop-shadow-2xl animate-bounce">
              {countdownNumber === 0 ? 'GO! 🚀' : countdownNumber}
            </div>
            <p className="text-xs text-slate-300 font-bold">
              Persiapkan kartu tangan Anda!
            </p>
          </div>
        </div>
      )}

      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              if (playMode === 'online_friends' && activeUserUnoPlayer) {
                broadcastGameEvent('PLAYER_LEFT', { playerId: activeUserUnoPlayer.id, playerName: activeUserUnoPlayer.name });
              }
              onBack();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

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
            <span>{playMode === 'solo_bot' ? '🤖 Main Sendiri (Bot AI)' : `🌐 Teman Online (${activeFamilyCode})`}</span>
            <span className="underline">Ubah</span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {playMode === 'online_friends' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 text-[10px] font-black flex items-center gap-1"
                title="Salin Kode Keluarga"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{activeFamilyCode}</span>
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
                initializeGame();
              }}
              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-family-coral transition-all active:scale-90"
              title="Kocok Ulang & Mulai Ulang"
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

          {/* 1. Pilih Jumlah Kartu Awal */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Pilih Jumlah Kartu Awal di Tangan
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
            onClick={() => {
              if (playMode === 'online_friends') {
                const onlineMembers = getOnlinePlayers();
                if (onlineMembers.length < 2) {
                  setShowOnlineErrorModal(true);
                  return;
                }
                setIsWaitingLobby(true);
              } else {
                initializeGame();
              }
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 hover:opacity-95 text-white font-display font-black text-xs sm:text-sm shadow-bubbly-coral active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>BAGIKAN KARTU & MULAI MAIN</span>
          </button>
        </div>
      ) : (
        /* ACTIVE UNO GAMEPLAY - FULL 1-SCREEN MOBILE ARENA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Main Gameplay Area (Cols 1-8 on Desktop) */}
          <div className="lg:col-span-8 space-y-2.5">
            
            {/* Top Player Turn Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
              {unoPlayers.map((p) => {
                const isCurrentTurn = p.id === activePlayer.id;

                return (
                  <div
                    key={p.id}
                    className={`px-2.5 py-1.5 rounded-xl border-2 transition-all flex items-center gap-2 shrink-0 ${
                      p.isLeft
                        ? 'border-slate-300 bg-slate-200 dark:bg-slate-800 opacity-50 grayscale'
                        : isCurrentTurn
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
                        {p.isLeft ? 'Keluar' : `${p.hand.length} Kartu`} {p.hand.length === 1 && !p.isLeft && <span className="text-rose-600 font-black animate-pulse">UNO! 🔥</span>}
                      </div>
                    </div>
                    {p.isLeft ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-500 text-white text-[8px] font-black uppercase">
                        Keluar
                      </span>
                    ) : isCurrentTurn && (
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

              {activeUserPlayer && activePlayer.id === activeUserPlayer.id && activePlayer.hand.length === 2 && (
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

            {/* Active User Player Hand Area (Interactive Hand for Logged-In User ONLY) */}
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5">
              
              {/* Hand Header */}
              <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{activeUserUnoPlayer.avatar}</span>
                  <span className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Tangan {activeUserUnoPlayer.name} ({activeUserUnoPlayer.hand.length} Kartu)
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

                  {!hasAnyPlayableCard && activePlayer.id === activeUserUnoPlayer.id && (
                    <button
                      onClick={handlePlayerDrawCard}
                      className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black shadow-xs active:scale-95 transition-all animate-pulse"
                    >
                      <span>➕ AMBIL (+1)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cards Deck Rendering */}
              <div
                className={`pt-2 pb-1 px-1 flex items-end min-h-[110px] sm:min-h-[135px] ${
                  useFannedView
                    ? 'justify-center -space-x-3.5 sm:-space-x-4 overflow-x-auto custom-scrollbar'
                    : 'gap-1.5 overflow-x-auto custom-scrollbar'
                }`}
              >
                {activeUserUnoPlayer.hand.map((card, idx) => {
                  const isMyTurn = activePlayer.id === activeUserUnoPlayer.id;
                  const playable = isMyTurn && isCardPlayable(card) && !winner;

                  return (
                    <button
                      key={card.id}
                      onClick={() => handlePlayCard(card)}
                      style={{ zIndex: playable ? 30 + idx : 10 + idx }}
                      className={`w-15 h-23 sm:w-20 sm:h-29 rounded-xl bg-gradient-to-br ${COLOR_MAP[card.color].gradient} p-1 text-white flex flex-col justify-between items-center shrink-0 transition-all border-2 border-white/95 shadow-md active:scale-95 relative ${
                        playable
                          ? '-translate-y-2 hover:-translate-y-3.5 ring-3 ring-amber-400 cursor-pointer scale-105 shadow-xl'
                          : isMyTurn
                          ? 'opacity-55 grayscale-20 cursor-not-allowed hover:opacity-80'
                          : 'opacity-70 grayscale-10 cursor-not-allowed hover:opacity-90'
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

          {/* Right Sidebar: Chat & Real-Time Log Panel (Cols 9-12 on Desktop) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-amber-50 dark:bg-slate-800 rounded-3xl p-4 border-3 border-amber-200 dark:border-slate-700 shadow-bubbly-amber flex flex-col h-80 sm:h-96">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-2 border-amber-200 dark:border-slate-700 shrink-0">
                <h3 className="font-display font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>OBROLAN & LOG GAME</span>
                </h3>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-2xl text-[11px] leading-tight ${
                      msg.isSystem
                        ? 'bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-black text-center border border-amber-300'
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

              {/* Chat Input Box */}
              <form onSubmit={handleSendChatMessage} className="mt-2 pt-2 border-t border-amber-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Ketik obrolan di sini..."
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
                onClick={() => initializeGame()}
                className="py-2.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
              >
                MAIN LAGI 🔄
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsGameStarted(false);
                  setShowModeModal(true);
                }}
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-display font-black text-xs active:scale-95 transition-all"
              >
                GANTI MODE 👥
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
