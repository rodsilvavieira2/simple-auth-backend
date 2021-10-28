import { container } from 'tsyringe';

import { IJwtProvider } from './IJwt-provider';
import { JwtFacade } from './implementations/jwt-facade';

export * from './IJwt-provider';

container.registerSingleton<IJwtProvider>('JwtFacade', JwtFacade);
