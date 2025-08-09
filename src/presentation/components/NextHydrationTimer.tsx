'use client';

import { useState, useEffect } from 'react';
import { NextHydrationInfo } from '@/application/use-cases/GetNextHydrationTimeUseCase';

interface NextHydrationTimerProps {
  nextHydrationInfo: NextHydrationInfo;
  onDrinkNow: () => void;
}

export default function NextHydrationTimer({ nextHydrationInfo, onDrinkNow }: NextHydrationTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
    }
  };

  const getStatusColor = () => {
    if (nextHydrationInfo.shouldDrinkNow) return 'from-red-400 to-pink-400';
    if (nextHydrationInfo.timeUntilNext <= 30) return 'from-amber-400 to-orange-400';
    return 'from-blue-400 to-cyan-400';
  };

  const getStatusEmoji = () => {
    if (nextHydrationInfo.shouldDrinkNow) return '🚨';
    if (nextHydrationInfo.timeUntilNext <= 30) return '⏰';
    return '⏳';
  };

  const getStatusMessage = () => {
    if (nextHydrationInfo.shouldDrinkNow) {
      return '水分補給の時間です！';
    }
    if (nextHydrationInfo.timeUntilNext <= 30) {
      return 'もうすぐ水分補給の時間です';
    }
    return '次回の水分補給まで';
  };

  return (
    <div className={`bg-gradient-to-br ${getStatusColor()} rounded-3xl shadow-lg p-6 border border-white/20 text-white`}>
      {/* ヘッダー */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{getStatusEmoji()}</div>
        <h3 className="text-lg font-bold">{getStatusMessage()}</h3>
      </div>

      {/* メインタイマー */}
      <div className="text-center mb-6">
        {nextHydrationInfo.shouldDrinkNow ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold animate-pulse">今すぐ！</div>
            <button
              onClick={onDrinkNow}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              💧 {nextHydrationInfo.recommendedIntake}ml 飲む
            </button>
          </div>
        ) : nextHydrationInfo.nextReminderTime ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {formatDuration(nextHydrationInfo.timeUntilNext)}
            </div>
            <div className="text-sm opacity-90">
              {formatTime(nextHydrationInfo.nextReminderTime)} に通知予定
            </div>
          </div>
        ) : (
          <div className="text-lg opacity-90">
            リマインダーがオフです
          </div>
        )}
      </div>

      {/* 詳細情報 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div className="text-xl font-bold">
            {nextHydrationInfo.lastDrinkTime ? 
              formatDuration(nextHydrationInfo.timeSinceLastDrink) : 
              '未記録'
            }
          </div>
          <div className="text-xs opacity-90">前回から</div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div className="text-xl font-bold">
            {nextHydrationInfo.recommendedIntake}ml
          </div>
          <div className="text-xs opacity-90">推奨量</div>
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