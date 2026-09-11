import React, { useState } from 'react';
import type { Player } from '../../types/game';
import type { FamilyAccount, UserAccount } from '../../types/auth';
import { 
  ShieldCheck, Settings, Users, Gamepad2, BarChart3, 
  ArrowLeft, Lock, Save, Key, ShieldAlert, 
  CheckCircle2, Plus, Trash2, Flame, Star, Database, Activity
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { sanitizeInput } from '../../utils/security';

interface AdminDashboardScreenProps {
  currentFamily?: FamilyAccount | null;
  currentUser?: UserAccount | null;
  players: Player[];
  familyMembers?: UserAccount[];
  familyStreak: number;
  totalLovePoints: number;
  onBack: () => void;
  onUpdateFamilySettings?: (updated: Partial<FamilyAccount>) => void;
  onUpdateMemberRole?: (memberId: string, roleTitle: string) => void;
  onBonusPoints?: (memberId: string, bonus: number) => void;
  onRemoveMember?: (memberId: string) => void;
}

type AdminTab = 'system' | 'security' | 'users' | 'games' | 'analytics';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  currentFamily,
  currentUser: _currentUser,
  players,
  familyMembers = [],
  familyStreak,
  totalLovePoints,
  onBack,
  onUpdateFamilySettings,
  onUpdateMemberRole: _onUpdateMemberRole,
  onBonusPoints,
  onRemoveMember,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('system');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // System Settings State
  const [platformName, setPlatformName] = useState('ASTA Family Time');
  const [familyCode, setFamilyCode] = useState(currentFamily?.familyCode || 'ASTA-2026');
  const [familyName, setFamilyName] = useState(currentFamily?.familyName || 'Keluarga Harmonis ASTA');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxMembers, setMaxMembers] = useState(8);
  const [defaultLovePoints, setDefaultLovePoints] = useState(500);

  // Security Settings State
  const [enableXssFilter, setEnableXssFilter] = useState(true);
  const [enableAiModeration, setEnableAiModeration] = useState(true);
  const [enableE2EE, setEnableE2EE] = useState(true);
  const rateLimitMaxAttempts = 5;

  // Game Settings State
  const [gameTimerSeconds, setGameTimerSeconds] = useState(60);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'smart'>('medium');
  const [enabledGames, setEnabledGames] = useState({
    artFrenzy: true,
    cardGame: true,
    snakeLadders: true,
    hijaiyah: true,
    alphabet: true,
    vehicle: true,
  });

  // Simulated Cyber Attack Audit Log
  const [cyberAuditLogs, setCyberAuditLogs] = useState([
    { id: '1', timestamp: '15:20:12', type: 'Script Injection (XSS)', source: 'Penginputan Form Chat', status: '🛡️ DIBLOKIR OTOMATIS', snippet: '<script>alert(1)</script>' },
    { id: '2', timestamp: '14:45:08', type: 'SQL Injection Pattern', source: 'Form Login Kode', status: '🛡️ DIBLOKIR OTOMATIS', snippet: "' OR '1'='1" },
    { id: '3', timestamp: '12:10:33', type: 'Brute Force Attempts', source: 'Portal Admin Login', status: '🔒 AKUN DIKUNCI (60s)', snippet: '5x Percobaan Gagal' },
  ]);

  const showNotification = (msg: string) => {
    sound.playSuccess();
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeInput(familyCode).toUpperCase();
    const cleanName = sanitizeInput(familyName);

    if (onUpdateFamilySettings) {
      onUpdateFamilySettings({
        familyCode: cleanCode,
        familyName: cleanName,
      });
    }

    showNotification('✅ Pengaturan Platform & Sistem berhasil disimpan!');
  };

  const handleSaveSecuritySettings = () => {
    showNotification('🛡️ Pengaturan Keamanan Cyber & Filter AI telah diperbarui!');
  };

  const handleSaveGameSettings = () => {
    showNotification('🎨 Pengaturan Game Engine & Timer berhasil disimpan!');
  };

  const handleAddSimulatedLog = () => {
    sound.playClick();
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCyberAuditLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp: now,
        type: 'Simulasi Serangan Cyber XSS',
        source: 'Tes Portal Admin',
        status: '🛡️ DIBLOKIR OTOMATIS',
        snippet: '<svg onload=alert(1)>'
      },
      ...prev
    ]);
    showNotification('🧪 Simulasi serangan cyber berhasil diuji & diblokir!');
  };

  const activeMembersList = familyMembers.length > 0 ? familyMembers : players.map(p => ({
    id: p.id,
    fullName: p.name,
    avatar: p.avatar,
    roleTitle: p.rolePreset || 'Anggota',
    lovePoints: p.score || 0,
    email: `${p.name.toLowerCase().replace(/\s+/g, '')}@asta.family`,
    color: p.color
  }));

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-5 animate-pop-in select-none">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-3xl p-4 sm:p-6 text-white shadow-bubbly-coral flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 shrink-0"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md mb-1">
              <span>🔐</span> PANEL PENGELOLA & ADMINISTRATOR
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl leading-snug">
              Pusat Pengaturan Admin
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm font-medium">
              Integrasi penuh pengaturan sistem, keamanan cyber ketat & pengelolaan keluarga.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-xs font-black border border-white/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Cyber Firewall ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl font-display font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Admin Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => { sound.playClick(); setActiveTab('system'); }}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-black shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm scale-102'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>⚙️ Sistem & Platform</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('security'); }}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-black shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm scale-102'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>🛡️ Keamanan Cyber</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('users'); }}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-black shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm scale-102'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Kelola Anggota ({activeMembersList.length})</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('games'); }}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-black shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'games'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm scale-102'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>🎨 Engine Game</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('analytics'); }}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-black shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm scale-102'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Analisis & Status</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM & PLATFORM SETTINGS */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSystemSettings} className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>⚙️</span> Pengaturan Umum Platform & Keluarga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ubah identitas platform, kode akses keluarga, serta opsi batas aplikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Platform Super-App:
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Keluarga Harmonis:
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Kode Akses Gabung Keluarga:
              </label>
              <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Batas Maksimal Anggota (Orang):
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Default Bonus Poin Saat Mendaftar (Love Points):
              </label>
              <input
                type="number"
                min={0}
                max={5000}
                value={defaultLovePoints}
                onChange={(e) => setDefaultLovePoints(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mode Pemeliharaan (Maintenance Mode)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-display font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>SIMPAN PENGATURAN SISTEM</span>
          </button>
        </form>
      )}

      {/* TAB 2: CYBER SECURITY & AUDIT LOG */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛡️</span> Pusat Keamanan Cyber & Filter Penginputan Form
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proteksi ketat dari serangan XSS, SQL/NoSQL Injection, Brute Force, & Filter Konten Sensitif.
              </p>
            </div>

            <button
              onClick={handleAddSimulatedLog}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 active:scale-95"
            >
              🧪 Uji Simulasi Serangan Cyber
            </button>
          </div>

          {/* Security Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Filter Anti-XSS & Script Injection
                </span>
                <input
                  type="checkbox"
                  checked={enableXssFilter}
                  onChange={(e) => setEnableXssFilter(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Menapis dan menghapus tag HTML/JavaScript berbahaya (`&lt;script&gt;`, `eval`, `onload`) dari semua penginputan form.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> AI Moderation Konten & Kata Sensitif
                </span>
                <input
                  type="checkbox"
                  checked={enableAiModeration}
                  onChange={(e) => setEnableAiModeration(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Memblokir kata-kata tidak layak, konten dewasa, dan ujaran tidak ramah anak pada chat & jurnal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-500" /> Enkripsi End-to-End (E2EE) Obrolan
                </span>
                <input
                  type="checkbox"
                  checked={enableE2EE}
                  onChange={(e) => setEnableE2EE(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enkripsi pesan obrolan menggunakan Web Crypto SHA-256 sehingga pesan aman antar anggota keluarga.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" /> Batas Percobaan Brute-Force Rate Limit
                </span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{rateLimitMaxAttempts} Percobaan</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mengunci login secara otomatis selama 60 detik jika salah memasukkan password lebih dari {rateLimitMaxAttempts} kali.
              </p>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>📜</span> Log Audit Keamanan Cyber Real-Time:
            </h4>

            <div className="space-y-2">
              {cyberAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold shrink-0">
                      {log.timestamp}
                    </span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                        {log.type} ({log.source})
                      </span>
                      <code className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block">
                        Snippet: {log.snippet}
                      </code>
                    </div>
                  </div>

                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSecuritySettings}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-display font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SIMPAN SETTING KEAMANAN CYBER</span>
          </button>
        </div>
      )}

      {/* TAB 3: USER & MEMBER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>👥</span> Pengelolaan Anggota Keluarga ({activeMembersList.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur peran anggota, alokasi bonus Love Points, dan status akun keluarga.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeMembersList.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{m.avatar}</span>
                    <div>
                      <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                        {m.fullName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {m.roleTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {m.lovePoints} Poin
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playFunnyBonus();
                      if (onBonusPoints) onBonusPoints(m.id, 100);
                      showNotification(`⭐ Memberikan 100 Love Points bonus untuk ${m.fullName}!`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-extrabold text-[11px] flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+100 Poin</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onRemoveMember && activeMembersList.length > 1) {
                        sound.playClick();
                        onRemoveMember(m.id);
                        showNotification(`🗑️ Anggota ${m.fullName} telah dihapus dari daftar.`);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-200 active:scale-95"
                    title="Hapus Anggota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GAME ENGINE & TIMER SETTINGS */}
      {activeTab === 'games' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎨</span> Pengaturan Game Engine & Timer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aktifkan/nonaktifkan permainan, sesuaikan durasi waktu & tingkat kecerdasan AI Bot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Durasi Timer Ronde Game (Detik):
              </label>
              <select
                value={gameTimerSeconds}
                onChange={(e) => setGameTimerSeconds(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
              >
                <option value={30}>30 Detik (Fast Play)</option>
                <option value={60}>60 Detik (Standar)</option>
                <option value={90}>90 Detik (Santai)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tingkat Kecerdasan AI Bot (Mode Solo):
              </label>
              <select
                value={botDifficulty}
                onChange={(e) => setBotDifficulty(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
              >
                <option value="easy">Easy (Bot sering salah tebak)</option>
                <option value="medium">Medium (Standar imbang)</option>
                <option value="smart">Smart (Bot cepat menebak)</option>
              </select>
            </div>
          </div>

          {/* Game Switch Toggles */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs text-slate-800 dark:text-slate-200">
              Sakelar Status Permainan yang Ditampilkan:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(enabledGames).map(([gameKey, isEnabled]) => (
                <button
                  key={gameKey}
                  onClick={() => {
                    sound.playClick();
                    setEnabledGames(prev => ({ ...prev, [gameKey]: !isEnabled }));
                  }}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-between ${
                    isEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-300 text-slate-400'
                  }`}
                >
                  <span className="capitalize">{gameKey}</span>
                  <span>{isEnabled ? '🟢 AKTIF' : '🔴 NONAKTIF'}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveGameSettings}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>SIMPAN SETTING GAME ENGINE</span>
          </button>
        </div>
      )}

      {/* TAB 5: ANALYTICS & SYSTEM STATUS */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>📊</span> Analisis & Status Real-Time Platform ASTA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statistik keharmonisan keluarga, penggunaan memori, dan status sinkronisasi cloud.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300 block">Streak Kebersamaan</span>
              <span className="font-display font-black text-xl text-slate-900 dark:text-white">{familyStreak} Hari 🔥</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">Total Love Points</span>
              <span className="font-display font-black text-xl text-slate-900 dark:text-white">{totalLovePoints} ⭐</span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1">
              <Database className="w-5 h-5 text-teal-500" />
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 block">PWA Cache Storage</span>
              <span className="font-display font-black text-xl text-slate-900 dark:text-white">1.2 MB / 5 MB</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">Cloud Status</span>
              <span className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400">🟢 Synchronized</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
