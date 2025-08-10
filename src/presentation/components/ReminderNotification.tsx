'use client';

import { useState, useEffect } from 'react';

interface ReminderNotificationProps {
  show: boolean;
  onClose: () => void;
  onDrink: () => void;
}

export default function ReminderNotification({ 
  show, 
  onClose, 
  onDrink 
}: ReminderNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // 自動的に閉じないように変更 - ユーザーが手動で閉じる必要がある
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation to complete
  };

  const handleDrink = () => {
    onDrink();
    handleClose();
  };

  if (!show && !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
          bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transition-all duration-300 border border-blue-100 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="text-center">
          {/* 水のアニメーション */}
          <div className="relative mb-6">
            <div className="text-7xl animate-bounce">💧</div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-2xl animate-ping">✨</div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            💧 水分補給の時間！
          </h3>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            体の健康を保つために<br />
            水分補給をしましょう
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleDrink}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🥛 今すぐ記録する
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-6 rounded-2xl font-medium transition-all duration-200"
            >
              後で通知
            </button>
          </div>
          
          {/* 手動閉じる説明 */}
          <div className="mt-4">
            <p className="text-xs text-gray-500">手動で閉じるか記録してください</p>
          </div>
        </div>
      </div>
      
    </>
  );
}