import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { UserId } from '@/domain/entities/User';

export interface MonthlyStatistics {
  month: Date;
  totalAmount: number;
  averageAmount: number;
  goalAchievementRate: number;
  recordCount: number;
}

export interface YearlyStatistics {
  year: number;
  monthlyData: MonthlyStatistics[];
  yearlyTotal: number;
  yearlyAverage: number;
  bestMonth: MonthlyStatistics | null;
  totalGoalAchievementDays: number;
}

export interface GetYearlyStatisticsRequest {
  userId: string;
  year: number;
}

export class GetYearlyStatisticsUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository,
    private hydrationGoalRepository: HydrationGoalRepository
  ) {}

  async execute(request: GetYearlyStatisticsRequest): Promise<YearlyStatistics> {
    const userId: UserId = { value: request.userId };
    const yearStart = new Date(request.year, 0, 1);
    const yearEnd = new Date(request.year, 11, 31, 23, 59, 59, 999);

    const [records, activeGoal] = await Promise.all([
      this.hydrationRecordRepository.findByUserIdAndDateRange(userId, yearStart, yearEnd),
      this.hydrationGoalRepository.findActiveByUserId(userId)
    ]);

    const goalAmount = activeGoal?.dailyTarget || 2000;
    const monthlyData: MonthlyStatistics[] = [];
    let yearlyTotal = 0;
    let totalGoalAchievementDays = 0;

    // 12ヶ月分のデータを生成
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(request.year, month, 1);
      const monthEnd = new Date(request.year, month + 1, 0, 23, 59, 59, 999);
      
      const monthRecords = records.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      const monthTotal = monthRecords.reduce((sum, record) => sum + record.amount, 0);
      const daysInMonth = monthEnd.getDate();
      const averageAmount = monthTotal / daysInMonth;
      
      // その月の目標達成日数を計算
      const dailyTotals = new Map<string, number>();
      monthRecords.forEach(record => {
        const dateKey = record.timestamp.toDateString();
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + record.amount);
      });

      let monthGoalAchievementDays = 0;
      dailyTotals.forEach(dailyTotal => {
        if (dailyTotal >= goalAmount) {
          monthGoalAchievementDays++;
        }
      });

      totalGoalAchievementDays += monthGoalAchievementDays;
      yearlyTotal += monthTotal;

      monthlyData.push({
        month: monthStart,
        totalAmount: monthTotal,
        averageAmount: Math.round(averageAmount),
        goalAchievementRate: monthGoalAchievementDays / daysInMonth,
        recordCount: monthRecords.length,
      });
    }

    // 最も良い月を特定
    const bestMonth = monthlyData.reduce((best, current) => 
      current.totalAmount > (best?.totalAmount || 0) ? current : best
    , null as MonthlyStatistics | null);

    return {
      year: request.year,
      monthlyData,
      yearlyTotal,
      yearlyAverage: Math.round(yearlyTotal / 365),
      bestMonth,
      totalGoalAchievementDays,
    };
  }
}