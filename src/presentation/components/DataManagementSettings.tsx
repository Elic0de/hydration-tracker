'use client';

import { useState } from 'react';

interface DataManagementSettingsProps {
  onDataExport: (format: 'json' | 'csv') => void;
  onDataImport: (data: unknown) => void;
  onDataClear: () => void;
}

export default function DataManagementSettings({ 
  onDataExport, 
  onDataImport, 
  onDataClear 
}: DataManagementSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: false,
    shareUsageData: false,
    allowNotifications: true,
    syncData: false
  });

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onDataImport(data);
      } catch {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
      }
    };
    reader.readAsText(file);
  };

  const handleDataClear = () => {
    onDataClear();
    setShowClearConfirm(false);
  };

  const getStorageSize = () => {
    if (typeof window === 'undefined') return '0KB';
    
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('hydration-')) {
        total += localStorage[key].length + key.length;
      }
    }
    
    if (total < 1024) return `${total}B`;
    if (total < 1024 * 1024) return `${Math.round(total / 1024)}KB`;
    return `${Math.round(total / (1024 * 1024))}MB`;
  };

  const getDataStats = () => {
    if (typeof window === 'undefined') return { records: 0, goals: 0, settings: 0 };
    
    try {
      const records = JSON.parse(localStorage.getItem('hydration-records') || '[]');
      const goals = JSON.parse(localStorage.getItem('hydration-goals') || '[]');
      const settingsCount = Object.keys(localStorage)
        .filter(key => key.startsWith('hydration-') && !key.includes('records') && !key.includes('goals'))
        .length;
      
      return {
        records: records.length || 0,
        goals: goals.length || 0,
        settings: settingsCount
      };
    } catch {
      return { records: 0, goals: 0, settings: 0 };
    }
  };

  const stats = getDataStats();

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-lg p-6 border border-indigo-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">💾</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">データ管理</h3>
            <p className="text-sm text-gray-500">使用容量: {getStorageSize()}</p>
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
          {/* データ統計 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-3">📊 データ統計</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.records}</div>
                <div className="text-xs text-gray-500">記録数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.goals}</div>
                <div className="text-xs text-gray-500">目標設定</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.settings}</div>
                <div className="text-xs text-gray-500">設定項目</div>
              </div>
            </div>
          </div>

          {/* データエクスポート */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📤 データエクスポート</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onDataExport('json')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium">JSON形式</div>
                  <div className="text-xs opacity-90 mt-1">完全バックアップ</div>
                </div>
              </button>
              <button
                onClick={() => onDataExport('csv')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium">CSV形式</div>
                  <div className="text-xs opacity-90 mt-1">表計算ソフト用</div>
                </div>
              </button>
            </div>
          </div>

          {/* データインポート */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📥 データインポート</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-3">
              <div className="flex items-start">
                <div className="text-lg mr-2">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">注意事項</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    インポートすると既存のデータが上書きされます。事前にバックアップを取ってください。
                  </p>
                </div>
              </div>
            </div>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="sr-only"
              />
              <div className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer">
                <div className="text-3xl mb-2">📂</div>
                <div className="font-medium text-gray-700">JSONファイルを選択</div>
                <div className="text-xs text-gray-500 mt-1">クリックしてファイルを選択</div>
              </div>
            </label>
          </div>

          {/* プライバシー設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🔒 プライバシー設定</h4>
            <div className="space-y-3">
              {[
                {
                  key: 'shareAnalytics',
                  label: '使用統計の共有',
                  description: '匿名化された使用データを開発改善のために共有',
                  emoji: '📊'
                },
                {
                  key: 'shareUsageData',
                  label: 'パフォーマンス改善データ',
                  description: 'アプリの動作改善のための技術データを共有',
                  emoji: '⚡'
                },
                {
                  key: 'allowNotifications',
                  label: 'プッシュ通知',
                  description: 'リマインダーや重要なお知らせの通知を許可',
                  emoji: '🔔'
                },
                {
                  key: 'syncData',
                  label: 'データ同期',
                  description: '複数デバイス間でのデータ同期 (将来実装予定)',
                  emoji: '🔄'
                }
              ].map((setting) => (
                <div key={setting.key} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="text-lg mr-3">{setting.emoji}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{setting.label}</div>
                        <div className="text-xs text-gray-500">{setting.description}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings[setting.key as keyof typeof privacySettings]}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          [setting.key]: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* データクリア */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🗑️ データ削除</h4>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🗑️</div>
                  <div className="font-medium">全データを削除</div>
                  <div className="text-xs opacity-90 mt-1">すべての記録・設定を削除</div>
                </div>
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">⚠️</div>
                  <div className="font-bold text-red-800">本当に削除しますか？</div>
                  <div className="text-sm text-red-600 mt-1">
                    この操作は取り消せません。すべてのデータが永久に削除されます。
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-3 transition-all duration-200"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDataClear}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl py-3 transition-all duration-200"
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* データ保護に関する説明 */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-xl mr-2">🛡️</div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">データ保護について</p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• すべてのデータは端末内に安全に保存されます</li>
                  <li>• 外部サーバーには一切送信されません</li>
                  <li>• 定期的なバックアップを推奨します</li>
                  <li>• ブラウザのデータ削除時に消失する可能性があります</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}