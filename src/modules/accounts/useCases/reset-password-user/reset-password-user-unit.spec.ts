import faker from 'faker';

import {
  UserRepositoryInMemory,
  TokenRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { InvalidTokenError } from '@shared/errors/useCase';
import { serverError, unauthorized } from '@shared/http';

import { ResetPasswordUserController } from './reset-password-user-controller';
import { ResetPasswordUserUseCase } from './reset-password-user-useCase';

let resetPasswordUserUseCase: ResetPasswordUserUseCase;
let resetPasswordUserController: ResetPasswordUserController;
let bodyRequestValidator: BodyRequestValidator;
let userRepository: UserRepositoryInMemory;
let bcryptFacade: BcryptFacade;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;

const user_mock = {
  id: faker.datatype.uuid(),
  email: 'any_email',
  password: 'any_password',
  name: 'any_name',
};

const user_token_mock = {
  id: faker.datatype.uuid(),
  token: 'any_token',
  id_user: user_mock.id,
  expires_in: faker.date.future(),
};

const http_request = {
  body: {
    password: 'any_password123',
  },
  query: {
    token: 'any_token',
  },
};

describe('Reset password user', () => {
  beforeEach(() => {
    bcryptFacade = new BcryptFacade(2);
    dayjsFacade = new DayjsFacade();
    tokenRepository = new TokenRepositoryInMemory();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    resetPasswordUserUseCase = new ResetPasswordUserUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
      bcryptFacade,
    );

    resetPasswordUserController = new ResetPasswordUserController(
      resetPasswordUserUseCase,
      bodyRequestValidator,
    );
  });

  it('should resetPasswordUserUseCase call your methods correctly ', async () => {
    const recent_date = faker.date.recent();

    await userRepository.save({
      ...user_mock,
    });

    await tokenRepository.save({
      ...user_token_mock,
    });

    const findByTokenSpy = jest.spyOn(tokenRepository, 'findByToken');
    const compareIfBeforeSpy = jest.spyOn(dayjsFacade, 'compareIfBefore');
    const dateNowSpy = jest
      .spyOn(dayjsFacade, 'dateNow')
      .mockReturnValue(recent_date);
    const findByIdSpy = jest.spyOn(userRepository, 'findById');
    const hashSpy = jest
      .spyOn(bcryptFacade, 'hash')
      .mockResolvedValueOnce('any_hash');
    const saveSpy = jest.spyOn(userRepository, 'save');
    const deleteByIdSpy = jest.spyOn(tokenRepository, 'deleteById');

    await resetPasswordUserUseCase.execute({
      token: 'any_token',
      password: 'any_password123',
    });

    expect(findByTokenSpy).toBeCalledWith('any_token');
    expect(dateNowSpy).toBeCalled();
    expect(compareIfBeforeSpy).toBeCalledWith(user_token_mock.expires_in, recent_date);
    expect(findByIdSpy).toBeCalledWith(user_token_mock.id_user);
    expect(hashSpy).toBeCalledWith('any_password123');
    expect(saveSpy).toBeCalledWith(
      expect.objectContaining({
        password: 'any_hash',
      }),
    );
    expect(deleteByIdSpy).toBeCalledWith(user_token_mock.id);
  });

  it('should resetPasswordUserController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(resetPasswordUserUseCase, 'execute');

    await resetPasswordUserController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: ['password'],
    });

    expect(executeSpy).toBeCalledWith({
      token: 'any_token',
      password: 'any_password123',
    });
  });

  it('should reset a password user if the reset password token is valid', async () => {
    await tokenRepository.save({
      ...user_token_mock,
    });

    await userRepository.save({
      ...user_mock,
    });

    const httpResponse = await resetPasswordUserController.handle(http_request);

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should not accept a token that is not registered', async () => {
    const httpResponse = await resetPasswordUserController.handle(http_request);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should not accept a token that is expired', async () => {
    await tokenRepository.save({
      ...user_token_mock,
      expires_in: faker.date.past(),
    });

    const httpResponse = await resetPasswordUserController.handle(http_request);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should returns a server error if resetPasswordUserUseCase.execute() throws an error', async () => {
    jest
      .spyOn(resetPasswordUserUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await resetPasswordUserController.handle(http_request);

    expect(httpResponse).toEqual(serverError());
  });
});
