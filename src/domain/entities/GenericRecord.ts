export class GenericRecordId {
  constructor(public readonly value: string) {}
}

export class GenericRecord {
  constructor(
    public readonly id: GenericRecordId,
    public readonly userId: string,
    public readonly trackerId: string,
    public readonly amount: number,
    public readonly note: string | null,
    public readonly recordedAt: Date
  ) {}
}