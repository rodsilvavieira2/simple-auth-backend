/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { InternalServerError } from '@shared/errors/http';

import { HttpResponse } from './data';

export const ok = (body?: any): HttpResponse => ({
  statusCode: 200,
  body,
});

export const badRequest = (body: Error): HttpResponse => ({
  statusCode: 400,
  body,
});

export const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: new InternalServerError(),
});

export const created = (body?: any): HttpResponse => ({
  body,
  statusCode: 201,
});

export const unauthorized = (body?: any): HttpResponse => ({
  statusCode: 401,
  body,
});

export const notFound = (body?: any): HttpResponse => ({
  statusCode: 404,
  body,
});
