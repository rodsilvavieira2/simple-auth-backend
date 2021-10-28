import { hash } from 'bcrypt';
import faker from 'faker';
import request, { SuperTest, Test } from 'supertest';
import { Connection } from 'typeorm';

import { loadConnection } from '@config/typeorm';
import { User, UserTokens } from '@modules/accounts/infra/typeorm/entities';

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

const user_password = {
  password: 'any_password',
};

const base_url = `/api/v1/password/reset?token=${user_token_mock.token}`;
describe('reset password user : integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();
    const passwordHash = await hash(user_mock.password, 1);

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          ...user_mock,
          password: passwordHash,
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserTokens)
      .values([user_token_mock])
      .execute();

    const { app } = await import('@config/server/app');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should reset a password user if the reset password token is valid', async () => {
    await api.post(base_url).send(user_password).expect(200);
  });

  it('should not accept a token that is not registered', async () => {
    const token = faker.datatype.uuid();

    const invalid_url = `/api/v1/password/reset?token=${token}`;
    const http_response = await api
      .post(invalid_url)
      .send(user_password)
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a request missing the reset password token', async () => {
    const invalid_url = '/api/v1/password/reset';

    const http_response = await api
      .post(invalid_url)
      .send(user_password)
      .expect(400);

    expect(http_response.body.error).toBe(
      'Missing the reset password token on the request query',
    );
  });

  it('should not accept a empty body request', async () => {
    const http_response = await api.post(base_url).send({}).expect(400);

    expect(http_response.body.error).toBe('The body requisition is empty');
  });

  it('should not accept a token that is expired', async () => {
    const invalid_user_token_mock = {
      id: faker.datatype.uuid(),
      id_user: user_mock.id,
      token: faker.datatype.uuid(),
      expires_in: faker.date.past(),
    };

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserTokens)
      .values([invalid_user_token_mock])
      .execute();
    const invalid_url = `/api/v1/password/reset?token=${invalid_user_token_mock.token}`;

    const http_response = await api
      .post(invalid_url)
      .send(user_password)
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });
});
