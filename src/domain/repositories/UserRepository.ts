import { User, UserId } from '../entities/User';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}