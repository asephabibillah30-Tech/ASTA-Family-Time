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
  JournalMood,
  ActivityNotification
} from '../types/family';
import {
  DAILY_IDEAS,
  INITIAL_CHALLENGES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_HABITS
} from '../data/familyData';
import { supabaseFamilyService } from '../services/db/supabaseFamilyService';
import { sound } from '../utils/sound';
import { fireBurstConfetti, fireSmallPop } from '../utils/confetti';

const MAX_NOTIF_BYTES = 5 * 1024 * 1024; // 5 MB PWA Cache Limit

export const DEFAULT_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif-1',
    title: 'Sesi Enkripsi Aktif',
    message: '✨ Sesi privat terenkripsi aktif untuk keluarga ASTA.',
    category: 'system',
    icon: '✨',
    timestamp: Date.now() - 1000 * 60 * 5,
    read: false
  },
  {
    id: 'notif-2',
    title: 'Sinkronisasi PWA Cloud',
    message: '☁️ Sinkronisasi data keluarga di semua HP aktif.',
    category: 'system',
    icon: '☁️',
    timestamp: Date.now() - 1000 * 60 * 15,
    read: false
  }
];

function pruneNotifications(notifs: ActivityNotification[]): ActivityNotification[] {
  let list = [...notifs];
  while (list.length > 1) {
    const jsonStr = JSON.stringify(list);
    const bytes = new Blob([jsonStr]).size;
    if (bytes <= MAX_NOTIF_BYTES && list.length <= 500) {
      break;
    }
    list.pop(); // Automatically evict oldest notification if limit reached
  }
  return list;
}

