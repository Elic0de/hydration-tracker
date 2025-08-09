import { GenericRecord } from '@/domain/entities/GenericRecord';
import { GenericRecordRepository } from '@/domain/repositories/GenericRecordRepository';

export interface GetGenericHistoryRequest {
  userId: string;
  trackerId: string;
}

export class GetGenericHistoryUseCase {
  constructor(
    private readonly genericRecordRepository: GenericRecordRepository
  ) {}

  async execute(request: GetGenericHistoryRequest): Promise<GenericRecord[]> {
    const records = await this.genericRecordRepository.findByUserIdAndTracker(
      request.userId,
      request.trackerId
    );
    
    // Sort by recorded date in descending order
    return records.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }
}