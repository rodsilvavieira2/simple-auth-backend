import 'reflect-metadata';
import faker from 'faker';
import { sign } from 'jsonwebtoken';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import auth from '@config/auth';
import { loadConnection } from '@config/typeorm';
import { User, UserAddress } from '@modules/accounts/infra/typeorm/entities';

import { UpdateUserAddressUseCase } from './update-user-address-useCase';

const mock_user = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  password: 'any_password',
  email: 'any_@email.com',
};

const mock_user_address = {
  id: faker.datatype.uuid(),
  city: 'any_city',
  district: 'any_district',
  id_user: mock_user.id,
  house_number: 1,
  postal_code: 'any_postal_code',
  state: 'any_state',
};

const access_token = sign({}, auth.secret_token);

const base_url = `/api/v1/address/update/${mock_user.id}`;

describe('update user address: integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;
  let updateUserAddressUseCase: UpdateUserAddressUseCase;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([mock_user])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserAddress)
      .values([mock_user_address])
      .execute();

    const { app } = await import('@config/server/app');

    updateUserAddressUseCase = container.resolve('UpdateUserAddressUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should update the user address data for a registered user', async () => {
    const new_user_address = {
      city: 'new_city',
      district: 'new_district',
      house_number: 2,
      postal_code: 'new_postal_code',
      state: 'new_state',
    };

    const http_response = await api
      .put(base_url)
      .send(new_user_address)
      .set({
        authorization: `Barer ${access_token}`,
      })
      .expect(200);

    expect(http_response.body).toEqual(new_user_address);
  });

  it('should not accept a request with a invalid  access token', async () => {
    const new_user_address = {
      city: 'new_city',
      district: 'new_district',
      house_number: 2,
      postal_code: 'new_postal_code',
      state: 'new_state',
    };

    const http_response = await api
      .put(base_url)
      .send(new_user_address)
      .set({
        authorization: 'Barer any_access token',
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a request missing the access token', async () => {
    const new_user_address = {
      city: 'new_city',
      district: 'new_district',
      house_number: 2,
      postal_code: 'new_postal_code',
      state: 'new_state',
    };

    const http_response = await api
      .put(base_url)
      .send(new_user_address)
      .expect(401);

    expect(http_response.body.error).toBe('Token missing');
  });
  it('should not update a new user address for a not registered user', async () => {
    const id = faker.datatype.uuid();

    const invalid_url = `/api/v1/address/update/${id}`;

    const http_response = await api
      .put(invalid_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('User not found');
  });

  it('should not accept a invalid postal_code', async () => {
    const http_response = await api
      .put(base_url)
      .send({
        ...mock_user_address,
        postal_code: 'any',
      })
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('The param postal_code is not valid');
  });

  it('should not accept a id_user with a invalid uuid format', async () => {
    const id = 'any_id';

    const invalid_url = `/api/v1/address/update/${id}`;

    const http_response = await api
      .put(invalid_url)
      .send({
        ...mock_user_address,
      })
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe(
      'The id_user does not have a valid uuid format',
    );
  });

  it('should returns a server error if createUserAddressUseCase throws an error', async () => {
    jest
      .spyOn(updateUserAddressUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await api
      .put(base_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
