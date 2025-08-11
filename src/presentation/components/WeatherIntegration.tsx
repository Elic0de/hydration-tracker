'use client';

import { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  feelsLike: number;
  uvIndex?: number;
  location: string;
}

interface WeatherIntegrationProps {
  currentGoal: number;
  onGoalAdjustment: (newGoal: number, reason: string) => void;
}

const WEATHER_ADJUSTMENTS = {
  hot: { threshold: 30, adjustment: 500, reason: '暑い日のため水分補給量を増量' },
  veryHot: { threshold: 35, adjustment: 800, reason: '猛暑日のため水分補給量を大幅増量' },
  dry: { threshold: 30, adjustment: 300, reason: '乾燥のため水分補給量を増量' },
  humid: { threshold: 70, adjustment: 200, reason: '高湿度による発汗のため増量' },
  cold: { threshold: 10, adjustment: -200, reason: '寒い日のため通常より少なめに調整' }
};

const WEATHER_TIPS = {
  sunny: [
    "☀️ 晴れた日は紫外線により脱水しやすくなります",
    "🕶️ 外出時は帽子や日傘で日差しを避けましょう",
    "💧 こまめな水分補給を心がけてください"
  ],
  cloudy: [
    "☁️ 曇りの日でも水分補給は大切です",
    "🌡️ 気温に注意して適切な量を摂取しましょう",
    "💦 湿度が高い場合は発汗量が増えます"
  ],
  rainy: [
    "🌧️ 雨の日は室内にいることが多くなりがちです",
    "🏠 エアコンによる乾燥にも注意しましょう",
    "☕ 温かい飲み物も水分補給になります"
  ],
  hot: [
    "🔥 高温注意！普段より多めの水分補給が必要です",
    "🧊 冷たい飲み物で体温調節も意識しましょう",
    "⚠️ 熱中症予防のため、のどが渇く前に飲みましょう"
  ],
  cold: [
    "❄️ 寒い日でも脱水は起こります",
    "🫖 温かい飲み物で体を温めながら水分補給",
    "🏠 暖房による空気の乾燥にも注意が必要です"
  ]
};

