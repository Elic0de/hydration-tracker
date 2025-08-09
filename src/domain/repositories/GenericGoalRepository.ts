import { GenericGoal, GenericGoalId } from '../entities/GenericGoal';

export interface GenericGoalRepository {
  save(goal: GenericGoal): Promise<void>;
  findByUserIdAndTracker(userId: string, trackerId: string): Promise<GenericGoal | null>;
  findById(id: GenericGoalId): Promise<GenericGoal | null>;
}