import React, { useState } from 'react';
import type { UserAccount, FamilyAccount } from '../../types/auth';
import { db } from '../../services/db/databaseService';
import type { SecurityAuditLog } from '../../services/db/databaseService';
import { postgresService } from '../../services/db/postgresService';
import { X, ShieldCheck, KeyRound, Lock, History, AlertTriangle, CheckCircle } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireSmallPop } from '../../utils/confetti';

interface SecurityCenterModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentFamily: FamilyAccount;
  onClose: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  currentUser,
  currentFamily,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'logs'>('password');
  
  // Password / PIN Form State
  const [oldSecret, setOldSecret] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logs, setLogs] = useState<SecurityAuditLog[]>(() => db.getSecurityLogs(currentFamily?.id));

  if (!isOpen) return null;

  const handleChangeSecret = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldSecret.trim() || !newSecret.trim()) {
      setMessage({ type: 'error', text: 'Harap isi semua kolom.' });
      return;
    }

    if (newSecret !== confirmSecret) {
      setMessage({ type: 'error', text: 'Konfirmasi tidak cocok.' });
      return;
    }

    if (newSecret.length < 4) {
      setMessage({ type: 'error', text: 'Minimal 4 karakter/angka.' });
      return;
    }

    try {
      if (currentUser.isHead) {
        db.changePassword(currentUser.id, oldSecret, newSecret);
      } else {
        db.changePin(currentUser.id, oldSecret, newSecret);
      }

      setMessage({ type: 'success', text: currentUser.isHead ? 'Password berhasil diperbarui! 🔒' : 'PIN berhasil diperbarui! 🔒' });
      setOldSecret('');
      setNewSecret('');
      setConfirmSecret('');
      setLogs(db.getSecurityLogs(currentFamily?.id));
      sound.playSuccess();
      fireSmallPop(0.5, 0.4);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah.' });
      sound.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-5 border-2 border-rose-100 dark:border-slate-700 shadow-bubbly-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                Pusat Keamanan Keluarga
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                Enkripsi SHA-256 & Proteksi Berlapis Aktif
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

        {/* Security Status Badge */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                {postgresService.getConfig().statusText}
              </span>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {postgresService.isCloudConnected() 
                  ? 'Terhubung langsung dengan Supabase Cloud PostgreSQL' 
                  : 'Sistem menggunakan enkripsi lokal terenkripsi'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl gap-1">
          <button
            onClick={() => {
              setActiveTab('password');
              setMessage(null);
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{currentUser.isHead ? 'Ganti Password' : 'Ganti PIN'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              setLogs(db.getSecurityLogs(currentFamily?.id));
              setMessage(null);
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-slate-800 text-family-coral dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Keamanan</span>
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB 1: GANTI PASSWORD / PIN */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangeSecret} className="space-y-3.5 animate-pop-in">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {currentUser.isHead ? 'Password Lama (Default Demo: 123)' : 'PIN Lama (Default Demo: 1234)'}
              </label>
              <input
                type="password"
                value={oldSecret}
                onChange={e => setOldSecret(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {currentUser.isHead ? 'Password Baru' : 'PIN Baru (4-6 Digit)'}
              </label>
              <input
                type="password"
                value={newSecret}
                onChange={e => setNewSecret(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Konfirmasi {currentUser.isHead ? 'Password Baru' : 'PIN Baru'}
              </label>
              <input
                type="password"
                value={confirmSecret}
                onChange={e => setConfirmSecret(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-family-coral"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>SIMPAN KEAMANAN BARU</span>
            </button>
          </form>
        )}



        {/* TAB 3: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-2 animate-pop-in max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada riwayat aktivitas keamanan.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      log.status === 'FAILED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-bold text-[11px] leading-snug">
                    {log.details}
                  </p>
                  <div className="text-[9px] text-slate-400 font-medium">
                    Oleh: {log.userName}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

