import { HydrationRecord } from '@/domain/entities/HydrationRecord';

export interface SmartReminderCalculation {
  nextReminderTime: Date;
  intervalMinutes: number;
  reason: string;
  recommendedAmount: number;
  recommendedAmountReason: string;
}

export class SmartReminderService {
  private static instance: SmartReminderService;

  static getInstance(): SmartReminderService {
    if (!this.instance) {
      this.instance = new SmartReminderService();
    }
    return this.instance;
  }

  /**
   * ユーザーの記録履歴を基にスマートな次回通知時間を計算
   */
  calculateNextReminderTime(
    records: HydrationRecord[],
    currentGoal: number,
    weatherAdjustment: number = 1.0,
    activityLevel: 'low' | 'medium' | 'high' = 'medium'
  ): SmartReminderCalculation {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 今日の記録を取得
    const todayRecords = records.filter(record => 
      record.timestamp >= todayStart
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 今日の摂取量を計算
    const todayIntake = todayRecords.reduce((sum, record) => sum + record.amount, 0);
    const remainingGoal = Math.max(0, currentGoal - todayIntake);

    // 活動レベルによる調整係数
    const activityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3
    }[activityLevel];

    // 基本間隔を計算（残り時間と目標に基づく）
    const baseInterval = this.calculateBaseInterval(
      remainingGoal,
      now,
      todayRecords,
      activityMultiplier * weatherAdjustment
    );

    // ユーザーの過去の飲水パターンを分析
    const patternAdjustment = this.analyzeUserPattern(records, now);

    // 最終的な間隔を決定
    const finalInterval = Math.max(15, Math.min(180, baseInterval + patternAdjustment));
    
    const nextTime = new Date(now.getTime() + finalInterval * 60 * 1000);
    
    // 推奨摂取量を計算
    const recommendedAmountCalc = this.calculateRecommendedAmount(
      remainingGoal,
      now,
      todayRecords,
      activityMultiplier * weatherAdjustment
    );
    
    return {
      nextReminderTime: nextTime,
      intervalMinutes: finalInterval,
      reason: this.generateReasonText(finalInterval, remainingGoal, weatherAdjustment, activityLevel),
      recommendedAmount: recommendedAmountCalc.amount,
      recommendedAmountReason: recommendedAmountCalc.reason
    };
  }

  private calculateBaseInterval(
    remainingGoal: number,
    currentTime: Date,
    todayRecords: HydrationRecord[],
    adjustmentFactor: number
  ): number {
    const currentHour = currentTime.getHours();
    
    // 夜は間隔を長くする
    if (currentHour >= 22 || currentHour <= 6) {
      return 120; // 2時間
    }

    // 起床後すぐは短い間隔
    if (currentHour >= 6 && currentHour <= 9) {
      return 30; // 30分
    }

    // 最近の摂取パターンを考慮
    const recentRecords = todayRecords.filter(record => {
      const timeDiff = currentTime.getTime() - record.timestamp.getTime();
      return timeDiff <= 2 * 60 * 60 * 1000; // 過去2時間
    });

    const recentIntake = recentRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 最近飲んだ場合は間隔を長くする
    if (recentIntake > 300) {
      return Math.round(90 / adjustmentFactor);
    } else if (recentIntake > 150) {
      return Math.round(60 / adjustmentFactor);
    } else {
      // あまり飲んでいない場合は短い間隔
      return Math.round(45 / adjustmentFactor);
    }
  }

  private analyzeUserPattern(records: HydrationRecord[], currentTime: Date): number {
    if (records.length < 7) {
      return 0; // データ不足の場合は調整なし
    }

    const currentHour = currentTime.getHours();
    const pastWeekRecords = records.filter(record => {
      const timeDiff = currentTime.getTime() - record.timestamp.getTime();
      return timeDiff <= 7 * 24 * 60 * 60 * 1000; // 過去1週間
    });

    // 同じ時間帯の過去の摂取パターンを分析
    const similarTimeRecords = pastWeekRecords.filter(record => {
      const recordHour = record.timestamp.getHours();
      return Math.abs(recordHour - currentHour) <= 1;
    });

    if (similarTimeRecords.length === 0) {
      return 0;
    }

    // この時間帯によく飲んでいる場合は間隔を短くする
    const averagePerDay = similarTimeRecords.length / 7;
    if (averagePerDay > 2) {
      return -15; // 15分短くする
    } else if (averagePerDay < 0.5) {
      return 15; // 15分長くする
    }

    return 0;
  }

