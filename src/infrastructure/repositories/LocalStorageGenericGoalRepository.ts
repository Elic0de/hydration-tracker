import { GenericGoal, GenericGoalId } from '@/domain/entities/GenericGoal';
import { GenericGoalRepository } from '@/domain/repositories/GenericGoalRepository';

interface GenericGoalStorageDto {
  id: { value: string };
  userId: string;
  trackerId: string;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export class LocalStorageGenericGoalRepository implements GenericGoalRepository {
  private readonly storageKey = 'generic-goals';

  private getGoals(): GenericGoal[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((item: GenericGoalStorageDto) => new GenericGoal(
        new GenericGoalId(item.id.value),
        item.userId,
        item.trackerId,
        item.dailyGoal,
        new Date(item.createdAt),
        new Date(item.updatedAt)
      ));
    } catch (error) {
      console.error('Error loading generic goals from localStorage:', error);
      return [];
    }
  }

  private saveGoals(goals: GenericGoal[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = goals.map(goal => ({
        id: { value: goal.id.value },
        userId: goal.userId,
        trackerId: goal.trackerId,
        dailyGoal: goal.dailyGoal,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving generic goals to localStorage:', error);
    }
  }

  async save(goal: GenericGoal): Promise<void> {
    const goals = this.getGoals();
    const existingIndex = goals.findIndex(g => g.id.value === goal.id.value);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    this.saveGoals(goals);
  }

  async findByUserIdAndTracker(userId: string, trackerId: string): Promise<GenericGoal | null> {
    const goals = this.getGoals();
    return goals.find(goal => 
      goal.userId === userId && goal.trackerId === trackerId
    ) || null;
  }

  async findById(id: GenericGoalId): Promise<GenericGoal | null> {
    const goals = this.getGoals();
    return goals.find(goal => goal.id.value === id.value) || null;
  }
}