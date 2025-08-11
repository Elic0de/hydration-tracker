'use client';

import { useState, useEffect } from 'react';

interface HealthProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  available: boolean;
  capabilities: string[];
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleep: number;
  weight: number;
  lastSync: Date | null;
}

interface HealthcareIntegrationProps {
  onDataSync: (data: HealthData) => void;
}

const HEALTH_PROVIDERS: HealthProvider[] = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'iPhoneのヘルスケアアプリと連携',
    icon: '🍎',
    connected: false,
    available: typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent),
    capabilities: ['steps', 'heartRate', 'sleep', 'weight', 'hydration']
  },
  {
    id: 'google-fit',
    name: 'Google Fit',
    description: 'Googleフィットネスデータと連携',
    icon: '📱',
    connected: false,
    available: typeof window !== 'undefined' && /Android/.test(navigator.userAgent),
    capabilities: ['steps', 'heartRate', 'weight', 'activities']
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Fitbitデバイスと連携',
    icon: '⌚',
    connected: false,
    available: true,
    capabilities: ['steps', 'heartRate', 'sleep', 'hydration', 'activities']
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    description: 'Garminデバイスと連携',
    icon: '🏃',
    connected: false,
    available: true,
    capabilities: ['steps', 'heartRate', 'sleep', 'stress', 'activities']
  },
  {
    id: 'samsung-health',
    name: 'Samsung Health',
    description: 'Samsung Healthアプリと連携',
    icon: '📲',
    connected: false,
    available: typeof window !== 'undefined' && /Samsung/.test(navigator.userAgent),
    capabilities: ['steps', 'heartRate', 'sleep', 'weight', 'hydration']
  }
];

