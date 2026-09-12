import React, { useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types/game';
import type { UserAccount } from '../../types/auth';
import { 
  ArrowLeft, Dices, RotateCcw, HelpCircle, X,
  Check, Copy, Share2, Play, Clock, MessageSquare,
  Send, CheckCircle2, Sparkles, Trophy, Users, Coins
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower, fireSmallPop } from '../../utils/confetti';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';

interface FamilyMonopolyGameProps {
  players: Player[];
  currentUser?: UserAccount;
  familyCode?: string;
  onBack: () => void;
}

export type PlayMode = 'solo_bot' | 'online_friends';

export interface MonopolyPlayerConfig {
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
  'bg-amber-500 text-white border-amber-600',
  'bg-indigo-500 text-white border-indigo-600',
  'bg-emerald-500 text-white border-emerald-600',
  'bg-rose-500 text-white border-rose-600',
];

const MONOPOLY_TILES = [
  { id: 0, name: 'START / KELUARGA BAHAGIA 🏁', type: 'start', desc: 'Dapat bonus tabungan 50 koin!' },
  { id: 1, name: 'Ruang Tamu Hangat 🛋️', type: 'property', cost: 30, rent: 10 },
  { id: 2, name: 'Celengan Kebaikan 🪙', type: 'chest', desc: 'Ambil kartu hadiah kebaikan!' },
  { id: 3, name: 'Dapur Masak Lezat 🍳', type: 'property', cost: 40, rent: 15 },
  { id: 4, name: 'Taman Bunga Asri 🌻', type: 'property', cost: 50, rent: 20 },
  { id: 5, name: 'Pojok Baca Buku 📚', type: 'property', cost: 60, rent: 25 },
  { id: 6, name: 'Tantangan Kuis Cerdas 🧠', type: 'quiz', desc: 'Jawab kuis dan dapatkan 30 koin!' },
  { id: 7, name: 'Kamar Tidur Nyaman 🛏️', type: 'property', cost: 70, rent: 30 },
  { id: 8, name: 'Halaman Olahraga ⚽', type: 'property', cost: 80, rent: 35 },
  { id: 9, name: 'Ruang Makan Berkah 🍽️', type: 'property', cost: 90, rent: 40 },
  { id: 10, name: 'Liburan Pantai Impian 🏖️', type: 'property', cost: 100, rent: 50 },
  { id: 11, name: 'Kuis Tebak Sayang ❤️', type: 'love', desc: 'Katakan 1 pujian dan dapat 40 koin!' }
];

export const FamilyMonopolyGame: React.FC<FamilyMonopolyGameProps> = ({
  players: initialPlayers,
  currentUser,
  familyCode,
  onBack,
}) => {
  // Family & User Setup
  const activeFamilyCode = familyCode || db.getSavedSession()?.family?.familyCode || 'ASTA2026';
  const roomCode = `MONOPOLY-${activeFamilyCode.toUpperCase()}`;
  const userDisplayName = currentUser?.fullName || initialPlayers[0]?.name || 'Pemain';
  const userAvatar = currentUser?.avatar || initialPlayers[0]?.avatar || '🎩';

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

  // Helper for Solo vs Online players setup
  const getSoloPlayers = useCallback((): Player[] => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers;
    }
    return [
      { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-amber-500', isOnline: true },
      { id: 'bot-1', name: 'Bot Kiki', avatar: '🤖', score: 0, cardsCompleted: 0, color: 'bg-indigo-500', isOnline: true },
      { id: 'bot-2', name: 'Bot Nana', avatar: '🐱', score: 0, cardsCompleted: 0, color: 'bg-emerald-500', isOnline: true },
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
      { id: '1', name: userDisplayName, avatar: userAvatar, score: 0, cardsCompleted: 0, color: 'bg-amber-500', isOnline: true },
    ];
  }, [initialPlayers, currentUser, userDisplayName, userAvatar]);

  const [players, setPlayers] = useState<Player[]>(getSoloPlayers());

  const getActiveUserPlayer = useCallback((playerList: MonopolyPlayerConfig[]): MonopolyPlayerConfig => {
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
  const [gamePlayers, setGamePlayers] = useState<MonopolyPlayerConfig[]>([]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [coins, setCoins] = useState<Record<string, number>>({});
  const [properties, setProperties] = useState<Record<number, string>>({}); // tileId -> playerId
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [logMessage, setLogMessage] = useState('Selamat datang di Monopoli Keluarga! Setiap pemain memulai dengan 100 Koin.');
  const [winner, setWinner] = useState<MonopolyPlayerConfig | null>(null);

  // Chat State
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Sistem', text: '🎩 Selamat datang di Monopoli Keluarga ASTA!', isSystem: true, timestamp: '14:30' },
  ]);

  // Real-time Event Broadcaster
  const broadcastGameEvent = useCallback((event: string, payload: any) => {
    if (!activeFamilyCode) return;
    const room = activeFamilyCode.toUpperCase();

    // 1. WebSocket via Supabase
    try {
      const supabase = postgresService.getClient();
      if (supabase) {
        const channel = supabase.channel(`monopoly_${room}`);
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
        const bc = new BroadcastChannel(`asta_monopoly_${room}`);
        bc.postMessage({ event, payload });
        bc.close();
      } catch {}
    }
  }, [activeFamilyCode]);

  // Synchronize entire state
  const broadcastGameState = useCallback((stateUpdate: Partial<{
    gamePlayers: MonopolyPlayerConfig[];
    positions: Record<string, number>;
    coins: Record<string, number>;
    properties: Record<number, string>;
    currentTurnIdx: number;
    diceValue: number | null;
    isRolling: boolean;
    logMessage: string;
    winner: MonopolyPlayerConfig | null;
    chatMessages: ChatMessage[];
    isWaitingLobby: boolean;
    isGameStarted: boolean;
    readyPlayers: Record<string, boolean>;
    countdown: number | null;
  }>) => {
    if (playMode !== 'online_friends') return;

    broadcastGameEvent('MONOPOLY_GAME_SYNC', {
      gamePlayers: stateUpdate.gamePlayers ?? gamePlayers,
      positions: stateUpdate.positions ?? positions,
      coins: stateUpdate.coins ?? coins,
      properties: stateUpdate.properties ?? properties,
      currentTurnIdx: stateUpdate.currentTurnIdx ?? currentTurnIdx,
      diceValue: stateUpdate.diceValue !== undefined ? stateUpdate.diceValue : diceValue,
      isRolling: stateUpdate.isRolling ?? isRolling,
      logMessage: stateUpdate.logMessage ?? logMessage,
      winner: stateUpdate.winner !== undefined ? stateUpdate.winner : winner,
      chatMessages: stateUpdate.chatMessages ?? chatMessages,
      isWaitingLobby: stateUpdate.isWaitingLobby ?? isWaitingLobby,
      isGameStarted: stateUpdate.isGameStarted ?? isGameStarted,
      readyPlayers: stateUpdate.readyPlayers ?? readyPlayers,
      countdown: stateUpdate.countdown !== undefined ? stateUpdate.countdown : countdown,
    });
  }, [
    playMode, broadcastGameEvent, gamePlayers, positions, coins, properties,
    currentTurnIdx, diceValue, isRolling, logMessage, winner, chatMessages,
    isWaitingLobby, isGameStarted, readyPlayers, countdown
  ]);

  // Initialize Game Players & Assets
  const initializeGame = useCallback(() => {
    const activeList = playMode === 'online_friends' ? getOnlineFamilyPlayers() : getSoloPlayers();
    
    const configList: MonopolyPlayerConfig[] = activeList.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '🎩',
      isOnline: p.isOnline ?? true,
      isReady: readyPlayers[p.id] ?? true,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    }));

    const initialPositions: Record<string, number> = {};
    const initialCoins: Record<string, number> = {};
    configList.forEach(p => {
      initialPositions[p.id] = 0;
      initialCoins[p.id] = 100;
    });

    setGamePlayers(configList);
    setPositions(initialPositions);
    setCoins(initialCoins);
    setProperties({});
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setIsRolling(false);
    setWinner(null);
    setLogMessage('Game Monopoli dimulai! Setiap pemain memulai dengan 100 Koin.');
    setIsGameStarted(true);
    setIsWaitingLobby(false);
    setShowModeModal(false);

    if (playMode === 'online_friends') {
      broadcastGameState({
        gamePlayers: configList,
        positions: initialPositions,
        coins: initialCoins,
        properties: {},
        currentTurnIdx: 0,
        diceValue: null,
        isRolling: false,
        logMessage: 'Game Monopoli dimulai! Setiap pemain memulai dengan 100 Koin.',
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
      if (payload.coins) setCoins(payload.coins);
      if (payload.properties) setProperties(payload.properties);
      if (payload.currentTurnIdx !== undefined) setCurrentTurnIdx(payload.currentTurnIdx);
      if (payload.diceValue !== undefined) setDiceValue(payload.diceValue);
      if (payload.isRolling !== undefined) setIsRolling(payload.isRolling);
      if (payload.logMessage) setLogMessage(payload.logMessage);
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
        supabaseChannel = supabase.channel(`monopoly_${room}`, {
          config: {
            presence: { key: activeUser?.id || 'guest' }
          }
        });
        supabaseChannel
          .on('broadcast', { event: '*' }, (msg: any) => handleIncomingSync(msg))
          .on('presence', { event: 'leave' }, ({ key }: any) => {
            if (!key) return;
            setTimeout(() => {
              try {
                const presenceState = supabaseChannel?.presenceState() || {};
                const currentKeys = Object.keys(presenceState);
                if (!currentKeys.includes(key)) {
                  handlePlayerLeftGame(key);
                }
              } catch {}
            }, 2500);
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
        bc = new BroadcastChannel(`asta_monopoly_${room}`);
        bc.onmessage = (event) => {
          if (event.data?.event === 'MONOPOLY_GAME_SYNC') {
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

  // Toggle ready status in lobby
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

  // Process Monopoly turn actions (property buying, rent, bonus)
  const processMonopolyTurn = useCallback((roll: number, playerToMove: MonopolyPlayerConfig) => {
    const currentPos = positions[playerToMove.id] || 0;
    const nextPos = (currentPos + roll) % MONOPOLY_TILES.length;
    const passedStart = currentPos + roll >= MONOPOLY_TILES.length;

    let updatedCoins = { ...coins };
    if (passedStart) {
      updatedCoins[playerToMove.id] = (updatedCoins[playerToMove.id] || 0) + 50;
      sound.playSuccess();
      fireSmallPop(0.5, 0.4);
    }

    const tile = MONOPOLY_TILES[nextPos];
    let msg = `${playerToMove.name} melempar dadu ${roll} dan tiba di ${tile.name}.`;
    let updatedProperties = { ...properties };

    if (tile.type === 'property' && tile.cost) {
      const ownerId = updatedProperties[nextPos];
      if (!ownerId) {
        // Can buy property if enough coins
        if ((updatedCoins[playerToMove.id] || 0) >= tile.cost) {
          updatedCoins[playerToMove.id] -= tile.cost;
          updatedProperties[nextPos] = playerToMove.id;
          msg = `🏠 ${playerToMove.name} berhasil membeli aset ${tile.name} seharga ${tile.cost} koin!`;
          sound.playSuccess();
          fireBurstConfetti();
        } else {
          msg = `${playerToMove.name} tiba di ${tile.name} tetapi koin belum cukup untuk membeli.`;
        }
      } else if (ownerId !== playerToMove.id) {
        // Pay rent to owner
        const owner = gamePlayers.find(p => p.id === ownerId);
        const rentFee = tile.rent || 10;
        updatedCoins[playerToMove.id] = Math.max(0, (updatedCoins[playerToMove.id] || 0) - rentFee);
        updatedCoins[ownerId] = (updatedCoins[ownerId] || 0) + rentFee;
        msg = `💰 ${playerToMove.name} mampir ke ${tile.name} milik ${owner?.name} dan membayar sewa ${rentFee} koin!`;
        sound.playClick();
      } else {
        msg = `🏠 ${playerToMove.name} mengunjungi aset miliknya sendiri (${tile.name})!`;
      }
    } else if (tile.type === 'quiz' || tile.type === 'love' || tile.type === 'chest') {
      updatedCoins[playerToMove.id] = (updatedCoins[playerToMove.id] || 0) + 30;
      msg = `🎁 ${tile.name}: ${tile.desc} (+30 Koin)`;
      sound.playFunnyBonus();
      fireBurstConfetti();
    }

    const updatedPositions = { ...positions, [playerToMove.id]: nextPos };
    let nextTurnIdx = (currentTurnIdx + 1) % (gamePlayers.length || 1);
    let attempts = 0;
    while (gamePlayers[nextTurnIdx]?.isLeft && attempts < gamePlayers.length * 2) {
      nextTurnIdx = (nextTurnIdx + 1) % gamePlayers.length;
      attempts++;
    }

    // Check winner if a player reaches 300+ coins or all properties are owned
    let gameWinner: MonopolyPlayerConfig | null = null;
    if ((updatedCoins[playerToMove.id] || 0) >= 300) {
      gameWinner = playerToMove;
      sound.playVictory();
      fireVictoryShower();
      msg = `🎉 Hore! ${playerToMove.name} mengumpulkan 300+ Koin dan menjadi Juara Monopoli Keluarga!`;
    }

    setCoins(updatedCoins);
    setPositions(updatedPositions);
    setProperties(updatedProperties);
    setLogMessage(msg);
    setCurrentTurnIdx(nextTurnIdx);
    setIsRolling(false);

    if (gameWinner) {
      setWinner(gameWinner);
    }

    if (playMode === 'online_friends') {
      broadcastGameState({
        positions: updatedPositions,
        coins: updatedCoins,
        properties: updatedProperties,
        currentTurnIdx: nextTurnIdx,
        logMessage: msg,
        isRolling: false,
        diceValue: roll,
        winner: gameWinner,
      });
    }
  }, [positions, coins, properties, currentTurnIdx, gamePlayers, playMode, broadcastGameState]);

  const handlePlayerLeftGame = useCallback((leavingId: string, leavingName?: string) => {
    if (!isGameStarted) return;
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
        const winMsg = `🎉 ${winnerPlayer.name} MENANG JUARA MONOPOLI! (${pName} keluar dari permainan) 🏆`;
        setLogMessage(winMsg);
        sound.playVictory();
        fireVictoryShower();

        broadcastGameState({
          gamePlayers: updatedPlayers,
          winner: winnerPlayer,
          logMessage: winMsg,
        });
      } else if (activePlayers.length > 1) {
        const exitMsg = `📢 ${pName} telah keluar dari permainan (Status: Keluar). Permainan berlanjut!`;
        setLogMessage(exitMsg);

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
          logMessage: exitMsg,
        });
      }

      return updatedPlayers;
    });
  }, [isGameStarted, currentTurnIdx, broadcastGameState]);

  // Roll Dice Action
  const rollDice = useCallback(() => {
    if (isRolling || winner || !isMyTurn) return;

    setIsRolling(true);
    sound.playCardShuffle();

    if (playMode === 'online_friends') {
      broadcastGameState({ isRolling: true });
    }

    let count = 0;
    const interval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * 4) + 1;
      setDiceValue(tempRoll);
      count++;

      if (count > 6) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 4) + 1;
        setDiceValue(finalRoll);
        processMonopolyTurn(finalRoll, activePlayer);
      }
    }, 90);
  }, [isRolling, winner, isMyTurn, playMode, activePlayer, processMonopolyTurn, broadcastGameState]);

  // AI Bot Automated Turn (Solo / BOT mode)
  useEffect(() => {
    if (!isGameStarted || winner || isRolling || playMode !== 'solo_bot') return;

    const isBotTurn = activePlayer.id.startsWith('bot-') || activePlayer.name.toLowerCase().includes('bot');
    if (isBotTurn) {
      const timer = setTimeout(() => {
        setIsRolling(true);
        sound.playCardShuffle();

        let count = 0;
        const interval = setInterval(() => {
          const tempRoll = Math.floor(Math.random() * 4) + 1;
          setDiceValue(tempRoll);
          count++;

          if (count > 6) {
            clearInterval(interval);
            const finalRoll = Math.floor(Math.random() * 4) + 1;
            setDiceValue(finalRoll);
            processMonopolyTurn(finalRoll, activePlayer);
          }
        }, 90);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isGameStarted, winner, isRolling, playMode, activePlayer, processMonopolyTurn]);

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
        title: 'Main Monopoli Keluarga ASTA',
        text: `Yuk main Monopoli Keluarga di ASTA Family Time! Kode Ruangan: ${roomCode}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const restartMonopoly = () => {
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-4 border-amber-400 shadow-2xl space-y-5 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
              🎩
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                Monopoli Keluarga ASTA
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pilih mode permainan keluarga favoritmu:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSelectMode('online_friends')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-display font-bold text-left shadow-lg active:scale-95 transition-all flex items-center gap-3 border border-amber-400"
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
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md"
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
              PERSIAPAN BERMAIN MONOPOLI...
            </h3>
            <p className="text-amber-300 font-bold text-sm">
              Semua perangkat akan memulai bersama secara realtime! 🎩
            </p>
          </div>
        </div>
      )}

      {/* Online Lobby / Waiting Room */}
      {isWaitingLobby ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-4 border-amber-400 dark:border-amber-700 shadow-bubbly-amber space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModeModal(true)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                  LOBBY MONOPOLI MULTIPLAYER
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Ruang Tunggu Keluarga
                </h2>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="bg-amber-50 dark:bg-amber-950/60 p-3 rounded-2xl border-2 border-amber-300 dark:border-amber-700 flex items-center gap-3">
              <div>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Kode Ruangan Keluarga
                </span>
                <span className="font-display font-black text-base tracking-wider text-slate-900 dark:text-white">
                  {roomCode}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl text-amber-600 dark:text-amber-300 shadow-sm active:scale-95"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShareCode}
                  className="p-2 bg-amber-500 text-white rounded-xl shadow-sm active:scale-95"
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
                <Users className="w-4 h-4 text-amber-500" />
                <span>Pemain Online ({players.length} Orang)</span>
              </h3>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                Terhubung ke Database ASTA
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
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl border-2 border-amber-200 shadow-sm">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-black">
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
                          ? 'bg-amber-500 text-white shadow-sm'
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
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Semua pemain siap akan memulai game secara serempak.</span>
            </div>

            <button
              onClick={startCountdownAndLaunch}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-display font-black text-sm shadow-bubbly-amber active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>MULAI GAME MONOPOLI</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE MONOPOLY GAMEPLAY ARENA */
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
                <span>🎩</span> Monopoli ASTA
              </h2>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
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
                onClick={restartMonopoly}
                className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300"
                title="Mulai Ulang"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Players Coins Standings Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {gamePlayers.map((p, idx) => {
              const isTurn = idx === (currentTurnIdx % gamePlayers.length);
              const pCoins = coins[p.id] || 0;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    p.isLeft
                      ? 'border-slate-300 bg-slate-200 dark:bg-slate-800 opacity-50 grayscale'
                      : isTurn
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 shadow-sm scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {p.isLeft ? <span className="text-slate-600 dark:text-slate-400 font-black">Keluar</span> : `Petak ${positions[p.id] || 0}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-xl font-display font-black text-xs text-amber-800 dark:text-amber-200">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{pCoins}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Turn & Dice Controller */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border-3 border-amber-300 dark:border-amber-800/60 shadow-bubbly-amber flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Active Player */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-3xl border-2 border-amber-300 shadow-sm animate-pulse-fast shrink-0">
                {activePlayer.avatar}
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Giliran Bermain Monopoli
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activePlayer.name}</span>
                  {activePlayer.id === activeUserPlayer.id && (
                    <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                      Anda
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Posisi Sekarang: <strong className="text-amber-600 dark:text-amber-400">Petak {positions[activePlayer.id] || 0}</strong>
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
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-bubbly-amber'
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
                  onClick={restartMonopoly}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trophy className="w-5 h-5" />
                  <span>MAIN LAGI</span>
                </button>
              )}
            </div>
          </div>

          {/* Log notice bar */}
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2.5 shadow-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            <p>{logMessage}</p>
          </div>

          {/* Monopoly Board Grid (12 Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
            {MONOPOLY_TILES.map((tile) => {
              const playersHere = gamePlayers.filter(p => (positions[p.id] || 0) === tile.id);
              const ownerId = properties[tile.id];
              const owner = gamePlayers.find(p => p.id === ownerId);

              return (
                <div
                  key={tile.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between min-h-[95px] relative transition-all ${
                    owner ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/40' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">{tile.name}</p>
                    {tile.cost && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Harga: {tile.cost} 🪙 | Sewa: {tile.rent} 🪙</p>
                    )}
                    {owner && (
                      <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 mt-1">
                        Milik {owner.name}
                      </span>
                    )}
                  </div>

                  {/* Players on tile */}
                  <div className="flex items-center gap-1 mt-2">
                    {playersHere.map(p => (
                      <span key={p.id} className="text-xl animate-bounce" title={p.name}>
                        {p.avatar}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time In-Game Chat Overlay */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Obrolan Realtime Keluarga</span>
            </h4>

            <div className="h-28 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex items-baseline gap-2">
                  <span className="font-black text-amber-600 dark:text-amber-400">{msg.senderName}:</span>
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
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-2 border-amber-400 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>📖</span> Aturan Monopoli ASTA
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <li>1. Kocok dadu dan kelilingi petak kebahagiaan keluarga.</li>
              <li>2. Beli aset rumah keluarga jika koin mencukupi.</li>
              <li>3. Bayar sewa koin jika mendarat di aset milik pemain lain.</li>
              <li>4. Setiap melewati petak START, kamu dapat bonus 50 Koin.</li>
              <li>5. Pemain yang mengumpulkan 300+ Koin menjadi Juara!</li>
            </ul>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
