import { Router } from 'express';

import { expressMiddlewareAdapter } from '@shared/adapters';
import { AuthMiddleware } from '@shared/middlers';

import { addressRoutes } from './address.routes';
import { authenticateRoutes } from './authenticate.routes';
import { emailRoutes } from './email.routes';
import { passwordRoutes } from './password.routes';
import { phoneRoutes } from './phone.routes';
import { userRoutes } from './user.routes';

const authMiddleware = expressMiddlewareAdapter(new AuthMiddleware());

const router = Router();

router.use('/address', authMiddleware, addressRoutes);
router.use('/phone', authMiddleware, phoneRoutes);
router.use('/password', passwordRoutes);
router.use('/auth', authenticateRoutes);
router.use('/users', userRoutes);
router.use('/email', emailRoutes);

export { router };
