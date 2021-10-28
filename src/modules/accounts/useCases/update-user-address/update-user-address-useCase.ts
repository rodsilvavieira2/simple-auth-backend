import { injectable, inject } from 'tsyringe';

import { UpdateUserAddressDTO } from '@modules/accounts/dtos';
import {
  IUserAddressRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { IValidator } from '@shared/container/providers';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { UserMustHaveAddressError } from './errors';

@injectable()
export class UpdateUserAddressUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserAddressRepository')
    private readonly userAddressRepository: IUserAddressRepository,
    @inject('UpdateUserAddressParamsValidator')
    private readonly validator: IValidator,
  ) {}

  async execute({
    city,
    district,
    house_number,
    postal_code,
    state,
    id_user,
  }: UpdateUserAddressDTO): Promise<Either<Error, UpdateUserAddressDTO>> {
    const haveAInvalidParam = this.validator.check({
      city,
      district,
      house_number,
      postal_code,
      state,
      id_user,
    });

    if (haveAInvalidParam.isLeft()) {
      return left(haveAInvalidParam.value);
    }

    const userExists = await this.userRepository.findById(id_user);

    if (userExists.isLeft()) {
      return left(new UserNotFoundError());
    }

    const alreadyHaveAddress = await this.userAddressRepository.findByUserId(
      id_user,
    );

    if (alreadyHaveAddress.isLeft()) {
      return left(new UserMustHaveAddressError());
    }

    const result = await this.userAddressRepository.update({
      id_user,
      city,
      district,
      house_number,
      postal_code,
      state,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    return right({
      city,
      district,
      house_number,
      postal_code,
      state,
    });
  }
}
