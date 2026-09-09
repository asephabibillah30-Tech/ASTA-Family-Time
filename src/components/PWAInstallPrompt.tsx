import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { sound } from '../utils/sound';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Android/Edge beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    // If iOS and not installed, show after 2 seconds
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    sound.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-pop-in">
        <div className="bg-gradient-to-r from-family-coral via-rose-500 to-family-pink text-white p-4 rounded-3xl shadow-bubbly-coral border-2 border-white/60 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
              📱
            </div>
            <div>
              <h4 className="font-display font-extrabold text-sm sm:text-base leading-tight">
                Pasang ASTA Family Time di HP!
              </h4>
              <p className="text-[11px] text-rose-100 font-medium leading-tight mt-0.5">
                Bisa dimainkan langsung dari layar utama tanpa browser!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-family-coral font-display font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang</span>
            </button>

            <button
              onClick={() => setShowBanner(false)}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Manual Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 text-center shadow-bubbly-lg border-4 border-rose-100 dark:border-slate-700">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-family-coral transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-3xl mb-3 text-family-coral">
              <Smartphone className="w-8 h-8 text-family-coral" />
            </div>

            <h3 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 mb-2">
              Cara Pasang di iPhone / iPad
            </h3>

            <div className="space-y-3 text-left text-xs text-slate-600 dark:text-slate-300 my-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-family-coral text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  Ketuk tombol <strong>Share / Bagikan</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) di menu browser Safari bawah.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-family-coral text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Gulir ke bawah lalu pilih menu <strong>"Add to Home Screen" (Tambah ke Layar Utama)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-family-coral text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Ketuk <strong>Add (Tambah)</strong> di pojok kanan atas. Selesai! 🎉
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-2xl bg-family-coral text-white font-display font-bold text-sm shadow-bubbly-coral"
            >
              Mengerti 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
};
