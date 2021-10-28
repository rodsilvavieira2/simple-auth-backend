import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { injectable } from 'tsyringe';

import { IDateProvider } from '../IDate-provider';

dayjs.extend(utc);

@injectable()
export class DayjsFacade implements IDateProvider {
  addHours(hours: number): Date {
    return dayjs().add(hours, 'hour').toDate();
  }
  dateNow(): Date {
    return dayjs().toDate();
  }
  addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }
  compareIfBefore(start: Date, end: Date): boolean {
    return dayjs(start).isBefore(end);
  }
}
