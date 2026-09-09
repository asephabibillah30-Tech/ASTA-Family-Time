import { useState, useEffect } from 'react';
import type {
  MemoryItem,
  PlannerEvent,
  JournalEntry,
  AppreciationItem,
  ChatMessage,
  FamilyChallenge,
  FamilyHabit,
  FinanceTransaction,
  SavingsTarget,
  FamilyAchievement,
  JournalMood
} from '../types/family';
import {
  DAILY_IDEAS,
  INITIAL_CHALLENGES,
  INITIAL_HABITS,
  INITIAL_PLANNER_EVENTS,
  INITIAL_MEMORIES,
  INITIAL_JOURNAL,
  INITIAL_APPRECIATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_SAVINGS_TARGETS,
  INITIAL_ACHIEVEMENTS
} from '../data/familyData';
import { sound } from '../utils/sound';
import { fireBurstConfetti, fireSmallPop } from '../utils/confetti';

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`asta_family_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading storage for', key, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`asta_family_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving storage for', key, e);
  }
}

export function useFamilyState() {
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState<number>(() => loadStorage('idea_idx', 0));
  const [memories, setMemories] = useState<MemoryItem[]>(() => loadStorage('memories', INITIAL_MEMORIES));
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>(() => loadStorage('planner', INITIAL_PLANNER_EVENTS));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadStorage('journal', INITIAL_JOURNAL));
  const [appreciations, setAppreciations] = useState<AppreciationItem[]>(() => loadStorage('appreciations', INITIAL_APPRECIATIONS));
  const [challenges, setChallenges] = useState<FamilyChallenge[]>(() => loadStorage('challenges', INITIAL_CHALLENGES));
  const [habits, setHabits] = useState<FamilyHabit[]>(() => loadStorage('habits', INITIAL_HABITS));
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => loadStorage('transactions', INITIAL_FINANCE_TRANSACTIONS));
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>(() => loadStorage('savings', INITIAL_SAVINGS_TARGETS));
  const [achievements] = useState<FamilyAchievement[]>(() => loadStorage('achievements', INITIAL_ACHIEVEMENTS));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadStorage('chat_msgs', INITIAL_CHAT_MESSAGES));

  // Calculated Family Stats
  const familyStreak = 7; // Streak days
  const totalLovePoints = (Array.isArray(appreciations) ? appreciations : []).reduce((acc, curr) => acc + (curr?.lovePoints || 0), 120);
  const currentDailyIdea = DAILY_IDEAS[Math.abs(currentIdeaIndex || 0) % DAILY_IDEAS.length] || DAILY_IDEAS[0];

  // Save effects
  useEffect(() => saveStorage('idea_idx', currentIdeaIndex), [currentIdeaIndex]);
  useEffect(() => saveStorage('memories', memories), [memories]);
  useEffect(() => saveStorage('planner', plannerEvents), [plannerEvents]);
  useEffect(() => saveStorage('journal', journalEntries), [journalEntries]);
  useEffect(() => saveStorage('appreciations', appreciations), [appreciations]);
  useEffect(() => saveStorage('challenges', challenges), [challenges]);
  useEffect(() => saveStorage('habits', habits), [habits]);
  useEffect(() => saveStorage('transactions', transactions), [transactions]);
  useEffect(() => saveStorage('savings', savingsTargets), [savingsTargets]);
  useEffect(() => saveStorage('achievements', achievements), [achievements]);
  useEffect(() => saveStorage('chat_msgs', chatMessages), [chatMessages]);

  // Actions
  const nextDailyIdea = () => {
    setCurrentIdeaIndex(prev => (prev + 1) % DAILY_IDEAS.length);
    sound.playClick();
    fireSmallPop(0.5, 0.4);
  };

  const addMemory = (memory: Omit<MemoryItem, 'id' | 'likes'>) => {
    const newItem: MemoryItem = {
      ...memory,
      id: `mem-${Date.now()}`,
      likes: 1
    };
    setMemories(prev => [newItem, ...prev]);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const likeMemory = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
    sound.playClick();
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    sound.playClick();
  };

  const addPlannerEvent = (event: Omit<PlannerEvent, 'id'>) => {
    const newItem: PlannerEvent = {
      ...event,
      id: `ev-${Date.now()}`
    };
    setPlannerEvents(prev => [...prev, newItem]);
    sound.playSuccess();
  };

  const togglePlannerEvent = (id: string) => {
    setPlannerEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
    sound.playClick();
  };

  const deletePlannerEvent = (id: string) => {
    setPlannerEvents(prev => prev.filter(e => e.id !== id));
    sound.playClick();
  };

  const addJournalEntry = (playerId: string, playerName: string, playerAvatar: string, mood: JournalMood, reason: string) => {
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      playerId,
      playerName,
      playerAvatar,
      date: new Date().toISOString().split('T')[0],
      mood,
      reason,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const sendAppreciation = (
    fromPlayerId: string,
    fromPlayerName: string,
    fromPlayerAvatar: string,
    toPlayerId: string,
    toPlayerName: string,
    toPlayerAvatar: string,
    message: string,
    badge?: string
  ) => {
    const newApp: AppreciationItem = {
      id: `app-${Date.now()}`,
      fromPlayerId,
      fromPlayerName,
      fromPlayerAvatar,
      toPlayerId,
      toPlayerName,
      toPlayerAvatar,
      message,
      lovePoints: 10,
      date: 'Hari ini',
      badge: badge || 'Penuh Kasih ❤️'
    };
    setAppreciations(prev => [newApp, ...prev]);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextCompleted = !h.completedToday;
        return {
          ...h,
          completedToday: nextCompleted,
          streakDays: nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1)
        };
      }
      return h;
    }));
    sound.playClick();
  };

  const toggleChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.completed;
        if (nextState) {
          sound.playSuccess();
          fireBurstConfetti();
        }
        return { ...c, completed: nextState };
      }
      return c;
    }));
  };

  const addFinanceTransaction = (type: 'income' | 'expense', amount: number, category: string, note: string) => {
    const newTrans: FinanceTransaction = {
      id: `f-${Date.now()}`,
      type,
      amount,
      category,
      note,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTrans, ...prev]);
    sound.playSuccess();
  };

  const addSavingsTarget = (title: string, targetAmount: number, emoji: string, deadline?: string) => {
    const newTarget: SavingsTarget = {
      id: `st-${Date.now()}`,
      title,
      targetAmount,
      currentAmount: 0,
      emoji: emoji || '🎯',
      deadline
    };
    setSavingsTargets(prev => [...prev, newTarget]);
    sound.playSuccess();
  };

  const depositSavings = (id: string, amount: number) => {
    setSavingsTargets(prev => prev.map(s => s.id === id ? { ...s, currentAmount: s.currentAmount + amount } : s));
    sound.playSuccess();
    fireSmallPop(0.5, 0.4);
  };

    const sendChatMessage = (
    senderId: string,
    senderName: string,
    senderAvatar: string,
    senderColor: string,
    text: string,
    mediaType: ChatMessage['mediaType'] = 'text'
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderAvatar,
      senderColor,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      mediaType
    };
    setChatMessages(prev => [...prev, newMsg]);
    sound.playClick();
  };

  const addChatReaction = (msgId: string, emoji: string, userId: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.by.includes(userId)) {
            // remove
            return {
              ...m,
              reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), by: r.by.filter(u => u !== userId) } : r).filter(r => r.count > 0)
            };
          } else {
            return {
              ...m,
              reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, by: [...r.by, userId] } : r)
            };
          }
        } else {
          return {
            ...m,
            reactions: [...m.reactions, { emoji, count: 1, by: [userId] }]
          };
        }
      }
      return m;
    }));
    sound.playClick();
  };

  const deleteChatMessage = (msgId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== msgId));
    sound.playClick();
  };

  return {
    chatMessages,
    sendChatMessage,
    addChatReaction,
    deleteChatMessage,
    currentDailyIdea,
    nextDailyIdea,
    memories,
    addMemory,
    likeMemory,
    deleteMemory,
    plannerEvents,
    addPlannerEvent,
    togglePlannerEvent,
    deletePlannerEvent,
    journalEntries,
    addJournalEntry,
    appreciations,
    sendAppreciation,
    challenges,
    toggleChallenge,
    habits,
    toggleHabit,
    transactions,
    addFinanceTransaction,
    savingsTargets,
    addSavingsTarget,
    depositSavings,
    achievements,
    familyStreak,
    totalLovePoints
  };
}
