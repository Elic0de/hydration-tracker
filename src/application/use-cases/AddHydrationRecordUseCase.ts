import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecord, HydrationRecordId } from '@/domain/entities/HydrationRecord';
import { UserId } from '@/domain/entities/User';

export interface AddHydrationRecordRequest {
  userId: string;
  amount: number;
  note?: string;
}

export class AddHydrationRecordUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository
  ) {}

  async execute(request: AddHydrationRecordRequest): Promise<void> {
    const record: HydrationRecord = {
      id: { value: crypto.randomUUID() },
      userId: { value: request.userId },
      amount: request.amount,
      timestamp: new Date(),
      note: request.note,
    };

    await this.hydrationRecordRepository.save(record);
  }
}