import faker from 'faker';
import jwt from 'jsonwebtoken';
import 'reflect-metadata';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import auth from '@config/auth';
import { loadConnection } from '@config/typeorm';
import { User, UserAddress } from '@modules/accounts/infra/typeorm/entities';

import { CreateUserAddressUseCase } from './create-user-address-useCase';

const mock_user = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  password: 'any_password',
  email: 'any_@email.com',
};

const mock_user_address = {
  city: 'any_city',
  district: 'any_district',
  house_number: 1,
  postal_code: 'any_postal_code',
  state: 'any_state',
};

const access_token = jwt.sign({}, auth.secret_token);

const base_url = `/api/v1/address/create/${mock_user.id}`;
describe('create user address : integration', () => {
  let connection: Connection;
  let createUserAddressUseCase: CreateUserAddressUseCase;
  let api: SuperTest<Test>;
  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([mock_user])
      .execute();
    const { app } = await import('@config/server/app');

    createUserAddressUseCase = container.resolve('CreateUserAddressUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should create a new user address for a registered user', async () => {
    const http_response = await api
      .post(base_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(201);

    expect(http_response.body).toEqual(mock_user_address);
  });

  it('should not accept a invalid access token', async () => {
    const invalid_access_token = jwt.sign({}, 'invalid_secret');

    const http_response = await api
      .post(base_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${invalid_access_token}`,
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a request missing the access token', async () => {
    const http_response = await api
      .post(base_url)
      .send(mock_user_address)
      .expect(401);

    expect(http_response.body.error).toBe('Token missing');
  });

  it('should not accept a empty body request', async () => {
    const http_response = await api
      .post(base_url)
      .send({})
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toEqual('The body requisition is empty');
  });

  it('should not create a new user address for a not registered user', async () => {
    const id = faker.datatype.uuid();

    const invalid_url = `/api/v1/address/create/${id}`;

    const http_response = await api
      .post(invalid_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('User not found');
  });

  it('should not accept a body request missing requirers params', async () => {
    const http_response = await api
      .post(base_url)
      .send({
        ...mock_user_address,
        city: '',
      })
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toEqual(
      'The filed(s): [city] is missing.',
    );
  });

  it('should not create a user address if the user already have one', async () => {
    const id = faker.datatype.uuid();
    const id_address_table = faker.datatype.uuid();
    const url = `/api/v1/address/create/${id}`;

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          id,
          name: 'any_name',
          password: 'any_password',
          email: 'any_email',
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserAddress)
      .values([
        {
          id: id_address_table,
          ...mock_user_address,
          id_user: id,
        },
      ])
      .execute();

    const http_response = await api
      .post(url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('This user already has a address');
  });

  it('should not accept a invalid postal_code', async () => {
    const http_response = await api
      .post(base_url)
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

    const invalid_url = `/api/v1/address/create/${id}`;

    const http_response = await api
      .post(invalid_url)
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
      .spyOn(createUserAddressUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await api
      .post(base_url)
      .send(mock_user_address)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
