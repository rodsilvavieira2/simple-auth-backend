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

import { CreateUserAddressUseCase } from './create-user-address-useCase';

@singleton()
export class CreateUserAddressController implements IController {
  constructor(
    @inject('CreateUserAddressUseCase')
    private readonly createUserAddressUseCase: CreateUserAddressUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body, params }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.validator.check({
        body,
        fields: ['city', 'state', 'house_number', 'postal_code', 'district'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { id } = params;

      const {
        city, district, house_number, postal_code, state,
      } = body;

      const result = await this.createUserAddressUseCase.execute({
        city,
        district,
        state,
        house_number,
        id_user: id,
        postal_code,
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
