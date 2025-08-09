import { HydrationRecord, HydrationRecordId } from '../entities/HydrationRecord';
import { UserId } from '../entities/User';

export interface HydrationRecordRepository {
  findById(id: HydrationRecordId): Promise<HydrationRecord | null>;
  save(record: HydrationRecord): Promise<void>;
  findByUserId(userId: UserId): Promise<HydrationRecord[]>;
  findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<HydrationRecord[]>;
  delete(id: HydrationRecordId): Promise<void>;
}