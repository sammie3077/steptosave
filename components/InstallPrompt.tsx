import React, { useState, useEffect } from 'react';
import { DownloadIcon, CheckIcon } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  theme: any;
}

export const InstallPrompt: React.FC<InstallPromptProps> = React.memo(({ theme }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show prompt after a delay (3 seconds)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (isInstalled) {
    return (
      <div className="fixed bottom-20 left-6 bg-green-50 text-green-700 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
        <CheckIcon size={20} />
        <span className="text-sm font-bold">已安裝為 App！</span>
      </div>
    );
  }

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-6 right-6 md:left-6 md:right-auto md:max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 duration-300 z-50 border border-gray-100">
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-2xl flex-shrink-0"
          style={{ backgroundColor: theme.light }}
        >
          <DownloadIcon size={24} style={{ color: theme.primary }} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-800 mb-1">
            安裝 Step2Save
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            安裝到主畫面，隨時隨地輕鬆記錄存錢成果！
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 text-white rounded-xl font-bold shadow-md transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              立即安裝
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              稍後
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>離線使用</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>快速啟動</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>更省空間</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>像原生 App</span>
          </div>
        </div>
      </div>
    </div>
  );
});

InstallPrompt.displayName = 'InstallPrompt';
