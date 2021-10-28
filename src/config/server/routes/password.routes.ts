import { Router } from 'express';
import { container } from 'tsyringe';

import {
  ResetPasswordUserController,
  SendForgotPasswordEmailController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const passwordRoutes = Router();

const resetPasswordUserController = container.resolve(
  ResetPasswordUserController,
);

const sendForgotPasswordEmailController = container.resolve(
  SendForgotPasswordEmailController,
);

passwordRoutes.post(
  '/reset',
  expressRouterAdapter(resetPasswordUserController),
);

passwordRoutes.post(
  '/forgot',
  expressRouterAdapter(sendForgotPasswordEmailController),
);

export { passwordRoutes };
