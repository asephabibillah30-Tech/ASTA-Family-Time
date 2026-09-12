import React, { useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types/game';
import type { UserAccount } from '../../types/auth';
import { 
  ArrowLeft, Dices, RotateCcw, HelpCircle, X,
  Check, Copy, Share2, Play, Clock, MessageSquare,
  Send, CheckCircle2, Sparkles, Trophy, Users
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower } from '../../utils/confetti';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';

interface SnakeLaddersGameProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onBack: () => void;
}

export type PlayMode = 'solo_bot' | 'online_friends';

export interface SnakePlayerConfig {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  isReady?: boolean;
  color: string;
  isLeft?: boolean;
  status?: 'playing' | 'keluar';
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isSystem?: boolean;
  timestamp: string;
}

const PLAYER_COLORS = [
  'bg-emerald-500 text-white border-emerald-600',
  'bg-rose-500 text-white border-rose-600',
  'bg-amber-500 text-white border-amber-600',
  'bg-indigo-500 text-white border-indigo-600',
];

// 25 tiles board for fast and enjoyable family play
const BOARD_TILES = [
  { id: 1, type: 'start', label: 'Mulai 🏁', action: 'Selamat bermain Ular Tangga Keluarga!' },
  { id: 2, type: 'normal', label: 'Petak 2', action: 'Beri senyum termanis pada keluarga.' },
  { id: 3, type: 'ladder', to: 11, label: 'Tangga 🪜 (ke 11)', action: 'Rajin merapikan tempat tidur! Naik ke petak 11.' },
  { id: 4, type: 'normal', label: 'Petak 4', action: 'Tos jempol ke semua pemain.' },
  { id: 5, type: 'challenge', label: 'Tantangan 🎯', action: 'Tirukan suara kucing mengeong 3 kali!' },
  { id: 6, type: 'normal', label: 'Petak 6', action: 'Sebutkan 1 makanan kesukaan keluargamu.' },
  { id: 7, type: 'snake', to: 2, label: 'Ular 🐍 (ke 2)', action: 'Lupa mencuci tangan sebelum makan! Turun ke petak 2.' },
  { id: 8, type: 'ladder', to: 15, label: 'Tangga 🪜 (ke 15)', action: 'Bantu Ayah & Ibu mencuci piring! Naik ke petak 15.' },
  { id: 9, type: 'challenge', label: 'Tantangan 🎯', action: 'Beri pelukan kilat ke pemain di sebelah kanan.' },
  { id: 10, type: 'normal', label: 'Petak 10', action: 'Pijat bahu pemain di sebelah kirimu 5 detik.' },
  { id: 11, type: 'normal', label: 'Petak 11', action: 'Katakan "Keluarga ini nomor satu!"' },
  { id: 12, type: 'challenge', label: 'Tantangan 🎯', action: 'Goyangkan badan seperti robot selama 10 detik!' },
  { id: 13, type: 'snake', to: 4, label: 'Ular 🐍 (ke 4)', action: 'Begadang main HP! Turun ke petak 4.' },
  { id: 14, type: 'normal', label: 'Petak 14', action: 'Ucapkan terima kasih pada semua pemain.' },
  { id: 15, type: 'normal', label: 'Petak 15', action: 'Sebutkan 3 hal yang kamu syukuri hari ini.' },
  { id: 16, type: 'ladder', to: 22, label: 'Tangga 🪜 (ke 22)', action: 'Sholat/Ibadah tepat waktu! Naik ke petak 22.' },
  { id: 17, type: 'snake', to: 9, label: 'Ular 🐍 (ke 9)', action: 'Malas membereskan mainan! Turun ke petak 9.' },
  { id: 18, type: 'challenge', label: 'Tantangan 🎯', action: 'Tirukan tawa paling heboh!' },
  { id: 19, type: 'normal', label: 'Petak 19', action: 'Doakan kesehatan untuk seluruh keluarga.' },
  { id: 20, type: 'snake', to: 12, label: 'Ular 🐍 (ke 12)', action: 'Bicara ketus saat dipanggil! Turun ke petak 12.' },
  { id: 21, type: 'normal', label: 'Petak 21', action: 'Beri pujian tulus pada salah satu pemain.' },
  { id: 22, type: 'normal', label: 'Petak 22', action: 'Tunjukkan pose pahlawan super!' },
  { id: 23, type: 'snake', to: 14, label: 'Ular 🐍 (ke 14)', action: 'Lupa belajar untuk ujian! Turun ke petak 14.' },
  { id: 24, type: 'challenge', label: 'Tantangan 🎯', action: 'Nyanyikan 1 baris lagu ceria!' },
  { id: 25, type: 'finish', label: 'FINISH 🏆', action: 'Selamat! Kamu jadi Pemenang Juara Ular Tangga Keluarga!' }
];

