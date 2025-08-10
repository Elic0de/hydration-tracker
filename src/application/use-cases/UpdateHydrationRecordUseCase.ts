import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecordId } from '@/domain/entities/HydrationRecord';

export interface UpdateHydrationRecordRequest {
  recordId: string;
  amount: number;
  note?: string;
}

export class UpdateHydrationRecordUseCase {
  constructor(private hydrationRecordRepository: HydrationRecordRepository) {}

  async execute(request: UpdateHydrationRecordRequest): Promise<void> {
    const recordId: HydrationRecordId = { value: request.recordId };
    
    // 既存の記録を取得
    const existingRecord = await this.hydrationRecordRepository.findById(recordId);
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // 更新されたレコードを作成
    const updatedRecord = {
      ...existingRecord,
      amount: request.amount,
      note: request.note,
      // タイムスタンプは変更しない（編集時刻ではなく元の記録時刻を保持）
    };

    // 保存（saveメソッドはcreateとupdateを兼ねている）
    await this.hydrationRecordRepository.save(updatedRecord);
  }
}