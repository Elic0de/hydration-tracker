import { ApiUserRepository } from '../repositories/ApiUserRepository';
import { ApiHydrationRecordRepository } from '../repositories/ApiHydrationRecordRepository';
import { ApiHydrationGoalRepository } from '../repositories/ApiHydrationGoalRepository';

import { AddHydrationRecordUseCase } from '@/application/use-cases/AddHydrationRecordUseCase';
import { GetHydrationHistoryUseCase } from '@/application/use-cases/GetHydrationHistoryUseCase';
import { GetDailyHydrationSummaryUseCase } from '@/application/use-cases/GetDailyHydrationSummaryUseCase';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { HydrationReminderUseCase } from '@/application/use-cases/HydrationReminderUseCase';

class ApiDIContainer {
  // Repositories
  private _userRepository = new ApiUserRepository();
  private _hydrationRecordRepository = new ApiHydrationRecordRepository();
  private _hydrationGoalRepository = new ApiHydrationGoalRepository();

  // Use Cases
  private _addHydrationRecordUseCase = new AddHydrationRecordUseCase(
    this._hydrationRecordRepository
  );
  
  private _getHydrationHistoryUseCase = new GetHydrationHistoryUseCase(
    this._hydrationRecordRepository
  );
  
  private _getDailyHydrationSummaryUseCase = new GetDailyHydrationSummaryUseCase(
    this._hydrationRecordRepository,
    this._hydrationGoalRepository
  );
  
  private _createUserUseCase = new CreateUserUseCase(
    this._userRepository
  );
  
  private _hydrationReminderUseCase = new HydrationReminderUseCase();

  // Getters
  get addHydrationRecordUseCase() {
    return this._addHydrationRecordUseCase;
  }

  get getHydrationHistoryUseCase() {
    return this._getHydrationHistoryUseCase;
  }

  get getDailyHydrationSummaryUseCase() {
    return this._getDailyHydrationSummaryUseCase;
  }

  get createUserUseCase() {
    return this._createUserUseCase;
  }

  get userRepository() {
    return this._userRepository;
  }

  get hydrationReminderUseCase() {
    return this._hydrationReminderUseCase;
  }
}

export const apiContainer = new ApiDIContainer();