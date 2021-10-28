import { container } from 'tsyringe';

import { IHasherProvider } from './IHasher-provider';
import { BcryptFacade } from './implementations/bcrypt-facade';

export * from './IHasher-provider';

container.register('BcryptRoundsValue', {
  useValue: 10,
});
container.registerSingleton<IHasherProvider>('BcryptFacade', BcryptFacade);
