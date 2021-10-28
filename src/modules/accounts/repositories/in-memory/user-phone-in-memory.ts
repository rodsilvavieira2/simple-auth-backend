import { CreateUserPhoneDTO, UpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { UserPhone } from '@modules/accounts/infra/typeorm/entities';
import { ErrorOnUpdate } from '@shared/errors/database-query';
import { UserNotFoundError } from '@shared/errors/useCase';
import {
  Either, filterAvailableParams, left, right,
} from '@shared/utils';

import { IUserPhoneRepository } from '../IUser-phone-repository';

export class UserPhoneInMemory implements IUserPhoneRepository {
  userPhones: UserPhone[] = [];

  async save(params: CreateUserPhoneDTO): Promise<CreateUserPhoneDTO> {
    const userPhone = new UserPhone();

    const newUserPhone = Object.assign(userPhone, params);

    this.userPhones.push(newUserPhone);

    return params;
  }
  async findByUserId(
    user_id: string,
  ): Promise<Either<UserNotFoundError, CreateUserPhoneDTO>> {
    const userExists = this.userPhones.find(
      (phone) => phone.id_user === user_id,
    );

    if (!userExists) {
      return left(new UserNotFoundError());
    }

    return right(userExists as any);
  }

  async update({
    id_user,
    ...rest
  }: UpdateUserPhoneDTO): Promise<Either<ErrorOnUpdate, UpdateUserPhoneDTO>> {
    const userPhone = this.userPhones.find((phone) => phone.id_user === id_user);

    if (!userPhone) {
      return left(new ErrorOnUpdate());
    }

    const data = filterAvailableParams(['type', 'phone_number'], rest);

    const newData = Object.assign(userPhone, data);

    const index = this.userPhones.findIndex((phone) => phone.id_user === id_user);

    this.userPhones[index] = newData;

    return right(newData);
  }
}
