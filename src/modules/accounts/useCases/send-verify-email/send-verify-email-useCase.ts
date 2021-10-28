import path from 'path';
import { injectable, inject } from 'tsyringe';

import { ITokenRepository, IUserRepository } from '@modules/accounts/repositories';
import { IDateProvider, IMailProvider, IUuidProvider } from '@shared/container/providers';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

@injectable()
export class SendVerifyEmailUseCase {
  constructor(
    @inject('SESMailProvider')
    private readonly mailProvider: IMailProvider,
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
    @inject('UuidFacade')
    private readonly uuidProvider: IUuidProvider,
  ) {}

  async execute(email: string): Promise<Either<UserNotFoundError, true>> {
    const userExists = await this.userRepository.findByEmail(email);

    if (userExists.isLeft()) {
      return left(new UserNotFoundError());
    }

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      'views',
      'emails',
      'verify-email.hbs',
    );

    const token = await this.uuidProvider.create();

    const expires_in = this.dateProvider.addHours(3);

    const { id, name } = userExists.value;

    await this.tokenRepository.save({
      token,
      expires_in,
      id_user: id,
    });

    const variables = {
      name,
      link: `${process.env.VERIFY_EMAIL_URL}${token}`,
    };

    await this.mailProvider.sendMail(
      email,
      'verify email address',
      variables,
      templatePath,
    );

    return right(true);
  }
}
