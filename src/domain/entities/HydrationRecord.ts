import { UserId } from './User';

export interface HydrationRecordId {
  readonly value: string;
}

export interface HydrationRecord {
  readonly id: HydrationRecordId;
  readonly userId: UserId;
  readonly amount: number; // ml
  readonly timestamp: Date;
  readonly note?: string;
}