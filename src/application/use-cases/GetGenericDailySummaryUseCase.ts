import { GenericRecordRepository } from '@/domain/repositories/GenericRecordRepository';
import { GenericGoalRepository } from '@/domain/repositories/GenericGoalRepository';

export interface GetGenericDailySummaryRequest {
  userId: string;
  trackerId: string;
  date: Date;
}

export interface GenericDailySummary {
  date: Date;
  totalAmount: number;
  goalAmount: number;
  achievementRate: number;
  recordCount: number;
  trackerId: string;
}

export class GetGenericDailySummaryUseCase {
  constructor(
    private readonly genericRecordRepository: GenericRecordRepository,
    private readonly genericGoalRepository: GenericGoalRepository
  ) {}

  async execute(request: GetGenericDailySummaryRequest): Promise<GenericDailySummary> {
    const startOfDay = new Date(request.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(request.date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.genericRecordRepository.findByUserIdTrackerAndDateRange(
      request.userId,
      request.trackerId,
      startOfDay,
      endOfDay
    );

    const goal = await this.genericGoalRepository.findByUserIdAndTracker(
      request.userId,
      request.trackerId
    );

    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    const goalAmount = goal?.dailyGoal || 0;
    const achievementRate = goalAmount > 0 ? totalAmount / goalAmount : 0;

    return {
      date: request.date,
      totalAmount,
      goalAmount,
      achievementRate,
      recordCount: records.length,
      trackerId: request.trackerId,
    };
  }
}