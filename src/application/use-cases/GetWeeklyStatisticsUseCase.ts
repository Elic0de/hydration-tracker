import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { DailyHydrationSummary } from '@/domain/value-objects/HydrationSummary';
import { UserId } from '@/domain/entities/User';

export interface WeeklyStatistics {
  weekStartDate: Date;
  dailyData: DailyHydrationSummary[];
  weeklyTotal: number;
  weeklyAverage: number;
  goalAchievementDays: number;
}

export interface GetWeeklyStatisticsRequest {
  userId: string;
  weekStartDate: Date;
}

export class GetWeeklyStatisticsUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository,
    private hydrationGoalRepository: HydrationGoalRepository
  ) {}

  async execute(request: GetWeeklyStatisticsRequest): Promise<WeeklyStatistics> {
    const userId: UserId = { value: request.userId };
    const weekEnd = new Date(request.weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const [records, activeGoal] = await Promise.all([
      this.hydrationRecordRepository.findByUserIdAndDateRange(
        userId, 
        request.weekStartDate, 
        weekEnd
      ),
      this.hydrationGoalRepository.findActiveByUserId(userId)
    ]);

    const dailyData: DailyHydrationSummary[] = [];
    const goalAmount = activeGoal?.dailyTarget || 2000;
    let weeklyTotal = 0;
    let goalAchievementDays = 0;

    // 一週間の各日のデータを生成
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(request.weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.toDateString() === currentDate.toDateString();
      });

      const totalAmount = dayRecords.reduce((sum, record) => sum + record.amount, 0);
      const achievementRate = totalAmount / goalAmount;

      if (achievementRate >= 1) {
        goalAchievementDays++;
      }

      weeklyTotal += totalAmount;

      dailyData.push({
        date: currentDate,
        totalAmount,
        goalAmount,
        achievementRate: Math.min(achievementRate, 1),
        recordCount: dayRecords.length,
      });
    }

    return {
      weekStartDate: request.weekStartDate,
      dailyData,
      weeklyTotal,
      weeklyAverage: Math.round(weeklyTotal / 7),
      goalAchievementDays,
    };
  }
}