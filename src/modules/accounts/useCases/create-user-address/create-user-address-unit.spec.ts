import faker from 'faker';

import {
  UserAddressInMemoryRepository,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import {
  BodyRequestValidator,
  CreateUserAddressParamsValidator,
} from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import {
  EmptyBodyError,
  InvalidParamError,
  MissingParamError,
} from '@shared/errors/validator';
import { badRequest, serverError } from '@shared/http';

import { CreateUserAddressController } from './create-user-address-controller';
import { CreateUserAddressUseCase } from './create-user-address-useCase';
import { UserAlreadyHaveAddress } from './errors';

let createUserAddressUseCase: CreateUserAddressUseCase;
let createUserAddressController: CreateUserAddressController;
let userAddressRepository: UserAddressInMemoryRepository;
let userRepository: UserRepositoryInMemory;
let bodyRequestValidator: BodyRequestValidator;
let createUserAddressParamsValidator: CreateUserAddressParamsValidator;

const user_mock = {
  id: faker.datatype.uuid(),
  email: 'any_email',
  name: 'any_name',
  password: 'any_password',
};

const user_address_mock = {
  city: 'any_city',
  state: 'any_state',
  district: 'any_district',
  house_number: 1,
  id_user: user_mock.id,
  postal_code: 'any_postal_code',
};

const http_request = {
  body: user_address_mock,
  params: {
    id: user_address_mock.id_user,
  },
};
describe('Create user address: unit', () => {
  beforeEach(() => {
    userAddressRepository = new UserAddressInMemoryRepository();
    userRepository = new UserRepositoryInMemory();

    createUserAddressParamsValidator = new CreateUserAddressParamsValidator();
    createUserAddressUseCase = new CreateUserAddressUseCase(
      userAddressRepository,
      userRepository,
      createUserAddressParamsValidator,
    );
    bodyRequestValidator = new BodyRequestValidator();
    createUserAddressController = new CreateUserAddressController(
      createUserAddressUseCase,
      bodyRequestValidator,
    );
  });
  it('should createUserAddressUseCase call your methods correctly', async () => {
    await userRepository.save({

      ...user_mock,
    });

    const findByIdSpy = jest.spyOn(userRepository, 'findById');

    const saveSpy = jest.spyOn(userAddressRepository, 'save');
    const checkSpy = jest.spyOn(createUserAddressParamsValidator, 'check');
    const findByUserIdSpy = jest.spyOn(userAddressRepository, 'findByUserId');

    await createUserAddressUseCase.execute(user_address_mock);

    expect(checkSpy).toBeCalledWith(user_address_mock);
    expect(findByIdSpy).toBeCalledWith(user_address_mock.id_user);
    expect(findByUserIdSpy).toBeCalledWith(user_address_mock.id_user);
    expect(saveSpy).toBeCalledWith(user_address_mock);
  });

  it('should createUserAddressController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserAddressUseCase, 'execute');

    await createUserAddressController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: ['city', 'state', 'house_number', 'postal_code', 'district'],
    });

    expect(executeSpy).toBeCalledWith(user_address_mock);
  });

  it('should create a new user address for a registered user', async () => {
    await userRepository.save({
      ...user_mock,
    });

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id_user, ...rest } = user_address_mock;

    expect(http_response.statusCode).toEqual(201);
    expect(http_response.body).toEqual(rest);
  });

  it('should not accept a empty body request', async () => {
    const http_response = await createUserAddressController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user address for a not registered user', async () => {
    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });

  it('should not accept a body request missing requirers params', async () => {
    const invalid_Body = {
      city: 'any_city',
      state: 'any_state',
      district: 'any_district',
      house_number: 1,
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
      params: {
        id: user_address_mock.id_user,
      },
    });

    expect(http_response).toEqual(
      badRequest(
        new MissingParamError('The filed(s): [postal_code] is missing.'),
      ),
    );
  });

  it('should not create a user address if the user already have one', async () => {
    await userRepository.save({
      ...user_mock,
    });

    await userAddressRepository.save({
      ...user_address_mock,
    });

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserAlreadyHaveAddress()));
  });

  it('should not accept a invalid postal_code', async () => {
    const invalid_Body = {
      ...user_address_mock,
      postal_code: 'any',
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
      params: {
        id: user_address_mock.id_user,
      },
    });

    expect(http_response).toEqual(
      badRequest(new InvalidParamError('The param postal_code is not valid')),
    );
  });

  it('should not accept a id_user with a invalid uuid format', async () => {
    const invalid_Body = {
      ...user_address_mock,
      id_user: 'any',
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
      params: user_address_mock.id_user,
    });

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      ),
    );
  });

  it('should returns a server error if createUserUseCase throws an error', async () => {
    jest
      .spyOn(createUserAddressUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(serverError());
  });
});
