import React, { useState } from 'react';
import { postgresService } from '../../services/db/postgresService';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, Shield, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const currentConfig = postgresService.getConfig();
  const [url, setUrl] = useState(currentConfig.supabaseUrl || '');
  const [anonKey, setAnonKey] = useState(currentConfig.supabaseAnonKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusResult(null);

    try {
      const res = await postgresService.testConnection(url, anonKey);
      if (res.success) {
        postgresService.updateCredentials(url, anonKey);
        setStatusResult({
          success: true,
          message: 'Terkoneksi ke PostgreSQL Supabase! (Latensi: ' + res.latencyMs + 'ms)'
        });
        sound.playSuccess();
        fireBurstConfetti();
        if (onConnected) onConnected();
      } else {
        setStatusResult({
          success: false,
          message: res.message
        });
        sound.playClick();
      }
    } catch (err: any) {
      setStatusResult({
        success: false,
        message: err.message || 'Gagal menghubungi server Supabase.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    postgresService.updateCredentials('', '');
    setUrl('');
    setAnonKey('');
    setStatusResult({
      success: true,
      message: 'Koneksi Supabase dinonaktifkan. Mode lokal PostgreSQL aktif.'
    });
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-100 dark:border-slate-800 shadow-bubbly-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl">
                Koneksi Database Supabase
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                Integrasikan ASTA Family Time langsung dengan PostgreSQL di Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Status Badge Banner */}
          <div className={'p-3.5 rounded-2xl border flex items-center gap-3 ' + (
            postgresService.isCloudConnected()
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          )}>
            {postgresService.isCloudConnected() ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Shield className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="font-black">
                {postgresService.isCloudConnected() 
                  ? 'Cloud Database Supabase: Terhubung Aktif 🟢' 
                  : 'Mode Standby: Local PostgreSQL Storage Aktif 🟡'}
              </div>
              <div className="text-[11px] opacity-80">
                {postgresService.isCloudConnected()
                  ? 'Semua data keluarga tersinkronisasi langsung ke cloud PostgreSQL Supabase.'
                  : 'Aplikasi berjalan lancar dengan penyimpanan lokal terenkripsi SHA-256.'}
              </div>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleTestAndSave} className="space-y-3.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Supabase Anon Public API Key</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            {statusResult && (
              <div className={'p-3 rounded-xl border flex items-center gap-2 ' + (
                statusResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
              )}>
                {statusResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span className="text-xs font-bold">{statusResult.message}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>{isLoading ? 'Menguji Koneksi...' : 'Uji & Simpan Koneksi Supabase'}</span>
              </button>

              {postgresService.isCloudConnected() && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                >
                  Putuskan
                </button>
              )}
            </div>
          </form>

          {/* Quick Guide */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-black text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
              <span>📋 Langkah Menghubungkan ke Supabase:</span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>Buka Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              <li>Buka dashboard Supabase dan buat proyek baru (contoh: <code>ASTA-Family-Time</code>).</li>
              <li>Buka menu <b>SQL Editor</b> di Supabase, lalu jalankan query dari file <code>database/schema.sql</code>.</li>
              <li>Buka menu <b>Project Settings ➡️ API</b> untuk menyalin <b>Project URL</b> dan <b>anon public key</b> ke formulir di atas.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs hover:bg-slate-300 transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
