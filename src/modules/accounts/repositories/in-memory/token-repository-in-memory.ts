import { CreteUserTokenDTO } from '@modules/accounts/dtos';
import { UserTokens } from '@modules/accounts/infra/typeorm/entities';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { ITokenRepository } from '../IToken-repository';

export class TokenRepositoryInMemory implements ITokenRepository {
  refreshTokens: UserTokens[] = [];

  async save({
    id,
    expires_in,
    id_user,
    token,
  }: CreteUserTokenDTO): Promise<UserTokens> {
    const refreshToken = new UserTokens();

    Object.assign(refreshToken, {
      id,
      expires_in,
      id_user,
      token,
    });

    this.refreshTokens.push(refreshToken);

    return refreshToken;
  }
  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, UserTokens>> {
    const refreshToken = this.refreshTokens.find(
      (token) => token.id_user === userId,
    );

    if (refreshToken) {
      return right(refreshToken);
    }

    return left(new NotFoundError(userId));
  }
  async findByToken(token: string): Promise<Either<NotFoundError, UserTokens>> {
    const refreshToken = this.refreshTokens.find(
      (refreshToken) => refreshToken.token === token,
    );

    if (refreshToken) {
      return right(refreshToken);
    }

    return left(new NotFoundError(token));
  }
  async deleteById(id: string): Promise<void> {
    const refreshTokens = this.refreshTokens.filter((token) => token.id !== id);

    this.refreshTokens = refreshTokens;
  }

  async findByUserIdAndToken(
    id_user: string,
    token: string,
  ): Promise<Either<NotFoundError, UserTokens>> {
    const tokenData = this.refreshTokens.find(
      (data) => data.id_user === id_user && data.token === token,
    );

    if (!tokenData) {
      return left(new NotFoundError(id_user));
    }

    return right(tokenData);
  }
}
