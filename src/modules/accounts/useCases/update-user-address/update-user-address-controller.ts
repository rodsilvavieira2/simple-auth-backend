import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { UpdateUserAddressUseCase } from './update-user-address-useCase';

@singleton()
export class UpdateUserAddressController implements IController {
  constructor(
    @inject('UpdateUserAddressUseCase')
    private readonly updateUserAddressUseCase: UpdateUserAddressUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body, params }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.validator.check({
        body,
        fields: [],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { id } = params;

      const {
        city, district, house_number, postal_code, state,
      } = body;

      const result = await this.updateUserAddressUseCase.execute({
        city,
        district,
        house_number,
        id_user: id,
        postal_code,
        state,
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
