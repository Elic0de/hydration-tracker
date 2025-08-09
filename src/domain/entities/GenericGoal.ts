export class GenericGoalId {
  constructor(public readonly value: string) {}
}

export class GenericGoal {
  constructor(
    public readonly id: GenericGoalId,
    public readonly userId: string,
    public readonly trackerId: string,
    public readonly dailyGoal: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}