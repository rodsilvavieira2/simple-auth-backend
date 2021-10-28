import { inject, injectable } from 'tsyringe';

import {
  IUserRepository,
  ITokenRepository,
} from '@modules/accounts/repositories';
import { IDateProvider } from '@shared/container/providers';
import { InvalidTokenError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    token: string,
  ): Promise<Either<InvalidTokenError, true>> {
    const tokenExists = await this.tokenRepository.findByToken(token);

    if (tokenExists.isLeft()) {
      return left(new InvalidTokenError());
    }

    const { expires_in, id, id_user } = tokenExists.value;

    if (
      this.dateProvider.compareIfBefore(expires_in, this.dateProvider.dateNow())
    ) {
      return left(new InvalidTokenError());
    }

    const user = await this.userRepository.findById(id_user);

    if (user.isRight()) {
      user.value.isVerified = true;

      await this.userRepository.save(user.value);
    }

    await this.tokenRepository.deleteById(id);

    return right(true);
  }
}
