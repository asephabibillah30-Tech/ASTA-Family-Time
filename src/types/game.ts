export type CategoryType = 
  | 'expression'  // 😂 Ekspresi & Gaya
  | 'charades'    // 🎭 Tebak Gaya
  | 'word_guess'  // 🧠 Tebak Kata
  | 'activity'    // 🕺 Gerakan & Aktivitas
  | 'trivia'      // 📚 Pengetahuan
  | 'affection'   // ❤️ Kasih Sayang
  | 'creative';   // 🎨 Kreatif

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  emoji: string;
  description: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
}

export type DifficultyLevel = 1 | 2 | 3; // 1 = Mudah, 2 = Sedang, 3 = Menantang

export interface Card {
  id: number;
  category: CategoryType;
  title: string;
  description: string;
  emoji: string;
  difficulty: DifficultyLevel;
  points: number;
  duration?: number;
  proTip?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  rolePreset?: string;
  score: number;
  cardsCompleted: number;
  color: string;
  isOnline?: boolean;
  isLeft?: boolean;
  status?: 'playing' | 'keluar';
}

export type GameModeId = 'random' | 'funny' | 'expression' | 'charades' | 'animal' | 'smart' | 'family' | 'speed' | 'custom';

export interface GameMode {
  id: GameModeId;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  color: string;
  badgeColor: string;
  allowedCategories: CategoryType[];
  defaultTimer?: number;
}

export type AppScreen = 
  | 'home'
  | 'chat'
  | 'game'
  | 'players_setup'
  | 'mode_select'
  | 'game_board'
  | 'result'
  | 'quality_time'
  | 'memories'
  | 'family_hub'
  | 'planner'
  | 'journal'
  | 'appreciation'
  | 'challenges'
  | 'habits'
  | 'finance'
  | 'learning'
  | 'achievements';

export type MainTab = 'home' | 'chat' | 'game' | 'quality_time' | 'memories' | 'family_hub';

export interface TurnTransition {
  show: boolean;
  completedPlayer: Player | null;
  pointsEarned: number;
  isBonus: boolean;
  nextPlayer: Player | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  darkMode: boolean;
  customTimerSeconds: number;
}
