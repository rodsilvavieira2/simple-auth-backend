import { HttpRequest, HttpResponse } from '@shared/http';

export interface IMiddleware {
  handle(req: HttpRequest): Promise<HttpResponse>;
}
