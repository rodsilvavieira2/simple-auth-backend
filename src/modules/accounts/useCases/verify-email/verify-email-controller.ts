import { inject, singleton } from 'tsyringe';

import { MissingParamError } from '@shared/errors/validator';
import {
  HttpRequest,
  HttpResponse,
  serverError,
  ok,
  unauthorized,
  badRequest,
} from '@shared/http';
import { IController } from '@shared/ports';

import { VerifyEmailUseCase } from './verify-email-useCase';

@singleton()
export class VerifyEmailController implements IController {
  constructor(
    @inject('VerifyEmailUseCase')
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  async handle({ query }: HttpRequest): Promise<HttpResponse> {
    try {
      const { token } = query;

      if (!token) {
        return badRequest(new MissingParamError('Token missing on the route query'));
      }

      const result = await this.verifyEmailUseCase.execute(token);

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok({
        message: 'The email has been successfully verified',
      });
    } catch {
      return serverError();
    }
  }
}
