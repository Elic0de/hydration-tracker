import { GenericRecord, GenericRecordId } from '@/domain/entities/GenericRecord';
import { GenericRecordRepository } from '@/domain/repositories/GenericRecordRepository';

export interface AddGenericRecordRequest {
  userId: string;
  trackerId: string;
  amount: number;
  note?: string;
}

export class AddGenericRecordUseCase {
  constructor(
    private readonly genericRecordRepository: GenericRecordRepository
  ) {}

  async execute(request: AddGenericRecordRequest): Promise<void> {
    const recordId = new GenericRecordId(crypto.randomUUID());
    
    const record = new GenericRecord(
      recordId,
      request.userId,
      request.trackerId,
      request.amount,
      request.note || null,
      new Date()
    );

    await this.genericRecordRepository.save(record);
  }
}