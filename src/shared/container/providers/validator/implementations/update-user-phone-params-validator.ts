import { injectable } from 'tsyringe';
import { validate as uuidValidator } from 'uuid';

import { UpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { InvalidParamError, MissingParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '..';

import { PHONE_ERRORS, TOKEN_ERRORS } from './errors';

@injectable()
export class UpdateUserPhoneParamsValidator implements IValidator {
  check({ id_user, ...rest }: UpdateUserPhoneDTO): Either<Error, true> {
    const params = Object.keys(rest).filter((field) => {
      if (rest[field]) {
        return true;
      }

      return false;
    });

    if (!params.length) {
      const availableParams = [
        'type',
        'phone_number',
      ];

      return left(
        new MissingParamError(
          `The requisition must includes at least one of the following fields: [${availableParams.toString()}].`,
        ),
      );
    }

    if (!uuidValidator(id_user)) {
      return left(
        new InvalidParamError(TOKEN_ERRORS.uuid),
      );
    }

    if (rest.phone_number?.length < 9) {
      return left(
        new InvalidParamError(
          PHONE_ERRORS.phone_number,
        ),
      );
    }

    if (rest.type?.length < 4) {
      return left(new InvalidParamError(PHONE_ERRORS.type));
    }

    return right(true);
  }
}
