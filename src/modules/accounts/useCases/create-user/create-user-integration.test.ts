/* eslint-disable import/no-extraneous-dependencies */
import 'reflect-metadata';
import '@shared/container';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import { loadConnection } from '@config/typeorm';
import { USER_PARAMS_VALIDATOR_ERRORS } from '@shared/container/providers/validator/implementations';

import { CreatUserUseCase } from './create-user-useCase';

let api: SuperTest<Test>;

const base_url = '/api/v1/users';

let creatUserUseCase: CreatUserUseCase;
describe('create user:integration test', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();

    const { app } = await import('@config/server/app');

    api = request(app);
    creatUserUseCase = container.resolve('CreatUserUseCase');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it('should create a new user', async () => {
    const new_user = {
      name: 'any_name',
      email: 'example@example.com',
      password: '12345678',
    };

    const http_response = await api.post(base_url).send(new_user).expect(201);
    expect(http_response.body).toBeFalsy();
  });

  it('should not accept a empty body request', async () => {
    const http_response = await api.post(base_url).send({}).expect(400);

    expect(http_response.body.error).toBe('The body requisition is empty');
  });

  it('should not accept a body request missing a required field', async () => {
    const new_user = {
      email: 'example@example.com',
    };
    const http_response = await api.post(base_url).send(new_user);

    expect(http_response.body.error).toBe(
      'The filed(s): [name,password] is missing.',
    );
  });

  it('should not accept a invalid email address', async () => {
    const new_user = {
      name: 'any_name',
      email: 'invalid_email.com',
      password: '12345678',
    };

    const http_response = await api.post(base_url).send(new_user).expect(400);
    expect(http_response.body.error).toBe(USER_PARAMS_VALIDATOR_ERRORS.email);
  });

  it('should not accept a invalid name', async () => {
    const new_user = {
      name: 'i',
      email: 'example@example.com',
      password: '12345678',
    };

    const http_response = await api.post(base_url).send(new_user).expect(400);
    expect(http_response.body.error).toBe(USER_PARAMS_VALIDATOR_ERRORS.name);
  });

  it('should not accept a invalid password', async () => {
    const new_user = {
      name: 'any_name',
      email: 'example@example.com',
      password: '12345',
    };

    const http_response = await api.post(base_url).send(new_user).expect(400);
    expect(http_response.body.error).toBe(
      USER_PARAMS_VALIDATOR_ERRORS.password,
    );
  });
  it('should returns a server error if createUserUseCase.execute() throws a error', async () => {
    jest.spyOn(creatUserUseCase, 'execute').mockRejectedValue(new Error());

    const new_user = {
      name: 'any_name',
      email: 'example@example.com',
      password: '12345678',
    };

    const http_response = await api.post(base_url).send(new_user).expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
