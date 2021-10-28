import 'reflect-metadata';
import faker from 'faker';
import { sign } from 'jsonwebtoken';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import auth from '@config/auth';
import { loadConnection } from '@config/typeorm';
import { User, UserTokens } from '@modules/accounts/infra/typeorm/entities';

import { VerifyEmailUseCase } from './verify-email-useCase';

const user_mock = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
};

const user_token_mock = {
  id: faker.datatype.uuid(),
  id_user: user_mock.id,
  token: faker.datatype.uuid(),
  expires_in: faker.date.future(),
};

const access_token = sign({}, auth.secret_token);
const base_url = `/api/v1/users/verify-email?token=${user_token_mock.token}`;

describe('verify email: integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;
  let verifyEmailUseCase: VerifyEmailUseCase;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([user_mock])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserTokens)
      .values([user_token_mock])
      .execute();

    const { app } = await import('@config/server/app');

    verifyEmailUseCase = container.resolve('VerifyEmailUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should verify a email of a registered user', async () => {
    await api
      .post(base_url)
      .set({
        authorization: `Barer ${access_token}`,
      })
      .expect(200);
  });

  it('should not accept a not registered token', async () => {
    const invalid_url = '/api/v1/users/verify-email?token=any_token';

    const http_response = await api
      .post(invalid_url)
      .set({
        authorization: `Barer ${access_token}`,
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a expired token', async () => {
    const invalid_token = {
      id: faker.datatype.uuid(),
      id_user: user_mock.id,
      token: faker.datatype.uuid(),
      expires_in: faker.date.past(),
    };

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserTokens)
      .values([invalid_token])
      .execute();

    const invalid_url = `/api/v1/users/verify-email?token=${invalid_token.token}`;

    const http_response = await api
      .post(invalid_url)
      .set({
        authorization: `Barer ${access_token}`,
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });
  it('should not accept a request missing the query route token', async () => {
    const invalid_url = '/api/v1/users/verify-email';

    const http_response = await api
      .post(invalid_url)
      .set({
        authorization: `Barer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('Token missing on the route query');
  });

  it('should not accept a request with a invalid  access token', async () => {
    const http_response = await api
      .post(base_url)
      .set({
        authorization: 'Barer any_access token',
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a request missing the access token', async () => {
    const http_response = await api.post(base_url).expect(401);

    expect(http_response.body.error).toBe('Token missing');
  });

  it('should returns a server error if VerifyEmailUseCase throws an error', async () => {
    jest
      .spyOn(verifyEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await api
      .post(base_url)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
