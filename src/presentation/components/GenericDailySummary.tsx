'use client';

import { GenericDailySummary } from '@/application/use-cases/GetGenericDailySummaryUseCase';
import { TrackerConfig } from '@/domain/entities/TrackerType';

interface GenericDailySummaryProps {
  summary: GenericDailySummary;
  config: TrackerConfig;
}

export default function GenericDailySummaryComponent({ summary, config }: GenericDailySummaryProps) {
  const achievementPercentage = Math.round(summary.achievementRate * 100);
  const isGoalAchieved = summary.achievementRate >= 1;
  
  const getProgressColor = () => {
    if (achievementPercentage >= 100) return 'text-green-600';
    if (achievementPercentage >= 75) return 'text-blue-600';
    if (achievementPercentage >= 50) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getProgressBgColor = () => {
    if (achievementPercentage >= 100) return 'bg-green-100';
    if (achievementPercentage >= 75) return 'bg-blue-100';
    if (achievementPercentage >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { gradient: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' };
      case 'red':
        return { gradient: 'from-red-400 to-red-500', bg: 'bg-red-50' };
      case 'purple':
        return { gradient: 'from-purple-400 to-purple-500', bg: 'bg-purple-50' };
      case 'green':
        return { gradient: 'from-green-400 to-green-500', bg: 'bg-green-50' };
      default:
        return { gradient: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' };
    }
  };

  const colorClasses = getColorClasses(config.color);

  return (
    <div className={`bg-gradient-to-br from-white to-${config.color}-50 rounded-3xl shadow-lg border border-${config.color}-100 p-6`}>
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">{config.emoji}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">今日の{config.name}</h2>
        <p className="text-sm text-gray-600">
          {summary.date.toLocaleDateString('ja-JP', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short' 
          })}
        </p>
      </div>

      <div className="space-y-6">
        {/* メイン統計 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {config.unit === '時間' ? summary.totalAmount.toFixed(1) : summary.totalAmount}
            <span className="text-xl text-gray-500 ml-1">{config.unit}</span>
          </div>
          <div className="text-sm text-gray-600">
            目標: {config.unit === '時間' ? summary.goalAmount.toFixed(1) : summary.goalAmount}{config.unit}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">進捗</span>
            <span className={`font-medium ${getProgressColor()}`}>
              {achievementPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colorClasses.gradient} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 達成状況 */}
        <div className={`${getProgressBgColor()} rounded-2xl p-4`}>
          <div className="flex items-center justify-center">
            {isGoalAchieved ? (
              <>
                <span className="text-2xl mr-2">🎉</span>
                <div className="text-center">
                  <div className="font-bold text-green-700">目標達成！</div>
                  <div className="text-sm text-green-600">素晴らしい継続です！</div>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl mr-2">💪</span>
                <div className="text-center">
                  <div className="font-bold text-gray-700">
                    あと{config.unit === '時間' 
                      ? (summary.goalAmount - summary.totalAmount).toFixed(1) 
                      : Math.round(summary.goalAmount - summary.totalAmount)
                    }{config.unit}
                  </div>
                  <div className="text-sm text-gray-600">目標まで頑張りましょう！</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 記録回数 */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
          <span className="text-gray-600">記録回数</span>
          <span className="font-bold text-gray-800">{summary.recordCount}回</span>
        </div>
      </div>
    </div>
  );
}