import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { HydrationGoal, HydrationGoalId } from '@/domain/entities/HydrationGoal';
import { UserId } from '@/domain/entities/User';

export class ApiHydrationGoalRepository implements HydrationGoalRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async findById(id: HydrationGoalId): Promise<HydrationGoal | null> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-goals/${id.value}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error fetching hydration goal:', error);
      throw error;
    }
  }

  async save(goal: HydrationGoal): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapToDto(goal)),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving hydration goal:', error);
      throw error;
    }
  }

  async findByUserId(userId: UserId): Promise<HydrationGoal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-goals?userId=${userId.value}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((item: any) => this.mapToEntity(item));
    } catch (error) {
      console.error('Error fetching hydration goals by user:', error);
      throw error;
    }
  }

  async findActiveByUserId(userId: UserId): Promise<HydrationGoal | null> {
    try {
      const response = await fetch(`${this.baseUrl}/hydration-goals?userId=${userId.value}&active=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.length > 0 ? this.mapToEntity(data[0]) : null;
    } catch (error) {
      console.error('Error fetching active hydration goal:', error);
      throw error;
    }
  }

  private mapToEntity(data: any): HydrationGoal {
    return {
      id: { value: data.id },
      userId: { value: data.userId },
      dailyTarget: data.dailyTarget,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      isActive: data.isActive,
    };
  }

  private mapToDto(goal: HydrationGoal): any {
    return {
      id: goal.id.value,
      userId: goal.userId.value,
      dailyTarget: goal.dailyTarget,
      startDate: goal.startDate.toISOString(),
      endDate: goal.endDate?.toISOString(),
      isActive: goal.isActive,
    };
  }
}