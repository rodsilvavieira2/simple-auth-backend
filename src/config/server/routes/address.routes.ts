import { Router } from 'express';
import { container } from 'tsyringe';

import {
  UpdateUserAddressController,
  CreateUserAddressController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const createUserAddressController = expressRouterAdapter(
  container.resolve(CreateUserAddressController),
);

const updateUserAddressController = expressRouterAdapter(
  container.resolve(UpdateUserAddressController),
);

const addressRoutes = Router();

addressRoutes.post('/create/:id', createUserAddressController);
addressRoutes.put('/update/:id', updateUserAddressController);

export { addressRoutes };
