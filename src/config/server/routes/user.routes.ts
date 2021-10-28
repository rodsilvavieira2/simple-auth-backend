import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserController,
} from '@modules/accounts/useCases';
import {
  expressRouterAdapter,
} from '@shared/adapters';

const userRoutes = Router();

const creteUserController = expressRouterAdapter(
  container.resolve(CreateUserController),
);

userRoutes.post('/', creteUserController);

export { userRoutes };
