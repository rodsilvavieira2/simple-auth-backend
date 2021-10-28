import { NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import { CreteUserTokenDTO } from '../dtos';
import { UserTokens } from '../infra/typeorm/entities';

export interface ITokenRepository {
  save(params: CreteUserTokenDTO): Promise<UserTokens>;
  findByUserId(userId: string): Promise<Either<NotFoundError, UserTokens>>;
  findByToken(token: string): Promise<Either<NotFoundError, UserTokens>>;
  deleteById(id: string): Promise<void>;
  findByUserIdAndToken(
    id_user: string,
    token: string,
  ): Promise<Either<NotFoundError, UserTokens>>;
}
