import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { DailyHydrationSummary } from '@/domain/value-objects/HydrationSummary';
import { UserId } from '@/domain/entities/User';

export interface GetDailyHydrationSummaryRequest {
  userId: string;
  date: Date;
}

export class GetDailyHydrationSummaryUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository,
    private hydrationGoalRepository: HydrationGoalRepository
  ) {}

  async execute(request: GetDailyHydrationSummaryRequest): Promise<DailyHydrationSummary> {
    const userId: UserId = { value: request.userId };
    const startOfDay = new Date(request.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(request.date);
    endOfDay.setHours(23, 59, 59, 999);

    const [records, activeGoal] = await Promise.all([
      this.hydrationRecordRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay),
      this.hydrationGoalRepository.findActiveByUserId(userId)
    ]);

    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    const goalAmount = activeGoal?.dailyTarget || 2000; // デフォルト2L
    const achievementRate = Math.min(totalAmount / goalAmount, 1);

    return {
      date: request.date,
      totalAmount,
      goalAmount,
      achievementRate,
      recordCount: records.length,
    };
  }
}