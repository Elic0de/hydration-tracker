import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, UserId } from '@/domain/entities/User';

interface UserStorageDto {
  id: { value: string };
  name: string;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export class LocalStorageUserRepository implements UserRepository {
  private readonly STORAGE_KEY = 'hydration-tracker-users';

  async findById(id: UserId): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(user => user.id.value === id.value) || null;
    console.log('LocalStorageUserRepository.findById:', { id: id.value, found: !!user, totalUsers: users.length });
    return user;
  }

  async save(user: User): Promise<void> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id.value === user.id.value);
    
    if (index >= 0) {
      users[index] = user;
      console.log('LocalStorageUserRepository.save: Updated existing user', user.id.value);
    } else {
      users.push(user);
      console.log('LocalStorageUserRepository.save: Created new user', user.id.value);
    }
    
    this.setUsers(users);
  }

  async findAll(): Promise<User[]> {
    return this.getUsers();
  }

  private getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: UserStorageDto) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  private setUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }
}