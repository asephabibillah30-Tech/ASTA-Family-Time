import React, { useState, useMemo } from 'react';
import { 
  KeyRound, ShieldAlert, X, ArrowRight, CheckCircle2, 
  Eye, EyeOff, AlertCircle, Sparkles, Lock, Mail, Users
} from 'lucide-react';
import { db } from '../../services/db/databaseService';
import { sound } from '../../utils/sound';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'head_recovery' | 'member_info'>('head_recovery');
  const [identifier, setIdentifier] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  // Password strength meter
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Za-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Cukup', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'bg-teal-500' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-emerald-500' };
  }, [newPassword]);

  if (!isOpen) return null;

  const handleClose = () => {
    sound.playClick();
    setErrorMsg('');
    setSuccessMsg('');
    setStep(1);
    onClose();
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Harap masukkan Email Pemulihan atau Username Kepala Keluarga.');
      return;
    }
    if (!familyCode.trim()) {
      setErrorMsg('Harap masukkan Kode Keluarga (misal: ASTA-2026).');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMsg('Password atau PIN baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await db.resetHeadPasswordByRecovery(identifier, familyCode, newPassword);
      sound.playSuccess();
      setSuccessMsg(res.message || 'Password berhasil diperbarui!');
      setStep(2);
    } catch (err: any) {
      sound.playClick();
      setErrorMsg(err.message || 'Gagal memulihkan password. Periksa data kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    sound.playSuccess();
    if (onSuccess) onSuccess();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-50/70 to-amber-50/70 dark:from-rose-950/40 dark:to-amber-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-400/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Pemulihan Akses & Kata Sandi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Pulihkan akun Kepala Keluarga atau dapatkan bantuan PIN
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('head_recovery');
              sound.playClick();
            }}
            className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'head_recovery'
                ? 'border-family-coral text-family-coral dark:text-rose-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kepala Keluarga</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('member_info');
              sound.playClick();
            }}
            className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'member_info'
                ? 'border-family-coral text-family-coral dark:text-rose-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>PIN Anggota Keluarga</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'head_recovery' ? (
            step === 1 ? (
              <form onSubmit={handleResetSubmit} className="space-y-3.5 animate-fade-in">
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Masukkan <strong>Email Pemulihan</strong> (atau Username) dan <strong>Kode Keluarga</strong> Anda untuk memverifikasi kepemilikan ruang keluarga sebelum mengatur sandi baru.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Pemulihan / Username Kepala Keluarga *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="misal: ayah@asta.com atau ayah_asep"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none focus:border-family-coral text-slate-900 dark:text-white shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kode Keluarga *
                  </label>
                  <input
                    type="text"
                    placeholder="misal: ASTA-2026"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider outline-none focus:border-family-coral text-slate-900 dark:text-white shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password / PIN Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimal 4 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-9 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none focus:border-family-coral text-slate-900 dark:text-white shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title={showNewPassword ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Konfirmasi Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi sandi baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-3 pr-9 py-2.5 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-900 dark:text-white shadow-2xs ${
                          confirmPassword && newPassword === confirmPassword
                            ? 'border-emerald-500 focus:border-emerald-600'
                            : confirmPassword && newPassword !== confirmPassword
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-family-coral'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title={showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Bar */}
                {newPassword && (
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Kekuatan Sandi:</span>
                      <span className="text-slate-700 dark:text-slate-300">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`h-full flex-1 rounded-full transition-all ${
                            stepIdx <= passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Memverifikasi & Memperbarui...</span>
                    ) : (
                      <>
                        <span>VERIFIKASI & PERBARUI SANDI</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Success Notice */
              <div className="space-y-4 text-center py-4 animate-pop-in">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                    Kata Sandi Berhasil Dipulihkan!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    {successMsg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>KEMBALI & MASUK SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            /* TAB: PANDUAN PIN ANGGOTA */
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-teal-900 dark:text-teal-200">
                  <strong>Privasi & Keamanan Anggota Keluarga:</strong> PIN individual anggota (Ibu, Anak, Kakek/Nenek) dikelola secara privat oleh <strong>Kepala Keluarga</strong> demi melindungi keamanan keluarga.
                </p>
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <span>Cara Melihat / Mereset PIN Anggota:</span>
                </h5>
                <ol className="list-decimal pl-5 space-y-1.5 text-[11px]">
                  <li>Masuk sebagai <strong>Kepala Keluarga</strong> menggunakan Email dan Kata Sandi utama Anda.</li>
                  <li>Buka menu <strong>Manajemen Keluarga</strong> atau <strong>Pusat Keamanan</strong> di pojok kanan atas aplikasi.</li>
                  <li>Pilih nama anggota keluarga yang bersangkutan, lalu klik <strong>"Ubah PIN Anggota"</strong>.</li>
                  <li>Masukkan PIN baru 4-6 digit, lalu simpan. Anggota keluarga dapat langsung masuk menggunakan PIN baru tersebut.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('head_recovery')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Kembali ke Pemulihan Kepala Keluarga
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
