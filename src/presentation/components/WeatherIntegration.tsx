"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  hot: {
    threshold: 30,
    adjustment: 500,
    reason: "暑い日のため水分補給量を増量",
  },
  veryHot: {
    threshold: 35,
    adjustment: 800,
    reason: "猛暑日のため水分補給量を大幅増量",
  },
  dry: { threshold: 30, adjustment: 300, reason: "乾燥のため水分補給量を増量" },
  humid: {
    threshold: 70,
    adjustment: 200,
    reason: "高湿度による発汗のため増量",
  },
  cold: {
    threshold: 10,
    adjustment: -200,
    reason: "寒い日のため通常より少なめに調整",
  },
};

const WEATHER_TIPS = {
  sunny: [
    "☀️ 晴れた日は紫外線により脱水しやすくなります",
    "🕶️ 外出時は帽子や日傘で日差しを避けましょう",
    "💧 こまめな水分補給を心がけてください",
  ],
  cloudy: [
    "☁️ 曇りの日でも水分補給は大切です",
    "🌡️ 気温に注意して適切な量を摂取しましょう",
    "💦 湿度が高い場合は発汗量が増えます",
  ],
  rainy: [
    "🌧️ 雨の日は室内にいることが多くなりがちです",
    "🏠 エアコンによる乾燥にも注意しましょう",
    "☕ 温かい飲み物も水分補給になります",
  ],
  hot: [
    "🔥 高温注意！普段より多めの水分補給が必要です",
    "🧊 冷たい飲み物で体温調節も意識しましょう",
    "⚠️ 熱中症予防のため、のどが渇く前に飲みましょう",
  ],
  cold: [
    "❄️ 寒い日でも脱水は起こります",
    "🫖 温かい飲み物で体を温めながら水分補給",
    "🏠 暖房による空気の乾燥にも注意が必要です",
  ],
};

// --- Open-Meteo weather_code を日本語＆アイコンへ ---
const WEATHER_MAP: Record<number, { ja: string; icon: string }> = {
  0: { ja: "快晴", icon: "☀️" },
  1: { ja: "晴れ", icon: "🌤️" },
  2: { ja: "薄曇り", icon: "⛅" },
  3: { ja: "曇り", icon: "☁️" },
  45: { ja: "霧", icon: "🌫️" },
  48: { ja: "着氷性の霧", icon: "🌫️" },
  51: { ja: "霧雨（弱い）", icon: "🌦️" },
  53: { ja: "霧雨（中）", icon: "🌦️" },
  55: { ja: "霧雨（強い）", icon: "🌧️" },
  56: { ja: "着氷性霧雨（弱い）", icon: "🌧️" },
  57: { ja: "着氷性霧雨（強い）", icon: "🌧️" },
  61: { ja: "小雨", icon: "🌦️" },
  63: { ja: "雨", icon: "🌧️" },
  65: { ja: "大雨", icon: "🌧️" },
  66: { ja: "着氷性の雨（弱い）", icon: "🌧️" },
  67: { ja: "着氷性の雨（強い）", icon: "🌧️" },
  71: { ja: "小雪", icon: "🌨️" },
  73: { ja: "雪", icon: "❄️" },
  75: { ja: "大雪", icon: "❄️" },
  77: { ja: "細雪", icon: "❄️" },
  80: { ja: "にわか雨（弱い）", icon: "🌦️" },
  81: { ja: "にわか雨（中）", icon: "🌧️" },
  82: { ja: "にわか雨（強い）", icon: "🌧️" },
  85: { ja: "にわか雪（弱い）", icon: "🌨️" },
  86: { ja: "にわか雪（強い）", icon: "🌨️" },
  95: { ja: "雷雨", icon: "⛈️" },
  96: { ja: "雹を伴う雷雨（弱/中）", icon: "⛈️" },
  99: { ja: "雹を伴う雷雨（強）", icon: "⛈️" },
};
const codeToJa = (code: number) =>
  WEATHER_MAP[code] ?? { ja: "不明", icon: "❓" };
const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

