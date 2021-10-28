import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers/validator';
import {
  HttpRequest,
  HttpResponse,
  badRequest,
  serverError,
  created,
} from '@shared/http';
import { IController } from '@shared/ports';

import { CreatUserUseCase } from './create-user-useCase';

@singleton()
export class CreateUserController implements IController {
  constructor(
    @inject('CreatUserUseCase')
    private readonly createUserUseCase: CreatUserUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.bodyRequestValidator.check({
        body,
        fields: ['name', 'email', 'password'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const result = await this.createUserUseCase.execute(body);

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return created();
    } catch (error) {
      return serverError();
    }
  }
}
