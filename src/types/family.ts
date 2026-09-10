export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  caption: string;
  photoUrl?: string;
  tags: string[];
  album: string;
  likes: number;
}

export interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: 'routine' | 'school' | 'work' | 'birthday' | 'family_time' | 'holiday';
  description?: string;
  completed?: boolean;
  emoji: string;
}

export type JournalMood = 'happy' | 'neutral' | 'sad' | 'angry' | 'grateful';

export interface JournalMoodInfo {
  mood: JournalMood;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface JournalEntry {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  date: string;
  mood: JournalMood;
  reason: string;
  createdAt: string;
}

export interface AppreciationItem {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  fromPlayerAvatar: string;
  toPlayerId: string;
  toPlayerName: string;
  toPlayerAvatar: string;
  message: string;
  lovePoints: number;
  date: string;
  badge?: string;
}

export interface ReadReceipt {
  userId: string;
  userName: string;
  userAvatar?: string;
  readAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  text: string;
  timestamp: string;
  reactions: { emoji: string; count: number; by: string[] }[];
  readBy?: ReadReceipt[];
  isQuick?: boolean;
  mediaType?: 'text' | 'sticker' | 'call_invite' | 'voice_note';
}

export interface FamilyChallenge {
  id: string;
  title: string;
  tagline: string;
  type: 'daily' | 'weekly';
  description: string;
  durationText: string;
  rewardPoints: number;
  emoji: string;
  completed: boolean;
}

export interface FamilyHabit {
  id: string;
  title: string;
  emoji: string;
  completedToday: boolean;
  streakDays: number;
  category: 'spiritual' | 'health' | 'learning' | 'togetherness';
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface SavingsTarget {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  deadline?: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  category: 'general' | 'english' | 'religion' | 'math' | 'world' | 'financial' | 'skills';
  categoryLabel: string;
  emoji: string;
  summary: string;
  content: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface DailyIdea {
  id: string;
  title: string;
  description: string;
  duration: string;
  participants: string;
  cost: string;
  emoji: string;
  category: string;
  steps: string[];
}

export interface FamilyAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardPoints: number;
}
