import { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';

export interface CreateUserRequest {
  userId?: string;
  name: string;
  dailyGoal: number;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    const user: User = {
      id: { value: request.userId || crypto.randomUUID() },
      name: request.name,
      dailyGoal: request.dailyGoal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepository.save(user);
    return user;
  }
}