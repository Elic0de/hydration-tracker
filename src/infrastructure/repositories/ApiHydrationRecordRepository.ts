import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { HydrationRecord, HydrationRecordId } from '@/domain/entities/HydrationRecord';
import { UserId } from '@/domain/entities/User';

interface HydrationRecordDto {
  id: string;
  userId: string;
  amount: number;
  timestamp: string;
  note?: string;
}

export class ApiHydrationRecordRepository implements HydrationRecordRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async findById(id: HydrationRecordId): Promise<HydrationRecord | null> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-records/${id.value}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error fetching hydration record:', error);
      throw error;
    }
  }

  async save(record: HydrationRecord): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapToDto(record)),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving hydration record:', error);
      throw error;
    }
  }

  async findByUserId(userId: UserId): Promise<HydrationRecord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-records?userId=${userId.value}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((item: HydrationRecordDto) => this.mapToEntity(item));
    } catch (error) {
      console.error('Error fetching hydration records by user:', error);
      throw error;
    }
  }

  async findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<HydrationRecord[]> {
    try {
      const params = new URLSearchParams({
        userId: userId.value,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`${this.baseUrl}/hydration-records?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((item: HydrationRecordDto) => this.mapToEntity(item));
    } catch (error) {
      console.error('Error fetching hydration records by date range:', error);
      throw error;
    }
  }

  async delete(id: HydrationRecordId): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-records/${id.value}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting hydration record:', error);
      throw error;
    }
  }

  private mapToEntity(data: HydrationRecordDto): HydrationRecord {
    return {
      id: { value: data.id },
      userId: { value: data.userId },
      amount: data.amount,
      timestamp: new Date(data.timestamp),
      note: data.note,
    };
  }

  private mapToDto(record: HydrationRecord): HydrationRecordDto {
    return {
      id: record.id.value,
      userId: record.userId.value,
      amount: record.amount,
      timestamp: record.timestamp.toISOString(),
      note: record.note,
    };
  }
}