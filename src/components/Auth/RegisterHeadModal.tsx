import React, { useState } from 'react';
import type { FamilyRoleTitle } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import { X, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface RegisterHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
  onOpenLogin: () => void;
}

const AVATAR_OPTIONS = ['👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '🧕', '👳‍♂️', '👑'];

export const RegisterHeadModal: React.FC<RegisterHeadModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Register Head, 2: Add Initial Members
  
  // Head Form State
  const [headFullName, setHeadFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState<FamilyRoleTitle>('Ayah');
  const [familyName, setFamilyName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const pin = '1234';
  const [avatar, setAvatar] = useState('👨‍💼');
  const color = 'bg-blue-500';

  // After Registered Session
  const [registeredFamilyCode, setRegisteredFamilyCode] = useState('');
  const [registeredFamilyId, setRegisteredFamilyId] = useState('');
  const [registeredHeadId, setRegisteredHeadId] = useState('');

  // Initial Member Quick Add (Step 2)
  const [memberFullName, setMemberFullName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRoleTitle>('Ibu');
  const [memberAvatar, setMemberAvatar] = useState('👩‍🍳');
  const [addedMembersList, setAddedMembersList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegisterHead = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!headFullName.trim() || !familyName.trim() || !usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Harap lengkapi semua data pendaftaran kepala keluarga.');
      return;
    }

    try {
      const session = db.registerHeadOfFamily({
        headFullName,
        roleTitle,
        familyName,
        usernameOrEmail,
        password,
        pin: pin || '1234',
        avatar,
        color
      });

      setRegisteredFamilyCode(session.family.familyCode);
      setRegisteredFamilyId(session.family.id);
      setRegisteredHeadId(session.user.id);
      setStep(2);
      sound.playSuccess();
      fireBurstConfetti();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar.');
    }
  };

  const handleAddMemberStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFullName.trim()) return;

    try {
      db.addMemberByHead(registeredHeadId, registeredFamilyId, {
        fullName: memberFullName.trim(),
        roleTitle: memberRole,
        pin: '1234',
        avatar: memberAvatar,
        color: 'bg-rose-500'
      });

      setAddedMembersList(prev => [...prev, `${memberAvatar} ${memberFullName} (${memberRole})`]);
      setMemberFullName('');
      sound.playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleFinishAll = () => {
    onRegisterSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-5 border-2 border-rose-100 dark:border-slate-700 shadow-bubbly-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                Pendaftaran Kepala Keluarga
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                {step === 1 ? 'Langkah 1: Buat Akun Kepala Keluarga & Kode Keluarga' : 'Langkah 2: Tambahkan Anggota Keluarga Pertama'}
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

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: Head of Family Form */
          <form onSubmit={handleRegisterHead} className="space-y-3.5">
            
            {/* Nama Lengkap & Peran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Nama Kepala Keluarga *
                </label>
                <input
                  type="text"
                  placeholder="misal: Ayah Asep"
                  value={headFullName}
                  onChange={e => setHeadFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Panggilan Peran
                </label>
                <select
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value as FamilyRoleTitle)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
                >
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Kakek">Kakek</option>
                </select>
              </div>
            </div>

            {/* Nama Keluarga */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                Nama Keluarga (Grup Keluarga) *
              </label>
              <input
                type="text"
                placeholder="misal: Keluarga Bahagia ASTA"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            {/* Email/Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Email / Username *
                </label>
                <input
                  type="text"
                  placeholder="misal: nama@email.com"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Password Login *
                </label>
                <input
                  type="password"
                  placeholder="Buat password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
                />
              </div>
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Pilih Avatar Kepala Keluarga
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all shrink-0 ${
                      avatar === av
                        ? 'bg-family-coral text-white scale-110 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>BUAT KELUARGA & LANJUT KE ANGGOTA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: Add Initial Family Members */
          <div className="space-y-4 animate-pop-in">
            
            {/* Success Family Code Banner */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                🎉 Keluarga Berhasil Dibuat!
              </span>
              <div className="text-xl font-display font-black text-slate-900 dark:text-white tracking-widest">
                Kode Keluarga: <span className="text-family-coral">{registeredFamilyCode}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Bagikan kode ini kepada seluruh anggota keluarga untuk masuk dengan mudah.
              </p>
            </div>

            {/* Form Tambah Anggota */}
            <form onSubmit={handleAddMemberStep2} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-display font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-family-coral" />
                <span>Tambahkan Anggota (Ibu / Anak / Lainnya)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Nama Anggota (mis: Ibu Nia)"
                    value={memberFullName}
                    onChange={e => setMemberFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <select
                    value={memberRole}
                    onChange={e => {
                      const r = e.target.value as FamilyRoleTitle;
                      setMemberRole(r);
                      if (r === 'Ibu') setMemberAvatar('👩‍🍳');
                      else if (r === 'Kakak') setMemberAvatar('👦');
                      else if (r === 'Adik') setMemberAvatar('👧');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                  >
                    <option value="Ibu">Ibu</option>
                    <option value="Kakak">Kakak</option>
                    <option value="Adik">Adik</option>
                    <option value="Kakek">Kakek</option>
                    <option value="Nenek">Nenek</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {['👩‍🍳', '👦', '👧', '👨‍🎓', '🧕', '👴', '👵'].map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setMemberAvatar(av)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center ${
                        memberAvatar === av ? 'bg-family-coral text-white scale-110 shadow-xs' : 'bg-white dark:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs"
                >
                  + Tambah
                </button>
              </div>
            </form>

            {/* List of Added Members */}
            {addedMembersList.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500">Anggota yang Ditambahkan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {addedMembersList.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-slate-800 dark:text-slate-100 text-xs font-bold">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Finish Button */}
            <button
              type="button"
              onClick={handleFinishAll}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SELESAI & MASUK KE DASHBOARD KELUARGA</span>
            </button>

          </div>
        )}

        {/* Footer Login Link */}
        {step === 1 && (
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah punya akun keluarga?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                  sound.playClick();
                }}
                className="text-family-coral font-black hover:underline"
              >
                Masuk di Sini 🔐
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
