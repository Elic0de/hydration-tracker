import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecord, HydrationRecordId } from '@/domain/entities/HydrationRecord';
import { UserId } from '@/domain/entities/User';

interface HydrationRecordStorageDto {
  id: { value: string };
  userId: { value: string };
  amount: number;
  timestamp: string;
  note?: string;
}

export class LocalStorageHydrationRecordRepository implements HydrationRecordRepository {
  private readonly STORAGE_KEY = 'hydration-tracker-records';

  async findById(id: HydrationRecordId): Promise<HydrationRecord | null> {
    const records = this.getRecords();
    return records.find(record => record.id.value === id.value) || null;
  }

  async save(record: HydrationRecord): Promise<void> {
    const records = this.getRecords();
    const index = records.findIndex(r => r.id.value === record.id.value);
    
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    
    this.setRecords(records);
  }

  async findByUserId(userId: UserId): Promise<HydrationRecord[]> {
    const records = this.getRecords();
    return records.filter(record => record.userId.value === userId.value);
  }

  async findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<HydrationRecord[]> {
    const records = this.getRecords();
    return records.filter(record => 
      record.userId.value === userId.value &&
      record.timestamp >= startDate &&
      record.timestamp <= endDate
    );
  }

  async delete(id: HydrationRecordId): Promise<void> {
    const records = this.getRecords();
    const filteredRecords = records.filter(record => record.id.value !== id.value);
    this.setRecords(filteredRecords);
  }

  private getRecords(): HydrationRecord[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: HydrationRecordStorageDto) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch {
      return [];
    }
  }

  private setRecords(records: HydrationRecord[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }
}