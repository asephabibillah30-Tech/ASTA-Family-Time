import React, { useState } from 'react';
import type { UserAccount, FamilyAccount, FamilyRoleTitle } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import { X, UserPlus, Trash2, Copy, Check, KeyRound } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireSmallPop } from '../../utils/confetti';

interface ManageFamilyModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentFamily: FamilyAccount;
  familyMembers: UserAccount[];
  onClose: () => void;
  onRefresh: () => void;
  onAddMember?: (dto: any) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const ManageFamilyModal: React.FC<ManageFamilyModalProps> = ({
  isOpen,
  currentUser,
  currentFamily,
  familyMembers,
  onClose,
  onRefresh,
  onAddMember,
  onDeleteMember,
}) => {
  const [copied, setCopied] = useState(false);
  
  // Add Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<FamilyRoleTitle>('Kakak');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👦');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Member PIN Edit State
  const [editingPinMemberId, setEditingPinMemberId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFamily.familyCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://asta-family-time.vercel.app';
    const message = `✨ *ASTA Family Time - Platform & Super-App Game Keluarga Indonesia*\n\n` +
      `"ASTA - Aktivitas • Senyum • Tawa • Apresiasi - Satu aplikasi, lebih banyak waktu bersama Keluarga." ❤️\n\n` +
      `👨‍👩‍👧‍👦 *Keluarga:* ${currentFamily.familyName}\n` +
      `🔑 *Kode Keluarga:* ${currentFamily.familyCode}\n\n` +
      `Yuk bergabung dan main bareng sekarang di link berikut:\n` +
      `👉 ${shareUrl}/`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newMemberName.trim()) {
      setErrorMsg('Harap isi nama anggota keluarga.');
      return;
    }

    try {
      if (onAddMember) {
        onAddMember({
          fullName: newMemberName.trim(),
          roleTitle: newMemberRole,
          pin: '1234',
          avatar: newMemberAvatar,
          color: 'bg-amber-500'
        });
      } else {
        db.addMemberByHead(currentUser.id, currentFamily.id, {
          fullName: newMemberName.trim(),
          roleTitle: newMemberRole,
          pin: '1234',
          avatar: newMemberAvatar,
          color: 'bg-amber-500'
        });
      }

      setNewMemberName('');
      onRefresh();
      sound.playSuccess();
      fireSmallPop(0.5, 0.4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan anggota.');
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota keluarga ini?')) return;
    try {
      if (onDeleteMember) {
        onDeleteMember(memberId);
      } else {
        db.deleteMemberByHead(currentUser.id, memberId);
      }
      onRefresh();
      sound.playClick();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveMemberPin = (targetMember: UserAccount) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!newPinValue.trim() || newPinValue.trim().length < 4) {
      setErrorMsg('PIN baru minimal 4 digit.');
      return;
    }

    try {
      db.updateMemberPinByHead(currentUser.id, targetMember.id, newPinValue.trim());
      setSuccessMsg(`PIN baru untuk ${targetMember.fullName} berhasil disimpan! 🔒`);
      setEditingPinMemberId(null);
      setNewPinValue('');
      onRefresh();
      sound.playSuccess();
      fireSmallPop(0.5, 0.4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah PIN anggota.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-5 border-2 border-rose-100 dark:border-slate-700 shadow-bubbly-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                Kelola Anggota Keluarga
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                Khusus Hak Akses Kepala Keluarga 👑
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

        {/* Family Code Card */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-[10px] font-black uppercase text-family-coral">Kode Unik Keluarga:</span>
            <div className="font-display font-black text-base text-slate-900 dark:text-white tracking-widest">
              {currentFamily.familyCode}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 text-family-coral text-xs font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95"
              title="Kirim Undangan ke WhatsApp"
            >
              <span>💬 Bagikan ke WA</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Add Member Form (Only Head) */}
        {currentUser.isHead ? (
          <form onSubmit={handleAddMember} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-display font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-family-coral" />
              <span>Tambah Anggota Baru</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
              <select
                value={newMemberRole}
                onChange={e => {
                  const r = e.target.value as FamilyRoleTitle;
                  setNewMemberRole(r);
                  if (r === 'Ibu') setNewMemberAvatar('👩‍🍳');
                  else if (r === 'Kakak') setNewMemberAvatar('👦');
                  else if (r === 'Adik') setNewMemberAvatar('👧');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="Ibu">Ibu</option>
                <option value="Kakak">Kakak</option>
                <option value="Adik">Adik</option>
                <option value="Kakek">Kakek</option>
                <option value="Nenek">Nenek</option>
                <option value="Paman">Paman</option>
                <option value="Bibi">Bibi</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['👨‍💼', '👩‍🍳', '👦', '👧', '🧕', '👴', '👵'].map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setNewMemberAvatar(av)}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center ${
                      newMemberAvatar === av ? 'bg-family-coral text-white scale-110 shadow-xs' : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-family-coral text-white font-black text-xs shadow-xs hover:bg-rose-600 transition-all"
              >
                + Tambah
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs text-slate-500 font-medium">
            🔒 Hanya Kepala Keluarga yang dapat menambah atau menghapus anggota.
          </div>
        )}

        {/* Existing Members List */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
            Daftar Anggota Keluarga ({familyMembers.length} Orang)
          </label>
          <div className="space-y-2">
            {familyMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-xs text-slate-900 dark:text-white">
                          {m.fullName}
                        </span>
                        {m.isHead && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[8px] font-black rounded-md">
                            👑 Kepala Keluarga
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{m.roleTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Change/Reset PIN Button for Member */}
                    {currentUser.isHead && (
                      <button
                        onClick={() => {
                          setErrorMsg('');
                          setSuccessMsg('');
                          if (editingPinMemberId === m.id) {
                            setEditingPinMemberId(null);
                          } else {
                            setEditingPinMemberId(m.id);
                            setNewPinValue('');
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Atur PIN Anggota Ini"
                      >
                        <KeyRound className="w-3 h-3 text-amber-500" />
                        <span>Ganti PIN</span>
                      </button>
                    )}

                    {currentUser.isHead && !m.isHead && (
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline PIN Editor Form */}
                {editingPinMemberId === m.id && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-pop-in">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      Set PIN Baru untuk <strong>{m.fullName}</strong>:
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="PIN Baru (4-6 Digit)"
                        value={newPinValue}
                        onChange={e => setNewPinValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold outline-none"
                      />
                      <button
                        onClick={() => handleSaveMemberPin(m)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingPinMemberId(null)}
                        className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
