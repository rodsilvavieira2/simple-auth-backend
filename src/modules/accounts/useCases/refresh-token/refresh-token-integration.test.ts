import 'reflect-metadata';
import faker from 'faker';
import { sign } from 'jsonwebtoken';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import auth from '@config/auth';
import { loadConnection } from '@config/typeorm';
import { User, UserTokens } from '@modules/accounts/infra/typeorm/entities';

import { RefreshTokenUseCase } from './refresh-token-useCase';

const user_mock = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  password: 'any_password',
  email: 'any_email',
};

const refresh_token = sign({ email: 'any_email' }, auth.secret_refresh_token, {
  subject: user_mock.id,
});

const user_token_mock = {
  id: faker.datatype.uuid(),
  id_user: user_mock.id,
  token: refresh_token,
  expires_in: faker.date.future(),
};

const base_url = '/api/v1/auth/refresh-token';

describe('refresh token: integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;
  let refreshTokenUseCase: RefreshTokenUseCase;

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

    refreshTokenUseCase = container.resolve('RefreshTokenUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should accept a valid refresh token', async () => {
    const http_response = await api
      .post(base_url)
      .set({
        'x-refresh-token': refresh_token,
      })
      .expect(201);

    expect(http_response.body.access_token).toBeTruthy();
    expect(http_response.body.refresh_token).toBeTruthy();
  });

  it('should not accept a invalid refresh_token', async () => {
    const http_response = await api
      .post(base_url)
      .set({
        'x-refresh-token': 'invalid_token',
      })
      .expect(401);

    expect(http_response.body.error).toBe('Invalid refresh token');
  });

  it('should not accept a not registered refresh token', async () => {
    const not_registered = sign(
      { email: 'email_any' },
      auth.secret_refresh_token,
      {
        subject: user_mock.id,
      },
    );

    const http_response = await api
      .post(base_url)
      .set({
        'x-refresh-token': not_registered,
      })
      .expect(401);

    expect(http_response.body.error).toBe('Refresh Token does not exists!');
  });

  it('should return a server error if refreshTokenUseCase throws a error', async () => {
    jest
      .spyOn(refreshTokenUseCase, 'execute')
      .mockRejectedValueOnce(new Error());
    const http_response = await api
      .post(base_url)
      .set({
        'x-refresh-token': refresh_token,
      })
      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
