export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export class HydrationReminderUseCase {
  private timerId: NodeJS.Timeout | null = null;
  private lastReminderTime: Date | null = null;

  startReminder(settings: ReminderSettings, onReminder: () => void): void {
    if (!settings.enabled) {
      this.stopReminder();
      return;
    }

    this.stopReminder(); // Stop existing timer

    const intervalMs = settings.intervalMinutes * 60 * 1000;
    
    this.timerId = setInterval(() => {
      if (this.shouldShowReminder(settings)) {
        onReminder();
        this.lastReminderTime = new Date();
      }
    }, intervalMs);
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