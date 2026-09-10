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
  const [isSearching, setIsSearching] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const pgConfig = postgresService.getConfig();

  // 1. Submit Head Login
  const handleHeadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!headUsername.trim() || !headPassword.trim()) {
        setErrorMsg('Harap isi email/username dan password.');
        return;
      }
      if (auth?.loginHead) {
        await auth.loginHead(headUsername, headPassword);
      } else {
        await db.loginHeadAsync(headUsername, headPassword);
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
  const handleSearchFamily = async (e: React.FormEvent) => {
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
    <div className="min-h-dvh bg-family-bg dark:bg-slate-950 flex flex-col justify-between p-3 sm:p-6 lg:p-8 font-body antialiased selection:bg-rose-200">
      
      {/* Top Mobile & Desktop Header */}
      <header className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto flex items-center justify-between gap-2 pt-1 sm:pt-2 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-family-coral to-family-pink flex items-center justify-center text-white text-2xl shadow-md shrink-0">
            🎴
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
              ASTA Family Time
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold truncate max-w-[200px] sm:max-w-none">
              Satu aplikasi, lebih banyak waktu bersama. ❤️
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black shrink-0 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">{pgConfig.statusText}</span>
          <span className="sm:hidden">Cloud Active</span>
        </div>
      </header>

      {/* Main Responsive Layout: Dual Column on Desktop, Centered Column on Mobile & Tablet */}
      <main className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto my-auto py-2 sm:py-4 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
        
        {/* Desktop Left Hero Panel (Hidden on mobile/tablet, visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col space-y-6 text-left p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-black w-fit">
            <span>✨</span> Super-App Keluarga Indonesia
          </div>

          <h2 className="font-display font-black text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight">
            Hubungkan Senyum & Tawa Keluarga Setiap Hari ❤️
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Nikmati 350+ kartu interaktif, game UNO, Ludo, Ular Tangga, Obrolan privat terenkripsi, Jurnal Kenangan, dan Perencana Kegiatan Keluarga dalam 1 aplikasi.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-2xs">
              <span className="text-2xl mb-1 block">🔐</span>
              <h4 className="font-black text-xs text-slate-900 dark:text-white">Privat & Aman</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Enkripsi E2EE per keluarga</p>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-2xs">
              <span className="text-2xl mb-1 block">☁️</span>
              <h4 className="font-black text-xs text-slate-900 dark:text-white">Real-time Cloud</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Sinkron lintas HP & Laptop</p>
            </div>
          </div>
        </div>

        {/* Right Form Card (Single column on mobile, right 7 cols on desktop) */}
        <div className="lg:col-span-7">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 border-3 border-rose-200 dark:border-slate-700 shadow-bubbly-coral space-y-5 animate-pop-in">
            
            {/* Header Title */}
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl inline-block animate-bounce">🔐</span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                Ruang Masuk Keluarga
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs mx-auto">
                Hubungkan seluruh anggota keluarga dalam ruang privat yang aman.
              </p>
            </div>

          {/* 3 Nav Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-700/80 rounded-2xl gap-1">
            <button
              onClick={() => {
                setActiveTab('login_head');
                setErrorMsg('');
                sound.playClick();
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeTab === 'login_head'
                  ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeTab === 'login_member'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>✨ Daftar Baru</span>
              <span className="text-[9px] font-bold opacity-80">Keluarga</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN KEPALA KELUARGA */}
          {activeTab === 'login_head' && (
            <form onSubmit={handleHeadLogin} className="space-y-4 animate-pop-in">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email / Username Kepala Keluarga
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Email atau Username"
                  value={headUsername}
                  onChange={e => setHeadUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-family-coral focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password / PIN Keamanan
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password atau PIN"
                  value={headPassword}
                  onChange={e => setHeadPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold outline-none focus:border-family-coral focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-2xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
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
                  <div className="space-y-1 text-center">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Masukkan Kode Keluarga
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: ASTA-2026"
                      value={familyCode}
                      onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-base sm:text-lg font-black outline-none focus:border-teal-500 text-center tracking-widest text-slate-900 dark:text-white transition-all shadow-2xs uppercase"
                    />
                    <p className="text-[10px] text-slate-400 font-bold">
                      *Minta kode unik keluarga dari Kepala Keluarga Anda
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{isSearching ? 'MENCARI KODE KELUARGA...' : 'TEMUKAN PROFIL KELUARGA'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div className="p-3.5 bg-teal-50 dark:bg-teal-950/70 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">Keluarga Ditemukan:</span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">{foundFamily.familyName}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFoundFamily(null)}
                      className="text-[10px] text-teal-700 dark:text-teal-300 underline font-bold px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xs"
                    >
                      Ganti Kode
                    </button>
                  </div>

                  {/* Member Profiles Grid */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Pilih Profil Anda:
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
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
                            className={`p-2.5 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/80 shadow-xs scale-102'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-2xl shrink-0">{m.avatar}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black truncate text-slate-900 dark:text-white">{m.fullName}</div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">{m.roleTitle}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PIN Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                      Masukkan PIN Keamanan (4-6 Digit)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••"
                      value={memberPin}
                      onChange={e => setMemberPin(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm sm:text-base font-bold outline-none focus:border-teal-500 text-center tracking-widest text-slate-900 dark:text-white shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
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
                <form onSubmit={handleRegisterHead} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Nama Kepala Keluarga *
                      </label>
                      <input
                        type="text"
                        placeholder="misal: Ayah Asep"
                        value={headFullName}
                        onChange={e => setHeadFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Panggilan Peran
                      </label>
                      <select
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Kakek">Kakek</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Nama Keluarga (Grup) *
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Keluarga Harmonis ASTA"
                      value={familyName}
                      onChange={e => setFamilyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Email / Username *
                      </label>
                      <input
                        type="text"
                        placeholder="ayah@asta.com"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Password *
                      </label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Pilih Avatar Kepala Keluarga
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setRegAvatar(av)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-transform shrink-0 ${
                            regAvatar === av ? 'bg-amber-500 text-white scale-110 shadow-xs' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>BUAT KELUARGA & LANJUT KE ANGGOTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2 Add Initial Members */
                <div className="space-y-4 animate-pop-in">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">Keluarga Berhasil Dibuat!</span>
                    <div className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-widest">
                      Kode: <span className="text-family-coral">{regFamilyCode}</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddMemberStep2} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5 text-family-coral" />
                      <span>Tambahkan Anggota (Ibu / Anak)</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Anggota (Ibu Nia)"
                        value={memberFullName}
                        onChange={e => setMemberFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <select
                        value={memberRole}
                        onChange={e => setMemberRole(e.target.value as FamilyRoleTitle)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Ibu">Ibu</option>
                        <option value="Kakak">Kakak</option>
                        <option value="Adik">Adik</option>
                        <option value="Kakek">Kakek</option>
                        <option value="Nenek">Nenek</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1 overflow-x-auto">
                        {['👩‍🍳', '👦', '👧', '🧕', '👴', '👵'].map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setMemberAvatar(av)}
                            className={`w-7 h-7 rounded-lg text-sm shrink-0 ${
                              memberAvatar === av ? 'bg-family-coral text-white scale-110' : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-black text-xs shadow-xs shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>
                  </form>

                  {addedMembersList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {addedMembersList.map((m, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border text-[11px] font-bold text-slate-800 dark:text-slate-200">
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
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
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
    </main>

      {/* Footer Feature Highlights */}
      <footer className="w-full max-w-md sm:max-w-xl lg:max-w-6xl mx-auto text-center space-y-1.5 pb-2 pt-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1">🎴 350 Kartu ASTA</span> &bull;
          <span className="flex items-center gap-1">🃏 Game UNO</span> &bull;
          <span className="flex items-center gap-1">🎲 Game Ludo</span> &bull;
          <span className="flex items-center gap-1">💬 Obrolan E2EE</span> &bull;
          <span className="flex items-center gap-1">📅 Family Planner</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Dilindungi dengan enkripsi keamanan tingkat tinggi terisolasi per keluarga.
        </p>
      </footer>

    </div>
  );
};
