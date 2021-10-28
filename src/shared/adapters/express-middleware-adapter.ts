/* eslint-disable operator-linebreak */
import { Request, Response, NextFunction } from 'express';

import { IMiddleware } from '@shared/ports/middleware';

export const expressMiddlewareAdapter =
  (middleware: IMiddleware) => async (req: Request, res: Response, next: NextFunction) => {
    const httpResponse = await middleware.handle(req);

    if (httpResponse.statusCode === 200) {
      return next();
    }

    return res.status(httpResponse.statusCode).json(httpResponse.body);
  };
