import { inject, singleton } from 'tsyringe';

import { MissingParamError } from '@shared/errors/validator';
import {
  badRequest,
  created,
  HttpRequest,
  HttpResponse,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports';

import { RefreshTokenUseCase } from './refresh-token-useCase';

@singleton()
export class RefreshTokenController implements IController {
  constructor(
    @inject('RefreshTokenUseCase')
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const token = request.body.token
        || request.query.token
        || request.headers['x-refresh-token'];

      if (!token) {
        return badRequest(new MissingParamError('Missing token'));
      }

      const result = await this.refreshTokenUseCase.execute(token);

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return created(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
