import 'reflect-metadata';
import { hash } from 'bcrypt';
import faker from 'faker';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import { loadConnection } from '@config/typeorm';
import { User } from '@modules/accounts/infra/typeorm/entities';

import { UserAuthenticateUseCase } from './user-authenticate-useCase';

const mock_user = {
  id: faker.datatype.uuid(),
  email: 'any_email',
  password: 'any_password',
  name: 'any_name',
};

describe('user authenticate: integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;
  let userAuthenticateUseCase: UserAuthenticateUseCase;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();

    const passwordHash = await hash(mock_user.password, 1);

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          ...mock_user,
          password: passwordHash,
        },
      ])
      .execute();

    const { app } = await import('@config/server/app');
    userAuthenticateUseCase = container.resolve('UserAuthenticateUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const base_url = '/api/v1/auth/sessions';

  it('should authenticate a registered user', async () => {
    const http_response = await api.post(base_url).send(mock_user).expect(200);

    expect(http_response.body.accessToken).toBeTruthy();
    expect(http_response.body.refreshToken).toBeTruthy();
    expect(http_response.body.user.password).toBeFalsy();
    expect(http_response.body.password).toBeFalsy();
  });

  it('should not authenticate a user with invalid password', async () => {
    const http_response = await api
      .post(base_url)
      .send({
        ...mock_user,
        password: '123',
      })
      .expect(401);

    expect(http_response.body.error).toBe('Email or password invalid');
  });

  it('should not authenticate a user with a not registered email address', async () => {
    const http_response = await api
      .post(base_url)
      .send({
        ...mock_user,
        email: 'invalid_email',
      })
      .expect(401);

    expect(http_response.body.error).toBe('Email or password invalid');
  });

  it('should not accept a empty body request', async () => {
    const http_response = await api.post(base_url).send({}).expect(400);

    expect(http_response.body.error).toEqual('The body requisition is empty');
  });

  it('should not accept a body request missing requirers params', async () => {
    const http_response = await api
      .post(base_url)
      .send({
        ...mock_user,
        email: '',
      })
      .expect(400);

    expect(http_response.body.error).toBe('The filed(s): [email] is missing.');
  });

  it('should returns a server error if userAuthenticateUseCase.execute() throws an error', async () => {
    jest
      .spyOn(userAuthenticateUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await api
      .post(base_url)
      .send(mock_user)

      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
