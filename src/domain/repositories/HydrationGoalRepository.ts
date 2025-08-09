import { HydrationGoal, HydrationGoalId } from '../entities/HydrationGoal';
import { UserId } from '../entities/User';

export interface HydrationGoalRepository {
  findById(id: HydrationGoalId): Promise<HydrationGoal | null>;
  save(goal: HydrationGoal): Promise<void>;
  findByUserId(userId: UserId): Promise<HydrationGoal[]>;
  findActiveByUserId(userId: UserId): Promise<HydrationGoal | null>;
}