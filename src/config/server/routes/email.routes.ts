import { Router } from 'express';
import { container } from 'tsyringe';

import {
  SendVerifyEmailController,
  VerifyEmailController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const emailRoutes = Router();

const sendVerifyEmailController = expressRouterAdapter(
  container.resolve(SendVerifyEmailController),
);

const verifyEmailController = expressRouterAdapter(
  container.resolve(VerifyEmailController),
);

emailRoutes.post('/send-email', sendVerifyEmailController);
emailRoutes.post('/verify-email', verifyEmailController);

export { emailRoutes };
