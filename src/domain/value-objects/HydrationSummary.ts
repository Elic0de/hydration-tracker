export interface DailyHydrationSummary {
  readonly date: Date;
  readonly totalAmount: number; // ml
  readonly goalAmount: number; // ml
  readonly achievementRate: number; // 0-1
  readonly recordCount: number;
}

export interface WeeklyHydrationSummary {
  readonly weekStartDate: Date;
  readonly dailySummaries: DailyHydrationSummary[];
  readonly averageDailyAmount: number;
  readonly weeklyGoalAchievementRate: number;
}