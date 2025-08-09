import { GenericGoal, GenericGoalId } from '@/domain/entities/GenericGoal';
import { GenericGoalRepository } from '@/domain/repositories/GenericGoalRepository';

export interface UpdateGenericGoalRequest {
  userId: string;
  trackerId: string;
  newDailyGoal: number;
}

export class UpdateGenericGoalUseCase {
  constructor(
    private readonly genericGoalRepository: GenericGoalRepository
  ) {}

  async execute(request: UpdateGenericGoalRequest): Promise<void> {
    const existingGoal = await this.genericGoalRepository.findByUserIdAndTracker(
      request.userId,
      request.trackerId
    );

    if (existingGoal) {
      const updatedGoal = new GenericGoal(
        existingGoal.id,
        existingGoal.userId,
        existingGoal.trackerId,
        request.newDailyGoal,
        existingGoal.createdAt,
        new Date()
      );
      await this.genericGoalRepository.save(updatedGoal);
    } else {
      const goalId = new GenericGoalId(crypto.randomUUID());
      const newGoal = new GenericGoal(
        goalId,
        request.userId,
        request.trackerId,
        request.newDailyGoal,
        new Date(),
        new Date()
      );
      await this.genericGoalRepository.save(newGoal);
    }
  }
}