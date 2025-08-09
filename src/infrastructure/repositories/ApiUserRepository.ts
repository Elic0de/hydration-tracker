import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, UserId } from '@/domain/entities/User';

export class ApiUserRepository implements UserRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async findById(id: UserId): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id.value}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async save(user: User): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapToDto(user)),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((item: any) => this.mapToEntity(item));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  private mapToEntity(data: any): User {
    return {
      id: { value: data.id },
      name: data.name,
      dailyGoal: data.dailyGoal,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private mapToDto(user: User): any {
    return {
      id: user.id.value,
      name: user.name,
      dailyGoal: user.dailyGoal,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}