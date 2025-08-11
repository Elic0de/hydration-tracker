"use client";

import { useState, useEffect } from "react";
import { NextHydrationInfo } from "@/application/use-cases/GetNextHydrationTimeUseCase";
import { ReminderSettings } from "@/application/use-cases/HydrationReminderUseCase";
import { SmartReminderService } from "@/application/services/SmartReminderService";
import { HydrationRecord } from "@/domain/entities/HydrationRecord";

interface NextHydrationTimerProps {
  nextHydrationInfo: NextHydrationInfo;
  onDrinkNow: (amount?: number) => void;
  onRefreshTimer: () => void;
  records: HydrationRecord[];
  reminderSettings: ReminderSettings;
  currentGoal?: number;
}

export default function NextHydrationTimer({
  nextHydrationInfo,
  onDrinkNow,
  onRefreshTimer,
  records,
  reminderSettings,
  currentGoal = 2000,
}: NextHydrationTimerProps) {
  const [timeUntilNextSeconds, setTimeUntilNextSeconds] = useState(0);
  const [smartCalculatedNext, setSmartCalculatedNext] = useState<Date | null>(
    null
  );
  const [smartReason, setSmartReason] = useState<string>("");
  const [recommendedAmount, setRecommendedAmount] = useState<number>(200);
  const [recommendedAmountReason, setRecommendedAmountReason] =
    useState<string>("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const smartReminderService = SmartReminderService.getInstance();

  // 初期推奨量設定
  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRecords = records.filter(
      (record) => record.timestamp >= todayStart
    );
    const todayIntake = todayRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const remainingGoal = Math.max(0, currentGoal - todayIntake);

    if (reminderSettings.mode === "manual") {
      const amountCalc = smartReminderService.calculateManualRecommendedAmount(
        remainingGoal,
        reminderSettings.intervalMinutes,
        new Date()
      );
      setRecommendedAmount(amountCalc.amount);
      setRecommendedAmountReason(amountCalc.reason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderSettings.mode, reminderSettings.intervalMinutes, currentGoal]);

  // リアルタイム更新
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastUpdateTime(now);

      let nextTime: Date | null = null;

      // モードに応じて次回時間を計算（依存関係の問題を回避するため直接計算）
      if (reminderSettings.mode === "auto") {
        if (reminderSettings.autoSettings?.useSmartTiming) {
          try {
            const calculation = smartReminderService.calculateNextReminderTime(
              records,
              currentGoal,
              1.0,
              "medium"
            );

            setSmartReason(calculation.reason);
            setRecommendedAmount(calculation.recommendedAmount);
            setRecommendedAmountReason(calculation.recommendedAmountReason);
            setSmartCalculatedNext(calculation.nextReminderTime);
            nextTime = calculation.nextReminderTime;
          } catch (error) {
            console.error("Smart calculation failed:", error);
            nextTime = nextHydrationInfo.nextReminderTime;
          }
        } else {
          // オートモードだがスマートタイミングが無効の場合、基本的なオート計算
          nextTime = nextHydrationInfo.nextReminderTime;
          setSmartCalculatedNext(nextTime);

          // 推奨摂取量もデフォルト値で設定
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayRecords = records.filter(
            (record) => record.timestamp >= todayStart
          );
          const todayIntake = todayRecords.reduce(
            (sum, record) => sum + record.amount,
            0
          );
          const remainingGoal = Math.max(0, currentGoal - todayIntake);

          const amountCalc =
            smartReminderService.calculateManualRecommendedAmount(
              remainingGoal,
              60, // デフォルト60分間隔
              now
            );

          setRecommendedAmount(amountCalc.amount);
          setRecommendedAmountReason(amountCalc.reason);
          setSmartReason("基本的な自動スケジュール");
        }
      } else if (reminderSettings.mode === "manual") {
        // マニュアルモードの計算
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayRecords = records.filter(
          (record) => record.timestamp >= todayStart
        );
        const todayIntake = todayRecords.reduce(
          (sum, record) => sum + record.amount,
          0
        );
        const remainingGoal = Math.max(0, currentGoal - todayIntake);

        const amountCalc =
          smartReminderService.calculateManualRecommendedAmount(
            remainingGoal,
            reminderSettings.intervalMinutes,
            now
          );

        setRecommendedAmount(amountCalc.amount);
        setRecommendedAmountReason(amountCalc.reason);

        // 次回時間計算
        if (!records || records.length === 0) {
          const next = new Date();
          next.setMinutes(next.getMinutes() + reminderSettings.intervalMinutes);
          nextTime = next;
        } else {
          const sortedRecords = [...records].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          const lastRecord = sortedRecords[0];

          if (lastRecord) {
            const lastDrinkTime = new Date(lastRecord.timestamp);
            const calculatedNext = new Date(lastDrinkTime);
            calculatedNext.setMinutes(
              calculatedNext.getMinutes() + reminderSettings.intervalMinutes
            );

            // 現在時刻を過ぎている場合は調整
            if (calculatedNext <= now) {
              const next = new Date();
              next.setMinutes(
                next.getMinutes() + reminderSettings.intervalMinutes
              );
              nextTime = next;
            } else {
              nextTime = calculatedNext;
            }
          } else {
            const next = new Date();
            next.setMinutes(
              next.getMinutes() + reminderSettings.intervalMinutes
            );
            nextTime = next;
          }
        }
      }

      // フォールバック
      if (!nextTime) {
        nextTime = nextHydrationInfo.nextReminderTime;
      }

      // カウントダウン更新
      if (nextTime) {
        const timeDiffSeconds = Math.max(
          0,
          Math.floor((nextTime.getTime() - now.getTime()) / 1000)
        );
        setTimeUntilNextSeconds(timeDiffSeconds);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reminderSettings.mode,
    reminderSettings.intervalMinutes,
    reminderSettings.autoSettings,
    currentGoal,
    smartReminderService,
  ]);

  // recordsが変更されたときの依存関係更新
  useEffect(() => {
    // recordsが変更されたときだけ、依存関係を更新するためのフラグ
  }, [records, nextHydrationInfo]);

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
      return {
        hours: "00",
        minutes: "00",
        seconds: "00",
        displayText: "今すぐ！",
      };
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 表示用のテキストを生成
    let displayText = "";
    if (hours > 0) {
      displayText = `${hours}時間${minutes > 0 ? minutes + "分" : ""}後`;
    } else if (minutes > 0) {
      displayText = `${minutes}分${
        seconds > 0 && minutes < 5 ? seconds + "秒" : ""
      }後`;
    } else {
      displayText = `${seconds}秒後`;
    }

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      displayText,
    };
  };

  const getModeIcon = () => {
    return reminderSettings.mode === "auto" ? "🤖" : "⚙️";
  };

  const getModeLabel = () => {
    return reminderSettings.mode === "auto"
      ? "オートモード"
      : "マニュアルモード";
  };

  const getModeDescription = () => {
    if (reminderSettings.mode === "auto") {
      return smartReason || "AIが最適な時間を推奨しています";
    } else {
      return `${formatDuration(reminderSettings.intervalMinutes)}間隔で通知`;
    }
  };

  const countdown = formatSecondsCountdown(timeUntilNextSeconds);
  const isOverdue = timeUntilNextSeconds <= 0;

  // 表示する次回時間を決定
  const displayNextTime =
    smartCalculatedNext || nextHydrationInfo.nextReminderTime;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl p-6 border border-blue-100">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3">{getModeIcon()}</div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">次回の水分補給</h3>
            <p className="text-xs text-gray-500">{getModeLabel()}</p>
          </div>
        </div>
        <button
          onClick={onRefreshTimer}
          className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors text-gray-600 hover:text-blue-600"
          title="更新"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* 推奨摂取量表示 */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-4 mb-6 border border-emerald-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-700 mb-2">
            {recommendedAmount}ml
          </div>
          <div className="text-sm font-medium text-emerald-600 mb-1">
            推奨摂取量
          </div>
          <div className="text-xs text-emerald-600 opacity-80">
            {recommendedAmountReason}
          </div>
        </div>
      </div>

      {/* カウントダウンタイマー */}
      <div className="text-center mb-6">
        {isOverdue ? (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 mb-4">
            <div className="text-2xl font-bold mb-2">
              💧 水分補給の時間です！
            </div>
            <div className="text-lg font-medium mb-2">
              {recommendedAmount}ml 飲みましょう
            </div>
            <div className="text-sm opacity-90">
              適切な水分補給を心がけましょう
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur rounded-2xl p-4 mb-4">
            {/* 直感的な時間表示 */}
            <div className="text-center mb-3">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {countdown.displayText}
              </div>
            </div>

            {/* 詳細カウントダウン */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {countdown.hours}
                </div>
                <div className="text-xs text-gray-500">時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {countdown.minutes}
                </div>
                <div className="text-xs text-gray-500">分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {countdown.seconds}
                </div>
                <div className="text-xs text-gray-500">秒</div>
              </div>
            </div>

            {displayNextTime && (
              <div className="text-sm text-gray-600">
                次回予定: {formatTime(displayNextTime)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* モード詳細情報 */}
      <div className="bg-white/40 backdrop-blur rounded-xl p-4 mb-6">
        <div className="flex items-center mb-2">
          <div className="text-sm text-gray-600">推奨理由:</div>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {getModeDescription()}
        </div>

        {/* オートモードの追加情報 */}
        {reminderSettings.mode === "auto" && reminderSettings.autoSettings && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div
              className={`flex items-center ${
                reminderSettings.autoSettings.useSmartTiming
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <span className="mr-1">
                {reminderSettings.autoSettings.useSmartTiming ? "✓" : "○"}
              </span>
              AI推奨
            </div>
            <div
              className={`flex items-center ${
                reminderSettings.autoSettings.adaptToWeather
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <span className="mr-1">
                {reminderSettings.autoSettings.adaptToWeather ? "✓" : "○"}
              </span>
              天気連携
            </div>
            <div
              className={`flex items-center ${
                reminderSettings.autoSettings.adaptToActivity
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <span className="mr-1">
                {reminderSettings.autoSettings.adaptToActivity ? "✓" : "○"}
              </span>
              活動調整
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={() => onDrinkNow(recommendedAmount)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">💧</span>
            {recommendedAmount}ml 飲む
          </div>
        </button>

        {isOverdue && (
          <button
            onClick={onRefreshTimer}
            className="px-4 py-3 bg-white/80 text-gray-700 rounded-xl font-medium hover:bg-white transition-colors"
          >
            次へ
          </button>
        )}
      </div>

      {/* 最終更新時刻 */}
      <div className="text-center mt-4">
        <div className="text-xs text-gray-400">
          最終更新: {formatTime(lastUpdateTime)}
        </div>
      </div>
    </div>
  );
}
