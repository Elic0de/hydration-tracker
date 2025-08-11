import { GenericRecord, GenericRecordId } from '@/domain/entities/GenericRecord';
import { GenericRecordRepository } from '@/domain/repositories/GenericRecordRepository';

interface GenericRecordStorageDto {
  id: { value: string };
  userId: string;
  trackerId: string;
  amount: number;
  note?: string;
  recordedAt: string;
}

export class LocalStorageGenericRecordRepository implements GenericRecordRepository {
  private readonly storageKey = 'generic-records';

  private getRecords(): GenericRecord[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((item: GenericRecordStorageDto) => new GenericRecord(
        new GenericRecordId(item.id.value),
        item.userId,
        item.trackerId,
        item.amount,
        item.note ?? null,
        new Date(item.recordedAt)
      ));
    } catch (error) {
      console.error('Error loading generic records from localStorage:', error);
      return [];
    }
  }

  private saveRecords(records: GenericRecord[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = records.map(record => ({
        id: { value: record.id.value },
        userId: record.userId,
        trackerId: record.trackerId,
        amount: record.amount,
        note: record.note,
        recordedAt: record.recordedAt.toISOString(),
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving generic records to localStorage:', error);
    }
  }

  async save(record: GenericRecord): Promise<void> {
    const records = this.getRecords();
    const existingIndex = records.findIndex(r => r.id.value === record.id.value);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    this.saveRecords(records);
  }

  async findByUserIdAndTracker(userId: string, trackerId: string): Promise<GenericRecord[]> {
    const records = this.getRecords();
    return records.filter(record => 
      record.userId === userId && record.trackerId === trackerId
    );
  }

  async findByUserIdTrackerAndDateRange(
    userId: string,
    trackerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GenericRecord[]> {
    const records = this.getRecords();
    return records.filter(record =>
      record.userId === userId &&
      record.trackerId === trackerId &&
      record.recordedAt >= startDate &&
      record.recordedAt <= endDate
    );
  }

  async findById(id: GenericRecordId): Promise<GenericRecord | null> {
    const records = this.getRecords();
    return records.find(record => record.id.value === id.value) || null;
  }
}