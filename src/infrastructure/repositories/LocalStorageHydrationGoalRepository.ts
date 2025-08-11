import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { HydrationGoal, HydrationGoalId } from '@/domain/entities/HydrationGoal';
import { UserId } from '@/domain/entities/User';

interface HydrationGoalStorageDto {
  id: { value: string };
  userId: { value: string };
  dailyTarget: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export class LocalStorageHydrationGoalRepository implements HydrationGoalRepository {
  private readonly STORAGE_KEY = 'hydration-tracker-goals';

  async findById(id: HydrationGoalId): Promise<HydrationGoal | null> {
    const goals = this.getGoals();
    return goals.find(goal => goal.id.value === id.value) || null;
  }

  async save(goal: HydrationGoal): Promise<void> {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id.value === goal.id.value);
    
    if (index >= 0) {
      goals[index] = goal;
    } else {
      goals.push(goal);
    }
    
    this.setGoals(goals);
  }

  async findByUserId(userId: UserId): Promise<HydrationGoal[]> {
    const goals = this.getGoals();
    return goals.filter(goal => goal.userId.value === userId.value);
  }

  async findActiveByUserId(userId: UserId): Promise<HydrationGoal | null> {
    const goals = this.getGoals();
    return goals.find(goal => 
      goal.userId.value === userId.value && goal.isActive
    ) || null;
  }

  private getGoals(): HydrationGoal[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: HydrationGoalStorageDto) => ({
        ...item,
        startDate: new Date(item.startDate),
        endDate: item.endDate ? new Date(item.endDate) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private setGoals(goals: HydrationGoal[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
  }
}