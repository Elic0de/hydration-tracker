export interface UserId {
  readonly value: string;
}

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly dailyGoal: number; // ml
  readonly createdAt: Date;
  readonly updatedAt: Date;
}