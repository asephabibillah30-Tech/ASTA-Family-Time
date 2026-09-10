import React, { useState } from 'react';
import type { FamilyRoleTitle, UserAccount, FamilyAccount } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';
import { 
  Users, ArrowRight, UserCheck, AlertCircle, 
  UserPlus, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface AuthGateScreenProps {
  auth?: any;
  onLoginSuccess: () => void;
}

const AVATARS = ['👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '👨‍🎓', '🧕', '👴', '👵'];

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({ auth, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login_head' | 'login_member' | 'register'>('login_head');
  
  // Head Login State
  const [headUsername, setHeadUsername] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  
  // Member Login State
  const [familyCode, setFamilyCode] = useState('');
  const [foundFamily, setFoundFamily] = useState<FamilyAccount | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserAccount[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPin, setMemberPin] = useState('');

  // Register State
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [headFullName, setHeadFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState<FamilyRoleTitle>('Ayah');
  const [familyName, setFamilyName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('👨‍💼');
  
  // Step 2 Register State
  const [regFamilyCode, setRegFamilyCode] = useState('');
  const [regFamilyId, setRegFamilyId] = useState('');
  const [regHeadId, setRegHeadId] = useState('');
  const [memberFullName, setMemberFullName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRoleTitle>('Ibu');
  const [memberAvatar, setMemberAvatar] = useState('👩‍🍳');
  const [addedMembersList, setAddedMembersList] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState('');
  const pgConfig = postgresService.getConfig();

  // 1. Submit Head Login
  const handleHeadLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!headUsername.trim() || !headPassword.trim()) {
        setErrorMsg('Harap isi username/email dan password.');
        return;
      }
      if (auth?.loginHead) {
        auth.loginHead(headUsername, headPassword);
      } else {
        db.loginHead(headUsername, headPassword);
      }
      sound.playSuccess();
      fireBurstConfetti();
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk.');
      sound.playClick();
    }
  };

  // 2. Search Family Code
  const handleSearchFamily = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const fam = db.getFamilyByCode(familyCode);
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
      setErrorMsg(err.message);
    }
  };

  // 3. Submit Member Login
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!foundFamily || !selectedMemberId) {
        setErrorMsg('Pilih profil anggota keluarga terlebih dahulu.');
        return;
      }
      if (auth?.loginMember) {
        auth.loginMember(foundFamily.familyCode, selectedMemberId, memberPin);
      } else {
        db.loginMemberWithCode(foundFamily.familyCode, selectedMemberId, memberPin);
      }
      sound.playSuccess();
      fireBurstConfetti();
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'PIN anggota salah.');
      sound.playClick();
    }
  };

  // 4. Submit Head Registration
  const handleRegisterHead = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!headFullName.trim() || !familyName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Harap lengkapi semua data pendaftaran kepala keluarga.');
      return;
    }

    try {
      let session;
      if (auth?.registerHead) {
        session = auth.registerHead({
          headFullName,
          roleTitle,
          familyName,
          usernameOrEmail: regUsername,
          password: regPassword,
          pin: '1234',
          avatar: regAvatar,
          color: 'bg-blue-500'
        });
      } else {
        session = db.registerHeadOfFamily({
          headFullName,
          roleTitle,
          familyName,
          usernameOrEmail: regUsername,
          password: regPassword,
          pin: '1234',
          avatar: regAvatar,
          color: 'bg-blue-500'
        });
      }

      setRegFamilyCode(session.family.familyCode);
      setRegFamilyId(session.family.id);
      setRegHeadId(session.user.id);
      setRegStep(2);
      sound.playSuccess();
      fireBurstConfetti();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar.');
    }
  };

  // 5. Add Member in Step 2
  const handleAddMemberStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFullName.trim()) return;

    try {
      db.addMemberByHead(regHeadId, regFamilyId, {
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

  return (
    <div className="min-h-screen bg-family-bg dark:bg-slate-950 flex flex-col justify-between py-6 px-4 font-body antialiased selection:bg-rose-200">
      
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-family-coral to-family-pink flex items-center justify-center text-white text-2xl shadow-md">
            🎴
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
              ASTA Family Time
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              Satu aplikasi, lebih banyak waktu bersama keluarga. ❤️
            </p>
          </div>
        </div>

        {/* PostgreSQL Database Secure Badge (Read-only) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{pgConfig.statusText}</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-lg mx-auto w-full my-auto py-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-6 animate-pop-in">
          
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <span className="text-4xl inline-block animate-bounce">🔐</span>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Silakan Masuk Terlebih Dahulu
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Hubungkan seluruh anggota keluarga dalam satu ruang aman & penuh cinta.
            </p>
          </div>

          {/* 3 Nav Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl gap-1">
            <button
              onClick={() => {
                setActiveTab('login_head');
                setErrorMsg('');
                sound.playClick();
              }}
              className={`py-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'login_head'
                  ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>👑 Kepala</span>
              <span className="text-[9px] font-bold opacity-80">Keluarga</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('login_member');
                setErrorMsg('');
                sound.playClick();
              }}
              className={`py-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'login_member'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>👥 Anggota</span>
              <span className="text-[9px] font-bold opacity-80">Kode Cepat</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                sound.playClick();
              }}
              className={`py-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>✨ Daftar Baru</span>
              <span className="text-[9px] font-bold opacity-80">Keluarga</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN KEPALA KELUARGA */}
          {activeTab === 'login_head' && (
            <form onSubmit={handleHeadLogin} className="space-y-4 animate-pop-in">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Email / Username Kepala Keluarga
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Email atau Username"
                  value={headUsername}
                  onChange={e => setHeadUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
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
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-family-coral"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>MASUK SEBAGAI KEPALA KELUARGA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: LOGIN ANGGOTA CEPAT VIA KODE KELUARGA */}
          {activeTab === 'login_member' && (
            <div className="space-y-4 animate-pop-in">
              {!foundFamily ? (
                <form onSubmit={handleSearchFamily} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Masukkan Kode Keluarga
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: ASTA-2026"
                      value={familyCode}
                      onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-base font-black outline-none focus:border-teal-500 text-center tracking-widest text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                      *Minta kode keluarga dari Kepala Keluarga Anda
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>TEMUKAN PROFIL KELUARGA</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-teal-600 uppercase">Keluarga Ditemukan:</span>
                      <h4 className="font-black text-xs text-slate-900 dark:text-white">{foundFamily.familyName}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFoundFamily(null)}
                      className="text-[10px] text-teal-700 dark:text-teal-300 underline font-bold"
                    >
                      Ganti Kode
                    </button>
                  </div>

                  {/* Member Profiles Grid */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      Pilih Siapa Anda
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
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 shadow-xs scale-102'
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
                      value={memberPin}
                      onChange={e => setMemberPin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none focus:border-teal-500 text-center tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>MASUK SEBAGAI ANGGOTA</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: DAFTAR KEPALA KELUARGA BARU */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-pop-in">
              {regStep === 1 ? (
                <form onSubmit={handleRegisterHead} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Nama Kepala Keluarga *
                      </label>
                      <input
                        type="text"
                        placeholder="misal: Ayah Asep"
                        value={headFullName}
                        onChange={e => setHeadFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Panggilan Peran
                      </label>
                      <select
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Kakek">Kakek</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                      Nama Keluarga (Grup) *
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Keluarga Harmonis ASTA"
                      value={familyName}
                      onChange={e => setFamilyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Email / Username *
                      </label>
                      <input
                        type="text"
                        placeholder="ayah@asta.com"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                      Pilih Avatar Kepala Keluarga
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setRegAvatar(av)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center ${
                            regAvatar === av ? 'bg-family-coral text-white scale-110 shadow-xs' : 'bg-slate-100 dark:bg-slate-700'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>BUAT KELUARGA & LANJUT KE ANGGOTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2 Add Initial Members */
                <div className="space-y-4 animate-pop-in">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border-2 border-emerald-300 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700">Keluarga Berhasil Dibuat!</span>
                    <div className="text-lg font-display font-black text-slate-900 dark:text-white tracking-widest">
                      Kode: <span className="text-family-coral">{regFamilyCode}</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddMemberStep2} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-2.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5 text-family-coral" />
                      <span>Tambahkan Anggota (Ibu / Anak)</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Anggota (Ibu Nia)"
                        value={memberFullName}
                        onChange={e => setMemberFullName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border text-xs font-bold outline-none"
                      />
                      <select
                        value={memberRole}
                        onChange={e => setMemberRole(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-1.5 rounded-xl border text-xs font-bold outline-none"
                      >
                        <option value="Ibu">Ibu</option>
                        <option value="Kakak">Kakak</option>
                        <option value="Adik">Adik</option>
                        <option value="Kakek">Kakek</option>
                        <option value="Nenek">Nenek</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1">
                        {['👩‍🍳', '👦', '👧', '🧕', '👴', '👵'].map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setMemberAvatar(av)}
                            className={`w-7 h-7 rounded-lg text-sm ${
                              memberAvatar === av ? 'bg-family-coral text-white scale-110' : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-xl bg-teal-600 text-white font-black text-xs shadow-xs"
                      >
                        + Tambah
                      </button>
                    </div>
                  </form>

                  {addedMembersList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {addedMembersList.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-rose-50 border text-[11px] font-bold">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SELESAI & MASUK KE APLIKASI</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer Feature Highlights */}
      <div className="max-w-3xl mx-auto w-full text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1">🎴 350 Kartu ASTA</span> &bull;
          <span className="flex items-center gap-1">🃏 Game UNO</span> &bull;
          <span className="flex items-center gap-1">🎲 Game Ludo</span> &bull;
          <span className="flex items-center gap-1">💬 Obrolan Jarak Jauh</span> &bull;
          <span className="flex items-center gap-1">📅 Family Planner</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Dilindungi dengan enkripsi keamanan tingkat tinggi terisolasi per keluarga.
        </p>
      </div>

    </div>
  );
};
