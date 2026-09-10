import { useState, useEffect, useCallback } from 'react';
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
  INITIAL_ACHIEVEMENTS
} from '../data/familyData';
import { supabaseFamilyService } from '../services/db/supabaseFamilyService';
import { sound } from '../utils/sound';
import { fireBurstConfetti, fireSmallPop } from '../utils/confetti';

function loadStorage<T>(key: string, familyId: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem('asta_family_' + familyId + '_' + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading storage for', key, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, familyId: string, value: T) {
  try {
    localStorage.setItem('asta_family_' + familyId + '_' + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving storage for', key, e);
  }
}

export function useFamilyState(familyId?: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState<number>(0);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [appreciations, setAppreciations] = useState<AppreciationItem[]>([]);
  const [challenges, setChallenges] = useState<FamilyChallenge[]>(INITIAL_CHALLENGES);
  const [habits, setHabits] = useState<FamilyHabit[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>([]);
  const [achievements] = useState<FamilyAchievement[]>(INITIAL_ACHIEVEMENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const loadData = useCallback(async (fid: string) => {
    setIsLoading(true);
    try {
      const cloud = await supabaseFamilyService.loadAllFamilyData(fid);
      const hasCloudData = Object.values(cloud).some((arr) => arr.length > 0);
      if (hasCloudData) {
        setMemories(cloud.memories.length > 0 ? cloud.memories : loadStorage('memories', fid, []));
        setPlannerEvents(cloud.plannerEvents.length > 0 ? cloud.plannerEvents : loadStorage('planner', fid, []));
        setJournalEntries(cloud.journalEntries.length > 0 ? cloud.journalEntries : loadStorage('journal', fid, []));
        setAppreciations(cloud.appreciations.length > 0 ? cloud.appreciations : loadStorage('appreciations', fid, []));
        setHabits(cloud.habits.length > 0 ? cloud.habits : loadStorage('habits', fid, []));
        setTransactions(cloud.transactions.length > 0 ? cloud.transactions : loadStorage('transactions', fid, []));
        setSavingsTargets(cloud.savingsTargets.length > 0 ? cloud.savingsTargets : loadStorage('savings', fid, []));
        setChatMessages(cloud.chatMessages.length > 0 ? cloud.chatMessages : loadStorage('chat_msgs', fid, []));
      } else {
        setMemories(loadStorage('memories', fid, []));
        setPlannerEvents(loadStorage('planner', fid, []));
        setJournalEntries(loadStorage('journal', fid, []));
        setAppreciations(loadStorage('appreciations', fid, []));
        setHabits(loadStorage('habits', fid, []));
        setTransactions(loadStorage('transactions', fid, []));
        setSavingsTargets(loadStorage('savings', fid, []));
        setChatMessages(loadStorage('chat_msgs', fid, []));
      }
      setCurrentIdeaIndex(loadStorage('idea_idx', fid, 0));
    } catch (e) {
      console.warn('loadData error, falling back to localStorage:', e);
      setMemories(loadStorage('memories', fid, []));
      setPlannerEvents(loadStorage('planner', fid, []));
      setJournalEntries(loadStorage('journal', fid, []));
      setAppreciations(loadStorage('appreciations', fid, []));
      setHabits(loadStorage('habits', fid, []));
      setTransactions(loadStorage('transactions', fid, []));
      setSavingsTargets(loadStorage('savings', fid, []));
      setChatMessages(loadStorage('chat_msgs', fid, []));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (familyId) {
      loadData(familyId);
    } else {
      setMemories([]);
      setPlannerEvents([]);
      setJournalEntries([]);
      setAppreciations([]);
      setHabits([]);
      setTransactions([]);
      setSavingsTargets([]);
      setChatMessages([]);
      setIsLoading(false);
    }
  }, [familyId, loadData]);

  useEffect(() => { if (familyId) saveStorage('idea_idx', familyId, currentIdeaIndex); }, [currentIdeaIndex, familyId]);
  useEffect(() => { if (familyId) saveStorage('memories', familyId, memories); }, [memories, familyId]);
  useEffect(() => { if (familyId) saveStorage('planner', familyId, plannerEvents); }, [plannerEvents, familyId]);
  useEffect(() => { if (familyId) saveStorage('journal', familyId, journalEntries); }, [journalEntries, familyId]);
  useEffect(() => { if (familyId) saveStorage('appreciations', familyId, appreciations); }, [appreciations, familyId]);
  useEffect(() => { if (familyId) saveStorage('habits', familyId, habits); }, [habits, familyId]);
  useEffect(() => { if (familyId) saveStorage('transactions', familyId, transactions); }, [transactions, familyId]);
  useEffect(() => { if (familyId) saveStorage('savings', familyId, savingsTargets); }, [savingsTargets, familyId]);
  useEffect(() => { if (familyId) saveStorage('chat_msgs', familyId, chatMessages); }, [chatMessages, familyId]);

  // Real-Time Auto-Sync: Pesan obrolan baru & status dibaca langsung muncul tanpa perlu refresh halaman
  useEffect(() => {
    if (!familyId) return;

    const pollInterval = setInterval(async () => {
      try {
        const cloudMsgs = await supabaseFamilyService.loadChatMessages(familyId);
        if (cloudMsgs && Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
          setChatMessages((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloudMsgs)) {
              return cloudMsgs;
            }
            return prev;
          });
        }
      } catch (e) {
        // Silent catch
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [familyId]);

  const totalLovePoints = appreciations.reduce((acc, curr) => acc + (curr?.lovePoints || 0), 0);
  const familyStreak = 7;
  const currentDailyIdea = DAILY_IDEAS[Math.abs(currentIdeaIndex || 0) % DAILY_IDEAS.length] || DAILY_IDEAS[0];

  const nextDailyIdea = () => {
    setCurrentIdeaIndex((prev) => (prev + 1) % DAILY_IDEAS.length);
    sound.playClick();
    fireSmallPop(0.5, 0.4);
  };

  const addMemory = (memory: Omit<MemoryItem, 'id' | 'likes'>) => {
    const newItem: MemoryItem = { ...memory, id: 'mem-' + Date.now(), likes: 1 };
    setMemories((prev) => [newItem, ...prev]);
    if (familyId) supabaseFamilyService.upsertMemory(familyId, newItem).catch(console.warn);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const likeMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m));
      const item = updated.find((m) => m.id === id);
      if (familyId && item) supabaseFamilyService.upsertMemory(familyId, item).catch(console.warn);
      return updated;
    });
    sound.playClick();
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    supabaseFamilyService.deleteMemory(id).catch(console.warn);
    sound.playClick();
  };

  const addPlannerEvent = (event: Omit<PlannerEvent, 'id'>) => {
    const newItem: PlannerEvent = { ...event, id: 'ev-' + Date.now() };
    setPlannerEvents((prev) => [...prev, newItem]);
    if (familyId) supabaseFamilyService.upsertPlannerEvent(familyId, newItem).catch(console.warn);
    sound.playSuccess();
  };

  const togglePlannerEvent = (id: string) => {
    setPlannerEvents((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e));
      const item = updated.find((e) => e.id === id);
      if (familyId && item) supabaseFamilyService.upsertPlannerEvent(familyId, item).catch(console.warn);
      return updated;
    });
    sound.playClick();
  };

  const deletePlannerEvent = (id: string) => {
    setPlannerEvents((prev) => prev.filter((e) => e.id !== id));
    supabaseFamilyService.deletePlannerEvent(id).catch(console.warn);
    sound.playClick();
  };

  const addJournalEntry = (playerId: string, playerName: string, playerAvatar: string, mood: JournalMood, reason: string) => {
    const newEntry: JournalEntry = {
      id: 'j-' + Date.now(),
      playerId,
      playerName,
      playerAvatar,
      date: new Date().toISOString().split('T')[0],
      mood,
      reason,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
    if (familyId) supabaseFamilyService.insertJournalEntry(familyId, newEntry).catch(console.warn);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const sendAppreciation = (
    fromPlayerId: string, fromPlayerName: string, fromPlayerAvatar: string,
    toPlayerId: string, toPlayerName: string, toPlayerAvatar: string,
    message: string, badge?: string
  ) => {
    const newApp: AppreciationItem = {
      id: 'app-' + Date.now(),
      fromPlayerId, fromPlayerName, fromPlayerAvatar,
      toPlayerId, toPlayerName, toPlayerAvatar,
      message,
      lovePoints: 10,
      date: 'Hari ini',
      badge: badge || 'Penuh Kasih ❤️'
    };
    setAppreciations((prev) => [newApp, ...prev]);
    if (familyId) supabaseFamilyService.insertAppreciation(familyId, newApp).catch(console.warn);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nextCompleted,
            streakDays: nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1)
          };
        }
        return h;
      });
      const item = updated.find((h) => h.id === id);
      if (familyId && item) supabaseFamilyService.upsertHabit(familyId, item).catch(console.warn);
      return updated;
    });
    sound.playClick();
  };

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.completed;
          if (nextState) { sound.playSuccess(); fireBurstConfetti(); }
          return { ...c, completed: nextState };
        }
        return c;
      })
    );
  };

  const addFinanceTransaction = (type: 'income' | 'expense', amount: number, category: string, note: string) => {
    const newTrans: FinanceTransaction = {
      id: 'f-' + Date.now(),
      type, amount, category, note,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions((prev) => [newTrans, ...prev]);
    if (familyId) supabaseFamilyService.insertTransaction(familyId, newTrans).catch(console.warn);
    sound.playSuccess();
  };

  const addSavingsTarget = (title: string, targetAmount: number, emoji: string, deadline?: string) => {
    const newTarget: SavingsTarget = {
      id: 'st-' + Date.now(),
      title, targetAmount,
      currentAmount: 0,
      emoji: emoji || '🎯',
      deadline
    };
    setSavingsTargets((prev) => [...prev, newTarget]);
    if (familyId) supabaseFamilyService.upsertSavingsTarget(familyId, newTarget).catch(console.warn);
    sound.playSuccess();
  };

  const depositSavings = (id: string, amount: number) => {
    setSavingsTargets((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, currentAmount: s.currentAmount + amount } : s));
      const item = updated.find((s) => s.id === id);
      if (familyId && item) supabaseFamilyService.upsertSavingsTarget(familyId, item).catch(console.warn);
      return updated;
    });
    sound.playSuccess();
    fireSmallPop(0.5, 0.4);
  };

  const sendChatMessage = (
    senderId: string, senderName: string, senderAvatar: string,
    senderColor: string, text: string,
    mediaType: ChatMessage['mediaType'] = 'text'
  ) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId, senderName, senderAvatar, senderColor, text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      readBy: [{ userId: senderId, userName: senderName, userAvatar: senderAvatar, readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      mediaType
    };
    setChatMessages((prev) => {
      const nextList = [...prev, newMsg];
      if (familyId) saveStorage('chat_msgs', familyId, nextList);
      return nextList;
    });
    if (familyId) {
      supabaseFamilyService.insertChatMessage(familyId, newMsg).catch(console.warn);
    }
    sound.playClick();
  };

  const addChatReaction = (msgId: string, emoji: string, userId: string) => {
    setChatMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === msgId) {
          const existing = m.reactions.find((r) => r.emoji === emoji);
          let newReactions;
          if (existing) {
            if (existing.by.includes(userId)) {
              newReactions = m.reactions
                .map((r) => r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), by: r.by.filter((u) => u !== userId) } : r)
                .filter((r) => r.count > 0);
            } else {
              newReactions = m.reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, by: [...r.by, userId] } : r);
            }
          } else {
            newReactions = [...m.reactions, { emoji, count: 1, by: [userId] }];
          }
          supabaseFamilyService.updateChatReactions(msgId, newReactions).catch(console.warn);
          return { ...m, reactions: newReactions };
        }
        return m;
      });
      return updated;
    });
    sound.playClick();
  };

  const deleteChatMessage = (msgId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== msgId));
    supabaseFamilyService.deleteChatMessage(msgId).catch(console.warn);
    sound.playClick();
  };

  const markChatMessagesAsRead = useCallback((userId: string, userName: string, userAvatar?: string) => {
    if (!userId) return;
    setChatMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (m.senderId === userId) return m;
        const currentReadBy = m.readBy || [];
        const alreadyRead = currentReadBy.some((r) => r.userId === userId);
        if (!alreadyRead) {
          changed = true;
          const newReadBy = [
            ...currentReadBy,
            {
              userId,
              userName,
              userAvatar: userAvatar || '😊',
              readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
          supabaseFamilyService.updateChatReadBy(m.id, newReadBy).catch(console.warn);
          return { ...m, readBy: newReadBy };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, []);

  const resetChatToDemo = () => {
    setChatMessages([]);
    sound.playSuccess();
    fireBurstConfetti();
  };

  const clearAllChatMessages = () => {
    setChatMessages([]);
    sound.playClick();
  };

  return {
    isLoading,
    chatMessages,
    sendChatMessage,
    addChatReaction,
    deleteChatMessage,
    markChatMessagesAsRead,
    resetChatToDemo,
    clearAllChatMessages,
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
