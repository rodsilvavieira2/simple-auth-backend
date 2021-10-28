export interface IDateProvider {
  addDays(days: number): Date;
  compareIfBefore(start: Date, end: Date): boolean;
  dateNow(): Date;
  addHours(hours: number): Date;
}
