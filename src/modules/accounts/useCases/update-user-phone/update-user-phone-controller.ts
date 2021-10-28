import { inject, singleton } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { UpdateUserPhoneUseCase } from './update-user-phone-useCase';

@singleton()
export class UpdateUserPhoneController implements IController {
  constructor(
    @inject('UpdateUserPhoneUseCase')
    private readonly updateUserPhoneUseCase: UpdateUserPhoneUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body, params }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyInvalid = this.validator.check({
        body,
        fields: ['type', 'phone_number'],
      });

      if (isBodyInvalid.isLeft()) {
        return badRequest(isBodyInvalid.value);
      }

      const { id } = params;

      const { phone_number, type } = body;

      const result = await this.updateUserPhoneUseCase.execute({
        id_user: id,
        phone_number,
        type,
      });

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return ok(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
