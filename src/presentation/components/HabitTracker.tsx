'use client';

import { useState, useEffect, useCallback } from 'react';
import { HydrationRecord } from '@/domain/entities/HydrationRecord';
import { DailyHydrationSummary } from '@/domain/value-objects/HydrationSummary';

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  weeklyGoalAchievement: number;
  monthlyGoalAchievement: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedDate?: Date;
  condition: string;
}

interface HabitTrackerProps {
  records: HydrationRecord[];
  dailySummary: DailyHydrationSummary | null;
  currentGoal: number;
}

const BADGES: Badge[] = [
  {
    id: 'first_record',
    name: '初回記録',
    description: '初めての水分補給を記録',
    emoji: '🥇',
    earned: false,
    condition: '1回記録'
  },
  {
    id: 'goal_achiever',
    name: '目標達成者',
    description: '1日の目標を達成',
    emoji: '🎯',
    earned: false,
    condition: '目標達成'
  },
  {
    id: 'week_warrior',
    name: '週間戦士',
    description: '7日連続で目標達成',
    emoji: '⚔️',
    earned: false,
    condition: '7日連続達成'
  },
  {
    id: 'hydration_master',
    name: '水分補給マスター',
    description: '30日連続で目標達成',
    emoji: '👑',
    earned: false,
    condition: '30日連続達成'
  },
  {
    id: 'consistency_king',
    name: '継続の王',
    description: '100日連続で記録',
    emoji: '🏆',
    earned: false,
    condition: '100日連続記録'
  },
  {
    id: 'overachiever',
    name: 'オーバーアチーバー',
    description: '目標の150%達成',
    emoji: '🚀',
    earned: false,
    condition: '目標150%達成'
  },
  {
    id: 'early_bird',
    name: 'アーリーバード',
    description: '朝6時前に記録を3回',
    emoji: '🐦',
    earned: false,
    condition: '早朝記録3回'
  },
  {
    id: 'night_owl',
    name: 'ナイトアウル',
    description: '夜22時以降に記録を3回',
    emoji: '🦉',
    earned: false,
    condition: '深夜記録3回'
  },
  {
    id: 'perfect_week',
    name: 'パーフェクトウィーク',
    description: '1週間毎日目標達成',
    emoji: '💎',
    earned: false,
    condition: '週間完璧達成'
  },
  {
    id: 'comeback_kid',
    name: 'カムバックキッド',
    description: '5日以上のブランクから復帰',
    emoji: '💪',
    earned: false,
    condition: 'ブランク後復帰'
  }
];

