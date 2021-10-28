import { inject, injectable } from 'tsyringe';

import config from '@config/auth';
import { UserAuthenticateDTO } from '@modules/accounts/dtos';
import {
  ITokenRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import {
  IDateProvider,
  IHasherProvider,
  IJwtProvider,
} from '@shared/container/providers';
import { Either, left, right } from '@shared/utils';

import { EmailOrPasswordInvalid } from './errors';

type Response = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

@injectable()
export class UserAuthenticateUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('JwtFacade')
    private readonly jwtProvider: IJwtProvider,
    @inject('BcryptFacade')
    private readonly hasherProvider: IHasherProvider,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute({
    email,
    password,
  }: UserAuthenticateDTO): Promise<Either<EmailOrPasswordInvalid, Response>> {
    const userExists = await this.userRepository.findByEmail(email);

    if (userExists.isLeft()) {
      return left(new EmailOrPasswordInvalid());
    }

    const isPasswordValid = await this.hasherProvider.compare(
      password,
      userExists.value.password,
    );

    if (!isPasswordValid) {
      return left(new EmailOrPasswordInvalid());
    }

    const { id, name } = userExists.value;

    const {
      expires_in_token,
      secret_token,
      expires_in_refresh_token,
      expires_refresh_token_days,
      secret_refresh_token,
    } = config;

    const accessToken = await this.jwtProvider.createToken(
      {
        email,
        id,
      },
      expires_in_token,
      secret_token,
      id,
    );

    const refreshToken = await this.jwtProvider.createToken(
      {
        id,
        email,
      },
      expires_in_refresh_token,
      secret_refresh_token,
      id,
    );

    const refresh_token_expires_data = this.dateProvider.addDays(
      expires_refresh_token_days,
    );

    await this.tokenRepository.save({
      token: refreshToken,
      id_user: id,
      expires_in: refresh_token_expires_data,
    });

    const response: Response = {
      accessToken,
      refreshToken,
      user: {
        id,
        email,
        name,
      },
    };

    return right(response);
  }
}
