import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecordId } from '@/domain/entities/HydrationRecord';

export interface DeleteHydrationRecordRequest {
  recordId: string;
}

export class DeleteHydrationRecordUseCase {
  constructor(private hydrationRecordRepository: HydrationRecordRepository) {}

  async execute(request: DeleteHydrationRecordRequest): Promise<void> {
    const recordId: HydrationRecordId = { value: request.recordId };
    
    // 削除前に記録が存在するか確認
    const existingRecord = await this.hydrationRecordRepository.findById(recordId);
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // 記録を削除
    await this.hydrationRecordRepository.delete(recordId);
  }
}