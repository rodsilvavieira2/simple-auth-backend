import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  notFound,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { SendForgotPasswordEmailUseCase } from './send-forgot-password-email-useCase';

@singleton()
export class SendForgotPasswordEmailController implements IController {
  constructor(
    @inject('SendForgotPasswordEmailUseCase')
    private readonly sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.validator.check({
        body,
        fields: ['email'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { email } = body;

      const result = await this.sendForgotPasswordEmailUseCase.execute(email);

      if (result.isLeft()) {
        return notFound(result.value);
      }

      return ok();
    } catch (error) {
      return serverError();
    }
  }
}
