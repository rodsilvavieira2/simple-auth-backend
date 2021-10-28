import { ErrorOnUpdate } from '@shared/errors/database-query';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either } from '@shared/utils';

import { CreateUserPhoneDTO, UpdateUserPhoneDTO } from '../dtos';

export interface IUserPhoneRepository {
  save(params: CreateUserPhoneDTO): Promise<CreateUserPhoneDTO>;
  findByUserId(
    user_id: string,
  ): Promise<Either<UserNotFoundError, CreateUserPhoneDTO>>;
  update(
    params: UpdateUserPhoneDTO,
  ): Promise<Either<ErrorOnUpdate, UpdateUserPhoneDTO>>;
}
