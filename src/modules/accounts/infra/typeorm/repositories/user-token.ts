import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreteUserTokenDTO } from '@modules/accounts/dtos';
import { ITokenRepository } from '@modules/accounts/repositories';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { UserTokens } from '../entities';

@injectable()
export class TokenRepository implements ITokenRepository {
  private readonly repository: Repository<UserTokens>;

  constructor() {
    this.repository = getRepository(UserTokens);
  }

  async save({
    expires_in,
    id_user,
    token,
  }: CreteUserTokenDTO): Promise<UserTokens> {
    const refreshToken = this.repository.create({
      expires_in,
      id_user,
      token,
    });

    const queryResult = await this.repository.save(refreshToken);

    return queryResult;
  }
  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, UserTokens>> {
    const queryResult = await this.repository.findOne({
      where: {
        id_user: userId,
      },
    });

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(userId));
  }

  async findByToken(token: string): Promise<Either<NotFoundError, UserTokens>> {
    const queryResult = await this.repository.findOne({
      where: {
        token,
      },
    });

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(token));
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findByUserIdAndToken(
    id_user: string,
    token: string,
  ): Promise<Either<NotFoundError, UserTokens>> {
    const tokenData = await this.repository.findOne({
      where: {
        id_user,
        token,
      },
    });

    if (!tokenData) {
      return left(new NotFoundError(id_user));
    }

    return right(tokenData);
  }
}
