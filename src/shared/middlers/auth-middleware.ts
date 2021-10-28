import { verify } from 'jsonwebtoken';
import { singleton } from 'tsyringe';

import auth from '@config/auth';
import {
  HttpRequest, HttpResponse, ok, unauthorized,
} from '@shared/http';
import { IMiddleware } from '@shared/ports/middleware';

@singleton()
export class AuthMiddleware implements IMiddleware {
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const authHeader = req.headers.authorization as string;

    if (!authHeader) {
      return unauthorized({
        error: 'Token missing',
      });
    }

    try {
      const [, token] = authHeader.split(' ');

      const { sub: id_user } = verify(token, auth.secret_token);

      req.user = {
        id_user,
      };

      return ok();
    } catch {
      return unauthorized({ error: 'Token invalid' });
    }
  }
}
