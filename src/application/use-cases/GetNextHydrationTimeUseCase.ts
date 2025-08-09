import { HydrationRecordRepository } from '@/domain/repositories/HydrationRecordRepository';
import { UserId } from '@/domain/entities/User';
import { ReminderSettings } from './HydrationReminderUseCase';

export interface NextHydrationInfo {
  nextReminderTime: Date | null;
  timeSinceLastDrink: number; // minutes
  lastDrinkTime: Date | null;
  shouldDrinkNow: boolean;
  timeUntilNext: number; // minutes
  recommendedIntake: number; // ml
}

export interface GetNextHydrationTimeRequest {
  userId: string;
  reminderSettings: ReminderSettings;
}

export class GetNextHydrationTimeUseCase {
  constructor(
    private hydrationRecordRepository: HydrationRecordRepository
  ) {}

  async execute(request: GetNextHydrationTimeRequest): Promise<NextHydrationInfo> {
    const userId: UserId = { value: request.userId };
    const now = new Date();
    
    // 今日の記録を取得
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayRecords = await this.hydrationRecordRepository.findByUserIdAndDateRange(
      userId, 
      startOfDay, 
      endOfDay
    );

    // 最後の飲用時間を取得
    const lastRecord = todayRecords
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    const lastDrinkTime = lastRecord ? lastRecord.timestamp : null;
    const timeSinceLastDrink = lastDrinkTime 
      ? Math.floor((now.getTime() - lastDrinkTime.getTime()) / (1000 * 60))
      : null;

    // 次のリマインダー時間を計算
    let nextReminderTime: Date | null = null;
    let timeUntilNext = 0;
    let shouldDrinkNow = false;

    if (request.reminderSettings.enabled) {
      const intervalMinutes = request.reminderSettings.intervalMinutes;
      
      if (lastDrinkTime) {
        // 最後の飲用時間 + 間隔 = 次のリマインダー
        nextReminderTime = new Date(lastDrinkTime.getTime() + intervalMinutes * 60 * 1000);
        
        // 時間範囲チェック
        if (!this.isWithinReminderWindow(nextReminderTime, request.reminderSettings)) {
          nextReminderTime = this.getNextValidReminderTime(nextReminderTime, request.reminderSettings);
        }
      } else {
        // 初回の場合、現在時刻から間隔後
        nextReminderTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
        
        if (!this.isWithinReminderWindow(nextReminderTime, request.reminderSettings)) {
          nextReminderTime = this.getNextValidReminderTime(nextReminderTime, request.reminderSettings);
        }
      }

      if (nextReminderTime) {
        timeUntilNext = Math.max(0, Math.floor((nextReminderTime.getTime() - now.getTime()) / (1000 * 60)));
        
        // 既に時間が過ぎている場合は今すぐ飲むべき
        if (nextReminderTime.getTime() <= now.getTime()) {
          shouldDrinkNow = true;
          timeUntilNext = 0;
        }
      }
    }

    // 推奨摂取量を計算（時間経過に基づく）
    let recommendedIntake = 200; // デフォルト200ml
    if (timeSinceLastDrink !== null) {
      if (timeSinceLastDrink >= 120) { // 2時間以上
        recommendedIntake = 300;
      } else if (timeSinceLastDrink >= 180) { // 3時間以上
        recommendedIntake = 400;
      } else if (timeSinceLastDrink >= 240) { // 4時間以上
        recommendedIntake = 500;
      }
    }

    // 長時間経過している場合は今すぐ飲むべき
    if (timeSinceLastDrink !== null && timeSinceLastDrink >= 120) {
      shouldDrinkNow = true;
    }

    return {
      nextReminderTime,
      timeSinceLastDrink: timeSinceLastDrink || 0,
      lastDrinkTime,
      shouldDrinkNow,
      timeUntilNext,
      recommendedIntake,
    };
  }

  private isWithinReminderWindow(time: Date, settings: ReminderSettings): boolean {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const currentTime = hour * 60 + minute;
    
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 日をまたぐ場合
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private getNextValidReminderTime(time: Date, settings: ReminderSettings): Date {
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    
    // 明日の開始時刻に設定
    const nextDay = new Date(time);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(startHour, startMinute, 0, 0);
    
    return nextDay;
  }
}