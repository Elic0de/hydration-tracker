import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { UserId } from '@/domain/entities/User';

export interface HourlyStatistics {
  hour: number;
  amount: number;
  recordCount: number;
}

export interface DailyHourlyStatistics {
  date: Date;
  hourlyData: HourlyStatistics[];
  peakHour: number;
  totalAmount: number;
}

export interface GetDailyHourlyStatisticsRequest {
  userId: string;
  date: Date;
}

export class GetDailyHourlyStatisticsUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository
  ) {}

  async execute(request: GetDailyHourlyStatisticsRequest): Promise<DailyHourlyStatistics> {
    const userId: UserId = { value: request.userId };
    const startOfDay = new Date(request.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(request.date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.hydrationRecordRepository.findByUserIdAndDateRange(
      userId, 
      startOfDay, 
      endOfDay
    );

    const hourlyData: HourlyStatistics[] = [];
    let peakHour = 0;
    let maxAmount = 0;
    let totalAmount = 0;

    // 24時間分のデータを初期化
    for (let hour = 0; hour < 24; hour++) {
      const hourRecords = records.filter(record => 
        record.timestamp.getHours() === hour
      );

      const hourAmount = hourRecords.reduce((sum, record) => sum + record.amount, 0);
      totalAmount += hourAmount;

      if (hourAmount > maxAmount) {
        maxAmount = hourAmount;
        peakHour = hour;
      }

      hourlyData.push({
        hour,
        amount: hourAmount,
        recordCount: hourRecords.length,
      });
    }

    return {
      date: request.date,
      hourlyData,
      peakHour,
      totalAmount,
    };
  }
}