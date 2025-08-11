'use client';

import { useState, useEffect } from 'react';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  fontSize: 'small' | 'medium' | 'large';
  language: 'ja' | 'en';
  animations: boolean;
  compactMode: boolean;
  showEmojis: boolean;
  chartStyle: 'modern' | 'classic' | 'minimal';
}

interface AppearanceSettingsProps {
  onSettingsChange: (settings: AppearanceSettings) => void;
}

const THEME_OPTIONS = [
  { value: 'light', label: 'ライト', emoji: '☀️', description: '明るいテーマ' },
  { value: 'dark', label: 'ダーク', emoji: '🌙', description: '暗いテーマ' },
  { value: 'auto', label: '自動', emoji: '🌗', description: 'システム設定に従う' },
] as const;

const COLOR_SCHEMES = [
  { value: 'blue', label: 'ブルー', color: 'from-blue-500 to-indigo-500', emoji: '💙' },
  { value: 'green', label: 'グリーン', color: 'from-green-500 to-emerald-500', emoji: '💚' },
  { value: 'purple', label: 'パープル', color: 'from-purple-500 to-pink-500', emoji: '💜' },
  { value: 'orange', label: 'オレンジ', color: 'from-orange-500 to-red-500', emoji: '🧡' },
  { value: 'pink', label: 'ピンク', color: 'from-pink-500 to-rose-500', emoji: '🩷' },
] as const;

const FONT_SIZES = [
  { value: 'small', label: '小', description: '14px', emoji: '🔤' },
  { value: 'medium', label: '中', description: '16px', emoji: '🔡' },
  { value: 'large', label: '大', description: '18px', emoji: '🔠' },
] as const;

const LANGUAGES = [
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
] as const;

const CHART_STYLES = [
  { value: 'modern', label: 'モダン', description: 'グラデーション・アニメーション', emoji: '✨' },
  { value: 'classic', label: 'クラシック', description: 'シンプル・安定', emoji: '📊' },
  { value: 'minimal', label: 'ミニマル', description: '最小限の装飾', emoji: '📋' },
] as const;

export default function AppearanceSettings({ onSettingsChange }: AppearanceSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'medium',
    language: 'ja',
    animations: true,
    compactMode: false,
    showEmojis: true,
    chartStyle: 'modern'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('hydration-appearance-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Failed to parse appearance settings:', error);
        }
      }
    }
  }, []);

  const handleSettingChange = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-appearance-settings', JSON.stringify(newSettings));
    }
    
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: AppearanceSettings = {
      theme: 'light',
      colorScheme: 'blue',
      fontSize: 'medium',
      language: 'ja',
      animations: true,
      compactMode: false,
      showEmojis: true,
      chartStyle: 'modern'
    };
    
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-appearance-settings', JSON.stringify(defaultSettings));
    }
    onSettingsChange(defaultSettings);
  };

  return (
    <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl shadow-lg p-6 border border-pink-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🎨</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">外観設定</h3>
            <p className="text-sm text-gray-500">
              {COLOR_SCHEMES.find(c => c.value === settings.colorScheme)?.label} • 
              {FONT_SIZES.find(f => f.value === settings.fontSize)?.label}サイズ
            </p>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 詳細設定 */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* テーマ選択 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🌓 テーマ</h4>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleSettingChange('theme', theme.value)}
                  className={`p-3 rounded-2xl text-center transition-all duration-200 ${
                    settings.theme === theme.value
                      ? 'bg-gradient-to-r from-gray-800 to-gray-600 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{theme.emoji}</div>
                  <div className="font-medium text-sm">{theme.label}</div>
                  <div className="text-xs opacity-75">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* カラースキーム */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🎨 カラースキーム</h4>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_SCHEMES.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleSettingChange('colorScheme', color.value)}
                  className={`p-3 rounded-2xl text-center transition-all duration-200 ${
                    settings.colorScheme === color.value
                      ? `bg-gradient-to-r ${color.color} text-white shadow-lg`
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{color.emoji}</div>
                  <div className="font-medium text-sm">{color.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* フォントサイズ */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📝 フォントサイズ</h4>
            <div className="grid grid-cols-3 gap-3">
              {FONT_SIZES.map((fontSize) => (
                <button
                  key={fontSize.value}
                  onClick={() => handleSettingChange('fontSize', fontSize.value)}
                  className={`p-3 rounded-2xl text-center transition-all duration-200 ${
                    settings.fontSize === fontSize.value
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{fontSize.emoji}</div>
                  <div className="font-medium text-sm">{fontSize.label}</div>
                  <div className="text-xs opacity-75">{fontSize.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 言語設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🌐 言語</h4>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((language) => (
                <button
                  key={language.value}
                  onClick={() => handleSettingChange('language', language.value)}
                  className={`p-3 rounded-2xl text-center transition-all duration-200 ${
                    settings.language === language.value
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{language.flag}</div>
                  <div className="font-medium text-sm">{language.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* チャートスタイル */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📊 チャートスタイル</h4>
            <div className="grid grid-cols-3 gap-3">
              {CHART_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleSettingChange('chartStyle', style.value)}
                  className={`p-3 rounded-2xl text-center transition-all duration-200 ${
                    settings.chartStyle === style.value
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <div className="font-medium text-sm">{style.label}</div>
                  <div className="text-xs opacity-75">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* トグル設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">⚙️ 表示オプション</h4>
            <div className="space-y-3">
              {[
                {
                  key: 'animations',
                  label: 'アニメーション',
                  description: '画面遷移やチャートのアニメーション効果',
                  emoji: '✨'
                },
                {
                  key: 'compactMode',
                  label: 'コンパクトモード',
                  description: '情報を密に表示してスペースを節約',
                  emoji: '📱'
                },
                {
                  key: 'showEmojis',
                  label: '絵文字表示',
                  description: 'アイコンの代わりに絵文字を使用',
                  emoji: '😊'
                }
              ].map((option) => (
                <div key={option.key} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="text-lg mr-3">{option.emoji}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[option.key as keyof AppearanceSettings] as boolean}
                        onChange={(e) => handleSettingChange(
                          option.key as keyof AppearanceSettings,
                          e.target.checked
                        )}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* プレビュー */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">👁️ プレビュー</h4>
            <div 
              className={`bg-gradient-to-r ${COLOR_SCHEMES.find(c => c.value === settings.colorScheme)?.color} rounded-2xl p-4 text-white`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💧</div>
                <div className={`font-bold ${settings.fontSize === 'large' ? 'text-xl' : settings.fontSize === 'small' ? 'text-sm' : 'text-base'}`}>
                  水分補給トラッカー
                </div>
                <div className="text-sm opacity-90">
                  {settings.showEmojis ? '🎯' : '目標:'} 2000ml {settings.showEmojis && '✨'}
                </div>
              </div>
            </div>
          </div>

          {/* リセットボタン */}
          <div>
            <button
              onClick={resetToDefaults}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-medium">デフォルトに戻す</div>
                <div className="text-xs opacity-90 mt-1">すべての外観設定をリセット</div>
              </div>
            </button>
          </div>

          {/* 設定の説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-xl mr-2">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">外観設定のヒント</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• ダークモードは夜間の使用に適しています</li>
                  <li>• コンパクトモードは小さな画面で有効です</li>
                  <li>• アニメーション無効化でパフォーマンスが向上します</li>
                  <li>• 設定はブラウザに保存され、次回も適用されます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}