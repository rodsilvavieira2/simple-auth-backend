import { injectable } from 'tsyringe';

import { EmptyBodyError, MissingParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';

export type BodyRequestValidatorParams = {
  body: Record<string, unknown>;
  fields: string[];
};

@injectable()
export class BodyRequestValidator implements IValidator {
  check({ body, fields }: BodyRequestValidatorParams): Either<Error, true> {
    if (!body || !Object.keys(body).length) {
      return left(new EmptyBodyError());
    }

    const missingParams: string[] = [];

    fields.forEach((field) => {
      if (!body[field]) {
        missingParams.push(field);
      }
    });

    if (missingParams.length) {
      return left(
        new MissingParamError(`The filed(s): [${missingParams.toString()}] is missing.`),
      );
    }

    return right(true);
  }
}
