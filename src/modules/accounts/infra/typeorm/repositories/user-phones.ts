import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateUserPhoneDTO, UpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { IUserPhoneRepository } from '@modules/accounts/repositories';
import { ErrorOnUpdate } from '@shared/errors/database-query';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { UserPhone, UserPhoneTypes } from '../entities';

@injectable()
export class UserPhoneRepository implements IUserPhoneRepository {
  private phoneRepository: Repository<UserPhone>;
  private phoneTypeRepository: Repository<UserPhoneTypes>;

  constructor() {
    this.phoneRepository = getRepository(UserPhone);
    this.phoneTypeRepository = getRepository(UserPhoneTypes);
  }

  async save({
    type,
    id_user,
    phone_number,
  }: CreateUserPhoneDTO): Promise<CreateUserPhoneDTO> {
    const userPhoneTypes = await this.phoneTypeRepository.findOne({
      where: {
        type,
      },
    });

    if (userPhoneTypes) {
      const userPhone = this.phoneRepository.create({
        phone_number,
        id_user,
        userPhoneTypes,
      });

      await this.phoneRepository.manager.save(userPhone);

      return {
        id_user,
        phone_number,
        type,
      };
    }

    return null;
  }

  async findByUserId(
    id_user: string,
  ): Promise<Either<UserNotFoundError, CreateUserPhoneDTO>> {
    const phoneUser = await this.phoneRepository.findOne({
      where: {
        id_user,
      },
      relations: ['userPhoneTypes'],
    });

    if (!phoneUser) {
      return left(new UserNotFoundError());
    }

    const { phone_number, userPhoneTypes } = phoneUser;

    return right({
      phone_number,
      id_user,
      type: userPhoneTypes.type,
    });
  }

  async update({
    id_user,
    phone_number,
    type,
  }: UpdateUserPhoneDTO): Promise<Either<ErrorOnUpdate, UpdateUserPhoneDTO>> {
    if (type) {
      const typeData = await this.phoneTypeRepository.findOne({
        where: {
          type,
        },
      });

      if (!typeData) {
        return left(new ErrorOnUpdate());
      }

      if (typeData) {
        const result = await this.phoneRepository.update(
          { id_user },
          {
            id_user_phone_types: typeData.id,
          },
        );

        if (!result.affected) {
          return left(new ErrorOnUpdate());
        }
      }
    }

    if (phone_number) {
      const phoneData = await this.phoneRepository.update(
        { id_user },
        { phone_number },
      );

      if (!phoneData.affected) {
        return left(new ErrorOnUpdate());
      }
    }

    return right({
      phone_number,
      type,
    });
  }
}
