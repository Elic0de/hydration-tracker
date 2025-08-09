'use client';

import { useState } from 'react';
import { TrackerConfig } from '@/domain/entities/TrackerType';

interface GenericFormProps {
  onSubmit: (amount: number, note?: string) => void;
  isLoading?: boolean;
  config: TrackerConfig;
}

export default function GenericForm({ onSubmit, isLoading = false, config }: GenericFormProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleQuickAmount = (amount: number, label: string) => {
    onSubmit(amount, label);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      onSubmit(amount, 'カスタム');
      setCustomAmount('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* クイック記録ボタン */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {config.quickOptions.map((option) => (
          <button
            key={option.amount}
            onClick={() => handleQuickAmount(option.amount, option.label)}
            disabled={isLoading}
            className={`${option.color} text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{option.emoji}</div>
              <div className="font-semibold text-sm">{option.label}</div>
              <div className="text-xs opacity-90">{option.amount}{config.unit}</div>
            </div>
          </button>
        ))}
      </div>

      {/* カスタム入力ボタン */}
      {!showCustomInput ? (
        <button
          onClick={() => setShowCustomInput(true)}
          className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl p-4 border-2 border-dashed border-gray-300 transition-all duration-200"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">➕</div>
            <div className="font-medium text-sm">その他の量</div>
          </div>
        </button>
      ) : (
        <form onSubmit={handleCustomSubmit} className="bg-white rounded-2xl p-4 shadow-lg border">
          <div className="flex gap-3">
            <input
              type="number"
              step={config.unit === '時間' ? '0.5' : '1'}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min={config.unit === '時間' ? '0.5' : '1'}
              max="10000"
              placeholder={config.unit}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-center text-lg font-medium"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              記録
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomAmount('');
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="text-center text-blue-600 font-medium animate-pulse">
          {config.emoji} 記録中...
        </div>
      )}
    </div>
  );
}