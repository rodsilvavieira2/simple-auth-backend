import { container } from 'tsyringe';

import { IMailProvider } from './IMail-provider';
import { SESMailProvider } from './implementations';

export * from './IMail-provider';

container.registerSingleton<IMailProvider>('SESMailProvider', SESMailProvider);
