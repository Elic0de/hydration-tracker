import { GenericRecord, GenericRecordId } from '../entities/GenericRecord';

export interface GenericRecordRepository {
  save(record: GenericRecord): Promise<void>;
  findByUserIdAndTracker(userId: string, trackerId: string): Promise<GenericRecord[]>;
  findByUserIdTrackerAndDateRange(
    userId: string,
    trackerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GenericRecord[]>;
  findById(id: GenericRecordId): Promise<GenericRecord | null>;
}