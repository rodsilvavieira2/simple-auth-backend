import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import {
  HttpRequest,
  HttpResponse,
  badRequest,
  ok,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports/controller';

import { UserAuthenticateUseCase } from './user-authenticate-useCase';

@singleton()
export class UserAuthenticateController implements IController {
  constructor(
    @inject('UserAuthenticateUseCase')
    private readonly userAuthenticateUseCase: UserAuthenticateUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.validator.check({
        body,
        fields: ['password', 'email'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const result = await this.userAuthenticateUseCase.execute(body);

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
