export type HttpRequest = {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
};

export type HttpResponse = {
  body?: any;
  statusCode: number;
};
