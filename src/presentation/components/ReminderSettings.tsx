'use client';

import { useState } from 'react';
import { ReminderSettings } from '@/application/use-cases/HydrationReminderUseCase';

interface ReminderSettingsProps {
  settings: ReminderSettings;
  onSettingsChange: (settings: ReminderSettings) => void;
}

export default function ReminderSettingsComponent({ 
  settings, 
  onSettingsChange 
}: ReminderSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (updates: Partial<ReminderSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const intervalOptions = [
    { value: 15, label: '15分', emoji: '⏰' },
    { value: 30, label: '30分', emoji: '⏲️' },
    { value: 60, label: '1時間', emoji: '🕐' },
    { value: 120, label: '2時間', emoji: '🕑' },
    { value: 180, label: '3時間', emoji: '🕒' },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg p-6 border border-purple-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🔔</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">リマインダー</h3>
            <p className="text-xs text-gray-500">
              {localSettings.enabled ? 'オン' : 'オフ'}
            </p>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 簡単な切り替えスイッチ */}
      <div className="mt-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.enabled}
            onChange={(e) => handleChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            {localSettings.enabled ? 'リマインダーをオン' : 'リマインダーをオフ'}
          </span>
        </label>
      </div>

      {/* 詳細設定 */}
      {isExpanded && localSettings.enabled && (
        <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* モード選択 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">通知モード</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange({ 
                  mode: 'auto', 
                  autoSettings: { 
                    useSmartTiming: true, 
                    adaptToWeather: true, 
                    adaptToActivity: true 
                  }
                })}
                className={`p-4 rounded-xl text-center transition-all duration-200 ${
                  localSettings.mode === 'auto'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold text-sm">オートモード</div>
                <div className="text-xs mt-1 opacity-90">AIが最適な時間を推奨</div>
              </button>
              <button
                onClick={() => handleChange({ mode: 'manual' })}
                className={`p-4 rounded-xl text-center transition-all duration-200 ${
                  localSettings.mode === 'manual'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold text-sm">マニュアルモード</div>
                <div className="text-xs mt-1 opacity-90">固定間隔で通知</div>
              </button>
            </div>
          </div>

          {/* オートモード設定 */}
          {localSettings.mode === 'auto' && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center">
                <span className="mr-2">🧠</span>
                スマート通知設定
              </h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSettings?.useSmartTiming ?? true}
                    onChange={(e) => handleChange({
                      autoSettings: {
                        ...localSettings.autoSettings,
                        useSmartTiming: e.target.checked,
                        adaptToWeather: localSettings.autoSettings?.adaptToWeather ?? true,
                        adaptToActivity: localSettings.autoSettings?.adaptToActivity ?? true
                      }
                    })}
                    className="mr-3 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">AI推奨タイミングを使用</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSettings?.adaptToWeather ?? true}
                    onChange={(e) => handleChange({
                      autoSettings: {
                        ...localSettings.autoSettings,
                        useSmartTiming: localSettings.autoSettings?.useSmartTiming ?? true,
                        adaptToWeather: e.target.checked,
                        adaptToActivity: localSettings.autoSettings?.adaptToActivity ?? true
                      }
                    })}
                    className="mr-3 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">天気に基づいて調整</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSettings?.adaptToActivity ?? true}
                    onChange={(e) => handleChange({
                      autoSettings: {
                        ...localSettings.autoSettings,
                        useSmartTiming: localSettings.autoSettings?.useSmartTiming ?? true,
                        adaptToWeather: localSettings.autoSettings?.adaptToWeather ?? true,
                        adaptToActivity: e.target.checked
                      }
                    })}
                    className="mr-3 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">活動レベルに基づいて調整</span>
                </label>
              </div>
            </div>
          )}

          {/* マニュアルモード設定 */}
          {localSettings.mode === 'manual' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">通知間隔</p>
              <div className="grid grid-cols-3 gap-2">
                {intervalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange({ intervalMinutes: option.value })}
                    className={`p-3 rounded-xl text-center transition-all duration-200 ${
                      localSettings.intervalMinutes === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="text-lg">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 時間設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">開始時刻</p>
              <input
                type="time"
                value={localSettings.startTime}
                onChange={(e) => handleChange({ startTime: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-center font-medium"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">終了時刻</p>
              <input
                type="time"
                value={localSettings.endTime}
                onChange={(e) => handleChange({ endTime: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-center font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}