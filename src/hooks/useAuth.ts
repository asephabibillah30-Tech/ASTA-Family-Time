import { useState, useEffect, useRef } from 'react';
import type { UserAccount, FamilyAccount, RegisterHeadDTO, AddMemberDTO } from '../types/auth';
import { db } from '../services/db/databaseService';
import { postgresService } from '../services/db/postgresService';
import { sound } from '../utils/sound';
import { fireBurstConfetti } from '../utils/confetti';

export function useAuth() {
  // PENTING: Tidak pernah auto-login dengan DEFAULT_USERS.
  // currentUser hanya diisi jika ada sesi valid di sessionStorage.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const sess = db.getSavedSession();
    return sess?.user || null;
  });

  const [currentFamily, setCurrentFamily] = useState<FamilyAccount | null>(() => {
    const sess = db.getSavedSession();
    return sess?.family || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sess = db.getSavedSession();
    // Hanya true jika sesi valid DAN user bukan dari default template
    return Boolean(sess && sess.user && sess.user.id);
  });

  const [familyMembers, setFamilyMembers] = useState<UserAccount[]>(() => {
    const sess = db.getSavedSession();
    if (!sess?.family) return [];
    return db.getUsersByFamily(sess.family.id);
  });

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>(() => {
    const sess = db.getSavedSession();
    if (!sess?.family) return sess?.user ? [sess.user.id] : [];
    return db.getOnlineUserIds(sess.family.id, sess.user?.id);
  });

  // Refresh members & sync active family data whenever current family changes
  useEffect(() => {
    if (currentFamily?.id) {
      setFamilyMembers(db.getUsersByFamily(currentFamily.id));
      db.syncActiveFamily(currentFamily.id).catch(() => {});
    }
  }, [currentFamily]);

  // ── Ref untuk Supabase Realtime channel ──────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeChannelRef = useRef<any>(null);

  // ── Real-time Presence via Supabase Realtime WebSocket ────────────────
  // Saat user connect → event 'join' langsung muncul di semua device.
  // Saat browser/tab ditutup → WebSocket putus → Supabase otomatis broadcast 'leave'.
  // Tidak perlu polling sama sekali.
  useEffect(() => {
    if (!currentFamily?.id || !currentUser?.id) return;

    const familyId = currentFamily.id;
    const userId = currentUser.id;
    const supabase = postgresService.getClient();

    // ── Cleanup channel lama jika ada ──
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
      realtimeChannelRef.current = null;
    }

    // ── Juga kirim heartbeat ke localStorage (fallback same-device) ──
    db.sendHeartbeat(familyId, userId);

    if (supabase) {
      // ── Supabase Realtime Presence (WebSocket, instant cross-device) ──
      const channel = supabase.channel(`family_presence_${familyId}`, {
        config: { presence: { key: userId } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          // Dipanggil setiap kali state berubah (join/leave/reconnect)
          const state = channel.presenceState<{ userId: string }>();
          const onlineIds = Object.keys(state);
          // Pastikan user sendiri selalu ada
          if (!onlineIds.includes(userId)) onlineIds.push(userId);
          setOnlineUserIds(onlineIds);
          // Cache ke localStorage agar getOnlineUserIds() sinkron
          db.cacheOnlineIds(familyId, onlineIds);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('[Presence] join:', key, newPresences);
          setOnlineUserIds(prev => prev.includes(key) ? prev : [...prev, key]);
          db.cacheOnlineIds(familyId, undefined, key, 'join');
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('[Presence] leave:', key, leftPresences);
          setOnlineUserIds(prev => prev.filter(id => id !== key));
          db.cacheOnlineIds(familyId, undefined, key, 'leave');
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track kehadiran user ini di channel
            await channel.track({
              userId,
              online_at: new Date().toISOString(),
            });
          }
        });

      realtimeChannelRef.current = channel;

    } else {
      // ── Fallback: localStorage + BroadcastChannel (same-device only) ──
      const refreshPresence = () => {
        setOnlineUserIds(db.getOnlineUserIds(familyId, userId));
      };
      refreshPresence();

      const heartbeatInterval = setInterval(() => {
        db.sendHeartbeat(familyId, userId);
        refreshPresence();
      }, 5000);

      const handleStorage = (e: StorageEvent) => {
        if (e.key === `asta_presence_${familyId}`) refreshPresence();
      };
      window.addEventListener('storage', handleStorage);

      let ch: BroadcastChannel | null = null;
      if ('BroadcastChannel' in window) {
        ch = new BroadcastChannel(`asta_presence_${familyId}`);
        ch.onmessage = () => refreshPresence();
      }

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('storage', handleStorage);
        if (ch) ch.close();
      };
    }

    // ── Tandai offline saat tab disembunyikan / ditutup ──
    // Untuk Supabase Realtime: WebSocket putus otomatis → tidak perlu manual.
    // Tapi untuk localStorage fallback, kita tetap bersihkan.
    const handlePageHide = () => {
      db.markUserOffline(familyId, userId);
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    };
  }, [currentFamily?.id, currentUser?.id]);

  // Login as Head of Family
  const loginHead = async (usernameOrEmail: string, passwordOrPin: string) => {
    const session = await db.loginHeadAsync(usernameOrEmail, passwordOrPin);
    setCurrentUser(session.user);
    setCurrentFamily(session.family);
    setIsAuthenticated(true);
    setFamilyMembers(db.getUsersByFamily(session.family.id));
    sound.playSuccess();
    fireBurstConfetti();
    return session;
  };

  // Login as Member via Family Code & PIN
  const loginMember = (familyCode: string, userId: string, pin: string) => {
    const session = db.loginMemberWithCode(familyCode, userId, pin);
    setCurrentUser(session.user);
    setCurrentFamily(session.family);
    setIsAuthenticated(true);
    setFamilyMembers(db.getUsersByFamily(session.family.id));
    sound.playSuccess();
    fireBurstConfetti();
    return session;
  };

  // Register New Family & Head
  const registerHead = (dto: RegisterHeadDTO) => {
    const session = db.registerHeadOfFamily(dto);
    setCurrentUser(session.user);
    setCurrentFamily(session.family);
    setIsAuthenticated(true);
    setFamilyMembers(db.getUsersByFamily(session.family.id));
    sound.playSuccess();
    fireBurstConfetti();
    return session;
  };

  // Add Member (Head only)
  const addFamilyMember = (dto: AddMemberDTO) => {
    if (!currentUser || !currentFamily) throw new Error('Silakan masuk terlebih dahulu.');
    if (!currentUser.isHead) {
      throw new Error('Hanya Kepala Keluarga yang dapat menambahkan anggota keluarga.');
    }
    const newMember = db.addMemberByHead(currentUser.id, currentFamily.id, dto);
    setFamilyMembers(db.getUsersByFamily(currentFamily.id));
    sound.playSuccess();
    fireBurstConfetti();
    return newMember;
  };

  // Delete Member (Head only)
  const deleteFamilyMember = (memberId: string) => {
    if (!currentUser || !currentFamily) throw new Error('Silakan masuk terlebih dahulu.');
    db.deleteMemberByHead(currentUser.id, memberId);
    setFamilyMembers(db.getUsersByFamily(currentFamily.id));
    sound.playClick();
  };

  // Switch active profile within the same family
  const switchActiveMember = (memberId: string) => {
    if (!currentFamily) return;
    // Mark previous user offline before switching
    if (currentUser?.id) {
      db.markUserOffline(currentFamily.id, currentUser.id);
    }
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setCurrentUser(member);
      db.saveSession({ user: member, family: currentFamily });
      db.sendHeartbeat(currentFamily.id, member.id);
      sound.playClick();
    }
  };

  // Refresh session from local storage / db
  const refreshSession = () => {
    const sess = db.getSavedSession();
    if (sess && sess.user) {
      setCurrentUser(sess.user);
      setCurrentFamily(sess.family);
      setIsAuthenticated(true);
      setFamilyMembers(db.getUsersByFamily(sess.family.id));
    } else {
      setCurrentUser(null);
      setCurrentFamily(null);
      setIsAuthenticated(false);
    }
  };

  // Logout -> Returns to Auth Gate
  const logout = () => {
    // Tandai offline sebelum logout
    if (currentUser?.id && currentFamily?.id) {
      db.markUserOffline(currentFamily.id, currentUser.id);
    }
    db.clearSession();
    setCurrentUser(null);
    setCurrentFamily(null);
    setFamilyMembers([]);
    setIsAuthenticated(false);
    sound.playClick();
  };

  return {
    currentUser,
    currentFamily,
    familyMembers,
    onlineUserIds,
    isAuthenticated,
    isHead: currentUser?.isHead || false,
    loginHead,
    loginMember,
    registerHead,
    addFamilyMember,
    deleteFamilyMember,
    switchActiveMember,
    refreshSession,
    logout
  };
}
