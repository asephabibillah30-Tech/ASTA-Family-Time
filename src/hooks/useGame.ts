import { useState, useEffect, useCallback } from 'react';
import type { Card, GameModeId, Player, AppScreen, TurnTransition, GameSettings } from '../types/game';
import { INITIAL_CARDS, GAME_MODES } from '../data/cards';
import { sound } from '../utils/sound';
import { fireBurstConfetti, fireSmallPop, fireVictoryShower } from '../utils/confetti';

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p-1', name: 'Ayah', avatar: '👨‍💼', rolePreset: 'Ayah', score: 0, cardsCompleted: 0, color: 'bg-blue-500' },
  { id: 'p-2', name: 'Ibu', avatar: '👩‍🍳', rolePreset: 'Ibu', score: 0, cardsCompleted: 0, color: 'bg-rose-500' },
  { id: 'p-3', name: 'Kakak', avatar: '👦', rolePreset: 'Kakak', score: 0, cardsCompleted: 0, color: 'bg-amber-500' },
  { id: 'p-4', name: 'Adik', avatar: '👧', rolePreset: 'Adik', score: 0, cardsCompleted: 0, color: 'bg-teal-500' },
];

export const AVATAR_PRESETS = [
  { emoji: '👨‍💼', label: 'Ayah' },
  { emoji: '👩‍🍳', label: 'Ibu' },
  { emoji: '👦', label: 'Kakak Laki' },
  { emoji: '👧', label: 'Adik Cilik' },
  { emoji: '👱‍♀️', label: 'Kakak Cewek' },
  { emoji: '👶', label: 'Bayi Imut' },
  { emoji: '👴', label: 'Kakek' },
  { emoji: '👵', label: 'Nenek' },
  { emoji: '🐱', label: 'Kucing Peliharaan' },
  { emoji: '🐶', label: 'Anjing Setia' },
  { emoji: '🦸‍♂️', label: 'Pahlawan' },
  { emoji: '🚀', label: 'Astronaut' },
];

