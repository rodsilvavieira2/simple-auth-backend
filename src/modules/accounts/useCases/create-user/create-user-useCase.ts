import { inject, injectable } from 'tsyringe';

import { IHasherProvider } from '@shared/container/providers/hasher';
import { IValidator } from '@shared/container/providers/validator';
import { Either, left, right } from '@shared/utils';

import { CreateUserDTO } from '../../dtos';
import { IUserRepository } from '../../repositories';
import { EmailAlreadyUseError } from './errors';

@injectable()
class CreatUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserParamsValidator')
    private readonly validator: IValidator,
    @inject('BcryptFacade')
    private readonly hasherProvider: IHasherProvider,
  ) {}

  async execute({
    email,
    name,
    password,
  }: CreateUserDTO): Promise<Either<Error, true>> {
    const haveAInvalidParam = this.validator.check({
      email,
      name,
      password,
    });

    const emailAlreadyUse = await this.userRepository.findByEmail(email);

    if (haveAInvalidParam.isLeft()) {
      return left(haveAInvalidParam.value);
    }

    if (emailAlreadyUse.isRight()) {
      return left(new EmailAlreadyUseError(email));
    }

    const passwordHash = await this.hasherProvider.hash(password);

    await this.userRepository.save({
      email,
      name,
      password: passwordHash,
    });

    return right(true);
  }
}

export { CreatUserUseCase };