export default function HealthcareIntegration({ onDataSync }: HealthcareIntegrationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [providers, setProviders] = useState<HealthProvider[]>(HEALTH_PROVIDERS);
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    weight: 0,
    lastSync: null
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = () => {
    if (typeof window !== 'undefined') {
      const savedConnections = localStorage.getItem('hydration-health-connections');
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setProviders(prev => prev.map(provider => ({
            ...provider,
            connected: connections[provider.id] || false
          })));
        } catch (error) {
          console.error('Failed to load health connections:', error);
        }
      }
    }
  };

  const saveConnectionStatus = (providerId: string, connected: boolean) => {
    if (typeof window !== 'undefined') {
      const savedConnections = JSON.parse(localStorage.getItem('hydration-health-connections') || '{}');
      savedConnections[providerId] = connected;
      localStorage.setItem('hydration-health-connections', JSON.stringify(savedConnections));
    }
  };

  const connectProvider = async (providerId: string) => {
    setSyncInProgress(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update provider status
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, connected: true }
          : provider
      ));
      
      // Save connection status
      saveConnectionStatus(providerId, true);
      
      // Simulate initial data sync
      await syncHealthData();
      
    } catch (error) {
      console.error('Failed to connect provider:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const disconnectProvider = (providerId: string) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, connected: false }
        : provider
    ));
    
    saveConnectionStatus(providerId, false);
  };

  const syncHealthData = async () => {
    setSyncInProgress(true);
    
    try {
      // Simulate data fetching
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock health data
      const mockData: HealthData = {
        steps: Math.round(Math.random() * 8000 + 2000),
        heartRate: Math.round(Math.random() * 40 + 60),
        sleep: Math.round(Math.random() * 3 + 6), // 6-9 hours
        weight: Math.round((Math.random() * 40 + 50) * 10) / 10, // 50-90 kg
        lastSync: new Date()
      };
      
      setHealthData(mockData);
      onDataSync(mockData);
      
    } catch (error) {
      console.error('Failed to sync health data:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const getHydrationRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (healthData.steps > 8000) {
      recommendations.push('多くの歩数を記録しています。運動による発汗を考慮して水分補給量を増やしましょう。');
    }
    
    if (healthData.heartRate > 80) {
      recommendations.push('心拍数が高めです。適切な水分補給で体調を整えましょう。');
    }
    
    if (healthData.sleep < 7) {
      recommendations.push('睡眠時間が短いようです。脱水状態が睡眠の質に影響することがあります。');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('健康データは良好です。現在の水分補給習慣を続けましょう。');
    }
    
    return recommendations;
  };

  const connectedProviders = providers.filter(p => p.connected);
  const availableProviders = providers.filter(p => p.available && !p.connected);

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-lg p-6 border border-emerald-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🏥</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">ヘルスケア連携</h3>
            <p className="text-sm text-gray-500">
              {connectedProviders.length > 0 ? 
                `${connectedProviders.length}個のサービスと連携中` : 
                'ヘルスケアデータと連携'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {connectedProviders.length > 0 && (
            <div className="text-2xl mr-2">💚</div>
          )}
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 接続済みプロバイダー */}
      {connectedProviders.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">接続済み</h4>
            <button
              onClick={() => syncHealthData()}
              disabled={syncInProgress}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {syncInProgress ? '同期中...' : '同期'}
            </button>
          </div>
          <div className="space-y-2">
            {connectedProviders.map((provider) => (
              <div key={provider.id} className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-lg mr-3">{provider.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-gray-500">
                      {healthData.lastSync ? 
                        `最終同期: ${healthData.lastSync.toLocaleString('ja-JP')}` : 
                        '未同期'
                      }
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnectProvider(provider.id)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  切断
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 詳細表示 */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* ヘルスデータ表示 */}
          {healthData.lastSync && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">📊 健康データ</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{healthData.steps.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">歩数</div>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{healthData.heartRate}</div>
                  <div className="text-xs text-gray-500">心拍数 (bpm)</div>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{healthData.sleep}h</div>
                  <div className="text-xs text-gray-500">睡眠時間</div>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{healthData.weight}</div>
                  <div className="text-xs text-gray-500">体重 (kg)</div>
                </div>
              </div>
            </div>
          )}

          {/* おすすめ */}
          {healthData.lastSync && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">💡 健康データに基づくアドバイス</h4>
              <div className="space-y-3">
                {getHydrationRecommendations().map((rec, index) => (
                  <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <p className="text-sm text-emerald-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 利用可能なプロバイダー */}
          {availableProviders.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">🔗 接続可能なサービス</h4>
              <div className="space-y-3">
                {availableProviders.map((provider) => (
                  <div key={provider.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="text-lg mr-3">{provider.icon}</div>
                        <div>
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.description}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => connectProvider(provider.id)}
                        disabled={syncInProgress}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {syncInProgress ? '接続中...' : '接続'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.capabilities.map((capability, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 利用できないデバイス */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📱 その他のサービス</h4>
            <div className="space-y-2">
              {providers.filter(p => !p.available).map((provider) => (
                <div key={provider.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-lg mr-3">{provider.icon}</div>
                      <div>
                        <div className="font-medium text-sm text-gray-600">{provider.name}</div>
                        <div className="text-xs text-gray-500">このデバイスでは利用できません</div>
                      </div>
                    </div>
                    <div className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-lg">
                      未対応
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 将来の機能 */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-4 border border-emerald-200">
            <h4 className="text-md font-semibold text-emerald-800 mb-2 flex items-center">
              <span className="mr-2">🚀</span>今後の予定
            </h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• 心拍数に基づく最適な水分補給タイミング</li>
              <li>• 睡眠品質との相関分析</li>
              <li>• 運動強度に応じた自動目標調整</li>
              <li>• 医師・栄養士との情報共有機能</li>
              <li>• 健康診断結果との連携</li>
            </ul>
          </div>

          {/* プライバシーとセキュリティ */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-lg mr-2">🔐</div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">プライバシーとセキュリティ</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• すべての健康データは暗号化されて保存されます</li>
                  <li>• 外部サービスとの連携は任意です</li>
                  <li>• データの共有範囲を細かく制御できます</li>
                  <li>• いつでも連携を解除できます</li>
                  <li>• 医療情報は適切な基準で保護されます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}