'use client';

import { DailyHydrationSummary } from '@/domain/value-objects/HydrationSummary';

interface DailySummaryProps {
  summary: DailyHydrationSummary;
}

export default function DailySummary({ summary }: DailySummaryProps) {
  const progressPercentage = Math.round(summary.achievementRate * 100);
  const remaining = Math.max(0, summary.goalAmount - summary.totalAmount);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'from-emerald-400 to-emerald-500';
    if (progressPercentage >= 75) return 'from-blue-400 to-blue-500';
    if (progressPercentage >= 50) return 'from-amber-400 to-amber-500';
    return 'from-pink-400 to-pink-500';
  };

  const getWaveEmoji = () => {
    if (progressPercentage >= 100) return '🌊';
    if (progressPercentage >= 75) return '💧';
    if (progressPercentage >= 50) return '🥤';
    return '🥛';
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl p-6 border border-blue-100">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getWaveEmoji()}</div>
        <h2 className="text-xl font-bold text-gray-800">今日の水分補給</h2>
        <p className="text-gray-500 text-sm">
          {summary.date.toLocaleDateString('ja-JP', { 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* 進捗リング */}
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* 背景円 */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* 進捗円 */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - summary.achievementRate)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="stop-color-blue-400" />
                <stop offset="100%" className="stop-color-blue-600" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* 中央の進捗テキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800">{progressPercentage}%</div>
            <div className="text-xs text-gray-500">達成</div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-lg font-bold text-blue-600">{summary.totalAmount}</div>
          <div className="text-xs text-gray-500">ml 摂取</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-lg font-bold text-gray-600">{summary.goalAmount}</div>
          <div className="text-xs text-gray-500">ml 目標</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-lg font-bold text-purple-600">{summary.recordCount}</div>
          <div className="text-xs text-gray-500">回記録</div>
        </div>
      </div>

      {/* ステータス */}
      {summary.achievementRate >= 1 ? (
        <div className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl p-4 text-center border border-emerald-200">
          <div className="text-emerald-600 font-bold">🎉 目標達成！素晴らしい！</div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl p-4 text-center border border-blue-200">
          <div className="text-blue-600 font-medium">
            あと <span className="font-bold">{remaining}ml</span> で目標達成！
          </div>
        </div>
      )}
    </div>
  );
}