import { container } from 'tsyringe';

import { UuidFacade } from './implementations';
import { IUuidProvider } from './IUuid-provider';

export * from './IUuid-provider';

container.registerSingleton<IUuidProvider>('UuidFacade', UuidFacade);
