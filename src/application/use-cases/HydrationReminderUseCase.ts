import { NotificationService } from '../services/NotificationService';
import { SmartReminderService } from '../services/SmartReminderService';
import { HydrationRecord } from '@/domain/entities/HydrationRecord';

export type ReminderMode = 'auto' | 'manual';

export interface ReminderSettings {
  enabled: boolean;
  mode: ReminderMode;
  intervalMinutes: number; // マニュアルモードで使用
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  autoSettings?: {
    useSmartTiming: boolean; // AIベースの推奨時間を使用するか
    adaptToWeather: boolean; // 天気に基づいて調整するか
    adaptToActivity: boolean; // 活動レベルに基づいて調整するか
  };
}

export class HydrationReminderUseCase {
  private timerId: NodeJS.Timeout | null = null;
  private lastReminderTime: Date | null = null;
  private notificationService = NotificationService.getInstance();
  private smartReminderService = SmartReminderService.getInstance();

  startReminder(
    settings: ReminderSettings, 
    onReminder: () => void,
    records: HydrationRecord[] = [],
    currentGoal: number = 2000
  ): void {
    if (!settings.enabled) {
      this.stopReminder();
      return;
    }

    this.stopReminder(); // Stop existing timer

    if (settings.mode === 'auto' && settings.autoSettings?.useSmartTiming) {
      this.startSmartReminder(settings, onReminder, records, currentGoal);
    } else {
      this.startManualReminder(settings, onReminder);
    }
  }

  private startManualReminder(settings: ReminderSettings, onReminder: () => void): void {
    const intervalMs = settings.intervalMinutes * 60 * 1000;
    
    this.timerId = setInterval(async () => {
      if (this.shouldShowReminder(settings)) {
        onReminder();
        await this.showNotifications();
        this.lastReminderTime = new Date();
      }
    }, intervalMs);
  }

  private startSmartReminder(
    settings: ReminderSettings, 
    onReminder: () => void,
    records: HydrationRecord[],
    currentGoal: number
  ): void {
    const scheduleNext = () => {
      const calculation = this.smartReminderService.calculateNextReminderTime(
        records,
        currentGoal,
        1.0, // TODO: Weather adjustment
        'medium' // TODO: Activity level detection
      );

      const delayMs = calculation.nextReminderTime.getTime() - Date.now();
      
      if (delayMs > 0) {
        this.timerId = setTimeout(async () => {
          if (this.shouldShowReminder(settings)) {
            onReminder();
            await this.showNotifications();
            this.lastReminderTime = new Date();
          }
          
          // Schedule next reminder
          scheduleNext();
        }, delayMs);
      } else {
        // If calculated time is in the past, schedule for 15 minutes from now
        this.timerId = setTimeout(async () => {
          if (this.shouldShowReminder(settings)) {
            onReminder();
            await this.showNotifications();
            this.lastReminderTime = new Date();
          }
          scheduleNext();
        }, 15 * 60 * 1000);
      }
    };

    scheduleNext();
  }

  private async showNotifications(): Promise<void> {
    await this.notificationService.showHydrationReminder();
    this.notificationService.playNotificationSound();
    this.notificationService.vibrate();
  }

  stopReminder(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private shouldShowReminder(settings: ReminderSettings): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Parse start and end times
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Check if current time is within the reminder window
    const isWithinWindow = startTime <= endTime 
      ? currentTime >= startTime && currentTime <= endTime
      : currentTime >= startTime || currentTime <= endTime; // Handle midnight crossing

    if (!isWithinWindow) {
      return false;
    }

    // Check if enough time has passed since the last reminder
    if (this.lastReminderTime) {
      const timeSinceLastReminder = now.getTime() - this.lastReminderTime.getTime();
      const intervalMs = settings.intervalMinutes * 60 * 1000;
      return timeSinceLastReminder >= intervalMs;
    }

    return true;
  }
}