import { Router } from 'express';
import { container } from 'tsyringe';

import {
  UserAuthenticateController,
  RefreshTokenController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const authenticateRoutes = Router();

const userAuthenticateController = container.resolve(
  UserAuthenticateController,
);

const refreshTokenController = container.resolve(RefreshTokenController);

authenticateRoutes.post(
  '/sessions',
  expressRouterAdapter(userAuthenticateController),
);

authenticateRoutes.post(
  '/refresh-token',
  expressRouterAdapter(refreshTokenController),
);

export { authenticateRoutes };
