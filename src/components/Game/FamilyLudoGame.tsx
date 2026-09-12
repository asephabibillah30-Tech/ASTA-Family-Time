import React, { useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types/game';
import type { UserAccount } from '../../types/auth';
import { 
  ArrowLeft, Dices, RotateCcw, HelpCircle, X,
  Globe, Check, Copy, Share2, Play, Clock, MessageSquare,
  Send, CheckCircle2, Sparkles
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower, fireSmallPop } from '../../utils/confetti';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';

interface FamilyLudoGameProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onBack: () => void;
}

export type PlayMode = 'solo_bot' | 'online_friends';
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayerConfig {
  id: string;
  name: string;
  avatar: string;
  color: LudoColor;
  isLeft?: boolean;
  status?: 'playing' | 'keluar';
}

export interface LudoToken {
  id: number; // 0, 1, 2, 3
  color: LudoColor;
  step: number; // -1: in base, 0..50: on track, 51..55: in home path, 56: finished
}

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isCorrect?: boolean;
  isSystem?: boolean;
  timestamp: string;
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

export const FamilyLudoGame: React.FC<FamilyLudoGameProps> = ({ players: initialPlayers, currentUser, familyCode, onBack }) => {
  // Play Mode & Navigation State
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

  // Chat Stream State
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Sistem', text: '🎲 Selamat datang di Ludo Keluarga ASTA!', isSystem: true, timestamp: '14:30' },
  ]);

  // Broadcast Realtime Game Event across devices (Supabase) & tabs (BroadcastChannel)
  const broadcastGameEvent = useCallback((event: string, payload: any) => {
    if (!activeFamilyCode) return;
    const roomCode = activeFamilyCode.toUpperCase();

    // 1. Cross-Device WebSocket Broadcast via Supabase
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        const channel = supabase.channel(`ludo_${roomCode}`);
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
        const bc = new BroadcastChannel(`asta_ludo_${roomCode}`);
        bc.postMessage({ event, payload });
        bc.close();
      } catch {}
    }
  }, [activeFamilyCode]);

  // Synchronize full Ludo game state across all devices in multiplayer mode
  const broadcastGameState = useCallback((stateUpdate: Partial<{
    gamePlayers: LudoPlayerConfig[];
    currentTurnIdx: number;
    diceValue: number | null;
    isRolling: boolean;
    hasRolled: boolean;
    tokens: LudoToken[];
    message: string;
    winner: LudoPlayerConfig | null;
    starActionPopup: string | null;
    chatMessages: ChatMessage[];
  }>) => {
    if (playMode === 'online_friends') {
      broadcastGameEvent('LUDO_GAME_SYNC', stateUpdate);
    }
  }, [playMode, broadcastGameEvent]);

  // Initialize Players based on selection
  const initializeGame = useCallback((initialState?: any) => {
    if (initialState) {
      setGamePlayers(initialState.gamePlayers);
      setTokens(initialState.tokens);
      setCurrentTurnIdx(initialState.currentTurnIdx);
      setDiceValue(initialState.diceValue);
      setHasRolled(initialState.hasRolled);
      setWinner(initialState.winner);
      setMessage(initialState.message);
      setStarActionPopup(initialState.starActionPopup);
      setIsGameStarted(true);
      return;
    }

    let assignedColors: LudoColor[] = [];
    if (playerCount === 2) {
      assignedColors = ['red', 'yellow'];
    } else if (playerCount === 3) {
      assignedColors = ['red', 'green', 'yellow'];
    } else {
      assignedColors = ['red', 'green', 'yellow', 'blue'];
    }

    const playerList = playMode === 'online_friends' ? getOnlinePlayers() : getSoloPlayers();

    const configs: LudoPlayerConfig[] = assignedColors.map((color, idx) => {
      const p = playerList[idx % playerList.length];
      return {
        id: p?.id || `ludo-p-${idx}`,
        name: p?.name || `Pemain ${idx + 1}`,
        avatar: p?.avatar || (color === 'red' ? '👨‍💼' : color === 'green' ? '👩‍🍳' : color === 'yellow' ? '👦' : '👧'),
        color
      };
    });

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

    const startMsg = `Giliran ${configs[0].name} (${COLOR_INFO[configs[0].color].name}). Kocok dadu! 🎲`;

    const freshState = {
      gamePlayers: configs,
      tokens: initTokens,
      currentTurnIdx: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      winner: null,
      message: startMsg,
      starActionPopup: null,
    };

    setGamePlayers(configs);
    setTokens(initTokens);
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setHasRolled(false);
    setWinner(null);
    setIsGameStarted(true);
    setMessage(startMsg);

    sound.playSuccess();
    fireBurstConfetti();

    if (playMode === 'online_friends') {
      broadcastGameEvent('GAME_START_COUNTDOWN', { initialGameState: freshState });
    }
  }, [playMode, playerCount, tokensPerPlayer, getOnlinePlayers, getSoloPlayers, broadcastGameEvent]);

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
    const channelName = `ludo_${roomCode}`;
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
      } else if (event === 'LUDO_GAME_SYNC') {
        if (payload?.gamePlayers) setGamePlayers(payload.gamePlayers);
        if (payload?.tokens) setTokens(payload.tokens);
        if (typeof payload?.currentTurnIdx === 'number') setCurrentTurnIdx(payload.currentTurnIdx);
        if (payload?.diceValue !== undefined) setDiceValue(payload.diceValue);
        if (typeof payload?.isRolling === 'boolean') setIsRolling(payload.isRolling);
        if (typeof payload?.hasRolled === 'boolean') setHasRolled(payload.hasRolled);
        if (payload?.winner !== undefined) setWinner(payload.winner);
        if (payload?.message) setMessage(payload.message);
        if (payload?.starActionPopup !== undefined) setStarActionPopup(payload.starActionPopup);
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

    const activeUser = getActiveUserPlayer(players);

    // 1. Supabase Realtime Listener
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        supabaseChannel = supabase
          .channel(channelName, {
            config: {
              presence: { key: activeUser?.id || 'guest' }
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
            if (status === 'SUBSCRIBED' && activeUser?.id) {
              supabaseChannel.track({
                id: activeUser.id,
                name: activeUser.name,
                online_at: new Date().toISOString()
              }).catch(() => {});
            }
          });
      }
    } catch {}

    // 2. BroadcastChannel Listener (same-device)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        localBc = new BroadcastChannel(`asta_ludo_${roomCode}`);
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
          text: `🌐 Mode Teman Online Aktif (Kode: ${activeFamilyCode})! Selamat bergabung, permainan Ludo dimulai serempak ketika semua siap.`,
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

    const activeUser = getActiveUserPlayer(players);
    if (playMode === 'online_friends' && activePlayer.id !== activeUser.id) {
      sound.playClick();
      setMessage(`⏳ Masih giliran ${activePlayer.name}! Harap tunggu giliran Anda.`);
      return;
    }

    setIsRolling(true);
    sound.playCardShuffle();
    broadcastGameState({ isRolling: true });

    let count = 0;
    const interval = setInterval(() => {
      const tempVal = Math.floor(Math.random() * 6) + 1;
      setDiceValue(tempVal);
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
      const noMoveMsg = `${activePlayer.name} melempar ${roll}. Tidak ada pion yang bisa melangkah.`;
      setMessage(noMoveMsg);
      broadcastGameState({ diceValue: roll, isRolling: false, hasRolled: true, message: noMoveMsg });

      setTimeout(() => {
        passTurn(false);
      }, 1200);
      return;
    }

    // Auto-move if only 1 token can move OR if all movable tokens are in the base yard (step === -1)
    const allInBase = movable.every(t => t.step === -1);
    if (movable.length === 1 || allInBase) {
      const autoMoveMsg = `${activePlayer.name} melempar ${roll}! Pion melangkah ke luar / bergerak otomatis.`;
      setMessage(autoMoveMsg);
      broadcastGameState({ diceValue: roll, isRolling: false, hasRolled: true, message: autoMoveMsg });

      setTimeout(() => {
        moveToken(movable[0], roll);
      }, 500);
      return;
    }

    const selectPawnMsg = `${activePlayer.name} melempar ${roll}! Pilih pion pada papan atau klik JALANKAN PION.`;
    setMessage(selectPawnMsg);
    broadcastGameState({ diceValue: roll, isRolling: false, hasRolled: true, message: selectPawnMsg });
  };

  // Move a selected token
  const moveToken = (token: LudoToken, roll: number) => {
    const activeUser = getActiveUserPlayer(players);
    if (playMode === 'online_friends' && activePlayer.id !== activeUser.id) {
      return;
    }

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
    let newStarPopup: string | null = null;

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
        newStarPopup = FAMILY_STAR_ACTIONS[Math.floor(Math.random() * FAMILY_STAR_ACTIONS.length)];
        setStarActionPopup(newStarPopup);
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
      const winMsg = `🏆 HOREEE! ${activePlayer.name} (${COLOR_INFO[activePlayer.color].name}) MENANG JUARA 1 LUDO KELUARGA! 🎉`;
      setMessage(winMsg);

      broadcastGameState({
        tokens: updatedTokens,
        winner: activePlayer,
        message: winMsg,
        starActionPopup: newStarPopup,
      });
      return;
    }

    const getsExtraTurn = roll === 6 || isCaptured;
    let stepMsg = '';

    if (isCaptured) {
      stepMsg = `💥 SERU! ${activePlayer.name} memakan pion ${capturedPlayerName} & dapat bonus kocok dadu lagi!`;
    } else if (roll === 6) {
      stepMsg = `🎲 Dadu 6! ${activePlayer.name} berhak kocok dadu sekali lagi!`;
    } else {
      stepMsg = `${activePlayer.name} berhasil melangkah.`;
    }
    setMessage(stepMsg);

    broadcastGameState({
      tokens: updatedTokens,
      message: stepMsg,
      starActionPopup: newStarPopup,
    });

    setTimeout(() => {
      passTurn(getsExtraTurn);
    }, getsExtraTurn ? 800 : 600);
  };

  const handlePlayerLeftGame = useCallback((leavingId: string, leavingName?: string) => {
    setGamePlayers((prevPlayers) => {
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
        const winMsg = `🎉 ${winnerPlayer.name} MENANG JUARA 1 LUDO! (${pName} keluar dari permainan) 🏆`;
        setMessage(winMsg);
        sound.playVictory();
        fireVictoryShower();

        broadcastGameState({
          gamePlayers: updatedPlayers,
          winner: winnerPlayer,
          message: winMsg,
        });
      } else if (activePlayers.length > 1) {
        const exitMsg = `📢 ${pName} telah keluar dari permainan (Status: Keluar). Permainan berlanjut!`;
        setMessage(exitMsg);

        let nextTurn = currentTurnIdx;
        if (prevPlayers[currentTurnIdx]?.id === leavingId) {
          let attempts = 0;
          nextTurn = (currentTurnIdx + 1) % updatedPlayers.length;
          while (updatedPlayers[nextTurn]?.isLeft && attempts < updatedPlayers.length * 2) {
            nextTurn = (nextTurn + 1) % updatedPlayers.length;
            attempts++;
          }
          setCurrentTurnIdx(nextTurn);
        }

        broadcastGameState({
          gamePlayers: updatedPlayers,
          currentTurnIdx: nextTurn,
          message: exitMsg,
        });
      }

      return updatedPlayers;
    });
  }, [currentTurnIdx, broadcastGameState]);

  // Pass turn to next player
  const passTurn = (extraTurn: boolean) => {
    setHasRolled(false);
    setDiceValue(null);

    let nextIdx = currentTurnIdx;
    let turnMsg = '';

    if (!extraTurn) {
      let attempts = 0;
      nextIdx = (currentTurnIdx + 1) % (gamePlayers.length || 1);
      while (gamePlayers[nextIdx]?.isLeft && attempts < gamePlayers.length * 2) {
        nextIdx = (nextIdx + 1) % gamePlayers.length;
        attempts++;
      }
      setCurrentTurnIdx(nextIdx);
      const nextP = gamePlayers[nextIdx];
      turnMsg = nextP ? `Giliran ${nextP.name} (${COLOR_INFO[nextP.color].name}). Kocok dadu! 🎲` : 'Kocok dadu!';
    } else {
      turnMsg = `Giliran bonus untuk ${activePlayer.name}! Silakan kocok dadu lagi 🎲`;
    }

    setMessage(turnMsg);
    broadcastGameState({
      currentTurnIdx: nextIdx,
      hasRolled: false,
      diceValue: null,
      message: turnMsg,
    });
  };

  // AI Bot Automated Turns in Solo Mode
  useEffect(() => {
    if (playMode !== 'solo_bot' || !isGameStarted || winner || isRolling || !activePlayer) return;

    const isBotTurn = activePlayer.id.startsWith('bot') || !activePlayer.name.includes('(Anda)');
    if (!isBotTurn) return;

    const timer = setTimeout(() => {
      if (!hasRolled) {
        handleRollDice();
      } else if (diceValue) {
        const movable = getMovableTokens(diceValue);
        if (movable.length > 0) {
          const chosenPawn = movable[Math.floor(Math.random() * movable.length)];
          moveToken(chosenPawn, diceValue);
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [playMode, isGameStarted, currentTurnIdx, hasRolled, diceValue, isRolling, winner, activePlayer]);

  // Share helpers
  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(activeFamilyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWA = () => {
    sound.playClick();
    const messageText = `🎲 *Main Ludo Papan Keluarga ASTA Bersama!*\n` +
      `Yuk bergabung main Ludo bareng keluarga sekarang di ASTA Family Time!\n\n` +
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
  const activeUserPlayer = getActiveUserPlayer(players);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 space-y-3 animate-pop-in select-none">
      
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
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
                🎲
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                ASTA Ludo Papan Keluarga
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Pilih mode permainan favorit Anda untuk mulai bermain Ludo bersama!
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
                    Latihan bermain Ludo secara solo melawan AI Bot Keluarga (Bot Bella, Bot Papa, Bot Mamah).
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
                Ruang Ludo Keluarga ({activeFamilyCode})
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
              PERMAINAN LUDO SEREMPAK DIMULAI!
            </span>
            <div className="text-8xl sm:text-9xl font-display font-black text-amber-300 drop-shadow-2xl animate-bounce">
              {countdownNumber === 0 ? 'GO! 🚀' : countdownNumber}
            </div>
            <p className="text-xs text-slate-300 font-bold">
              Siapkan dadu dan pion keberuntungan Anda!
            </p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              const activeUser = getActiveUserPlayer(players);
              if (playMode === 'online_friends' && activeUser) {
                broadcastGameEvent('PLAYER_LEFT', { playerId: activeUser.id, playerName: activeUser.name });
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
            title="Cara Main Ludo ASTA"
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
              title="Mulai Ulang Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SETUP SCREEN */}
      {!isGameStarted ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border-3 border-amber-200 dark:border-slate-700 shadow-bubbly-amber space-y-4 animate-pop-in">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🎲
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              Pengaturan Ludo Papan Keluarga
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Main Ludo bersama 2, 3, atau 4 pemain! Kocok dadu 6 untuk keluar kandang, makan pion lawan, dan capai mahkota juara!
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
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{num === 2 ? '👥' : num === 3 ? '👨‍👩‍JB' : '👨‍👩‍👧‍👦'}</span>
                  <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    {num} Pemain
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Jumlah Pion per Pemain */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              2. Jumlah Pion per Pemain
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setTokensPerPlayer(2);
                }}
                className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 ${
                  tokensPerPlayer === 2
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-xl">⚡</div>
                <div className="text-left min-w-0">
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Mode Cepat (2 Pion)
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setTokensPerPlayer(4);
                }}
                className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 ${
                  tokensPerPlayer === 4
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="text-xl">👑</div>
                <div className="text-left min-w-0">
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Mode Standar (4 Pion)
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-display font-black text-xs sm:text-sm shadow-bubbly-amber active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>MULAI GAME LUDO</span>
          </button>
        </div>
      ) : (
        /* ACTIVE LUDO GAMEPLAY ARENA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Main Gameplay Board (Cols 1-8 on Desktop) */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Top Players Turn Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gamePlayers.map((p) => {
                const isCurrentTurn = p.id === activePlayer.id;
                const info = COLOR_INFO[p.color];
                const finishedCount = tokens.filter(t => t.color === p.color && t.step === 56).length;

                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                      p.isLeft
                        ? 'border-slate-300 bg-slate-200 dark:bg-slate-800 opacity-50 grayscale'
                        : isCurrentTurn
                        ? `${info.borderClass} ${info.lightBg} shadow-md ring-2 ring-amber-400/40 scale-102`
                        : 'border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 opacity-75'
                    }`}
                  >
                    <span className="text-xl">{p.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">
                        {p.isLeft ? <span className="text-slate-600 dark:text-slate-400 font-black">Keluar</span> : `${info.label} • ${finishedCount}/${tokensPerPlayer} Finish`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Announcement & Action Bar */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 min-w-0 flex-1">
                <span className="text-base shrink-0">📢</span>
                <span className="leading-tight truncate">{message}</span>
              </div>

              {/* Dice Roll Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (hasRolled && movableTokens.length > 0 && diceValue) {
                      sound.playClick();
                      moveToken(movableTokens[0], diceValue);
                    } else {
                      handleRollDice();
                    }
                  }}
                  disabled={isRolling || (hasRolled && movableTokens.length === 0) || Boolean(winner) || (playMode === 'online_friends' && activePlayer.id !== activeUserPlayer.id)}
                  className={`px-4 py-2.5 rounded-2xl font-display font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 ${
                    hasRolled && movableTokens.length > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white'
                  }`}
                >
                  <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                  <span>
                    {isRolling
                      ? 'MENGOKOK...'
                      : hasRolled && movableTokens.length > 0
                      ? 'JALANKAN PION ➔'
                      : 'KOCOK DADU 🎲'}
                  </span>
                </button>

                {diceValue !== null && (
                  <div
                    onClick={() => {
                      if (hasRolled && movableTokens.length > 0 && diceValue) {
                        sound.playClick();
                        moveToken(movableTokens[0], diceValue);
                      }
                    }}
                    className={`w-10 h-10 rounded-xl bg-slate-900 text-amber-300 font-display font-black text-xl flex items-center justify-center border-2 border-amber-400 shadow-md ${
                      hasRolled && movableTokens.length > 0 ? 'cursor-pointer animate-pulse ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    title="Klik untuk jalankan pion"
                  >
                    {diceValue}
                  </div>
                )}
              </div>
            </div>

            {/* 15x15 LUDO SVG BOARD */}
            <div className="bg-slate-900 p-2 sm:p-3 rounded-3xl border-4 border-slate-800 shadow-2xl relative flex items-center justify-center">
              <svg viewBox="0 0 600 600" className="w-full h-auto max-w-[550px] aspect-square rounded-2xl select-none">
                
                {/* 1. Base Yards */}
                <rect x="0" y="0" width="240" height="240" fill="#EF4444" rx="16" />
                <rect x="360" y="0" width="240" height="240" fill="#10B981" rx="16" />
                <rect x="360" y="360" width="240" height="240" fill="#F59E0B" rx="16" />
                <rect x="0" y="360" width="240" height="240" fill="#3B82F6" rx="16" />

                {/* Inner Base White Boxes */}
                <rect x="40" y="40" width="160" height="160" fill="#FFFFFF" rx="12" />
                <rect x="400" y="40" width="160" height="160" fill="#FFFFFF" rx="12" />
                <rect x="400" y="400" width="160" height="160" fill="#FFFFFF" rx="12" />
                <rect x="40" y="400" width="160" height="160" fill="#FFFFFF" rx="12" />

                {/* Base Circles */}
                {BASE_SLOTS.red.map((s, idx) => <circle key={idx} cx={(s.x + 0.5) * 40} cy={(s.y + 0.5) * 40} r="22" fill="#FEE2E2" stroke="#EF4444" strokeWidth="4" />)}
                {BASE_SLOTS.green.map((s, idx) => <circle key={idx} cx={(s.x + 0.5) * 40} cy={(s.y + 0.5) * 40} r="22" fill="#D1FAE5" stroke="#10B981" strokeWidth="4" />)}
                {BASE_SLOTS.yellow.map((s, idx) => <circle key={idx} cx={(s.x + 0.5) * 40} cy={(s.y + 0.5) * 40} r="22" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="4" />)}
                {BASE_SLOTS.blue.map((s, idx) => <circle key={idx} cx={(s.x + 0.5) * 40} cy={(s.y + 0.5) * 40} r="22" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="4" />)}

                {/* 2. Track Grid (52 Squares) */}
                {TRACK_COORDS.map((coord, idx) => {
                  const isStar = SAFE_STAR_INDICES.includes(idx);
                  let fillHex = '#FFFFFF';

                  if (idx === 0) fillHex = '#EF4444'; // Red Start
                  else if (idx === 13) fillHex = '#10B981'; // Green Start
                  else if (idx === 26) fillHex = '#F59E0B'; // Yellow Start
                  else if (idx === 39) fillHex = '#3B82F6'; // Blue Start

                  return (
                    <g key={idx}>
                      <rect
                        x={coord.x * 40}
                        y={coord.y * 40}
                        width="40"
                        height="40"
                        fill={fillHex}
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                      />
                      {isStar && (
                        <text
                          x={coord.x * 40 + 20}
                          y={coord.y * 40 + 26}
                          fontSize="20"
                          textAnchor="middle"
                          fill={fillHex === '#FFFFFF' ? '#F59E0B' : '#FFFFFF'}
                        >
                          ⭐
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 3. Home Paths */}
                {HOME_PATHS.red.map((coord, idx) => <rect key={idx} x={coord.x * 40} y={coord.y * 40} width="40" height="40" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />)}
                {HOME_PATHS.green.map((coord, idx) => <rect key={idx} x={coord.x * 40} y={coord.y * 40} width="40" height="40" fill="#10B981" stroke="#047857" strokeWidth="1.5" />)}
                {HOME_PATHS.yellow.map((coord, idx) => <rect key={idx} x={coord.x * 40} y={coord.y * 40} width="40" height="40" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />)}
                {HOME_PATHS.blue.map((coord, idx) => <rect key={idx} x={coord.x * 40} y={coord.y * 40} width="40" height="40" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />)}

                {/* 4. Center Home Triangles (Goal) */}
                <polygon points="240,240 300,300 240,360" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <polygon points="240,240 300,300 360,240" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <polygon points="360,240 300,300 360,360" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                <polygon points="240,360 300,300 360,360" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <text x="300" y="306" fontSize="22" textAnchor="middle" fill="#FFFFFF">👑</text>

                {/* 5. Render Player Tokens */}
                {tokens.map((t) => {
                  const coords = getTokenCoords(t);
                  const isMovable = movableTokens.some(mt => mt.color === t.color && mt.id === t.id);
                  const colorHex = COLOR_INFO[t.color].hex;

                  return (
                    <g
                      key={`${t.color}-${t.id}`}
                      onClick={() => {
                        if (isMovable && diceValue) {
                          moveToken(t, diceValue);
                        }
                      }}
                      className={isMovable ? 'cursor-pointer' : ''}
                    >
                      {/* Expanded Touch Target (64px) for mobile fingers */}
                      <circle
                        cx={coords.cx}
                        cy={coords.cy}
                        r="32"
                        fill="transparent"
                        pointerEvents="all"
                      />
                      {/* Professional smooth pulsing golden halo for movable tokens */}
                      {isMovable && (
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r="24"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.5"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={coords.cx}
                        cy={coords.cy}
                        r="18"
                        fill={colorHex}
                        stroke={isMovable ? '#FACC15' : '#FFFFFF'}
                        strokeWidth={isMovable ? '4' : '3.5'}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx={coords.cx}
                        cy={coords.cy}
                        r="9"
                        fill="#FFFFFF"
                        opacity="0.85"
                      />
                    </g>
                  );
                })}
              </svg>
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

      {/* FAMILY STAR ACTION POPUP */}
      {starActionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-5 text-center space-y-3 border-4 border-amber-400 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              ⭐
            </div>
            <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Tantangan Bintang Kasih Keluarga!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-900">
              {starActionPopup}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setStarActionPopup(null);
                fireSmallPop(0.5, 0.4);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
            >
              SUDAH KAMI LAKUKAN! 🥰
            </button>
          </div>
        </div>
      )}

      {/* WINNER MODAL 🏆 */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-5 text-center space-y-3 border-4 border-amber-400 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                JUARA 1 LUDO KELUARGA ASTA
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-0.5">
                {winner.name} ({COLOR_INFO[winner.color].name})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Seluruh pion berhasil mencapai garis finish mahkota! Kemenangan luar biasa 🎉
              </p>
            </div>

            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-center gap-2.5">
              <span className="text-2xl">{winner.avatar}</span>
              <div className="text-left">
                <div className="font-display font-black text-xs text-slate-900 dark:text-white">
                  Pemenang Utama Ludo 🥇
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  +100 Poin Kasih Sayang Keluarga
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => initializeGame()}
                className="py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
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
                  Aturan Main Ludo ASTA
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
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 space-y-0.5">
                <div className="font-bold text-amber-700 dark:text-amber-400">🎲 1. Keluar Kandang</div>
                <p>Kocok dadu dan raih <strong>angka 6</strong> untuk mengeluarkan pion dari kandang ke petak awal.</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 space-y-0.5">
                <div className="font-bold text-rose-700 dark:text-rose-400">💥 2. Makan Pion Lawan</div>
                <p>Jika pion Anda mendarat tepat di petak pion lawan (di luar petak Bintang ⭐), pion lawan terdorong kembali ke kandang dan Anda mendapat bonus kocok dadu lagi!</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-0.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">⭐ 3. Petak Aman Bintang & Tantangan</div>
                <p>Petak bergambar Bintang ⭐ adalah <strong>petak aman</strong> (pion tidak bisa dimakan). Jika mendarat di sana, muncul tantangan Bintang Kasih Sayang Keluarga!</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-0.5">
                <div className="font-bold text-blue-700 dark:text-blue-400">🏆 4. Garis Finish Mahkota</div>
                <p>Pemain pertama yang berhasil mengantarkan seluruh pionnya ke tengah mahkota finish dinobatkan sebagai <strong>Juara 1</strong>!</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all"
            >
              MENGERTI, SIAP MAIN! 👍
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