export default function WeatherIntegration({
  currentGoal,
  onGoalAdjustment,
}: WeatherIntegrationProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 同一の天気入力に対して複数回の目標更新を防ぐ
  const lastAppliedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    // Load settings & cache（初回のみ）
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("hydration-weather-settings");
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setAutoAdjustEnabled(!!settings.autoAdjustEnabled);
        } catch (e) {
          console.error("Failed to load weather settings:", e);
        }
      }

      const cachedWeather = localStorage.getItem("hydration-weather-cache");
      if (cachedWeather) {
        try {
          const { data, timestamp } = JSON.parse(cachedWeather);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < 30 * 60 * 1000) {
            setWeatherData(data);
            setLastUpdate(new Date(timestamp));
          }
        } catch (e) {
          console.error("Failed to load cached weather:", e);
        }
      }
    }
  }, []);

  // --- 位置取得 ---
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false,
      });
    });
  };

  // --- Open-Meteo から現在値を取る ---
  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // フォールバック（東京都庁近辺）
    let latitude = 35.6895;
    let longitude = 139.6917;

    try {
      try {
        const pos = await getCurrentPosition();
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        /* 位置拒否/失敗 → フォールバック継続 */
      }

      const url = new URL(OPEN_METEO);
      url.searchParams.set("latitude", String(latitude));
      url.searchParams.set("longitude", String(longitude));
      url.searchParams.set(
        "current",
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "weather_code",
          "uv_index",
        ].join(",")
      );
      url.searchParams.set("timezone", "auto");
      url.searchParams.set("language", "ja");

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`Open-Meteo error: ${resp.status}`);
      const data = await resp.json();
      const cur = data?.current ?? {};

      const wmoCode: number = Number(cur.weather_code ?? NaN);
      const { ja, icon } = Number.isFinite(wmoCode)
        ? codeToJa(wmoCode)
        : { ja: "不明", icon: "❓" };

      const coordLabel = `現在地 (${latitude.toFixed(2)}, ${longitude.toFixed(
        2
      )})`;

      const newWeather: WeatherData = {
        temperature: Math.round(cur.temperature_2m ?? 0),
        humidity: Math.round(cur.relative_humidity_2m ?? 0),
        description: ja,
        icon,
        feelsLike: Math.round(
          cur.apparent_temperature ?? cur.temperature_2m ?? 0
        ),
        uvIndex:
          typeof cur.uv_index === "number" ? Math.round(cur.uv_index) : 0,
        location: coordLabel,
      };

      setWeatherData((prev) => {
        // 同値なら更新しない（StrictModeの二重実行等でも安定）
        if (
          prev &&
          prev.temperature === newWeather.temperature &&
          prev.humidity === newWeather.humidity &&
          prev.description === newWeather.description &&
          prev.icon === newWeather.icon &&
          prev.feelsLike === newWeather.feelsLike &&
          prev.uvIndex === newWeather.uvIndex &&
          prev.location === newWeather.location
        ) {
          return prev;
        }
        return newWeather;
      });

      const now = new Date();
      setLastUpdate(now);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "hydration-weather-cache",
          JSON.stringify({ data: newWeather, timestamp: now.getTime() })
        );
      }

      // 新しい天気を取得したので、同一入力に対する目標調整の重複をクリア
      lastAppliedSignatureRef.current = null;
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("天気データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []); // 依存なしで安定させる

  // --- 目標自動調整（同一天気につき一度だけ） ---
  const checkForGoalAdjustment = useCallback(() => {
    if (!weatherData || !autoAdjustEnabled) return;

    const { temperature, humidity } = weatherData;
    let adjustment = 0;
    let reason = "";

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

    if (humidity <= WEATHER_ADJUSTMENTS.dry.threshold) {
      adjustment += WEATHER_ADJUSTMENTS.dry.adjustment;
      reason += (reason ? " / " : "") + WEATHER_ADJUSTMENTS.dry.reason;
    } else if (humidity >= WEATHER_ADJUSTMENTS.humid.threshold) {
      adjustment += WEATHER_ADJUSTMENTS.humid.adjustment;
      reason += (reason ? " / " : "") + WEATHER_ADJUSTMENTS.humid.reason;
    }

    // 入力のシグネチャ（同一天気での連続適用を防止）
    const signature = `${temperature}|${humidity}`;
    if (lastAppliedSignatureRef.current === signature) return;

    if (Math.abs(adjustment) >= 200) {
      const newGoal = Math.max(1000, currentGoal + adjustment);
      onGoalAdjustment(newGoal, reason);
      lastAppliedSignatureRef.current = signature;
    } else {
      // しきい値未満は適用せず、シグネチャは更新しない（再取得時に再評価）
    }
  }, [
    weatherData?.temperature,
    weatherData?.humidity,
    autoAdjustEnabled,
    currentGoal,
    onGoalAdjustment,
  ]);

  // weatherData が更新されたときだけ評価（循環を作らない）
  useEffect(() => {
    if (autoAdjustEnabled && weatherData) {
      checkForGoalAdjustment();
    }
  }, [
    autoAdjustEnabled,
    weatherData?.temperature,
    weatherData?.humidity,
    checkForGoalAdjustment,
  ]);

  const getWeatherIcon = (description: string, temp: number) => {
    if (temp >= 35) return "🔥";
    if (temp >= 30) return "☀️";
    if (temp <= 5) return "🥶";
    if (temp <= 15) return "❄️";
    if (description.includes("雨")) return "🌧️";
    if (description.includes("曇")) return "☁️";
    if (description.includes("晴")) return "☀️";
    return "🌤️";
  };

  const getWeatherTips = (weatherData: WeatherData) => {
    const { temperature, description } = weatherData;
    if (temperature >= 30) return WEATHER_TIPS.hot;
    if (temperature <= 10) return WEATHER_TIPS.cold;
    if (description.includes("雨")) return WEATHER_TIPS.rainy;
    if (description.includes("曇")) return WEATHER_TIPS.cloudy;
    return WEATHER_TIPS.sunny;
  };

  const toggleAutoAdjust = () => {
    const newValue = !autoAdjustEnabled;
    setAutoAdjustEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "hydration-weather-settings",
        JSON.stringify({ autoAdjustEnabled: newValue })
      );
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
              {weatherData
                ? `${weatherData.temperature}°C • ${weatherData.description}`
                : "天気データを取得"}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {weatherData && (
            <div className="text-2xl mr-2">
              {getWeatherIcon(weatherData.description, weatherData.temperature)}
            </div>
          )}
          <div
            className={`transform transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
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
              <div className="text-2xl font-bold text-blue-600">
                {weatherData.temperature}°C
              </div>
              <div className="text-xs text-gray-500">気温</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {weatherData.humidity}%
              </div>
              <div className="text-xs text-gray-500">湿度</div>
            </div>
          </div>
          {lastUpdate && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                最終更新: {lastUpdate.toLocaleTimeString("ja-JP")}
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
                <h4 className="text-md font-semibold text-gray-700">
                  自動目標調整
                </h4>
                <p className="text-xs text-gray-500">
                  天気に応じて目標を自動調整
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdjustEnabled}
                  onChange={toggleAutoAdjust}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-blue-500"></div>
              </label>
            </div>

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
                <span className="mr-2">
                  {getWeatherIcon(
                    weatherData.description,
                    weatherData.temperature
                  )}
                </span>
                今日のアドバイス
              </h4>
              <div className="space-y-2">
                {getWeatherTips(weatherData).map((tip, idx) => (
                  <p key={idx} className="text-sm text-sky-700">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 詳細天気情報 */}
          {weatherData && (
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                詳細情報
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">体感温度:</span>
                  <span className="ml-2 font-medium">
                    {weatherData.feelsLike}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">場所:</span>
                  <span className="ml-2 font-medium">
                    {weatherData.location}
                  </span>
                </div>
                {typeof weatherData.uvIndex === "number" && (
                  <div>
                    <span className="text-gray-500">UV指数:</span>
                    <span className="ml-2 font-medium">
                      {weatherData.uvIndex}
                    </span>
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
                <p className="text-sm font-medium text-gray-800 mb-1">
                  プライバシーについて
                </p>
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
