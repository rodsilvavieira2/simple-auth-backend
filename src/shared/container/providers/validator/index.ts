import { container } from 'tsyringe';

import {
  BodyRequestValidator,
  UserParamsValidator,
  CreateUserAddressParamsValidator,
  CreateUserPhoneParamsValidator,
  UpdateUserAddressParamsValidator,
  UpdateUserPhoneParamsValidator,
} from './implementations/index';
import { IValidator } from './IValidator';

export * from './IValidator';

container.registerSingleton<IValidator>(
  'BodyRequestValidator',
  BodyRequestValidator,
);

container.registerSingleton<IValidator>(
  'UserParamsValidator',
  UserParamsValidator,
);

container.registerSingleton<IValidator>(
  'CreateUserAddressParamsValidator',
  CreateUserAddressParamsValidator,
);

container.registerSingleton<IValidator>(
  'CreateUserPhoneParamsValidator',
  CreateUserPhoneParamsValidator,
);

container.registerSingleton<IValidator>(
  'UpdateUserAddressParamsValidator',
  UpdateUserAddressParamsValidator,
);

container.registerSingleton<IValidator>(
  'UpdateUserPhoneParamsValidator',
  UpdateUserPhoneParamsValidator,
);
