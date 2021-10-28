import { injectable } from 'tsyringe';
import { v4 as uuidV4 } from 'uuid';

import { IUuidProvider } from '../IUuid-provider';

@injectable()
export class UuidFacade implements IUuidProvider {
  async create(): Promise<string> {
    const uuid = uuidV4();

    return uuid;
  }
}