  private calculateRecommendedAmount(
    remainingGoal: number,
    currentTime: Date,
    todayRecords: HydrationRecord[],
    adjustmentFactor: number
  ): { amount: number; reason: string } {
    const currentHour = currentTime.getHours();
    
    // 基本推奨量（一回あたりの標準的な摂取量）
    let baseAmount = 200;
    const reasons = [];

    // 時間帯による調整
    if (currentHour >= 6 && currentHour <= 9) {
      baseAmount = 250; // 起床後は多めに
      reasons.push('起床後の水分補給');
    } else if (currentHour >= 22 || currentHour <= 6) {
      baseAmount = 150; // 夜間は少なめに
      reasons.push('夜間の適度な水分補給');
    }

    // 残りゴールによる調整
    if (remainingGoal > 1500) {
      baseAmount = Math.min(300, baseAmount + 50);
      reasons.push('目標達成のため多めに');
    } else if (remainingGoal < 500) {
      baseAmount = Math.max(100, baseAmount - 50);
      reasons.push('目標に近いため適量を');
    }

    // 最近の摂取パターンによる調整
    const recentRecords = todayRecords.filter(record => {
      const timeDiff = currentTime.getTime() - record.timestamp.getTime();
      return timeDiff <= 2 * 60 * 60 * 1000; // 過去2時間
    });

    const recentIntake = recentRecords.reduce((sum, record) => sum + record.amount, 0);
    
    if (recentIntake > 500) {
      baseAmount = Math.max(100, baseAmount - 50);
      reasons.push('最近多く飲んでいるため控えめに');
    } else if (recentIntake < 100) {
      baseAmount = Math.min(350, baseAmount + 50);
      reasons.push('最近の摂取量が少ないため多めに');
    }

    // 活動レベル・天気による調整
    const finalAmount = Math.round(baseAmount * adjustmentFactor);
    
    if (adjustmentFactor > 1.1) {
      reasons.push('暑い環境での調整');
    } else if (adjustmentFactor < 0.9) {
      reasons.push('涼しい環境での調整');
    }

    // 最終的な推奨量を100-400mlの範囲に制限
    const recommendedAmount = Math.max(100, Math.min(400, finalAmount));
    
    const reasonText = reasons.length > 0 
      ? reasons.join('、') 
      : '標準的な摂取量';

    return {
      amount: recommendedAmount,
      reason: reasonText
    };
  }

  private generateReasonText(
    intervalMinutes: number,
    remainingGoal: number,
    weatherAdjustment: number,
    activityLevel: string
  ): string {
    const reasons = [];

    if (remainingGoal > 1000) {
      reasons.push('目標達成まで多くの水分が必要');
    } else if (remainingGoal < 200) {
      reasons.push('目標にもう少しで到達');
    }

    if (weatherAdjustment > 1.1) {
      reasons.push('暑い天候による調整');
    } else if (weatherAdjustment < 0.9) {
      reasons.push('涼しい天候による調整');
    }

    if (activityLevel === 'high') {
      reasons.push('高い活動レベル');
    } else if (activityLevel === 'low') {
      reasons.push('低い活動レベル');
    }

    if (reasons.length === 0) {
      return `標準的な推奨間隔（${intervalMinutes}分）`;
    }

    return `${intervalMinutes}分間隔 - ${reasons.join('、')}`;
  }

  /**
   * 一日の推奨通知スケジュールを生成
   */
  generateDailySchedule(
    dailyGoal: number,
    startTime: string,
    endTime: string
  ): Date[] {
    const schedule: Date[] = [];
    const now = new Date();
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);
    
    // 基本的な推奨タイミング
    const optimalTimes = [
      { hour: 7, minute: 0, priority: 0.9 },   // 起床後
      { hour: 10, minute: 0, priority: 0.8 },  // 午前中
      { hour: 12, minute: 30, priority: 0.7 }, // 昼食後
      { hour: 15, minute: 0, priority: 0.8 },  // 午後
      { hour: 18, minute: 0, priority: 0.7 },  // 夕方
      { hour: 20, minute: 0, priority: 0.6 },  // 夜
    ];

    for (const time of optimalTimes) {
      const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.hour, time.minute);
      
      if (scheduledTime >= startDate && scheduledTime <= endDate && scheduledTime > now) {
        schedule.push(scheduledTime);
      }
    }

    return schedule.sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * マニュアルモード用の推奨摂取量計算
   */
  calculateManualRecommendedAmount(
    remainingGoal: number,
    intervalMinutes: number,
    currentTime: Date
  ): { amount: number; reason: string } {
    const currentHour = currentTime.getHours();
    
    // 基本的な1回あたりの推奨量
    let baseAmount = 200;
    const reasons = [];

    // 間隔による調整
    if (intervalMinutes <= 30) {
      baseAmount = 150; // 短い間隔なら少量
      reasons.push('短い間隔での適量');
    } else if (intervalMinutes >= 120) {
      baseAmount = 300; // 長い間隔なら多量
      reasons.push('長い間隔での補給');
    }

    // 時間帯による調整
    if (currentHour >= 6 && currentHour <= 9) {
      baseAmount += 50; // 起床後は多めに
      reasons.push('起床後の水分補給');
    } else if (currentHour >= 22 || currentHour <= 6) {
      baseAmount -= 50; // 夜間は少なめに
      reasons.push('夜間の適度な補給');
    }

    // 残りゴールによる調整
    if (remainingGoal > 1000) {
      baseAmount += 50;
      reasons.push('目標達成のため多めに');
    } else if (remainingGoal < 300) {
      baseAmount -= 50;
      reasons.push('目標に近いため適量を');
    }

    // 最終的な推奨量を100-400mlの範囲に制限
    const recommendedAmount = Math.max(100, Math.min(400, baseAmount));
    
    const reasonText = reasons.length > 0 
      ? reasons.join('、') 
      : `${intervalMinutes}分間隔での標準量`;

    return {
      amount: recommendedAmount,
      reason: reasonText
    };
  }
}