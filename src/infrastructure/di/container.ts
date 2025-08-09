import { LocalStorageUserRepository } from '../repositories/LocalStorageUserRepository';
import { LocalStorageHydrationRecordRepository } from '../repositories/LocalStorageHydrationRecordRepository';
import { LocalStorageHydrationGoalRepository } from '../repositories/LocalStorageHydrationGoalRepository';

import { AddHydrationRecordUseCase } from '@/application/use-cases/AddHydrationRecordUseCase';
import { GetHydrationHistoryUseCase } from '@/application/use-cases/GetHydrationHistoryUseCase';
import { GetDailyHydrationSummaryUseCase } from '@/application/use-cases/GetDailyHydrationSummaryUseCase';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { HydrationReminderUseCase } from '@/application/use-cases/HydrationReminderUseCase';
import { GetWeeklyStatisticsUseCase } from '@/application/use-cases/GetWeeklyStatisticsUseCase';
import { GetYearlyStatisticsUseCase } from '@/application/use-cases/GetYearlyStatisticsUseCase';
import { GetDailyHourlyStatisticsUseCase } from '@/application/use-cases/GetDailyHourlyStatisticsUseCase';
import { UpdateGoalUseCase } from '@/application/use-cases/UpdateGoalUseCase';
import { GetNextHydrationTimeUseCase } from '@/application/use-cases/GetNextHydrationTimeUseCase';

class DIContainer {
  // Repositories
  private _userRepository = new LocalStorageUserRepository();
  private _hydrationRecordRepository = new LocalStorageHydrationRecordRepository();
  private _hydrationGoalRepository = new LocalStorageHydrationGoalRepository();

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
  
  private _getWeeklyStatisticsUseCase = new GetWeeklyStatisticsUseCase(
    this._hydrationRecordRepository,
    this._hydrationGoalRepository
  );
  
  private _getYearlyStatisticsUseCase = new GetYearlyStatisticsUseCase(
    this._hydrationRecordRepository,
    this._hydrationGoalRepository
  );
  
  private _getDailyHourlyStatisticsUseCase = new GetDailyHourlyStatisticsUseCase(
    this._hydrationRecordRepository
  );
  
  private _updateGoalUseCase = new UpdateGoalUseCase(
    this._userRepository,
    this._hydrationGoalRepository
  );
  
  private _getNextHydrationTimeUseCase = new GetNextHydrationTimeUseCase(
    this._hydrationRecordRepository
  );

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

  get getWeeklyStatisticsUseCase() {
    return this._getWeeklyStatisticsUseCase;
  }

  get getYearlyStatisticsUseCase() {
    return this._getYearlyStatisticsUseCase;
  }

  get getDailyHourlyStatisticsUseCase() {
    return this._getDailyHourlyStatisticsUseCase;
  }

  get updateGoalUseCase() {
    return this._updateGoalUseCase;
  }

  get getNextHydrationTimeUseCase() {
    return this._getNextHydrationTimeUseCase;
  }
}

export const container = new DIContainer();