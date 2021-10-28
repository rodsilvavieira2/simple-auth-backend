import faker from 'faker';

import {
  UserRepositoryInMemory,
  TokenRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import { JwtFacade } from '@shared/container/providers/jwt/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { EmptyBodyError, MissingParamError } from '@shared/errors/validator';
import { badRequest, serverError, unauthorized } from '@shared/http';

import { EmailOrPasswordInvalid } from './errors';
import { UserAuthenticateController } from './user-authenticate-controller';
import { UserAuthenticateUseCase } from './user-authenticate-useCase';

let userAuthenticateUseCase: UserAuthenticateUseCase;
let userAuthenticateController: UserAuthenticateController;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let jwtFacade: JwtFacade;
let bcryptFacade: BcryptFacade;
let dayjsFacade: DayjsFacade;
let bodyRequestValidator: BodyRequestValidator;

const user_mock = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  password: 'any_password123',
  email: 'any_email',
};

const http_request = {
  body: {
    email: 'any_email',
    password: 'any_password123',
  },
};

describe('user authenticate: unit', () => {
  beforeEach(async () => {
    tokenRepository = new TokenRepositoryInMemory();
    userRepository = new UserRepositoryInMemory();
    jwtFacade = new JwtFacade();
    bcryptFacade = new BcryptFacade(2);
    dayjsFacade = new DayjsFacade();

    bodyRequestValidator = new BodyRequestValidator();
    userAuthenticateUseCase = new UserAuthenticateUseCase(
      userRepository,
      tokenRepository,
      jwtFacade,
      bcryptFacade,
      dayjsFacade,
    );

    userAuthenticateController = new UserAuthenticateController(
      userAuthenticateUseCase,
      bodyRequestValidator,
    );
  });
  it('should userAuthenticateUseCase call your methods correctly', async () => {
    const password = 'any_password123';
    const email = 'any_email';
    const expires_in = faker.date.future();

    await userRepository.save({
      ...user_mock,
    });

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const compareSpy = jest
      .spyOn(bcryptFacade, 'compare')
      .mockResolvedValueOnce(true);
    const createTokenSpy = jest
      .spyOn(jwtFacade, 'createToken')
      .mockResolvedValue('any_jwt');
    const addDaysSpy = jest
      .spyOn(dayjsFacade, 'addDays')
      .mockReturnValueOnce(expires_in);
    const saveSpy = jest.spyOn(tokenRepository, 'save');

    await userAuthenticateUseCase.execute({
      password,
      email,
    });

    expect(findByEmailSpy).toBeCalledWith(email);
    expect(compareSpy).toBeCalledWith(password, password);
    expect(createTokenSpy).toBeCalledTimes(2);
    expect(addDaysSpy).toBeCalled();
    expect(saveSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_jwt',
        expires_in,
      }),
    );
  });

  it('should userAuthenticateController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(userAuthenticateUseCase, 'execute');

    await userAuthenticateController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: ['password', 'email'],
    });

    expect(executeSpy).toBeCalledWith(http_request.body);
  });
  it('should authenticate a registered user', async () => {
    const passwordHash = await bcryptFacade.hash(user_mock.password);

    const { id } = await userRepository.save({
      ...user_mock,
      password: passwordHash,
    });

    const httpResponse = await userAuthenticateController.handle(http_request);

    const { email, name } = user_mock;

    expect(httpResponse.statusCode).toBe(200);

    expect(httpResponse.body).toEqual(
      expect.objectContaining({
        user: {
          id,
          name,
          email,
        },
      }),
    );

    expect(httpResponse.body.refreshToken).toBeTruthy();
    expect(httpResponse.body.accessToken).toBeTruthy();
  });

  it('should not authenticate a user with invalid credentials', async () => {
    const password = faker.internet.password();
    const passwordHash = await bcryptFacade.hash(password);

    const user_db = {
      ...user_mock,
      password: passwordHash,
    };

    const http_request = {
      body: {
        ...user_db,
        password,
      },
    };

    await userRepository.save(user_db);

    const httpResponse = await userAuthenticateController.handle({
      body: {
        ...http_request.body,
        password: '123',
      },
    });

    expect(httpResponse).toEqual(unauthorized(new EmailOrPasswordInvalid()));
  });

  it('should not accept a empty body request', async () => {
    const httpResponse = await userAuthenticateController.handle({});

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not accept a body request missing a required fields', async () => {
    const http_request = {
      body: {
        email: 'any_email',
      },
    };
    const httpResponse = await userAuthenticateController.handle(http_request);

    expect(httpResponse).toEqual(
      badRequest(new MissingParamError('The filed(s): [password] is missing.')),
    );
  });

  it('should returns a server error if userAuthenticateUseCase.execute() throws an error', async () => {
    jest
      .spyOn(userAuthenticateUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await userAuthenticateController.handle(http_request);

    expect(httpResponse).toEqual(serverError());
  });
});
