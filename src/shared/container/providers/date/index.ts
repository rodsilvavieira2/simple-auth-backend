import { container } from 'tsyringe';

import { IDateProvider } from './IDate-provider';
import { DayjsFacade } from './implementations/Daysj-facade';

export * from './IDate-provider';

container.registerSingleton<IDateProvider>('DayjsFacade', DayjsFacade);
