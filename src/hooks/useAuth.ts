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

  // Refresh members whenever current family changes
  useEffect(() => {
    if (currentFamily?.id) {
      setFamilyMembers(db.getUsersByFamily(currentFamily.id));
    }
  }, [currentFamily]);

  // Login as Head of Family
  const loginHead = (usernameOrEmail: string, passwordOrPin: string) => {
    const session = db.loginHead(usernameOrEmail, passwordOrPin);
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