function loadStorage<T>(key: string, familyId: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem('asta_family_' + familyId + '_' + key);
    if (saved) {
      const parsed = JSON.parse(saved) as T;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (!Array.isArray(parsed) && parsed !== null && parsed !== undefined) return parsed;
    }
  } catch (e) {
    console.error('Error loading storage for', key, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, familyId: string, value: T) {
  try {
    localStorage.setItem('asta_family_' + familyId + '_' + key, JSON.stringify(value));
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.open('asta-pwa-storage-v1').then((cache) => {
        cache.put('/api/storage/' + familyId + '/' + key, new Response(JSON.stringify(value), {
          headers: { 'Content-Type': 'application/json' }
        })).catch(() => {});
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving storage for', key, e);
  }
}

export function useFamilyState(familyId?: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState<number>(0);
  const [memories, setMemories] = useState<MemoryItem[]>(() => familyId ? loadStorage('memories', familyId, []) : []);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>(() => familyId ? loadStorage('planner', familyId, []) : []);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => familyId ? loadStorage('journal', familyId, []) : []);
  const [appreciations, setAppreciations] = useState<AppreciationItem[]>(() => familyId ? loadStorage('appreciations', familyId, []) : []);
  const [challenges, setChallenges] = useState<FamilyChallenge[]>(INITIAL_CHALLENGES);
  const [habits, setHabits] = useState<FamilyHabit[]>(() => familyId ? loadStorage('habits', familyId, INITIAL_HABITS) : INITIAL_HABITS);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => familyId ? loadStorage('transactions', familyId, []) : []);
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>(() => familyId ? loadStorage('savings', familyId, []) : []);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => familyId ? loadStorage('chat_msgs', familyId, []) : []);
  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => familyId ? loadStorage('notifications', familyId, DEFAULT_NOTIFICATIONS) : DEFAULT_NOTIFICATIONS);
  const [gamePoints, setGamePoints] = useState<number>(() => familyId ? loadStorage('game_points', familyId, 0) : 0);

  const addNotification = useCallback((
    message: string,
    category: ActivityNotification['category'],
    icon?: string,
    title?: string,
    senderId?: string,
    targetUserId?: string,
    dedupKey?: string
  ) => {
    setNotifications((prev) => {
      if (dedupKey && prev.some((n) => n.dedupKey === dedupKey)) {
        return prev;
      }
      if (!dedupKey && prev.some((n) => n.message === message && Math.abs(n.timestamp - Date.now()) < 5000)) {
        return prev;
      }

      const newNotif: ActivityNotification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: title || 'Aktivitas Keluarga',
        message,
        category,
        icon: icon || '🔔',
        timestamp: Date.now(),
        read: false,
        senderId,
        targetUserId,
        dedupKey
      };

      const updated = [newNotif, ...prev];
      const pruned = pruneNotifications(updated);
      if (familyId) {
        saveStorage('notifications', familyId, pruned);
        try {
          if ('caches' in window) {
            caches.open('asta-pwa-notif-v1').then((cache) => {
              cache.put('/api/notifications', new Response(JSON.stringify(pruned), {
                headers: { 'Content-Type': 'application/json' }
              })).catch(() => {});
            });
          }
        } catch (e) {}
      }
      return pruned;
    });
  }, [familyId]);

  const markAllNotifsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (familyId) saveStorage('notifications', familyId, updated);
      return updated;
    });
  }, [familyId]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (familyId) saveStorage('notifications', familyId, []);
  }, [familyId]);

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
        setHabits(cloud.habits.length > 0 ? cloud.habits : loadStorage('habits', fid, INITIAL_HABITS));
        setTransactions(cloud.transactions.length > 0 ? cloud.transactions : loadStorage('transactions', fid, []));
        setSavingsTargets(cloud.savingsTargets.length > 0 ? cloud.savingsTargets : loadStorage('savings', fid, []));
        setNotifications(loadStorage('notifications', fid, DEFAULT_NOTIFICATIONS));
        // Merge local chat messages with cloud chat messages to preserve read receipts
        const localMsgs = loadStorage<ChatMessage[]>('chat_msgs', fid, []);
        const mergedMsgs = (cloud.chatMessages || []).map((cMsg) => {
          const lMsg = localMsgs.find(m => m.id === cMsg.id);
          if (!lMsg) return cMsg;
          const cloudReadBy = cMsg.readBy || [];
          const localReadBy = lMsg.readBy || [];
          const map = new Map();
          cloudReadBy.forEach(r => map.set(r.userId, r));
          localReadBy.forEach(r => { if (!map.has(r.userId)) map.set(r.userId, r); });
          return { ...cMsg, readBy: Array.from(map.values()) };
        });
        setChatMessages(mergedMsgs.length > 0 ? mergedMsgs : localMsgs);
      } else {
        setMemories(loadStorage('memories', fid, []));
        setPlannerEvents(loadStorage('planner', fid, []));
        setJournalEntries(loadStorage('journal', fid, []));
        setAppreciations(loadStorage('appreciations', fid, []));
        setHabits(loadStorage('habits', fid, INITIAL_HABITS));
        setTransactions(loadStorage('transactions', fid, []));
        setSavingsTargets(loadStorage('savings', fid, []));
        setChatMessages(loadStorage('chat_msgs', fid, []));
        setNotifications(loadStorage('notifications', fid, DEFAULT_NOTIFICATIONS));
      }
      setCurrentIdeaIndex(loadStorage('idea_idx', fid, 0));
    } catch (e) {
      console.warn('loadData error, falling back to localStorage:', e);
      setMemories(loadStorage('memories', fid, []));
      setPlannerEvents(loadStorage('planner', fid, []));
      setJournalEntries(loadStorage('journal', fid, []));
      setAppreciations(loadStorage('appreciations', fid, []));
      setHabits(loadStorage('habits', fid, INITIAL_HABITS));
      setTransactions(loadStorage('transactions', fid, []));
      setSavingsTargets(loadStorage('savings', fid, []));
      setChatMessages(loadStorage('chat_msgs', fid, []));
      setNotifications(loadStorage('notifications', fid, DEFAULT_NOTIFICATIONS));
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
  useEffect(() => { if (familyId) saveStorage('notifications', familyId, notifications); }, [notifications, familyId]);

  // Real-Time Auto-Sync: Pesan obrolan baru & status dibaca langsung muncul tanpa perlu refresh halaman
  useEffect(() => {
    if (!familyId) return;

    const pollInterval = setInterval(async () => {
      try {
        const cloudMsgs = await supabaseFamilyService.loadChatMessages(familyId);
        if (cloudMsgs && Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
          setChatMessages((prev) => {
            if (prev.length > 0) {
              const newMsgs = cloudMsgs.filter((c) => !prev.some((p) => p.id === c.id));
              newMsgs.forEach((nM) => {
                const snippet = nM.text.length > 35 ? nM.text.substring(0, 35) + '...' : nM.text;
                addNotification(`💬 ${nM.senderName}: "${snippet}"`, 'chat', '💬', 'Pesan Obrolan Masuk');
              });
            }

            const merged = cloudMsgs.map((cMsg) => {
              const localMsg = prev.find((p) => p.id === cMsg.id);
              if (!localMsg) return cMsg;
              const cloudReadBy = cMsg.readBy || [];
              const localReadBy = localMsg.readBy || [];
              const map = new Map();
              cloudReadBy.forEach(r => map.set(r.userId, r));
              localReadBy.forEach(r => {
                if (!map.has(r.userId)) {
                  map.set(r.userId, r);
                  supabaseFamilyService.updateChatReadBy(cMsg.id, Array.from(map.values())).catch(() => {});
                }
              });
              return { ...cMsg, readBy: Array.from(map.values()) };
            });

            if (JSON.stringify(prev) !== JSON.stringify(merged)) {
              return merged;
            }
            return prev;
          });
        }
      } catch (e) {
        // Silent catch
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [familyId, addNotification]);

  const basePoints = 100; // Base Initial Family Welcome Points
  const appreciationsPoints = appreciations.reduce((acc, curr) => acc + (curr?.lovePoints || 10), 0);
  const memoriesPoints = memories.length * 10;
  const habitsPoints = habits.filter(h => h.completedToday).length * 10;
  const totalLovePoints = basePoints + appreciationsPoints + memoriesPoints + habitsPoints + gamePoints;

  const addLovePoints = (amount: number) => {
    setGamePoints((prev) => {
      const next = prev + amount;
      if (familyId) saveStorage('game_points', familyId, next);
      return next;
    });
    addNotification(`🎮 Berhasil mendapatkan +${amount} Love Points dari permainan!`, 'game', '🎮', 'Poin Permainan');
    sound.playSuccess();
    fireSmallPop(0.5, 0.4);
  };

  const familyStreak = habits.length > 0
    ? Math.max(...habits.map((h) => h.streakDays || 0), 1)
    : 7;

  const achievements: FamilyAchievement[] = INITIAL_ACHIEVEMENTS.map((ach) => {
    if (ach.id === 'ach-2') {
      const progress = Math.min(familyStreak, 7);
      return { ...ach, progress, unlocked: progress >= 7 };
    }
    if (ach.id === 'ach-3') {
      const progress = Math.min(appreciations.length, 100);
      return { ...ach, progress, unlocked: progress >= 100 };
    }
    if (ach.id === 'ach-4') {
      const progress = Math.min(memories.length, 50);
      return { ...ach, progress, unlocked: progress >= 50 };
    }
    if (ach.id === 'ach-6') {
      const completedCount = habits.filter((h) => h.completedToday).length;
      const max = habits.length || 6;
      return { ...ach, maxProgress: max, progress: completedCount, unlocked: habits.length > 0 && completedCount === habits.length };
    }
    return ach;
  });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

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
    addNotification(`📸 Momen kenangan foto "${newItem.title}" telah diunggah! (+10 ⭐)`, 'memory', '📸', 'Memori Foto');
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
    addNotification(`📅 Agenda baru "${newItem.title}" ditambahkan untuk ${newItem.date}`, 'planner', '📅', 'Agenda Keluarga Baru');
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
    addNotification(`📝 Catatan emosi baru ditulis oleh ${playerName}`, 'journal', '📝', 'Jurnal Emosi Hati');
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
    addNotification(`💌 ${newApp.fromPlayerName} mengapresiasi ${newApp.toPlayerName}: "${newApp.message}" (+10 ⭐)`, 'appreciation', '💌', 'Kartu Apresiasi Hangat');
    sound.playSuccess();
    fireBurstConfetti();
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          if (nextCompleted) {
            addNotification(`🌱 Kebiasaan "${h.title}" diselesaikan hari ini! (+10 ⭐)`, 'habit', '🌱', 'Kebiasaan Harian');
          }
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
    const snippet = text.length > 35 ? text.substring(0, 35) + '...' : text;
    addNotification(`💬 ${senderName}: "${snippet}"`, 'chat', '💬', 'Pesan Obrolan Baru');
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
    totalLovePoints,
    addLovePoints,
    notifications,
    unreadNotifCount,
    markAllNotifsAsRead,
    clearNotifications,
    addNotification
  };
}
