import { Either } from '@shared/utils';

export interface IValidator {
  check(input: any): Either<Error, true>;
}
