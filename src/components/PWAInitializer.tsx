'use client';

import { useEffect, useState } from 'react';
import { 
  initPWA, 
  getPWAInstallInfo, 
  showPWAInstallPrompt,
  PWAInstallInfo 
} from '@/utils/pwa';

export default function PWAInitializer() {
  const [installInfo, setInstallInfo] = useState<PWAInstallInfo>({
    canInstall: false,
    isInstalled: false,
    platform: 'unknown'
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Initialize PWA features
    initPWA();

    // Check install info
    const updateInstallInfo = () => {
      const info = getPWAInstallInfo();
      setInstallInfo(info);
      
      // Show install prompt if available and not already installed
      if (info.canInstall && !info.isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    updateInstallInfo();

    // Listen for PWA events
    const handleInstallAvailable = () => {
      updateInstallInfo();
    };

    const handleInstalled = () => {
      setShowInstallPrompt(false);
      updateInstallInfo();
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const success = await showPWAInstallPrompt();
    if (success) {
      setShowInstallPrompt(false);
    }
  };


  // Don't show install prompt if already installed or can't install
  if (!showInstallPrompt || !installInfo.canInstall || installInfo.isInstalled) {
    return null;
  }

  return (
    <>
      {/* PWA Install Prompt */}
      <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-2xl mr-2">📱</div>
                <h3 className="font-bold text-sm">アプリをインストール</h3>
              </div>
              <p className="text-xs opacity-90 mb-3">
                ホーム画面に追加してより便利に使用できます
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-blue-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  インストール
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors duration-200"
                >
                  後で
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="ml-2 text-white/80 hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions */}
      {installInfo.platform === 'ios' && showInstallPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ホーム画面に追加
              </h3>
              <p className="text-gray-600 text-sm">
                Safariのメニューから「ホーム画面に追加」を選択してください
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3">1</div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">画面下部の</span>
                  <div className="bg-gray-200 p-1 rounded">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 ml-2">をタップ</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3">2</div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">「ホーム画面に追加」を選択</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3">3</div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">「追加」をタップして完了</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallPrompt(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3 font-medium transition-colors duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}