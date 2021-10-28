import { validate as uuidValidator } from 'uuid';

import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';
import { PHONE_ERRORS, TOKEN_ERRORS } from './errors';

export class CreateUserPhoneParamsValidator implements IValidator {
  check(params: CreateUserPhoneDTO): Either<Error, true> {
    if (!uuidValidator(params.id_user)) {
      return left(
        new InvalidParamError(TOKEN_ERRORS.uuid),
      );
    }
    if (params.phone_number.length < 9) {
      return left(
        new InvalidParamError(
          PHONE_ERRORS.phone_number,
        ),
      );
    }

    return right(true);
  }
}
