"use client";

import { useState, useEffect, useCallback } from "react";
import { NextHydrationInfo } from "@/application/use-cases/GetNextHydrationTimeUseCase";

interface NextHydrationTimerProps {
  nextHydrationInfo: NextHydrationInfo;
  onDrinkNow: () => void;
  onRefreshTimer: () => void;
  records: any[];
  reminderSettings: any;
}

export default function NextHydrationTimer({
  nextHydrationInfo,
  onDrinkNow,
  onRefreshTimer,
  records,
  reminderSettings,
}: NextHydrationTimerProps) {
  const [timeUntilNextSeconds, setTimeUntilNextSeconds] = useState(0);
  const [autoCalculatedNext, setAutoCalculatedNext] = useState<Date | null>(
    null
  );
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // 自動計算による次回の水分補給時間を計算
  const calculateNextHydrationTime = useCallback(() => {
    // ローカルストレージから設定を取得（リマインダーがオフでも使用）
    let intervalMinutes = 60; // デフォルト1時間

    if (typeof window !== "undefined") {
      // ローカルストレージから間隔設定を取得
      const savedInterval = localStorage.getItem("hydration-auto-interval");
      if (savedInterval) {
        intervalMinutes = parseInt(savedInterval);
      } else if (reminderSettings?.intervalMinutes) {
        // リマインダー設定があればそれを使用してローカルストレージに保存
        intervalMinutes = reminderSettings.intervalMinutes;
        localStorage.setItem(
          "hydration-auto-interval",
          intervalMinutes.toString()
        );
      } else {
        // デフォルト値をローカルストレージに保存
        localStorage.setItem(
          "hydration-auto-interval",
          intervalMinutes.toString()
        );
      }
    } else if (reminderSettings?.intervalMinutes) {
      intervalMinutes = reminderSettings.intervalMinutes;
    }

    if (!records || records.length === 0) {
      // 記録がない場合は現在時刻から間隔分後
      const next = new Date();
      next.setMinutes(next.getMinutes() + intervalMinutes);
      return next;
    }

    // 最後の記録を取得
    const sortedRecords = [...records].sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastRecord = sortedRecords[0];

    if (!lastRecord) {
      const next = new Date();
      next.setMinutes(next.getMinutes() + intervalMinutes);
      return next;
    }

    const lastDrinkTime = new Date(lastRecord.timestamp);

    // 最後の記録から間隔分後を計算
    const nextTime = new Date(lastDrinkTime);
    nextTime.setMinutes(nextTime.getMinutes() + intervalMinutes);

    // 現在時刻を過ぎている場合は次の適切な時間に調整
    const now = new Date();
    if (nextTime <= now) {
      // 現在時刻から次の間隔後に設定（過去の時間は表示しない）
      const next = new Date();
      next.setMinutes(next.getMinutes() + intervalMinutes);
      return next;
    }

    return nextTime;
  }, [records, reminderSettings]);

  // リアルタイム秒単位更新
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastUpdateTime(now);

      // 自動計算による次回時間を更新
      const autoNext = calculateNextHydrationTime();
      setAutoCalculatedNext(autoNext);

      // 次回までの時間を秒単位で計算
      const nextTime = nextHydrationInfo.nextReminderTime || autoNext;
      if (nextTime) {
        const timeDiffSeconds = Math.max(
          0,
          Math.floor((nextTime.getTime() - now.getTime()) / 1000)
        );
        setTimeUntilNextSeconds(timeDiffSeconds);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextHydrationInfo, calculateNextHydrationTime, records]);

  // 初期計算
  useEffect(() => {
    const autoNext = calculateNextHydrationTime();
    setAutoCalculatedNext(autoNext);
  }, [calculateNextHydrationTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes <= 0) {
      return "0分";
    }
    if (minutes < 60) {
      return `${minutes}分`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}時間${remainingMinutes}分`
        : `${hours}時間`;
    }
  };

  // 秒単位カウントダウンのフォーマット
  const formatSecondsCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return { hours: "00", minutes: "00", seconds: "00" };
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  // 人間に読みやすい時間形式
  const formatReadableTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "今すぐ！";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}時間${minutes}分${seconds}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  const handleRefreshTimer = () => {
    const autoNext = calculateNextHydrationTime();
    setAutoCalculatedNext(autoNext);
    setLastUpdateTime(new Date());
    onRefreshTimer();
  };

  const adjustInterval = (minutes: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hydration-auto-interval", minutes.toString());
      const autoNext = calculateNextHydrationTime();
      setAutoCalculatedNext(autoNext);
      setLastUpdateTime(new Date());
    }
  };

  const getCurrentInterval = (): number => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hydration-auto-interval");
      return saved ? parseInt(saved) : 60;
    }
    return reminderSettings?.intervalMinutes || 60;
  };

  const getStatusColor = () => {
    // 自動計算の場合も考慮
    const isTimeForDrink =
      timeUntilNextSeconds <= 0 || nextHydrationInfo.shouldDrinkNow;
    const isAlmostTime = timeUntilNextSeconds <= 1800; // 30分以内

    if (isTimeForDrink) return "from-red-400 to-pink-400";
    if (isAlmostTime) return "from-amber-400 to-orange-400";
    return "from-blue-400 to-cyan-400";
  };

  const getStatusEmoji = () => {
    const isTimeForDrink =
      timeUntilNextSeconds <= 0 || nextHydrationInfo.shouldDrinkNow;
    const isAlmostTime = timeUntilNextSeconds <= 1800; // 30分以内

    if (isTimeForDrink) return "🚨";
    if (isAlmostTime) return "⏰";
    return "⏳";
  };

  const getStatusMessage = () => {
    const isTimeForDrink =
      timeUntilNextSeconds <= 0 || nextHydrationInfo.shouldDrinkNow;
    const isAlmostTime = timeUntilNextSeconds <= 1800; // 30分以内

    if (isTimeForDrink) {
      return "水分補給の時間です！";
    }
    if (isAlmostTime) {
      return "もうすぐ水分補給の時間です";
    }

    // リマインダーがオフの場合の表示
    if (!nextHydrationInfo.nextReminderTime && autoCalculatedNext) {
      return "自動計算による次回の水分補給まで";
    }

    return "次回の水分補給まで";
  };

  return (
    <div
      className={`bg-gradient-to-br ${getStatusColor()} rounded-3xl shadow-lg p-6 border border-white/20 text-white`}
    >
      {/* ヘッダー */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{getStatusEmoji()}</div>
        <h3 className="text-lg font-bold">{getStatusMessage()}</h3>
      </div>

      {/* メインタイマー */}
      <div className="text-center mb-6">
        {timeUntilNextSeconds <= 0 || nextHydrationInfo.shouldDrinkNow ? (
          <div className="space-y-3">
            <div className="text-3xl font-bold animate-pulse text-red-100">
              今すぐ！
            </div>
            <button
              onClick={onDrinkNow}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              💧 {nextHydrationInfo.recommendedIntake}ml 飲む
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* リアルタイムカウントダウン */}
            <div className="space-y-2">
              {/* <div className="text-2xl font-bold text-white">
                {formatReadableTime(timeUntilNextSeconds)}
              </div> */}

              {/* デジタル時計スタイル表示 */}
              <div className="flex justify-center items-center space-x-2 text-white/90">
                {(() => {
                  const { hours, minutes, seconds } =
                    formatSecondsCountdown(timeUntilNextSeconds);
                  return (
                    <>
                      <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <div className="text-lg font-mono font-bold">
                          {hours}
                        </div>
                        <div className="text-xs opacity-80">時間</div>
                      </div>
                      <div className="text-xl font-bold">:</div>
                      <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <div className="text-lg font-mono font-bold">
                          {minutes}
                        </div>
                        <div className="text-xs opacity-80">分</div>
                      </div>
                      <div className="text-xl font-bold">:</div>
                      <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <div className="text-lg font-mono font-bold">
                          {seconds}
                        </div>
                        <div className="text-xs opacity-80">秒</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 次回通知時刻 */}
            <div className="text-sm opacity-90">
              {(nextHydrationInfo.nextReminderTime || autoCalculatedNext) && (
                <div>
                  {nextHydrationInfo.nextReminderTime
                    ? `${formatTime(
                        nextHydrationInfo.nextReminderTime
                      )} に通知予定`
                    : `${formatTime(autoCalculatedNext!)} が目安時刻`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 更新ボタンと間隔調整 */}
      <div className="text-center mb-4 space-y-3">
        <button
          onClick={handleRefreshTimer}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
        >
          🔄 タイマー更新
        </button>

        {/* 間隔クイック設定 */}
        <div className="text-xs opacity-90">
          間隔設定 (現在: {getCurrentInterval()}分)
        </div>
        <div className="flex justify-center gap-2">
          {[30, 60, 90, 120].map((minutes) => (
            <button
              key={minutes}
              onClick={() => adjustInterval(minutes)}
              className={`text-xs py-1 px-3 rounded-lg transition-all duration-200 ${
                getCurrentInterval() === minutes
                  ? "bg-white text-blue-600 font-semibold"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
            >
              {minutes}分
            </button>
          ))}
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div className="text-lg font-bold">
            {nextHydrationInfo.lastDrinkTime
              ? formatDuration(nextHydrationInfo.timeSinceLastDrink)
              : "未記録"}
          </div>
          <div className="text-xs opacity-90">前回から</div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div className="text-lg font-bold">
            {nextHydrationInfo.recommendedIntake}ml
          </div>
          <div className="text-xs opacity-90">推奨量</div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div className="text-lg font-bold">{formatTime(lastUpdateTime)}</div>
          <div className="text-xs opacity-90">最終更新</div>
        </div>
      </div>

      {/* 最後の飲用時間 */}
      {nextHydrationInfo.lastDrinkTime && (
        <div className="mt-4 text-center">
          <div className="text-sm opacity-90">
            最後の記録: {formatTime(nextHydrationInfo.lastDrinkTime)}
          </div>
        </div>
      )}

      {/* アドバイス */}
      {nextHydrationInfo.timeSinceLastDrink >= 180 && (
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center text-sm">
            <div className="text-xl mr-2">💡</div>
            <div>
              <div className="font-semibold">長時間経過しています</div>
              <div className="text-xs opacity-90">
                3時間以上水分を摂取していません。脱水症状に注意しましょう。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
