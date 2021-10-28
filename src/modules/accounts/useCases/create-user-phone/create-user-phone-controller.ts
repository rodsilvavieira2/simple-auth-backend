import { inject, singleton } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  created,
  HttpRequest,
  HttpResponse,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { CreateUserPhoneUseCase } from './create-user-phone-useCase';

@singleton()
export class CreateUserPhoneController implements IController {
  constructor(
    @inject('CreateUserPhoneUseCase')
    private readonly createUserPhoneUseCase: CreateUserPhoneUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator,
  ) {}

  async handle({ body, params }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.bodyRequestValidator.check({
        body,
        fields: ['type', 'phone_number'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { id } = params;

      const { phone_number, type } = body;

      const result = await this.createUserPhoneUseCase.execute({
        id_user: id,
        phone_number,
        type,
      });

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return created(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