export const PLAYER_COLORS = [
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useGame() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>('random');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);

  const [availableDeck, setAvailableDeck] = useState<Card[]>([]);
  const [usedCards, setUsedCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const [turnTransition, setTurnTransition] = useState<TurnTransition>({
    show: false,
    completedPlayer: null,
    pointsEarned: 0,
    isBonus: false,
    nextPlayer: null,
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    return {
      soundEnabled: true,
      musicVolume: 0.6,
      darkMode: false,
      customTimerSeconds: 15,
    };
  });

  // Keep sound instance in sync with settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.musicVolume);
  }, [settings.soundEnabled, settings.musicVolume]);

  // Dark mode class toggle
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = (partial: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  // Helper to get active mode config
  const currentMode = GAME_MODES.find(m => m.id === selectedModeId) || GAME_MODES[0];

  // Initialize deck based on game mode
  const initializeDeck = useCallback((modeId: GameModeId) => {
    const mode = GAME_MODES.find(m => m.id === modeId) || GAME_MODES[0];
    const filtered = INITIAL_CARDS.filter(c => mode.allowedCategories.includes(c.category));
    const shuffled = shuffleArray(filtered);
    setAvailableDeck(shuffled);
    setUsedCards([]);
    setCurrentCard(null);
    setIsCardFlipped(false);
  }, []);

  // Add a player
  const addPlayer = (name: string, rolePreset: string = 'Pemain', avatar?: string) => {
    if (!name.trim()) return;
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    const defaultAvatar = avatar || AVATAR_PRESETS[players.length % AVATAR_PRESETS.length].emoji;
    
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      rolePreset,
      avatar: defaultAvatar,
      score: 0,
      cardsCompleted: 0,
      color,
    };

    setPlayers(prev => [...prev, newPlayer]);
    sound.playClick();
  };

  // Remove player
  const removePlayer = (id: string) => {
    if (players.length <= 2) return; // Keep at least 2 players
    setPlayers(prev => prev.filter(p => p.id !== id));
    sound.playClick();
  };

  // Update player info
  const updatePlayer = (id: string, partial: Partial<Player>) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...partial } : p)));
  };

  // Select Mode
  const selectMode = (modeId: GameModeId) => {
    setSelectedModeId(modeId);
    sound.playClick();
  };

  // Start the Game
  const startGame = () => {
    if (players.length < 2) return;
    // Reset player scores
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, cardsCompleted: 0 })));
    setCurrentPlayerIndex(0);
    initializeDeck(selectedModeId);
    setScreen('game_board');
    sound.playTurnSwitch();
    fireSmallPop(0.5, 0.3);
  };

  // Draw the next card
  const drawCard = () => {
    if (availableDeck.length === 0) {
      // Game finished
      finishGame();
      return;
    }

    setIsShuffling(true);
    sound.playCardShuffle();

    setTimeout(() => {
      const nextCard = availableDeck[0];
      const remainingDeck = availableDeck.slice(1);

      setCurrentCard(nextCard);
      setAvailableDeck(remainingDeck);
      setUsedCards(prev => [...prev, nextCard]);
      setIsShuffling(false);
      setIsCardFlipped(true);
      sound.playCardFlip();
    }, 600);
  };

  // Finish Game and show Result
  const finishGame = () => {
    setScreen('result');
    sound.playVictory();
    fireVictoryShower();
  };

  // Submit scoring for current card
  const submitScore = (actionType: 'success' | 'funny' | 'skip') => {
    if (!currentCard) return;

    const currentPlayer = players[currentPlayerIndex];
    let pointsToAdd = 0;
    let isBonus = false;

    if (actionType === 'success') {
      pointsToAdd = currentCard.points;
      sound.playSuccess();
      fireBurstConfetti();
    } else if (actionType === 'funny') {
      pointsToAdd = currentCard.points + 1; // +1 Bonus for super funny performance
      isBonus = true;
      sound.playFunnyBonus();
      fireBurstConfetti();
    } else {
      // Skip
      pointsToAdd = 0;
      sound.playSkip();
    }

    // Update player score
    const updatedPlayers = players.map((p, idx) => {
      if (idx === currentPlayerIndex) {
        return {
          ...p,
          score: p.score + pointsToAdd,
          cardsCompleted: pointsToAdd > 0 ? p.cardsCompleted + 1 : p.cardsCompleted,
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);

    // Calculate next player
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = updatedPlayers[nextIndex];

    // Show celebratory turn transition modal
    setTurnTransition({
      show: true,
      completedPlayer: currentPlayer,
      pointsEarned: pointsToAdd,
      isBonus,
      nextPlayer,
    });
  };

  // Close turn transition and advance to next player
  const advanceToNextTurn = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    setCurrentCard(null);
    setIsCardFlipped(false);
    setTurnTransition(prev => ({ ...prev, show: false }));
    sound.playTurnSwitch();

    // Check if deck is empty after card is scored
    if (availableDeck.length === 0 && !currentCard) {
      finishGame();
    }
  };

  // Restart Game with same players
  const restartSamePlayers = () => {
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, cardsCompleted: 0 })));
    setCurrentPlayerIndex(0);
    initializeDeck(selectedModeId);
    setScreen('game_board');
    sound.playClick();
  };

  // Reset to Home
  const resetToHome = () => {
    setScreen('home');
    setCurrentCard(null);
    setIsCardFlipped(false);
    setTurnTransition({ show: false, completedPlayer: null, pointsEarned: 0, isBonus: false, nextPlayer: null });
    sound.playClick();
  };

  const currentPlayer = players[currentPlayerIndex] || players[0];

  return {
    screen,
    setScreen,
    players,
    currentPlayer,
    currentPlayerIndex,
    selectedModeId,
    currentMode,
    availableDeck,
    usedCards,
    currentCard,
    isCardFlipped,
    isShuffling,
    turnTransition,
    settings,
    totalCardsInMode: availableDeck.length + usedCards.length,
    cardsRemaining: availableDeck.length,
    addPlayer,
    removePlayer,
    updatePlayer,
    selectMode,
    startGame,
    drawCard,
    submitScore,
    advanceToNextTurn,
    finishGame,
    restartSamePlayers,
    resetToHome,
    updateSettings,
  };
}
