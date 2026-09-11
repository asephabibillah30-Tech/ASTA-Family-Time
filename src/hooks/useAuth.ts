import { useState, useEffect } from 'react';
import type { UserAccount, FamilyAccount, RegisterHeadDTO, AddMemberDTO } from '../types/auth';
import { db } from '../services/db/databaseService';
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

  // Heartbeat & Presence Listener (Multi-tab & Real-time Presence Sync)
  useEffect(() => {
    if (!currentFamily?.id || !currentUser?.id) return;

    const familyId = currentFamily.id;
    const userId = currentUser.id;

    // Fungsi refresh presence dari semua sumber
    const refreshPresence = () => {
      setOnlineUserIds(db.getOnlineUserIds(familyId, userId));
    };

    // Send immediate heartbeat for active user
    db.sendHeartbeat(familyId, userId);
    refreshPresence();

    // Ambil cloud presence langsung saat login (cross-device)
    db.fetchCloudPresence(familyId).then((cloudIds) => {
      if (cloudIds.length > 0) {
        refreshPresence();
      }
    });

    // Kirim heartbeat lokal setiap 15 detik
    const heartbeatInterval = setInterval(() => {
      db.sendHeartbeat(familyId, userId);
      refreshPresence();
    }, 15000);

    // Poll cloud presence setiap 15 detik (cross-device presence dari Supabase)
    const cloudPollInterval = setInterval(async () => {
      await db.fetchCloudPresence(familyId);
      refreshPresence();
    }, 15000);

    // Listen to storage events (cross-tab same device)
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === `asta_presence_${familyId}` ||
        e.key === `asta_cloud_presence_${familyId}`
      ) {
        refreshPresence();
      }
    };

    window.addEventListener('storage', handleStorage);

    // BroadcastChannel untuk cross-tab di browser yang sama
    let ch: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      ch = new BroadcastChannel(`asta_presence_${familyId}`);
      ch.onmessage = () => {
        refreshPresence();
      };
    }

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cloudPollInterval);
      window.removeEventListener('storage', handleStorage);
      if (ch) ch.close();
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
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setCurrentUser(member);
      db.saveSession({ user: member, family: currentFamily });
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
