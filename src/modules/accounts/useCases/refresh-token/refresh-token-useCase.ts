import { inject, injectable } from 'tsyringe';

import auth from '@config/auth';
import { ITokenRepository } from '@modules/accounts/repositories';
import { IDateProvider, IJwtProvider } from '@shared/container/providers';
import { Either, left, right } from '@shared/utils';

import { InvalidRefreshToken, UserTokenDoesNotExists } from './errors';

type Response = {
  refresh_token: string;
  access_token: string;
};

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
    @inject('JwtFacade')
    private readonly jwtProvider: IJwtProvider,
  ) {}

  async execute(token: string): Promise<Either<Error, Response>> {
    const isRefreshTokenValid = await this.jwtProvider.verify(
      token,
      auth.secret_refresh_token,
    );

    if (!isRefreshTokenValid) {
      return left(new InvalidRefreshToken());
    }

    const { sub: id_user, email } = await this.jwtProvider.decode(token);

    const tokenData = await this.tokenRepository.findByUserIdAndToken(
      id_user,
      token,
    );

    if (tokenData.isLeft()) {
      return left(new UserTokenDoesNotExists());
    }

    await this.tokenRepository.deleteById(tokenData.value.id);

    const refresh_token = await this.jwtProvider.createToken(
      { email },
      auth.expires_in_refresh_token,
      auth.secret_refresh_token,
      id_user,
    );

    const expires_in = this.dateProvider.addDays(
      auth.expires_refresh_token_days,
    );

    await this.tokenRepository.save({
      expires_in,
      id_user,
      token: refresh_token,
    });

    const access_token = await this.jwtProvider.createToken(
      {
        id_user,
        email,
      },
      auth.expires_in_token,
      auth.secret_token,
      id_user,
    );

    return right({
      access_token,
      refresh_token,
    });
  }
}
