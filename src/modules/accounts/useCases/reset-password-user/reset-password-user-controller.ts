import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import { MissingParamError } from '@shared/errors/validator';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports';

import { ResetPasswordUserUseCase } from './reset-password-user-useCase';

@singleton()
export class ResetPasswordUserController implements IController {
  constructor(
    @inject('ResetPasswordUserUseCase')
    private readonly resetPasswordUserUseCase: ResetPasswordUserUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator,
  ) {}

  async handle({ body, query }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.bodyRequestValidator.check({
        body,
        fields: ['password'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { token } = query;

      if (!token) {
        return badRequest(
          new MissingParamError(
            'Missing the reset password token on the request query',
          ),
        );
      }

      const { password } = body;

      const result = await this.resetPasswordUserUseCase.execute({
        password,
        token,
      });

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok();
    } catch {
      return serverError();
    }
  }
}
