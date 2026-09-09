import { useState, useEffect } from 'react';
import type { UserAccount, FamilyAccount, RegisterHeadDTO, AddMemberDTO } from '../types/auth';
import { db, DEFAULT_FAMILY, DEFAULT_USERS } from '../services/db/databaseService';
import { sound } from '../utils/sound';
import { fireBurstConfetti } from '../utils/confetti';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const sess = db.getSavedSession();
    return sess?.user || DEFAULT_USERS[0];
  });

  const [currentFamily, setCurrentFamily] = useState<FamilyAccount>(() => {
    const sess = db.getSavedSession();
    return sess?.family || DEFAULT_FAMILY;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sess = db.getSavedSession();
    return Boolean(sess && sess.user);
  });

  const [familyMembers, setFamilyMembers] = useState<UserAccount[]>(() => {
    return db.getUsersByFamily(currentFamily?.id || DEFAULT_FAMILY.id);
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
    db.deleteMemberByHead(currentUser.id, memberId);
    setFamilyMembers(db.getUsersByFamily(currentFamily.id));
    sound.playClick();
  };

  // Switch active profile within the same family
  const switchActiveMember = (memberId: string) => {
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
      setIsAuthenticated(false);
    }
  };

  // Logout -> Returns to Auth Gate
  const logout = () => {
    db.clearSession();
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
