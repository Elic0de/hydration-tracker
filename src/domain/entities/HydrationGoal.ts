import { UserId } from './User';

export interface HydrationGoalId {
  readonly value: string;
}

export interface HydrationGoal {
  readonly id: HydrationGoalId;
  readonly userId: UserId;
  readonly dailyTarget: number; // ml
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly isActive: boolean;
}