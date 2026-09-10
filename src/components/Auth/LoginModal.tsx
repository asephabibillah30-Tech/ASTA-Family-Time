import React, { useState } from 'react';
import type { UserAccount, FamilyAccount } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import { X, Users, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/sound';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onLoginSuccess,
}) => {
  const [loginMode, setLoginMode] = useState<'head' | 'member'>('head');
  
  // Head Login State
  const [headUsername, setHeadUsername] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  
  // Member Login State
  const [familyCode, setFamilyCode] = useState('');
  const [foundFamily, setFoundFamily] = useState<FamilyAccount | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserAccount[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPin, setMemberPin] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleHeadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!headUsername.trim() || !headPassword.trim()) {
        setErrorMsg('Harap isi username/email dan password.');
        return;
      }
      await db.loginHeadAsync(headUsername, headPassword);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk.');
      sound.playClick();
    }
  };

  const handleSearchFamilyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSearching(true);
    try {
      const fam = await db.findFamilyByCodeAsync(familyCode);
      if (!fam) {
        setErrorMsg('Kode Keluarga tidak ditemukan. Contoh: ASTA-2026');
        return;
      }
      setFoundFamily(fam);
      const members = db.getUsersByFamily(fam.id);
      setFamilyMembers(members);
      if (members.length > 0) {
        setSelectedMemberId(members[0].id);
      }
      sound.playClick();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari Kode Keluarga.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!foundFamily || !selectedMemberId) {
        setErrorMsg('Pilih profil anggota keluarga terlebih dahulu.');
        return;
      }
      db.loginMemberWithCode(foundFamily.familyCode, selectedMemberId, memberPin);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'PIN anggota salah.');
      sound.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-5 border-2 border-rose-100 dark:border-slate-700 shadow-bubbly-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                Masuk Akun Keluarga
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                Pilih metode masuk yang sesuai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setLoginMode('head');
              setErrorMsg('');
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'head'
                ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>👑 Kepala Keluarga</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('member');
              setErrorMsg('');
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'member'
                ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>👥 Anggota Keluarga</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Mode: Kepala Keluarga */}
        {loginMode === 'head' ? (
          <form onSubmit={handleHeadLogin} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                Email / Username Kepala Keluarga
              </label>
              <input
                type="text"
                placeholder="Masukkan email atau username"
                value={headUsername}
                onChange={e => setHeadUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                Password / PIN Keamanan
              </label>
              <input
                type="password"
                placeholder="Masukkan password atau PIN"
                value={headPassword}
                onChange={e => setHeadPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>MASUK SEBAGAI KEPALA KELUARGA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Form Mode: Anggota Cepat via Kode Keluarga */
          <div className="space-y-4">
            {!foundFamily ? (
              <form onSubmit={handleSearchFamilyCode} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Masukkan Kode Keluarga Anda
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: ASTA-2026"
                    value={familyCode}
                    onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral tracking-widest text-center"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Minta kode keluarga dari Kepala Keluarga Anda.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>{isSearching ? 'MENCARI KODE KELUARGA...' : 'CARI KELUARGA'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleMemberLogin} className="space-y-3.5">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-teal-600 uppercase">Keluarga Ditemukan:</span>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white">{foundFamily.familyName}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFoundFamily(null)}
                    className="text-[10px] text-teal-700 underline font-bold"
                  >
                    Ganti
                  </button>
                </div>

                {/* Select Member Avatar */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Pilih Profil Anda
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {familyMembers.map((m) => {
                      const isSelected = m.id === selectedMemberId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            sound.playClick();
                          }}
                          className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'border-family-coral bg-rose-50 dark:bg-rose-950/60 shadow-xs scale-102'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                          }`}
                        >
                          <span className="text-2xl">{m.avatar}</span>
                          <div className="text-left min-w-0 flex-1">
                            <div className="text-xs font-black truncate">{m.fullName}</div>
                            <div className="text-[9px] text-slate-500 font-bold">{m.roleTitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PIN Input */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    PIN Keamanan
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="PIN Profil"
                    value={memberPin}
                    onChange={e => setMemberPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral text-center tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>MASUK SEBAGAI ANGGOTA</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Register Link */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Belum punya akun keluarga?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
                sound.playClick();
              }}
              className="text-family-coral font-black hover:underline"
            >
              Daftar Sebagai Kepala Keluarga ✨
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
