import { injectable } from 'tsyringe';
import { validate as uuidValidator } from 'uuid';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';
import { ADDRESS_ERRORS, TOKEN_ERRORS } from './errors';

@injectable()
export class CreateUserAddressParamsValidator implements IValidator {
  check(params: CreateUserAddressDTO): Either<Error, true> {
    if (!uuidValidator(params.id_user)) {
      return left(new InvalidParamError(TOKEN_ERRORS.uuid));
    }

    const haveAParamLessThan3Characters = ['city', 'district', 'state'].find(
      (field) => {
        if (String(params[field]).length < 3) {
          return true;
        }

        return false;
      },
    );

    if (haveAParamLessThan3Characters) {
      return left(
        new InvalidParamError(
          `The param: ${haveAParamLessThan3Characters} is invalid.`,
        ),
      );
    }

    if (params.postal_code.length < 7) {
      return left(new InvalidParamError(ADDRESS_ERRORS.postal_code));
    }

    return right(true);
  }
}
