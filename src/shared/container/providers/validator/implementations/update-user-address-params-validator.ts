/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'tsyringe';
import { validate as uuidValidator } from 'uuid';

import { UpdateUserAddressDTO } from '@modules/accounts/dtos';
import { InvalidParamError, MissingParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';
import { ADDRESS_ERRORS, TOKEN_ERRORS } from './errors';

@injectable()
export class UpdateUserAddressParamsValidator implements IValidator {
  check({ id_user, ...rest }: UpdateUserAddressDTO): Either<Error, true> {
    const params = Object.keys(rest).filter((field) => {
      if (rest[field]) {
        return true;
      }

      return false;
    });

    if (!params.length) {
      const availableParams = [
        'house_number',
        'city',
        'district',
        'state',
        'postal_code',
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

    const invalidParam = params.find((field) => {
      if (String(rest[field]).length < 3 && field !== 'house_number') {
        return true;
      }

      return false;
    });

    if (invalidParam) {
      const invalidParamIndex = params.indexOf(invalidParam);
      const fields = Object.keys(invalidParam);

      return left(
        new InvalidParamError(
          `The param: ${fields[invalidParamIndex]} is invalid.`,
        ),
      );
    }

    if (rest?.postal_code?.length < 7) {
      return left(
        new InvalidParamError(ADDRESS_ERRORS.postal_code),
      );
    }

    return right(true);
  }
}
