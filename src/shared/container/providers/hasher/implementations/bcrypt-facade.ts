import bcrypt from 'bcrypt';
import { inject, injectable } from 'tsyringe';

import { IHasherProvider } from '../IHasher-provider';

@injectable()
export class BcryptFacade implements IHasherProvider {
  constructor(
    @inject('BcryptRoundsValue') private readonly roundsOrSalt: string | number,
  ) {}

  async hash(plaintext: string): Promise<string> {
    const token = bcrypt.hash(plaintext, this.roundsOrSalt);
    return token;
  }
  async compare(plaintext: string, digest: string): Promise<boolean> {
    const isValid = await bcrypt.compare(plaintext, digest);

    return isValid;
  }
}
