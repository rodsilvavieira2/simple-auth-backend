import { inject, injectable } from 'tsyringe';

import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import {
  IUserPhoneRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { IValidator } from '@shared/container/providers';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { UserAlreadyHavePhone } from './errors';

type response = {
  type: string;
  phone_number: string;
};

@injectable()
export class CreateUserPhoneUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserPhoneRepository')
    private readonly userPhoneRepository: IUserPhoneRepository,
    @inject('CreateUserPhoneParamsValidator')
    private readonly validator: IValidator,
  ) {}

  async execute({
    id_user,
    phone_number,
    type,
  }: CreateUserPhoneDTO): Promise<Either<Error, response>> {
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

    const userAlreadyHavePhone = await this.userPhoneRepository.findByUserId(
      id_user,
    );

    if (userAlreadyHavePhone.isRight()) {
      return left(new UserAlreadyHavePhone());
    }

    await this.userPhoneRepository.save({
      id_user,
      phone_number,
      type,
    });

    return right({
      phone_number,
      type,
    });
  }
}
