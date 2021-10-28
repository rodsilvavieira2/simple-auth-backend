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

import { SendVerifyEmailUseCase } from './send-verify-email-useCase';

@singleton()
export class SendVerifyEmailController implements IController {
  constructor(
    @inject('SendVerifyEmailUseCase')
    private readonly sendVerifyEmailUseCase: SendVerifyEmailUseCase,
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

      const result = await this.sendVerifyEmailUseCase.execute(email);

      if (result.isLeft()) {
        return notFound(result.value);
      }

      return ok();
    } catch {
      return serverError();
    }
  }
}
