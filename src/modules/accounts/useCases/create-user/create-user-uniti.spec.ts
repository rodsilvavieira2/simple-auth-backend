import faker from 'faker';

import { UserRepositoryInMemory } from '@modules/accounts/repositories/in-memory';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import {
  UserParamsValidator,
  BodyRequestValidator,
  USER_PARAMS_VALIDATOR_ERRORS,
} from '@shared/container/providers/validator/implementations';
import {
  EmptyBodyError,
  InvalidParamError,
  MissingParamError,
} from '@shared/errors/validator';
import { badRequest, serverError } from '@shared/http';

import { CreatUserUseCase, CreateUserController } from '.';

let bcryptFacade: BcryptFacade;
let userParamsValidator: UserParamsValidator;
let userRepository: UserRepositoryInMemory;
let createUserUseCase: CreatUserUseCase;
let bodyRequestValidator: BodyRequestValidator;
let createUserController: CreateUserController;

const httpRequest = {
  body: {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
  },
};
describe('create user: unit', () => {
  beforeEach(() => {
    bcryptFacade = new BcryptFacade(2);
    userParamsValidator = new UserParamsValidator();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    createUserUseCase = new CreatUserUseCase(
      userRepository,
      userParamsValidator,
      bcryptFacade,
    );
    createUserController = new CreateUserController(
      createUserUseCase,
      bodyRequestValidator,
    );
  });

  it('should CreatUserUserCase call your methods correctly', async () => {
    const user_mock = {
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: faker.internet.password(),
    };

    const checkSpy = jest.spyOn(userParamsValidator, 'check');
    const findByEmail = jest.spyOn(userRepository, 'findByEmail');
    const hashSpy = jest
      .spyOn(bcryptFacade, 'hash')
      .mockResolvedValueOnce('any_hash');
    const saveSpy = jest.spyOn(userRepository, 'save');

    await createUserUseCase.execute(user_mock);

    expect(checkSpy).toBeCalledWith(user_mock);
    expect(findByEmail).toBeCalledWith(user_mock.email);
    expect(hashSpy).toBeCalledWith(user_mock.password);
    expect(saveSpy).toBeCalledWith({
      ...user_mock,
      password: 'any_hash',
    });
  });

  it('should createUserController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserUseCase, 'execute');
    await createUserController.handle(httpRequest);

    expect(checkSpy).toBeCalledWith({
      body: httpRequest.body,
      fields: ['name', 'email', 'password'],
    });

    expect(executeSpy).toBeCalledWith(httpRequest.body);
  });
  it('should create a new user', async () => {
    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse.body).toBeUndefined();
    expect(httpResponse.statusCode).toBe(201);
  });

  it('should not accept a empty body request', async () => {
    const httpResponse = await createUserController.handle({});

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not accept a body request missing a required field', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        password: '',
      },
    });

    expect(httpResponse).toEqual(
      badRequest(new MissingParamError('The filed(s): [password] is missing.')),
    );
  });

  it('should not accept a invalid email address', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        email: 'invalid-email',
      },
    });

    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.email)),
    );
  });

  it('should not accept a invalid name', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        name: 'i',
      },
    });
    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.name)),
    );
  });

  it('should not accept a invalid password', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        password: '12345',
      },
    });

    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARAMS_VALIDATOR_ERRORS.password)),
    );
  });

  it('should returns a server error if createUserUseCase.execute() throws a error', async () => {
    jest.spyOn(createUserUseCase, 'execute').mockRejectedValue(new Error());

    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse).toEqual(serverError());
  });
});
