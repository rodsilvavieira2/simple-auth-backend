import { ErrorOnUpdate, NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import type { CreateUserAddressDTO, UpdateUserAddressDTO } from '../dtos';
import { UserAddress } from '../infra/typeorm/entities';

export interface IUserAddressRepository {
  save(params: CreateUserAddressDTO): Promise<CreateUserAddressDTO>;
  findByUserId(userId: string): Promise<Either<NotFoundError, UserAddress>>;
  update(params: UpdateUserAddressDTO): Promise<Either<ErrorOnUpdate, true>>;
}
