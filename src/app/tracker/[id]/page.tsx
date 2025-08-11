'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TRACKER_TYPES } from '@/domain/entities/TrackerType';
import { GenericRecord } from '@/domain/entities/GenericRecord';
import { GenericDailySummary } from '@/application/use-cases/GetGenericDailySummaryUseCase';
import { genericContainer } from '@/infrastructure/di/genericContainer';

import GenericForm from '@/presentation/components/GenericForm';
import GenericHistory from '@/presentation/components/GenericHistory';
import GenericDailySummaryComponent from '@/presentation/components/GenericDailySummary';

const DEFAULT_USER_ID = 'default-user';

export default function GenericTrackerPage() {
  const params = useParams();
  const trackerId = params.id as string;
  
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<GenericDailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const config = TRACKER_TYPES[trackerId];

  const loadData = useCallback(async () => {
    try {
      const today = new Date();
      const [historyResult, summaryResult] = await Promise.all([
        genericContainer.getGenericHistoryUseCase.execute({ 
          userId: DEFAULT_USER_ID, 
          trackerId 
        }),
        genericContainer.getGenericDailySummaryUseCase.execute({ 
          userId: DEFAULT_USER_ID, 
          trackerId,
          date: today 
        }),
      ]);

      setRecords(historyResult);
      setDailySummary(summaryResult);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  }, [trackerId]);

  const initializeGoal = useCallback(async () => {
    try {
      const existingGoal = await genericContainer.genericGoalRepository.findByUserIdAndTracker(
        DEFAULT_USER_ID,
        trackerId
      );
      
      if (!existingGoal) {
        await genericContainer.updateGenericGoalUseCase.execute({
          userId: DEFAULT_USER_ID,
          trackerId,
          newDailyGoal: config.defaultGoal,
        });
      }
    } catch (error) {
      console.error('目標の初期化に失敗しました:', error);
    }
  }, [trackerId, config]);

  useEffect(() => {
    const init = async () => {
      await initializeGoal();
      await loadData();
      setIsInitialized(true);
    };
    
    init();
  }, [trackerId, initializeGoal, loadData]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">トラッカーが見つかりません</h1>
          <p className="text-gray-600">指定されたトラッカーは存在しません。</p>
        </div>
      </div>
    );
  }

  const handleAddRecord = async (amount: number, note?: string) => {
    setIsLoading(true);
    try {
      await genericContainer.addGenericRecordUseCase.execute({
        userId: DEFAULT_USER_ID,
        trackerId,
        amount,
        note,
      });
      await loadData();
    } catch (error) {
      console.error('記録の追加に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-50 via-indigo-50 to-purple-50';
      case 'red':
        return 'from-red-50 via-pink-50 to-orange-50';
      case 'purple':
        return 'from-purple-50 via-violet-50 to-indigo-50';
      case 'green':
        return 'from-green-50 via-emerald-50 to-teal-50';
      default:
        return 'from-blue-50 via-indigo-50 to-purple-50';
    }
  };

  if (!isInitialized) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getColorClasses(config.color)} flex items-center justify-center`}>
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getColorClasses(config.color)}`}>
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ヘッダー */}
        <header className="text-center pt-4 pb-2">
          <div className="text-5xl mb-3">{config.emoji}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {config.name}トラッカー
          </h1>
          <p className="text-sm text-gray-600">
            健康的な{config.name}習慣を身につけよう
          </p>
        </header>

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* PC用：横2列レイアウト */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              {dailySummary && <GenericDailySummaryComponent summary={dailySummary} config={config} />}
            </div>
            
            <div className="space-y-6">
              <div className={`bg-gradient-to-br from-white to-${config.color}-50 rounded-3xl shadow-xl p-6 border border-${config.color}-100`}>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{config.name}を記録</h2>
                  <p className="text-sm text-gray-500">量をタップして記録しよう</p>
                </div>
                <GenericForm onSubmit={handleAddRecord} isLoading={isLoading} config={config} />
              </div>
              
              <GenericHistory records={records} config={config} />
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-500">
            健康的な1日を送りましょう ✨
          </p>
        </footer>
      </div>
    </div>
  );
}