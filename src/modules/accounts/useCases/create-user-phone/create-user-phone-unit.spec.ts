import faker from 'faker';

import {
  UserPhoneInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import {
  BodyRequestValidator,
  CreateUserPhoneParamsValidator,
} from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { EmptyBodyError, InvalidParamError } from '@shared/errors/validator';
import { badRequest, serverError } from '@shared/http';

import { CreateUserPhoneController, CreateUserPhoneUseCase } from '.';
import { UserAlreadyHavePhone } from './errors';

let createUserPhoneController: CreateUserPhoneController;
let createUserPhoneUseCase: CreateUserPhoneUseCase;
let bodyRequestValidator: BodyRequestValidator;
let userRepository: UserRepositoryInMemory;
let userPhoneRepository: UserPhoneInMemory;
let createUserPhoneParamsValidator: CreateUserPhoneParamsValidator;

const user_mock = {
  id: faker.datatype.uuid(),
  email: 'user@example.com',
  password: 'any_password',
  name: 'any_name',
};

const user_phone_mock = {
  id_user: user_mock.id,
  phone_number: 'any_phone_number',
  type: 'any_type',
};

const http_request = {
  body: user_phone_mock,
  params: {
    id: user_mock.id,
  },
};

describe('create user phone : unit', () => {
  beforeEach(() => {
    userRepository = new UserRepositoryInMemory();
    userPhoneRepository = new UserPhoneInMemory();
    bodyRequestValidator = new BodyRequestValidator();

    createUserPhoneParamsValidator = new CreateUserPhoneParamsValidator();

    createUserPhoneUseCase = new CreateUserPhoneUseCase(
      userRepository,
      userPhoneRepository,
      createUserPhoneParamsValidator,
    );

    createUserPhoneController = new CreateUserPhoneController(
      createUserPhoneUseCase,
      bodyRequestValidator,
    );
  });

  it('should createUserPhoneUseCase call your methods correctly', async () => {
    await userRepository.save({
      ...user_mock,
    });

    const checkSpy = jest.spyOn(createUserPhoneParamsValidator, 'check');
    const findByIdSpy = jest.spyOn(userRepository, 'findById');
    const findByUserIdSpy = jest.spyOn(userPhoneRepository, 'findByUserId');
    const saveSpy = jest.spyOn(userPhoneRepository, 'save');

    await createUserPhoneUseCase.execute(user_phone_mock);

    expect(checkSpy).toBeCalledWith(user_phone_mock);
    expect(findByIdSpy).toBeCalledWith(user_phone_mock.id_user);
    expect(findByUserIdSpy).toBeCalledWith(user_phone_mock.id_user);
    expect(saveSpy).toBeCalledWith(user_phone_mock);
  });

  it('should createUserPhoneController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserPhoneUseCase, 'execute');

    await createUserPhoneController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: user_phone_mock,
      fields: ['type', 'phone_number'],
    });
    expect(executeSpy).toBeCalledWith(user_phone_mock);
  });

  it('should create a new user phone for a registered user', async () => {
    await userRepository.save({
      ...user_mock,
    });

    const http_response = await createUserPhoneController.handle(http_request);

    const result_data = {
      type: user_phone_mock.type,
      phone_number: user_phone_mock.phone_number,
    };
    expect(http_response.statusCode).toBe(201);
    expect(http_response.body).toEqual(result_data);
  });

  it('should not accept a empty body request', async () => {
    const http_response = await createUserPhoneController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user phone for a not registered user', async () => {
    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });

  it('should not create a user phone if the user already have one', async () => {
    await userRepository.save({
      ...user_mock,
    });

    await userPhoneRepository.save({
      ...user_phone_mock,
    });

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(badRequest(new UserAlreadyHavePhone()));
  });

  it('should not accept a user with invalid phone number', async () => {
    const http_request = {
      body: {
        ...user_phone_mock,
        phone_number: '123',
      },
      params: {
        id: user_mock.id,
      },
    };

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError(
          'The param: phone_number have less than 9 characters',
        ),
      ),
    );
  });
  it('should not accept a id_user with a invalid uuid format', async () => {
    const http_request = {
      body: {
        ...user_phone_mock,
      },
      params: {
        id: 'invalid_id',
      },
    };

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      ),
    );
  });

  it('should returns a server error if createUserPhoneUseCase throws an error ', async () => {
    jest
      .spyOn(createUserPhoneUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(serverError());
  });
});
