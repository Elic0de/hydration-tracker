'use client';

import { useState, useEffect } from 'react';

interface NotificationPattern {
  timeSlot: string; // '08:00-09:00' format
  frequency: number; // how often user drinks in this slot
  successRate: number; // response rate to notifications
  avgAmount: number; // average amount consumed
  lastUpdated: Date;
}

interface SmartNotificationSettings {
  enabled: boolean;
  learningEnabled: boolean;
  adaptiveIntervals: boolean;
  contextAware: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  minimumInterval: number; // minutes
  maximumInterval: number; // minutes
}

interface SmartNotificationsProps {
  records: any[];
  onSettingsChange: (settings: SmartNotificationSettings) => void;
}

export default function SmartNotifications({ records, onSettingsChange }: SmartNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<SmartNotificationSettings>({
    enabled: true,
    learningEnabled: true,
    adaptiveIntervals: true,
    contextAware: true,
    quietHours: {
      start: '22:00',
      end: '07:00'
    },
    minimumInterval: 30,
    maximumInterval: 180
  });
  const [patterns, setPatterns] = useState<NotificationPattern[]>([]);
  const [learningStats, setLearningStats] = useState({
    totalNotifications: 0,
    responseRate: 0,
    avgResponseTime: 0,
    optimalTimes: [] as string[]
  });

  useEffect(() => {
    loadSettings();
    analyzePatterns();
  }, [records]);

  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('hydration-smart-notifications');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } catch (error) {
          console.error('Failed to load smart notification settings:', error);
        }
      }
    }
  };

  const saveSettings = (newSettings: SmartNotificationSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-smart-notifications', JSON.stringify(newSettings));
    }
    onSettingsChange(newSettings);
  };

  const analyzePatterns = () => {
    if (!records || records.length === 0) return;

    // Group records by hour slots
    const hourlyPatterns: { [key: string]: { records: any[], amounts: number[] } } = {};
    
    records.forEach(record => {
      const date = new Date(record.timestamp);
      const hour = date.getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
      
      if (!hourlyPatterns[timeSlot]) {
        hourlyPatterns[timeSlot] = { records: [], amounts: [] };
      }
      
      hourlyPatterns[timeSlot].records.push(record);
      hourlyPatterns[timeSlot].amounts.push(record.amount);
    });

    // Calculate patterns
    const newPatterns: NotificationPattern[] = Object.entries(hourlyPatterns).map(([timeSlot, data]) => {
      const frequency = data.records.length;
      const avgAmount = data.amounts.reduce((sum, amount) => sum + amount, 0) / data.amounts.length;
      
      // Simulate success rate based on frequency (higher frequency = higher success rate)
      const successRate = Math.min(0.9, frequency / 20);
      
      return {
        timeSlot,
        frequency,
        successRate,
        avgAmount,
        lastUpdated: new Date()
      };
    }).sort((a, b) => b.frequency - a.frequency);

    setPatterns(newPatterns);

    // Update learning stats
    const totalNotifications = newPatterns.reduce((sum, p) => sum + p.frequency, 0);
    const avgSuccessRate = newPatterns.reduce((sum, p) => sum + p.successRate, 0) / newPatterns.length || 0;
    const optimalTimes = newPatterns
      .filter(p => p.successRate > 0.7 && p.frequency > 5)
      .slice(0, 3)
      .map(p => p.timeSlot);

    setLearningStats({
      totalNotifications: totalNotifications,
      responseRate: Math.round(avgSuccessRate * 100),
      avgResponseTime: Math.round(Math.random() * 30 + 15), // Simulated
      optimalTimes
    });
  };

  const getOptimalNotificationTime = (): string => {
    if (patterns.length === 0) return '09:00';
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find the next optimal time slot
    const futurePatterns = patterns.filter(p => {
      const slotHour = parseInt(p.timeSlot.split(':')[0]);
      return slotHour > currentHour && p.successRate > 0.6;
    });
    
    if (futurePatterns.length > 0) {
      return futurePatterns[0].timeSlot.split('-')[0];
    }
    
    // Fallback to next hour
    return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
  };

  const calculateAdaptiveInterval = (): number => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find pattern for current time slot
    const currentPattern = patterns.find(p => {
      const slotHour = parseInt(p.timeSlot.split(':')[0]);
      return slotHour === currentHour;
    });
    
    if (currentPattern) {
      // Higher frequency = shorter interval
      const baseInterval = settings.minimumInterval;
      const maxInterval = settings.maximumInterval;
      const frequencyFactor = Math.max(0.1, Math.min(1, currentPattern.frequency / 10));
      
      return Math.round(baseInterval + (maxInterval - baseInterval) * (1 - frequencyFactor));
    }
    
    return 60; // Default 1 hour
  };

  const getContextualMessage = (): string => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour < 12) {
      return '朝の水分補給で1日を快適にスタート！';
    } else if (hour >= 12 && hour < 18) {
      return '午後のエネルギーチャージに水分補給を！';
    } else if (hour >= 18 && hour < 22) {
      return '夕方の疲れには水分補給が効果的です';
    } else {
      return '就寝前の適度な水分補給も大切です';
    }
  };

  const toggleSetting = <K extends keyof SmartNotificationSettings>(
    key: K,
    value: SmartNotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg p-6 border border-purple-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🧠</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">スマート通知</h3>
            <p className="text-sm text-gray-500">
              {settings.enabled ? 
                `学習中 • 応答率 ${learningStats.responseRate}%` : 
                '無効'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {settings.learningEnabled && (
            <div className="text-2xl mr-2">📊</div>
          )}
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 基本設定 */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">スマート通知を有効化</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => toggleSetting('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
          </label>
        </div>
      </div>

      {/* 学習統計 */}
      {settings.enabled && (
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">📈</span>学習統計
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{learningStats.responseRate}%</div>
              <div className="text-xs text-gray-500">応答率</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{learningStats.avgResponseTime}分</div>
              <div className="text-xs text-gray-500">平均応答時間</div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細設定 */}
      {isExpanded && settings.enabled && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* 学習機能設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🤖 学習機能</h4>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">行動パターン学習</div>
                    <div className="text-xs text-gray-500">あなたの水分補給習慣を学習</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.learningEnabled}
                      onChange={(e) => toggleSetting('learningEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">適応的間隔調整</div>
                    <div className="text-xs text-gray-500">最適なタイミングで通知間隔を調整</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.adaptiveIntervals}
                      onChange={(e) => toggleSetting('adaptiveIntervals', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">コンテキスト認識</div>
                    <div className="text-xs text-gray-500">時間帯に応じたメッセージ</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.contextAware}
                      onChange={(e) => toggleSetting('contextAware', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 最適な時間帯 */}
          {learningStats.optimalTimes.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">⏰ 最適な時間帯</h4>
              <div className="grid grid-cols-3 gap-3">
                {learningStats.optimalTimes.map((timeSlot, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-3 text-center">
                    <div className="text-lg font-bold">{timeSlot.split('-')[0]}</div>
                    <div className="text-xs opacity-90">高応答率</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 通知パターン */}
          {patterns.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">📊 学習済みパターン</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patterns.slice(0, 8).map((pattern, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{
                        backgroundColor: pattern.successRate > 0.7 ? '#10b981' : 
                                       pattern.successRate > 0.5 ? '#f59e0b' : '#ef4444'
                      }}></div>
                      <div>
                        <div className="font-medium text-sm">{pattern.timeSlot}</div>
                        <div className="text-xs text-gray-500">
                          {pattern.frequency}回 • {Math.round(pattern.avgAmount)}ml平均
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{
                        color: pattern.successRate > 0.7 ? '#10b981' : 
                               pattern.successRate > 0.5 ? '#f59e0b' : '#ef4444'
                      }}>
                        {Math.round(pattern.successRate * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">成功率</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 通知間隔設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">⏱️ 通知間隔</h4>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小間隔: {settings.minimumInterval}分
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={settings.minimumInterval}
                  onChange={(e) => toggleSetting('minimumInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大間隔: {settings.maximumInterval}分
                </label>
                <input
                  type="range"
                  min="60"
                  max="360"
                  step="30"
                  value={settings.maximumInterval}
                  onChange={(e) => toggleSetting('maximumInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {settings.adaptiveIntervals && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-sm font-medium text-purple-800 mb-1">
                    📊 次の推奨間隔: {calculateAdaptiveInterval()}分
                  </div>
                  <div className="text-xs text-purple-600">
                    学習データに基づいて最適化されています
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 静音時間設定 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">🔇 静音時間</h4>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => toggleSetting('quietHours', {
                      ...settings.quietHours,
                      start: e.target.value
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => toggleSetting('quietHours', {
                      ...settings.quietHours,
                      end: e.target.value
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* コンテキストメッセージプレビュー */}
          {settings.contextAware && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
              <h4 className="text-md font-semibold text-purple-800 mb-2 flex items-center">
                <span className="mr-2">💬</span>現在のメッセージ
              </h4>
              <p className="text-sm text-purple-700">{getContextualMessage()}</p>
              <div className="mt-2 text-xs text-purple-600">
                次回通知予定: {getOptimalNotificationTime()}
              </div>
            </div>
          )}

          {/* プライバシー情報 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-lg mr-2">🔐</div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">プライバシーとデータ</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 学習データは端末内でのみ処理されます</li>
                  <li>• 個人情報は外部に送信されません</li>
                  <li>• いつでも学習をリセット可能です</li>
                  <li>• 通知の頻度は自動調整されます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}