'use client';

import { useState, useEffect } from 'react';
import { container } from '@/infrastructure/di/container';
import { HydrationRecord } from '@/domain/entities/HydrationRecord';
import { DailyHydrationSummary } from '@/domain/value-objects/HydrationSummary';
import { ReminderSettings } from '@/application/use-cases/HydrationReminderUseCase';
import { WeeklyStatistics } from '@/application/use-cases/GetWeeklyStatisticsUseCase';
import { YearlyStatistics } from '@/application/use-cases/GetYearlyStatisticsUseCase';
import { DailyHourlyStatistics } from '@/application/use-cases/GetDailyHourlyStatisticsUseCase';
import { NextHydrationInfo } from '@/application/use-cases/GetNextHydrationTimeUseCase';
import HydrationForm from '@/presentation/components/HydrationForm';
import HydrationHistory from '@/presentation/components/HydrationHistory';
import DailySummary from '@/presentation/components/DailySummary';
import ReminderSettingsComponent from '@/presentation/components/ReminderSettings';
import ReminderNotification from '@/presentation/components/ReminderNotification';
import GoalSettings from '@/presentation/components/GoalSettings';
import WeeklyChart from '@/presentation/components/WeeklyChart';
import YearlyChart from '@/presentation/components/YearlyChart';
import DailyHourlyChart from '@/presentation/components/DailyHourlyChart';
import NextHydrationTimer from '@/presentation/components/NextHydrationTimer';

const DEFAULT_USER_ID = 'default-user';

