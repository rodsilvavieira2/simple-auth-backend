/* eslint-disable operator-linebreak */
import { Request, Response } from 'express';

import { IController } from '@shared/ports/controller';

const expressRouterAdapter =
  (controller: IController) => async (req: Request, res: Response): Promise<Response> => {
    const httpResponse = await controller.handle(req);

    const { statusCode, body } = httpResponse;

    if (statusCode >= 200 && statusCode <= 299) {
      return res.status(statusCode).json(body);
    }

    return res.status(statusCode).json({ error: body.message });
  };

export { expressRouterAdapter };
