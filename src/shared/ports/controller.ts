import { HttpRequest, HttpResponse } from '@shared/http/data';

export interface IController {
    handle(httpRequest: HttpRequest): Promise<HttpResponse>
}
