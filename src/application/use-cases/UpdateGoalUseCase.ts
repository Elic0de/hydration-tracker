import { UserRepository } from '@/domain/repositories/UserRepository';
import { HydrationGoalRepository } from '@/domain/repositories/HydrationGoalRepository';
import { User, UserId } from '@/domain/entities/User';
import { HydrationGoal } from '@/domain/entities/HydrationGoal';

export interface UpdateGoalRequest {
  userId: string;
  newDailyGoal: number;
}

export class UpdateGoalUseCase {
  constructor(
    private userRepository: UserRepository,
    private hydrationGoalRepository: HydrationGoalRepository
  ) {}

  async execute(request: UpdateGoalRequest): Promise<void> {
    const userId: UserId = { value: request.userId };
    
    // ユーザーの目標を更新
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    const updatedUser: User = {
      ...user,
      dailyGoal: request.newDailyGoal,
      updatedAt: new Date(),
    };

    await this.userRepository.save(updatedUser);

    // 現在のアクティブな目標を無効にする
    const currentGoal = await this.hydrationGoalRepository.findActiveByUserId(userId);
    if (currentGoal) {
      const inactiveGoal: HydrationGoal = {
        ...currentGoal,
        isActive: false,
        endDate: new Date(),
      };
      await this.hydrationGoalRepository.save(inactiveGoal);
    }

    // 新しい目標を作成
    const newGoal: HydrationGoal = {
      id: { value: crypto.randomUUID() },
      userId,
      dailyTarget: request.newDailyGoal,
      startDate: new Date(),
      isActive: true,
    };

    await this.hydrationGoalRepository.save(newGoal);
  }
}