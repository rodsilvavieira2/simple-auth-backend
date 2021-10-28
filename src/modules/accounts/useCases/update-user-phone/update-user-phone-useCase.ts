import { inject, injectable } from 'tsyringe';

import { UpdateUserPhoneDTO } from '@modules/accounts/dtos';
import {
  IUserPhoneRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { IValidator } from '@shared/container/providers';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { UserMustHavePhoneError } from './errors';

@injectable()
export class UpdateUserPhoneUseCase {
  constructor(
    @inject('UserPhoneRepository')
    private readonly userPhoneRepository: IUserPhoneRepository,
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UpdateUserPhoneParamsValidator')
    private readonly validator: IValidator,
  ) {}

  async execute({
    id_user,
    phone_number,
    type,
  }: UpdateUserPhoneDTO): Promise<Either<Error, UpdateUserPhoneDTO>> {
    const haveAInvalidParam = this.validator.check({
      id_user,
      phone_number,
      type,
    });

    if (haveAInvalidParam.isLeft()) {
      return left(haveAInvalidParam.value);
    }

    const userExists = await this.userRepository.findById(id_user);

    if (userExists.isLeft()) {
      return left(new UserNotFoundError());
    }

    const alreadyHavePhone = await this.userPhoneRepository.findByUserId(
      id_user,
    );

    if (alreadyHavePhone.isLeft()) {
      return left(new UserMustHavePhoneError());
    }

    const result = await this.userPhoneRepository.update({
      id_user,
      phone_number,
      type,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    return right({
      phone_number,
      type,
    });
  }
}
