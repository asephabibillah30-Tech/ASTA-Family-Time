import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, X, Check, Lock, Users, HeartHandshake, EyeOff, 
  Sparkles, CheckCircle2 
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  initialTab?: 'tos' | 'privacy';
  onClose: () => void;
  onAgreeAndClose?: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  initialTab = 'tos',
  onClose,
  onAgreeAndClose,
}) => {
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy'>(initialTab);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  const handleAgree = () => {
    sound.playSuccess();
    if (onAgreeAndClose) {
      onAgreeAndClose();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-100 dark:border-teal-900/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-50/70 to-emerald-50/70 dark:from-teal-950/40 dark:to-emerald-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-400/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              {activeTab === 'tos' ? (
                <FileText className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                {activeTab === 'tos' ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi Data Keluarga'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Ekosistem Permainan & Aktivitas Keluarga ASTA Family Time
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

        {/* Tab Navigation Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('tos');
              sound.playClick();
            }}
            className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'tos'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Syarat Layanan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('privacy');
              sound.playClick();
            }}
            className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privasi Data Keluarga</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
          {activeTab === 'tos' ? (
            /* TAB: SYARAT & KETENTUAN LAYANAN */
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-teal-900 dark:text-teal-200 leading-normal">
                  Selamat datang di <strong>ASTA Family Time</strong>! Layanan ini dirancang khusus untuk mempererat keharmonisan keluarga melalui permainan multiplayer interaktif, kuis edukasi, dan pencatatan kebiasaan positif dalam lingkungan privat yang aman.
                </p>
              </div>

              {/* Pasal 1 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-black">1</span>
                  Tanggung Jawab Akun Kepala Keluarga
                </h4>
                <p className="text-[11px] pl-7">
                  Kepala Keluarga adalah pemilik utama ruang keluarga dengan wewenang mengelola profil anggota (Ibu, Anak, Kakek, Nenek), menyetel PIN akses per anggota, serta mengamankan email pemulihan. Kepala Keluarga bertanggung jawab menjaga kerahasiaan kata sandi utama dan mengawasi jalannya aktivitas bermain anak-anak.
                </p>
              </div>

              {/* Pasal 2 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-black">2</span>
                  Kode Keluarga & Akses Anggota
                </h4>
                <p className="text-[11px] pl-7">
                  Setiap keluarga memiliki <strong>Kode Keluarga</strong> unik (misal: <em>ASTA-1234</em>). Anggota keluarga dapat masuk dari perangkat HP/tablet masing-masing menggunakan Kode Keluarga dan PIN individual mereka. Dilarang membagikan Kode Keluarga dan PIN kepada pihak asing di luar anggota keluarga Anda.
                </p>
              </div>

              {/* Pasal 3 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-black">3</span>
                  Aturan Permainan Bersama & Konten
                </h4>
                <p className="text-[11px] pl-7">
                  Seluruh permainan dalam ekosistem ASTA (ASTA Art Frenzy, Family UNO, Family Ludo, Ular Tangga, Family Monopoli) dirancang untuk tujuan edukasi, rekreasi, dan penguatan tali kasih keluarga. Seluruh gambar, tebakan, dan obrolan dalam permainan harus ramah anak, bebas dari konten kekerasan, ujaran kebencian, perjudian, atau materi tidak pantas.
                </p>
              </div>

              {/* Pasal 4 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-black">4</span>
                  Konektivitas Real-Time & Ketersediaan Layanan
                </h4>
                <p className="text-[11px] pl-7">
                  Fitur multiplayer real-time memerlukan koneksi internet aktif. ASTA terus berupaya menjaga ketersediaan server cloud 24/7 dan integritas data riwayat permainan, namun tidak bertanggung jawab atas kegagalan koneksi akibat kendala jaringan lokal pengguna.
                </p>
              </div>

              {/* Pasal 5 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-black">5</span>
                  Pemberhentian & Penghapusan Akun
                </h4>
                <p className="text-[11px] pl-7">
                  Kepala Keluarga berhak menghapus profil anggota atau seluruh data ruang keluarga kapan saja melalui Pusat Manajemen Keluarga di dalam aplikasi.
                </p>
              </div>
            </div>
          ) : (
            /* TAB: KEBIJAKAN PRIVASI DATA KELUARGA */
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-normal">
                  <strong>Privasi Anak & Keluarga adalah Hak Utama:</strong> ASTA dibangun dengan prinsip <em>Zero-Commercial Data Exploitation</em>. Kami tidak pernah menjual, menyewakan, atau memperdagangkan data keluarga Anda kepada pihak ketiga mana pun.
                </p>
              </div>

              {/* Poin 1 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  1. Data yang Dikumpulkan & Disimpan
                </h4>
                <ul className="text-[11px] space-y-1 pl-6 list-disc text-slate-600 dark:text-slate-300">
                  <li><strong>Identitas Keluarga:</strong> Nama Kepala Keluarga, Nama Keluarga (Grup), dan Nama Panggilan Anggota.</li>
                  <li><strong>Kontak Pemulihan:</strong> Email Kepala Keluarga yang hanya digunakan untuk verifikasi login dan reset sandi bila lupa.</li>
                  <li><strong>Kredensial Keamanan:</strong> Kata sandi dan PIN dienkripsi dengan standar hash kriptografi kuat sebelum disimpan di database.</li>
                  <li><strong>Aktivitas Bermain:</strong> Skor permainan, lencana penghargaan keluarga, dan jadwal kegiatan keluarga.</li>
                </ul>
              </div>

              {/* Poin 2 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Users className="w-4 h-4 text-emerald-500" />
                  2. Isolasi Data Keluarga (Row Level Security)
                </h4>
                <p className="text-[11px] pl-6">
                  Setiap data keluarga diisolasi secara ketat dalam basis data menggunakan aturan <em>Row Level Security (RLS)</em>. Keluarga lain tidak memiliki akses teknis maupun visual terhadap profil, skor, atau gambar kreasi keluarga Anda.
                </p>
              </div>

              {/* Poin 3 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <EyeOff className="w-4 h-4 text-emerald-500" />
                  3. Perlindungan Privasi Anak (Semangat Kepatuhan COPPA)
                </h4>
                <p className="text-[11px] pl-6">
                  ASTA tidak menayangkan iklan berbayar dari pihak ketiga, tidak memasang pelacak perilaku digital (*tracking cookies*), dan tidak mengumpulkan lokasi fisik (GPS) anggota keluarga. Anak-anak dapat bermain dengan tenang dalam pengawasan orang tua.
                </p>
              </div>

              {/* Poin 4 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  4. Hak Kendali & Penghapusan Penuh
                </h4>
                <p className="text-[11px] pl-6">
                  Orang tua memiliki hak penuh atas data keluarganya: dapat mengedit profil, memperbarui PIN, menyetel ulang akun, atau menghapus permanen data keluarga dari server kapan saja melalui aplikasi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Terlindungi secara privat untuk seluruh anggota keluarga ASTA</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleAgree}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Saya Mengerti & Setuju</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