export default function WeatherIntegration({ currentGoal, onGoalAdjustment }: WeatherIntegrationProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('hydration-weather-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setAutoAdjustEnabled(settings.autoAdjustEnabled || false);
        } catch (error) {
          console.error('Failed to load weather settings:', error);
        }
      }
      
      // Load cached weather data
      const cachedWeather = localStorage.getItem('hydration-weather-cache');
      if (cachedWeather) {
        try {
          const { data, timestamp } = JSON.parse(cachedWeather);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < 30 * 60 * 1000) { // 30 minutes cache
            setWeatherData(data);
            setLastUpdate(new Date(timestamp));
          }
        } catch (error) {
          console.error('Failed to load cached weather:', error);
        }
      }
    }
  }, []);

  const checkForGoalAdjustment = useCallback(() => {
    if (!weatherData || !autoAdjustEnabled) return;

    const { temperature, humidity } = weatherData;
    let adjustment = 0;
    let reason = '';

    // Check temperature-based adjustments
    if (temperature >= WEATHER_ADJUSTMENTS.veryHot.threshold) {
      adjustment = WEATHER_ADJUSTMENTS.veryHot.adjustment;
      reason = WEATHER_ADJUSTMENTS.veryHot.reason;
    } else if (temperature >= WEATHER_ADJUSTMENTS.hot.threshold) {
      adjustment = WEATHER_ADJUSTMENTS.hot.adjustment;
      reason = WEATHER_ADJUSTMENTS.hot.reason;
    } else if (temperature <= WEATHER_ADJUSTMENTS.cold.threshold) {
      adjustment = WEATHER_ADJUSTMENTS.cold.adjustment;
      reason = WEATHER_ADJUSTMENTS.cold.reason;
    }

    // Check humidity-based adjustments
    if (humidity <= WEATHER_ADJUSTMENTS.dry.threshold) {
      adjustment += WEATHER_ADJUSTMENTS.dry.adjustment;
      reason += (reason ? ' / ' : '') + WEATHER_ADJUSTMENTS.dry.reason;
    } else if (humidity >= WEATHER_ADJUSTMENTS.humid.threshold) {
      adjustment += WEATHER_ADJUSTMENTS.humid.adjustment;
      reason += (reason ? ' / ' : '') + WEATHER_ADJUSTMENTS.humid.reason;
    }

    // Apply adjustment if significant
    if (Math.abs(adjustment) >= 200) {
      const newGoal = Math.max(1000, currentGoal + adjustment); // Minimum 1000ml
      onGoalAdjustment(newGoal, reason);
    }
  }, [weatherData, autoAdjustEnabled, currentGoal, onGoalAdjustment]);

  useEffect(() => {
    if (autoAdjustEnabled && weatherData) {
      checkForGoalAdjustment();
    }
  }, [autoAdjustEnabled, weatherData, checkForGoalAdjustment]);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user location (currently unused in mock implementation)
      await getCurrentPosition();

      // Use OpenWeatherMap API (you would need to replace with actual API key)
      // For demo purposes, we'll simulate weather data
      const mockWeatherData: WeatherData = {
        temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
        humidity: Math.round(Math.random() * 50 + 30), // 30-80%
        description: ['晴れ', '曇り', '雨', '快晴', '薄曇り'][Math.floor(Math.random() * 5)],
        icon: '☀️',
        feelsLike: Math.round(Math.random() * 30 + 12),
        uvIndex: Math.round(Math.random() * 10),
        location: '東京都'
      };

      // In a real implementation, you would fetch from OpenWeatherMap:
      // const response = await fetch(
      //   `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`
      // );
      // const data = await response.json();

      setWeatherData(mockWeatherData);
      setLastUpdate(new Date());

      // Cache weather data
      if (typeof window !== 'undefined') {
        localStorage.setItem('hydration-weather-cache', JSON.stringify({
          data: mockWeatherData,
          timestamp: Date.now()
        }));
      }

    } catch (err) {
      setError('天気データの取得に失敗しました');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false
      });
    });
  };


  const getWeatherIcon = (description: string, temp: number) => {
    if (temp >= 35) return '🔥';
    if (temp >= 30) return '☀️';
    if (temp <= 5) return '🥶';
    if (temp <= 15) return '❄️';
    if (description.includes('雨')) return '🌧️';
    if (description.includes('曇')) return '☁️';
    if (description.includes('晴')) return '☀️';
    return '🌤️';
  };

  const getWeatherTips = (weatherData: WeatherData) => {
    const { temperature, description } = weatherData;
    
    if (temperature >= 30) return WEATHER_TIPS.hot;
    if (temperature <= 10) return WEATHER_TIPS.cold;
    if (description.includes('雨')) return WEATHER_TIPS.rainy;
    if (description.includes('曇')) return WEATHER_TIPS.cloudy;
    return WEATHER_TIPS.sunny;
  };

  const toggleAutoAdjust = () => {
    const newValue = !autoAdjustEnabled;
    setAutoAdjustEnabled(newValue);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-weather-settings', JSON.stringify({
        autoAdjustEnabled: newValue
      }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-sky-50 rounded-3xl shadow-lg p-6 border border-sky-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🌤️</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">天気連携</h3>
            <p className="text-sm text-gray-500">
              {weatherData ? 
                `${weatherData.temperature}°C • ${weatherData.description}` : 
                '天気データを取得'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {weatherData && (
            <div className="text-2xl mr-2">{getWeatherIcon(weatherData.description, weatherData.temperature)}</div>
          )}
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 天気取得ボタン */}
      <div className="mt-4">
        <button
          onClick={fetchWeather}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-2xl py-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              天気を取得中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="text-lg mr-2">🔄</div>
              天気データを更新
            </div>
          )}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 天気データ表示 */}
      {weatherData && (
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</div>
              <div className="text-xs text-gray-500">気温</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{weatherData.humidity}%</div>
              <div className="text-xs text-gray-500">湿度</div>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 詳細設定 */}
      {isExpanded && (
        <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* 自動調整設定 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-md font-semibold text-gray-700">自動目標調整</h4>
                <p className="text-xs text-gray-500">天気に応じて目標を自動調整</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdjustEnabled}
                  onChange={toggleAutoAdjust}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-blue-500"></div>
              </label>
            </div>

            {/* 調整ルール説明 */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <strong>調整ルール:</strong>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div>🔥 35°C以上: +800ml (猛暑日)</div>
                <div>☀️ 30°C以上: +500ml (暑い日)</div>
                <div>💧 湿度30%以下: +300ml (乾燥)</div>
                <div>💦 湿度70%以上: +200ml (高湿度)</div>
                <div>❄️ 10°C以下: -200ml (寒い日)</div>
              </div>
            </div>
          </div>

          {/* 天気に基づくアドバイス */}
          {weatherData && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
              <h4 className="text-md font-semibold text-sky-800 mb-3 flex items-center">
                <span className="mr-2">{getWeatherIcon(weatherData.description, weatherData.temperature)}</span>
                今日のアドバイス
              </h4>
              <div className="space-y-2">
                {getWeatherTips(weatherData).map((tip, index) => (
                  <p key={index} className="text-sm text-sky-700">{tip}</p>
                ))}
              </div>
            </div>
          )}

          {/* 詳細天気情報 */}
          {weatherData && (
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-700 mb-3">詳細情報</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">体感温度:</span>
                  <span className="ml-2 font-medium">{weatherData.feelsLike}°C</span>
                </div>
                <div>
                  <span className="text-gray-500">場所:</span>
                  <span className="ml-2 font-medium">{weatherData.location}</span>
                </div>
                {weatherData.uvIndex && (
                  <div>
                    <span className="text-gray-500">UV指数:</span>
                    <span className="ml-2 font-medium">{weatherData.uvIndex}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* プライバシー情報 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-lg mr-2">🔒</div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">プライバシーについて</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 位置情報は天気取得のみに使用されます</li>
                  <li>• 位置データは保存されません</li>
                  <li>• 天気データは30分間キャッシュされます</li>
                  <li>• 外部への位置情報の送信を拒否できます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}