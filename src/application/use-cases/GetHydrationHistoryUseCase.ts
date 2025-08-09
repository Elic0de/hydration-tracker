import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecord } from '@/domain/entities/HydrationRecord';
import { UserId } from '@/domain/entities/User';

export interface GetHydrationHistoryRequest {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetHydrationHistoryUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository
  ) {}

  async execute(request: GetHydrationHistoryRequest): Promise<HydrationRecord[]> {
    const userId: UserId = { value: request.userId };

    if (request.startDate && request.endDate) {
      return await this.hydrationRecordRepository.findByUserIdAndDateRange(
        userId,
        request.startDate,
        request.endDate
      );
    }

    const records = await this.hydrationRecordRepository.findByUserId(userId);
    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}