export const SnakeLaddersGame: React.FC<SnakeLaddersGameProps> = ({
  players: initialPlayers,
  currentUser,
  familyCode,
  onBack,
}) => {
  // Family & User Setup
  const activeFamilyCode = familyCode || db.getSavedSession()?.family?.familyCode || 'ASTA123';
  const roomCode = `SNAKE-${activeFamilyCode.toUpperCase()}`;
  const userDisplayName = currentUser?.fullName || initialPlayers[0]?.name || 'Pemain';
  const userAvatar = currentUser?.avatar || initialPlayers[0]?.avatar || '👨‍👩‍👧‍👦';

  // Game Mode Setup
  const [playMode, setPlayMode] = useState<PlayMode>('online_friends');
  const [showModeModal, setShowModeModal] = useState(true);
  const [isWaitingLobby, setIsWaitingLobby] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showOnlineErrorModal, setShowOnlineErrorModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Online Players & Ready Status
  const [readyPlayers, setReadyPlayers] = useState<Record<string, boolean>>({});

  // Player lists setup helper
  const getSoloPlayers = useCallback((): Player[] => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers;
    }
    return [
      { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-emerald-500', isOnline: true },
      { id: 'bot-1', name: 'Bot Kiki', avatar: '🤖', score: 0, cardsCompleted: 0, color: 'bg-rose-500', isOnline: true },
      { id: 'bot-2', name: 'Bot Nana', avatar: '🐱', score: 0, cardsCompleted: 0, color: 'bg-amber-500', isOnline: true },
    ];
  }, [initialPlayers, userDisplayName, userAvatar]);

  const getOnlineFamilyPlayers = useCallback((): Player[] => {
    if (initialPlayers && initialPlayers.length > 0) {
      const activeId = currentUser?.id || '';
      const activeName = (currentUser?.fullName || '').toLowerCase().trim();
      const loggedInIndex = initialPlayers.findIndex(
        (p) => (activeId && p.id === activeId) || (activeName && activeName.length >= 2 && p.name.toLowerCase().includes(activeName))
      );
      const activeIdx = loggedInIndex !== -1 ? loggedInIndex : 0;

      // Strictly exclude bot accounts in online mode
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
      { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-emerald-500', isOnline: true },
    ];
  }, [initialPlayers, currentUser, userDisplayName, userAvatar]);

  const [players, setPlayers] = useState<Player[]>(getSoloPlayers());

  const getActiveUserPlayer = useCallback((playerList: SnakePlayerConfig[]): SnakePlayerConfig => {
    if (playerList.length === 0) {
      return { id: '1', name: userDisplayName, avatar: userAvatar, isOnline: true, color: PLAYER_COLORS[0] };
    }
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

  // Gameplay State
  const [gamePlayers, setGamePlayers] = useState<SnakePlayerConfig[]>([]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState('Kocok dadu untuk memulai perjalanan Ular Tangga!');
  const [winner, setWinner] = useState<SnakePlayerConfig | null>(null);

  // Chat State
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Sistem', text: '🐍 Selamat datang di Ular Tangga Keluarga ASTA!', isSystem: true, timestamp: '14:30' },
  ]);

  // Real-time Event Broadcaster
  const broadcastGameEvent = useCallback((event: string, payload: any) => {
    if (!activeFamilyCode) return;
    const room = activeFamilyCode.toUpperCase();

    // 1. WebSocket via Supabase
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        const channel = supabase.channel(`snakes_${room}`);
        channel.send({
          type: 'broadcast',
          event,
          payload,
        }).catch(() => {});
      }
    } catch {}

    // 2. BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`asta_snakes_${room}`);
        bc.postMessage({ event, payload });
        bc.close();
      } catch {}
    }
  }, [activeFamilyCode]);

  // Synchronize entire state
  const broadcastGameState = useCallback((stateUpdate: Partial<{
    gamePlayers: SnakePlayerConfig[];
    positions: Record<string, number>;
    currentTurnIdx: number;
    diceValue: number | null;
    isRolling: boolean;
    lastActionMessage: string;
    winner: SnakePlayerConfig | null;
    chatMessages: ChatMessage[];
    isWaitingLobby: boolean;
    isGameStarted: boolean;
    readyPlayers: Record<string, boolean>;
    countdown: number | null;
  }>) => {
    if (playMode !== 'online_friends') return;

    broadcastGameEvent('SNAKES_GAME_SYNC', {
      gamePlayers: stateUpdate.gamePlayers ?? gamePlayers,
      positions: stateUpdate.positions ?? positions,
      currentTurnIdx: stateUpdate.currentTurnIdx ?? currentTurnIdx,
      diceValue: stateUpdate.diceValue !== undefined ? stateUpdate.diceValue : diceValue,
      isRolling: stateUpdate.isRolling ?? isRolling,
      lastActionMessage: stateUpdate.lastActionMessage ?? lastActionMessage,
      winner: stateUpdate.winner !== undefined ? stateUpdate.winner : winner,
      chatMessages: stateUpdate.chatMessages ?? chatMessages,
      isWaitingLobby: stateUpdate.isWaitingLobby ?? isWaitingLobby,
      isGameStarted: stateUpdate.isGameStarted ?? isGameStarted,
      readyPlayers: stateUpdate.readyPlayers ?? readyPlayers,
      countdown: stateUpdate.countdown !== undefined ? stateUpdate.countdown : countdown,
    });
  }, [
    playMode, broadcastGameEvent, gamePlayers, positions, currentTurnIdx,
    diceValue, isRolling, lastActionMessage, winner, chatMessages,
    isWaitingLobby, isGameStarted, readyPlayers, countdown
  ]);

  // Initialize Game Players
  const initializeGame = useCallback(() => {
    const activeList = playMode === 'online_friends' ? getOnlineFamilyPlayers() : getSoloPlayers();
    
    const configList: SnakePlayerConfig[] = activeList.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '🎲',
      isOnline: p.isOnline ?? true,
      isReady: readyPlayers[p.id] ?? true,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    }));

    const initialPositions: Record<string, number> = {};
    configList.forEach(p => {
      initialPositions[p.id] = 1;
    });

    setGamePlayers(configList);
    setPositions(initialPositions);
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setIsRolling(false);
    setWinner(null);
    setLastActionMessage('Permainan Ular Tangga dimulai! Pemain 1 silakan kocok dadu.');
    setIsGameStarted(true);
    setIsWaitingLobby(false);
    setShowModeModal(false);

    if (playMode === 'online_friends') {
      broadcastGameState({
        gamePlayers: configList,
        positions: initialPositions,
        currentTurnIdx: 0,
        diceValue: null,
        isRolling: false,
        lastActionMessage: 'Permainan Ular Tangga dimulai! Pemain 1 silakan kocok dadu.',
        winner: null,
        isGameStarted: true,
        isWaitingLobby: false,
        countdown: null,
      });
    }
  }, [playMode, getOnlineFamilyPlayers, getSoloPlayers, readyPlayers, broadcastGameState]);

  // Start synchronous countdown 3-2-1
  const startCountdownAndLaunch = useCallback(() => {
    sound.playClick();
    let currentCount = 3;
    setCountdown(currentCount);

    if (playMode === 'online_friends') {
      broadcastGameState({ countdown: currentCount, isWaitingLobby: true });
    }

    const timer = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        sound.playClick();
        if (playMode === 'online_friends') {
          broadcastGameState({ countdown: currentCount, isWaitingLobby: true });
        }
      } else {
        clearInterval(timer);
        setCountdown(null);
        initializeGame();
      }
    }, 1000);
  }, [playMode, broadcastGameState, initializeGame]);

  // Real-time Event Subscription (PostgreSQL WebSocket & BroadcastChannel)
  useEffect(() => {
    if (playMode !== 'online_friends' || !activeFamilyCode) return;
    const room = activeFamilyCode.toUpperCase();

    const handleIncomingSync = (data: any) => {
      if (!data || !data.payload) return;
      const { payload } = data;

      if (payload.gamePlayers) setGamePlayers(payload.gamePlayers);
      if (payload.positions) setPositions(payload.positions);
      if (payload.currentTurnIdx !== undefined) setCurrentTurnIdx(payload.currentTurnIdx);
      if (payload.diceValue !== undefined) setDiceValue(payload.diceValue);
      if (payload.isRolling !== undefined) setIsRolling(payload.isRolling);
      if (payload.lastActionMessage) setLastActionMessage(payload.lastActionMessage);
      if (payload.winner !== undefined) setWinner(payload.winner);
      if (payload.chatMessages) setChatMessages(payload.chatMessages);
      if (payload.isWaitingLobby !== undefined) setIsWaitingLobby(payload.isWaitingLobby);
      if (payload.isGameStarted !== undefined) setIsGameStarted(payload.isGameStarted);
      if (payload.readyPlayers) setReadyPlayers(payload.readyPlayers);
      if (payload.countdown !== undefined) setCountdown(payload.countdown);
      if (data?.event === 'PLAYER_LEFT' || payload?.event === 'PLAYER_LEFT') {
        const pId = payload?.playerId || data?.payload?.playerId;
        const pName = payload?.playerName || data?.payload?.playerName;
        if (pId) handlePlayerLeftGame(pId, pName);
      }
    };

    const activeUser = getActiveUserPlayer(gamePlayers);

    // Supabase Realtime Channel
    let supabaseChannel: any = null;
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        supabaseChannel = supabase.channel(`snakes_${room}`, {
          config: {
            presence: { key: activeUser?.id || 'guest' }
          }
        });
        supabaseChannel
          .on('broadcast', { event: '*' }, (msg: any) => handleIncomingSync(msg))
          .on('presence', { event: 'leave' }, ({ key }: any) => {
            if (key) handlePlayerLeftGame(key);
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

    // BroadcastChannel local
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel(`asta_snakes_${room}`);
        bc.onmessage = (event) => {
          if (event.data?.event === 'SNAKES_GAME_SYNC') {
            handleIncomingSync(event.data);
          }
        };
      } catch {}
    }

    return () => {
      if (supabaseChannel) {
        try { supabaseChannel.unsubscribe(); } catch {}
      }
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, [playMode, activeFamilyCode]);

  // Mode Selection Handler
  const handleSelectMode = (mode: PlayMode) => {
    sound.playClick();
    setPlayMode(mode);
    setShowModeModal(false);

    if (mode === 'online_friends') {
      const onlineMembers = getOnlineFamilyPlayers();
      if (onlineMembers.length < 1) {
        setShowOnlineErrorModal(true);
        return;
      }
      setPlayers(onlineMembers);
      setIsWaitingLobby(true);
      const initReady: Record<string, boolean> = {};
      onlineMembers.forEach(p => { initReady[p.id] = true; });
      setReadyPlayers(initReady);
    } else {
      const soloList = getSoloPlayers();
      setPlayers(soloList);
      setIsWaitingLobby(false);
      initializeGame();
    }
  };

  // Toggle ready in lobby
  const toggleReady = (player: Player) => {
    sound.playClick();
    const nextState = !readyPlayers[player.id];
    const updated = { ...readyPlayers, [player.id]: nextState };
    setReadyPlayers(updated);

    if (playMode === 'online_friends') {
      broadcastGameState({ readyPlayers: updated });
    }
  };

  const activePlayer = gamePlayers[currentTurnIdx % gamePlayers.length] || {
    id: '1', name: userDisplayName, avatar: userAvatar, color: PLAYER_COLORS[0]
  };

  const activeUserPlayer = getActiveUserPlayer(gamePlayers);
  const isMyTurn = playMode === 'solo_bot' || activePlayer.id === activeUserPlayer.id;

  // Process pawn move after dice roll
  const processMove = useCallback((roll: number, playerToMove: SnakePlayerConfig) => {
    const currentPos = positions[playerToMove.id] || 1;
    let newPos = currentPos + roll;

    if (newPos >= 25) {
      newPos = 25;
      const updatedPositions = { ...positions, [playerToMove.id]: 25 };
      setPositions(updatedPositions);
      setWinner(playerToMove);
      sound.playVictory();
      fireVictoryShower();

      const victoryMsg = `🎉 Hore! ${playerToMove.name} mencapai petak 25 (FINISH) dan menjadi Juara Ular Tangga Keluarga!`;
      setLastActionMessage(victoryMsg);

      if (playMode === 'online_friends') {
        broadcastGameState({
          positions: updatedPositions,
          winner: playerToMove,
          lastActionMessage: victoryMsg,
          isRolling: false,
          diceValue: roll,
        });
      }
      return;
    }

    const tile = BOARD_TILES.find(t => t.id === newPos);
    let finalPos = newPos;
    let msg = `${playerToMove.name} melempar dadu ${roll} dan mendarat di petak ${newPos}.`;

    if (tile?.type === 'ladder' && tile.to) {
      finalPos = tile.to;
      msg = `🪜 Hore! ${tile.action} Naik ke petak ${finalPos}!`;
      sound.playSuccess();
      fireBurstConfetti();
    } else if (tile?.type === 'snake' && tile.to) {
      finalPos = tile.to;
      msg = `🐍 Ups! ${tile.action} Turun ke petak ${finalPos}.`;
      sound.playSkip();
    } else if (tile?.type === 'challenge') {
      msg = `🎯 Tantangan: ${tile.action}`;
      sound.playFunnyBonus();
    } else {
      msg = `💬 ${tile?.action || 'Lanjutkan permainan!'}`;
      sound.playClick();
    }

    const updatedPositions = { ...positions, [playerToMove.id]: finalPos };
    let nextTurnIdx = (currentTurnIdx + 1) % (gamePlayers.length || 1);
    let attempts = 0;
    while (gamePlayers[nextTurnIdx]?.isLeft && attempts < gamePlayers.length * 2) {
      nextTurnIdx = (nextTurnIdx + 1) % gamePlayers.length;
      attempts++;
    }

    setPositions(updatedPositions);
    setLastActionMessage(msg);
    setCurrentTurnIdx(nextTurnIdx);
    setIsRolling(false);

    if (playMode === 'online_friends') {
      broadcastGameState({
        positions: updatedPositions,
        currentTurnIdx: nextTurnIdx,
        lastActionMessage: msg,
        isRolling: false,
        diceValue: roll,
      });
    }
  }, [positions, currentTurnIdx, gamePlayers, playMode, broadcastGameState]);

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
        const winMsg = `🎉 ${winnerPlayer.name} MENANG JUARA ULAR TANGGA! (${pName} keluar dari permainan) 🏆`;
        setLastActionMessage(winMsg);
        sound.playVictory();
        fireVictoryShower();

        broadcastGameState({
          gamePlayers: updatedPlayers,
          winner: winnerPlayer,
          lastActionMessage: winMsg,
        });
      } else if (activePlayers.length > 1) {
        const exitMsg = `📢 ${pName} telah keluar dari permainan (Status: Keluar). Permainan berlanjut!`;
        setLastActionMessage(exitMsg);

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
          lastActionMessage: exitMsg,
        });
      }

      return updatedPlayers;
    });
  }, [currentTurnIdx, broadcastGameState]);

  // Roll Dice Action
  const rollDice = useCallback(() => {
    if (isRolling || winner || !isMyTurn) return;

    setIsRolling(true);
    sound.playCardShuffle();

    if (playMode === 'online_friends') {
      broadcastGameState({ isRolling: true });
    }

    let rollCount = 0;
    const interval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(tempRoll);
      rollCount++;

      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        processMove(finalRoll, activePlayer);
      }
    }, 80);
  }, [isRolling, winner, isMyTurn, playMode, activePlayer, processMove, broadcastGameState]);

  // AI Bot Automated Turn (Solo / BOT mode)
  useEffect(() => {
    if (!isGameStarted || winner || isRolling || playMode !== 'solo_bot') return;

    const isBotTurn = activePlayer.id.startsWith('bot-') || activePlayer.name.toLowerCase().includes('bot');
    if (isBotTurn) {
      const timer = setTimeout(() => {
        setIsRolling(true);
        sound.playCardShuffle();

        let rollCount = 0;
        const interval = setInterval(() => {
          const tempRoll = Math.floor(Math.random() * 6) + 1;
          setDiceValue(tempRoll);
          rollCount++;

          if (rollCount > 8) {
            clearInterval(interval);
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(finalRoll);
            processMove(finalRoll, activePlayer);
          }
        }, 80);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isGameStarted, winner, isRolling, playMode, activePlayer, processMove]);

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: userDisplayName,
      text: guessInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setGuessInput('');
    sound.playClick();

    if (playMode === 'online_friends') {
      broadcastGameState({ chatMessages: updated });
    }
  };

  // Copy Family Code
  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Share Family Code
  const handleShareCode = () => {
    sound.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Main Ular Tangga Keluarga ASTA',
        text: `Yuk main Ular Tangga bersama di ASTA Family Time! Gunakan Kode Ruangan: ${roomCode}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const restartGame = () => {
    sound.playClick();
    if (playMode === 'online_friends') {
      setIsWaitingLobby(true);
      setIsGameStarted(false);
      broadcastGameState({
        isWaitingLobby: true,
        isGameStarted: false,
        winner: null,
        diceValue: null,
      });
    } else {
      initializeGame();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-5 animate-pop-in">

      {/* Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-4 border-emerald-400 shadow-2xl space-y-5 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
              🐍
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                Ular Tangga Keluarga ASTA
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pilih mode permainan keluarga favoritmu:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSelectMode('online_friends')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-bold text-left shadow-lg active:scale-95 transition-all flex items-center gap-3 border border-emerald-400"
              >
                <div className="p-3 bg-white/20 rounded-xl text-2xl">🌐</div>
                <div>
                  <div className="text-base font-black flex items-center gap-1.5">
                    <span>Main Online / Teman & Keluarga</span>
                    <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full font-black">REALTIME</span>
                  </div>
                  <div className="text-xs opacity-90 font-normal">
                    Lawan anggota keluarga asli serempak antar perangkat!
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectMode('solo_bot')}
                className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-display font-bold text-left shadow-md active:scale-95 transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-600"
              >
                <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-xl text-2xl">🤖</div>
                <div>
                  <div className="text-base font-black">Main Sendiri / Lawan BOT</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Latihan santai lawan AI Bot tanpa perlombaan online
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={onBack}
              className="w-full py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Kembali ke Game Hub
            </button>
          </div>
        </div>
      )}

      {/* Online Error Modal */}
      {showOnlineErrorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full border-4 border-rose-400 shadow-2xl space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
              Tidak Ada Pemain Online
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Belum ada anggota keluarga online di database. Kamu bisa bermain dalam mode lawan BOT terlebih dahulu!
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowOnlineErrorModal(false);
                  handleSelectMode('solo_bot');
                }}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Main Lawan BOT
              </button>
              <button
                onClick={() => {
                  setShowOnlineErrorModal(false);
                  setShowModeModal(true);
                }}
                className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Synchronous Countdown Overlay (3-2-1) */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div className="text-center space-y-4 animate-scale-up">
            <span className="text-8xl font-display font-black text-amber-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-bounce inline-block">
              {countdown}
            </span>
            <h3 className="font-display font-black text-2xl text-white tracking-wider">
              PERSIAPAN BERMAIN ULAR TANGGA...
            </h3>
            <p className="text-emerald-300 font-bold text-sm">
              Semua perangkat akan memulai bersama secara realtime! 🏁
            </p>
          </div>
        </div>
      )}

      {/* Online Lobby / Waiting Room */}
      {isWaitingLobby ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-4 border-emerald-400 dark:border-emerald-700 shadow-bubbly-teal space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModeModal(true)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                  LOBBY ULAR TANGGA MULTIPLAYER
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Ruang Tunggu Keluarga
                </h2>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Kode Ruangan Keluarga
                </span>
                <span className="font-display font-black text-base tracking-wider text-slate-900 dark:text-white">
                  {roomCode}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl text-emerald-600 dark:text-emerald-300 shadow-sm active:scale-95"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShareCode}
                  className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm active:scale-95"
                  title="Bagikan Kode"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Connected Online Family Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Pemain Online ({players.length} Orang)</span>
              </h3>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                Terhubung ke Database Database ASTA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => {
                const isReady = readyPlayers[p.id] ?? true;
                const isCurrentUser = currentUser?.id === p.id || p.name.includes('(Anda)');

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isReady
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl border-2 border-emerald-200 shadow-sm">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-black">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Online di database</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReady(p)}
                      className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all ${
                        isReady
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isReady ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>SIAP</span>
                        </>
                      ) : (
                        <span>BELUM SIAP</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to Start Game */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Semua pemain siap akan memulai game secara serempak.</span>
            </div>

            <button
              onClick={startCountdownAndLaunch}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-black text-sm shadow-bubbly-teal active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>MULAI GAME ULAR TANGGA</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE ULAR TANGGA GAMEPLAY ARENA */
        <div className="space-y-4">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => {
                sound.playClick();
                const activeUser = getActiveUserPlayer(gamePlayers);
                if (playMode === 'online_friends' && activeUser) {
                  broadcastGameEvent('PLAYER_LEFT', { playerId: activeUser.id, playerName: activeUser.name });
                }
                onBack();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div className="text-center">
              <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <span>🎲</span> Ular Tangga ASTA
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {playMode === 'online_friends' ? `ONLINE MULTIPLAYER (${roomCode})` : 'MODE BOT / LATIHAN'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRulesModal(true)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                title="Aturan Game"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={restartGame}
                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300"
                title="Mulai Ulang"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Turn & Dice Controller */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border-3 border-emerald-300 dark:border-emerald-800/60 shadow-bubbly-teal flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Active Player */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-3xl border-2 border-emerald-300 shadow-sm animate-pulse-fast shrink-0">
                {activePlayer.avatar}
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Giliran Melempar Dadu
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activePlayer.name}</span>
                  {activePlayer.id === activeUserPlayer.id && (
                    <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                      Anda
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Posisi Sekarang: <strong className="text-emerald-600 dark:text-emerald-400">Petak {positions[activePlayer.id] || 1}</strong>
                </p>
              </div>
            </div>

            {/* Dice & Action */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-md shrink-0">
                {diceValue || '🎲'}
              </div>

              {!winner ? (
                <button
                  onClick={rollDice}
                  disabled={isRolling || !isMyTurn}
                  className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-display font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    isMyTurn
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-bubbly-teal'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Dices className="w-5 h-5" />
                  <span>
                    {isRolling
                      ? 'Mengocok...'
                      : isMyTurn
                      ? 'KOCOK DADU'
                      : `Menunggu ${activePlayer.name}...`}
                  </span>
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trophy className="w-5 h-5" />
                  <span>MAIN LAGI</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Notice Bar */}
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2.5 shadow-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            <p>{lastActionMessage}</p>
          </div>

          {/* 25 Board Tiles Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 bg-white/80 dark:bg-slate-800/80 p-2.5 sm:p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            {BOARD_TILES.slice().reverse().map((tile) => {
              const playersOnTile = gamePlayers.filter(p => (positions[p.id] || 1) === tile.id);

              return (
                <div
                  key={tile.id}
                  className={`min-h-[62px] sm:min-h-[90px] p-2 rounded-xl sm:rounded-2xl border-2 flex flex-col justify-between relative transition-all ${
                    tile.type === 'start'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400'
                      : tile.type === 'finish'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 font-bold'
                      : tile.type === 'ladder'
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300'
                      : tile.type === 'snake'
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {tile.id}
                    </span>
                    <span className="text-xs">
                      {tile.type === 'ladder' ? '🪜' : tile.type === 'snake' ? '🐍' : tile.type === 'challenge' ? '🎯' : ''}
                    </span>
                  </div>

                  {/* Players Avatars on this tile */}
                  <div className="flex items-center gap-1 flex-wrap my-1">
                    {playersOnTile.map(p => (
                      <span
                        key={p.id}
                        className="text-lg sm:text-xl drop-shadow animate-bounce"
                        title={p.name}
                      >
                        {p.avatar}
                      </span>
                    ))}
                  </div>

                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate leading-tight">
                    {tile.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real-time In-Game Chat Overlay */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Obrolan Realtime Keluarga</span>
            </h4>

            <div className="h-28 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex items-baseline gap-2">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{msg.senderName}:</span>
                  <span className="text-slate-700 dark:text-slate-300">{msg.text}</span>
                  <span className="text-[9px] text-slate-400 ml-auto">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={guessInput}
                onChange={e => setGuessInput(e.target.value)}
                placeholder="Ketik pesan untuk keluarga..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Game Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-2 border-emerald-400 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>📖</span> Aturan Ular Tangga ASTA
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <li>1. Kocok dadu bergantian sesuai urutan giliran.</li>
              <li>2. Jika mendarat di 🪜 <strong>Tangga</strong>, pion naik ke petak tujuan.</li>
              <li>3. Jika mendarat di 🐍 <strong>Ular</strong>, pion turun ke petak tujuan.</li>
              <li>4. Jika mendarat di 🎯 <strong>Tantangan</strong>, laksanakan aksi seru untuk keluarga!</li>
              <li>5. Pemain pertama yang mencapai 🏆 <strong>FINISH (Petak 25)</strong> menjadi Juara!</li>
            </ul>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
