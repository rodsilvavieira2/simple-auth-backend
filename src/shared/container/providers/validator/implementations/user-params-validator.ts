import { injectable } from 'tsyringe';
import validator from 'validator';

import { CreateUserDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';
import { USER_PARAMS_VALIDATOR_ERRORS } from './errors';

@injectable()
export class UserParamsValidator implements IValidator {
  check({ email, name, password }: CreateUserDTO): Either<Error, true> {
    if (!name || name.length < 2) {
      return left(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.name));
    }

    if (!email || !validator.isEmail(email)) {
      return left(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.email));
    }

    if (!password || password.length < 8) {
      return left(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.password));
    }

    return right(true);
  }
}