export default function Home() {
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyHydrationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(2000);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');
  const [statsTab, setStatsTab] = useState<'today' | 'week' | 'year'>('today');
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatistics | null>(null);
  const [yearlyStats, setYearlyStats] = useState<YearlyStatistics | null>(null);
  const [todayHourlyStats, setTodayHourlyStats] = useState<DailyHourlyStatistics | null>(null);
  const [nextHydrationInfo, setNextHydrationInfo] = useState<NextHydrationInfo | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: false,
    intervalMinutes: 60,
    startTime: '08:00',
    endTime: '22:00',
  });

  const loadData = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // 今週の日曜日

      const [historyResult, summaryResult, weeklyResult, yearlyResult, hourlyResult, nextHydrationResult] = await Promise.all([
        container.getHydrationHistoryUseCase.execute({ userId: DEFAULT_USER_ID }),
        container.getDailyHydrationSummaryUseCase.execute({ 
          userId: DEFAULT_USER_ID, 
          date: today 
        }),
        container.getWeeklyStatisticsUseCase.execute({
          userId: DEFAULT_USER_ID,
          weekStartDate: weekStart
        }),
        container.getYearlyStatisticsUseCase.execute({
          userId: DEFAULT_USER_ID,
          year: today.getFullYear()
        }),
        container.getDailyHourlyStatisticsUseCase.execute({
          userId: DEFAULT_USER_ID,
          date: today
        }),
        container.getNextHydrationTimeUseCase.execute({
          userId: DEFAULT_USER_ID,
          reminderSettings
        })
      ]);

      setRecords(historyResult);
      setDailySummary(summaryResult);
      setWeeklyStats(weeklyResult);
      setYearlyStats(yearlyResult);
      setTodayHourlyStats(hourlyResult);
      setNextHydrationInfo(nextHydrationResult);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  };

  const initializeUser = async () => {
    try {
      console.log('Initializing user with ID:', DEFAULT_USER_ID);
      const existingUser = await container.userRepository.findById({ value: DEFAULT_USER_ID });
      console.log('Existing user:', existingUser);
      
      if (!existingUser) {
        console.log('Creating new user...');
        const newUser = await container.createUserUseCase.execute({
          userId: DEFAULT_USER_ID,
          name: 'デフォルトユーザー',
          dailyGoal: 2000,
        });
        console.log('Created user:', newUser);
        setCurrentGoal(2000);
      } else {
        console.log('Using existing user goal:', existingUser.dailyGoal);
        setCurrentGoal(existingUser.dailyGoal);
      }
    } catch (error) {
      console.error('ユーザーの初期化に失敗しました:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeUser();
      await loadData();
      setIsInitialized(true);
    };
    
    init();
  }, []);

  useEffect(() => {
    container.hydrationReminderUseCase.startReminder(
      reminderSettings,
      () => setShowReminder(true)
    );

    return () => {
      container.hydrationReminderUseCase.stopReminder();
    };
  }, [reminderSettings]);

  const handleAddRecord = async (amount: number, note?: string) => {
    setIsLoading(true);
    try {
      await container.addHydrationRecordUseCase.execute({
        userId: DEFAULT_USER_ID,
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

  const handleQuickDrink = async () => {
    await handleAddRecord(200);
  };

  const handleGoalUpdate = async (newGoal: number) => {
    setIsLoading(true);
    try {
      // ユーザーが存在しない場合は作成
      const existingUser = await container.userRepository.findById({ value: DEFAULT_USER_ID });
      if (!existingUser) {
        await container.createUserUseCase.execute({
          userId: DEFAULT_USER_ID,
          name: 'デフォルトユーザー',
          dailyGoal: newGoal,
        });
      } else {
        await container.updateGoalUseCase.execute({
          userId: DEFAULT_USER_ID,
          newDailyGoal: newGoal,
        });
      }
      setCurrentGoal(newGoal);
      
      // Save goal to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hydration-current-goal', newGoal.toString());
      }
      
      await loadData(); // データを再読み込み
    } catch (error) {
      console.error('目標の更新に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReminderSettingsChange = (settings: ReminderSettings) => {
    setReminderSettings(settings);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-reminder-settings', JSON.stringify(settings));
    }
  };

  // Load all settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load reminder settings
      const savedReminderSettings = localStorage.getItem('hydration-reminder-settings');
      if (savedReminderSettings) {
        try {
          const parsedSettings = JSON.parse(savedReminderSettings);
          setReminderSettings(parsedSettings);
        } catch (error) {
          console.error('Failed to parse reminder settings:', error);
        }
      }

      // Load active tab
      const savedActiveTab = localStorage.getItem('hydration-active-tab');
      if (savedActiveTab && ['home', 'stats', 'settings'].includes(savedActiveTab)) {
        setActiveTab(savedActiveTab as 'home' | 'stats' | 'settings');
      }

      // Load stats tab
      const savedStatsTab = localStorage.getItem('hydration-stats-tab');
      if (savedStatsTab && ['today', 'week', 'year'].includes(savedStatsTab)) {
        setStatsTab(savedStatsTab as 'today' | 'week' | 'year');
      }

      // Load current goal
      const savedGoal = localStorage.getItem('hydration-current-goal');
      if (savedGoal) {
        const goalValue = parseInt(savedGoal);
        if (goalValue > 0) {
          setCurrentGoal(goalValue);
        }
      }
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* PC用：横2列レイアウト */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          {dailySummary && <DailySummary summary={dailySummary} />}
          
          {nextHydrationInfo && (
            <NextHydrationTimer
              nextHydrationInfo={nextHydrationInfo}
              onDrinkNow={handleQuickDrink}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl p-6 border border-blue-100">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">水分補給を記録</h2>
              <p className="text-sm text-gray-500">飲んだ量をタップして記録しよう</p>
            </div>
            <HydrationForm onSubmit={handleAddRecord} isLoading={isLoading} />
          </div>
          
          <HydrationHistory records={records} />
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* 統計タブ切り替え */}
      <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
        <div className="grid grid-cols-3 gap-1">
          {[
            { key: 'today', label: '今日', emoji: '⏰' },
            { key: 'week', label: '週間', emoji: '📊' },
            { key: 'year', label: '年間', emoji: '📈' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                const newStatsTab = tab.key as typeof statsTab;
                setStatsTab(newStatsTab);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('hydration-stats-tab', newStatsTab);
                }
              }}
              className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                statsTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg">{tab.emoji}</div>
              <div className="text-xs">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 統計グラフ - PC用：大きなサイズ */}
      <div className="w-full">
        {statsTab === 'today' && todayHourlyStats && (
          <DailyHourlyChart data={todayHourlyStats} />
        )}
        {statsTab === 'week' && weeklyStats && (
          <WeeklyChart data={weeklyStats} />
        )}
        {statsTab === 'year' && yearlyStats && (
          <YearlyChart data={yearlyStats} />
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* PC用：横2列レイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalSettings
          currentGoal={currentGoal}
          onGoalUpdate={handleGoalUpdate}
          isLoading={isLoading}
        />
        <ReminderSettingsComponent 
          settings={reminderSettings}
          onSettingsChange={handleReminderSettingsChange}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ヘッダー */}
        <header className="text-center pt-4 pb-2">
          <div className="text-5xl mb-3">💧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            水分補給トラッカー
          </h1>
          <p className="text-sm text-gray-600">
            健康的な水分補給習慣を身につけよう
          </p>
        </header>

        {/* ナビゲーション */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 sticky top-4 z-10">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-1">
            {[
              { key: 'home', label: 'ホーム', emoji: '🏠' },
              { key: 'stats', label: '統計', emoji: '📊' },
              { key: 'settings', label: '設定', emoji: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  const newTab = tab.key as typeof activeTab;
                  setActiveTab(newTab);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('hydration-active-tab', newTab);
                  }
                }}
                className={`py-3 px-4 md:py-4 md:px-6 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg md:text-xl">{tab.emoji}</div>
                <div className="text-xs md:text-sm">{tab.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'settings' && renderSettingsTab()}

        {/* フッター */}
        <footer className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-500">
            健康的な1日を送りましょう ✨
          </p>
        </footer>

        {/* リマインダー通知 */}
        <ReminderNotification
          show={showReminder}
          onClose={() => setShowReminder(false)}
          onDrink={handleQuickDrink}
        />
      </div>
    </div>
  );
}