export default function HabitTracker({ records, dailySummary, currentGoal }: HabitTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<HabitStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    weeklyGoalAchievement: 0,
    monthlyGoalAchievement: 0,
    badges: BADGES
  });

  const calculateBadges = useCallback((
    records: HydrationRecord[], 
    dailyTotals: Map<string, number>, 
    currentGoal: number,
    stats: HabitStats
  ): Badge[] => {
    const badges = [...BADGES];
    const today = new Date();

    badges.forEach(badge => {
      if (badge.earned) return; // Skip already earned badges

      switch (badge.id) {
        case 'first_record':
          if (records.length > 0) {
            badge.earned = true;
            badge.earnedDate = new Date(records[0].timestamp);
          }
          break;

        case 'goal_achiever':
          if (dailySummary && dailySummary.totalAmount >= currentGoal) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'week_warrior':
          if (stats.currentStreak >= 7) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'hydration_master':
          if (stats.currentStreak >= 30) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'consistency_king':
          if (stats.totalDays >= 100) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'overachiever':
          if (dailySummary && dailySummary.totalAmount >= currentGoal * 1.5) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'early_bird':
          const earlyRecords = records.filter(r => {
            const hour = new Date(r.timestamp).getHours();
            return hour < 6;
          });
          if (earlyRecords.length >= 3) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'night_owl':
          const lateRecords = records.filter(r => {
            const hour = new Date(r.timestamp).getHours();
            return hour >= 22;
          });
          if (lateRecords.length >= 3) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'perfect_week':
          if (stats.weeklyGoalAchievement === 100 && stats.currentStreak >= 7) {
            badge.earned = true;
            badge.earnedDate = today;
          }
          break;

        case 'comeback_kid':
          // This would need more complex logic to track breaks and comebacks
          // For now, we'll skip this implementation
          break;
      }
    });

    return badges;
  }, [dailySummary]);

  const calculateStats = useCallback(() => {
    if (!records || records.length === 0) return;

    // Calculate daily achievements
    const dailyTotals = new Map<string, number>();
    records.forEach(record => {
      const date = new Date(record.timestamp).toDateString();
      dailyTotals.set(date, (dailyTotals.get(date) || 0) + record.amount);
    });

    const sortedDates = Array.from(dailyTotals.keys()).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Check if today or yesterday has records (to maintain streak)
    const hasRecentRecord = dailyTotals.has(today) || dailyTotals.has(yesterday);
    
    if (hasRecentRecord) {
      for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const amount = dailyTotals.get(date) || 0;
        
        if (amount >= currentGoal) {
          if (i === 0) currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === 0) break; // Current streak ends
          tempStreak = 0;
        }
      }
    }

    // Calculate weekly and monthly achievement rates
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let weeklyAchievements = 0;
    let monthlyAchievements = 0;
    let weeklyDays = 0;
    let monthlyDays = 0;

    dailyTotals.forEach((amount, dateStr) => {
      const date = new Date(dateStr);
      if (date >= weekAgo) {
        weeklyDays++;
        if (amount >= currentGoal) weeklyAchievements++;
      }
      if (date >= monthAgo) {
        monthlyDays++;
        if (amount >= currentGoal) monthlyAchievements++;
      }
    });

    const weeklyGoalAchievement = weeklyDays > 0 ? (weeklyAchievements / weeklyDays) * 100 : 0;
    const monthlyGoalAchievement = monthlyDays > 0 ? (monthlyAchievements / monthlyDays) * 100 : 0;

    // Calculate and update badges
    const updatedBadges = calculateBadges(records, dailyTotals, currentGoal, {
      currentStreak,
      longestStreak,
      totalDays: dailyTotals.size,
      weeklyGoalAchievement,
      monthlyGoalAchievement,
      badges: BADGES
    });

    setStats({
      currentStreak,
      longestStreak,
      totalDays: dailyTotals.size,
      weeklyGoalAchievement,
      monthlyGoalAchievement,
      badges: updatedBadges
    });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-habit-stats', JSON.stringify({
        currentStreak,
        longestStreak,
        totalDays: dailyTotals.size,
        weeklyGoalAchievement,
        monthlyGoalAchievement,
        badges: updatedBadges
      }));
    }
  }, [records, currentGoal, calculateBadges]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);


  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💪';
    if (streak >= 3) return '👍';
    return '🌱';
  };

  const getMotivationalMessage = () => {
    const { currentStreak } = stats;
    
    if (currentStreak === 0) {
      return "今日から新しいスタートを切りましょう！";
    } else if (currentStreak < 3) {
      return `${currentStreak}日継続中！調子いいですね！`;
    } else if (currentStreak < 7) {
      return `${currentStreak}日継続中！習慣化まであと少し！`;
    } else if (currentStreak < 30) {
      return `${currentStreak}日継続中！素晴らしい習慣です！`;
    } else {
      return `${currentStreak}日継続中！あなたは真の水分補給マスターです！`;
    }
  };

  const earnedBadges = stats.badges.filter(b => b.earned);
  const unearnedBadges = stats.badges.filter(b => !b.earned);

  return (
    <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-lg p-6 border border-yellow-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🏃‍♂️</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">習慣トラッカー</h3>
            <p className="text-sm text-gray-500">
              {stats.currentStreak}日連続 • バッジ {earnedBadges.length}個
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-2xl mr-2">{getStreakEmoji(stats.currentStreak)}</div>
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 簡易統計 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">日連続達成</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
          <div className="text-xs text-gray-500">獲得バッジ</div>
        </div>
      </div>

      {/* モチベーションメッセージ */}
      <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 text-center border border-yellow-200">
        <p className="text-sm text-yellow-800 font-medium">{getMotivationalMessage()}</p>
      </div>

      {/* 詳細統計 */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* 統計詳細 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">📊 詳細統計</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-blue-600">{stats.longestStreak}</div>
                <div className="text-xs text-gray-500">最長連続記録</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-green-600">{stats.totalDays}</div>
                <div className="text-xs text-gray-500">総記録日数</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-purple-600">{Math.round(stats.weeklyGoalAchievement)}%</div>
                <div className="text-xs text-gray-500">週間達成率</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-red-600">{Math.round(stats.monthlyGoalAchievement)}%</div>
                <div className="text-xs text-gray-500">月間達成率</div>
              </div>
            </div>
          </div>

          {/* 獲得済みバッジ */}
          {earnedBadges.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">🏆 獲得済みバッジ</h4>
              <div className="grid grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl p-3 text-center shadow-md">
                    <div className="text-2xl mb-1">{badge.emoji}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                    <div className="text-xs opacity-90 mt-1">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 未獲得バッジ */}
          {unearnedBadges.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">🎯 チャレンジ中</h4>
              <div className="grid grid-cols-3 gap-3">
                {unearnedBadges.slice(0, 6).map((badge) => (
                  <div key={badge.id} className="bg-gray-100 text-gray-600 rounded-2xl p-3 text-center border-2 border-dashed border-gray-300">
                    <div className="text-2xl mb-1 opacity-50">{badge.emoji}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                    <div className="text-xs opacity-75 mt-1">{badge.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 継続のコツ */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-xl mr-2">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">継続のコツ</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 毎日同じ時間に記録する習慣をつける</li>
                  <li>• 小さな目標から始めて徐々に増やす</li>
                  <li>• バッジ獲得を目標にしてモチベーションを維持</li>
                  <li>• 連続記録が途切れても諦めずに再開する</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}