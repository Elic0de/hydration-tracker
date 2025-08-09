import { AddGenericRecordUseCase } from '@/application/use-cases/AddGenericRecordUseCase';
import { GetGenericHistoryUseCase } from '@/application/use-cases/GetGenericHistoryUseCase';
import { GetGenericDailySummaryUseCase } from '@/application/use-cases/GetGenericDailySummaryUseCase';
import { UpdateGenericGoalUseCase } from '@/application/use-cases/UpdateGenericGoalUseCase';

import { LocalStorageGenericRecordRepository } from '@/infrastructure/repositories/LocalStorageGenericRecordRepository';
import { LocalStorageGenericGoalRepository } from '@/infrastructure/repositories/LocalStorageGenericGoalRepository';

class GenericContainer {
  // Repositories
  public readonly genericRecordRepository = new LocalStorageGenericRecordRepository();
  public readonly genericGoalRepository = new LocalStorageGenericGoalRepository();

  // Use Cases
  public readonly addGenericRecordUseCase = new AddGenericRecordUseCase(
    this.genericRecordRepository
  );

  public readonly getGenericHistoryUseCase = new GetGenericHistoryUseCase(
    this.genericRecordRepository
  );

  public readonly getGenericDailySummaryUseCase = new GetGenericDailySummaryUseCase(
    this.genericRecordRepository,
    this.genericGoalRepository
  );

  public readonly updateGenericGoalUseCase = new UpdateGenericGoalUseCase(
    this.genericGoalRepository
  );
}

export const genericContainer = new GenericContainer();