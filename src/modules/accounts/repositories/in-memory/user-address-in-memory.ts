import {
  CreateUserAddressDTO,
  UpdateUserAddressDTO,
} from '@modules/accounts/dtos';
import { UserAddress } from '@modules/accounts/infra/typeorm/entities';
import { ErrorOnUpdate, NotFoundError } from '@shared/errors/database-query';
import {
  Either, filterAvailableParams, left, right,
} from '@shared/utils';

import { IUserAddressRepository } from '..';

export class UserAddressInMemoryRepository implements IUserAddressRepository {
  public address: UserAddress[] = [];

  async save(params: CreateUserAddressDTO): Promise<CreateUserAddressDTO> {
    const userAddress = new UserAddress();

    const newUserAddress = Object.assign(userAddress, params);

    this.address.push(newUserAddress);

    return params;
  }

  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, UserAddress>> {
    const userExists = this.address.find(
      (address) => address.id_user === userId,
    );

    if (!userExists) {
      return left(new NotFoundError(userId));
    }

    return right(userExists);
  }

  async update({
    id_user,
    ...rest
  }: UpdateUserAddressDTO): Promise<Either<ErrorOnUpdate, true>> {
    const phoneUser = this.address.find((address) => address.id_user === id_user);

    if (!phoneUser) {
      return left(new ErrorOnUpdate());
    }

    const data = filterAvailableParams(
      ['house_number', 'city', 'district', 'state', 'postal_code'],
      rest,
    );

    const newData = Object.assign(phoneUser, data);

    const index = this.address.findIndex(
      (address) => address.id_user === id_user,
    );

    this.address[index] = newData;

    return right(true);
  }
}
