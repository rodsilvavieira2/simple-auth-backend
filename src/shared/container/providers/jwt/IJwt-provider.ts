import { JwtPayload } from 'jsonwebtoken';

export interface IJwtProvider {
  createToken(
    payload: any,
    expiresIn: string | number,
    secret: string,
    subject: string,
  ): Promise<string>;

  verify(token: string, secret: string): Promise<boolean>;

  decode(token: string): Promise<JwtPayload>;
}
