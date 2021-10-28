import path from 'path';
import { inject, injectable } from 'tsyringe';

import {
  ITokenRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import {
  IDateProvider,
  IMailProvider,
  IUuidProvider,
} from '@shared/container/providers';
import {
  EmailNotVerifiedError,
  UserNotFoundError,
} from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

@injectable()
export class SendForgotPasswordEmailUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
    @inject('UuidFacade')
    private readonly uuidProvider: IUuidProvider,
    @inject('SESMailProvider')
    private readonly mailProvider: IMailProvider,
  ) {}

  async execute(email: string): Promise<Either<Error, true>> {
    const user = await this.userRepository.findByEmail(email);

    if (user.isLeft()) {
      return left(new UserNotFoundError());
    }

    if (!user.value.isVerified) {
      return left(new EmailNotVerifiedError('reset password'));
    }

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      'views',
      'emails',
      'forgotPassword.hbs',
    );

    const token = await this.uuidProvider.create();

    const expires_in = this.dateProvider.addDays(3);

    await this.tokenRepository.save({
      token,
      id_user: user.value.id,
      expires_in,
    });

    const variables = {
      name: user.value.name,
      link: `${process.env.FORGOT_EMAIL_URL}${token}`,
    };

    await this.mailProvider.sendMail(
      email,
      'password recovery',
      variables,
      templatePath,
    );

    return right(true);
  }
}
