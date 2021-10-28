import faker from 'faker';

import {
  TokenRepositoryInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { InvalidTokenError } from '@shared/errors/useCase';
import { MissingParamError } from '@shared/errors/validator';
import { badRequest, serverError, unauthorized } from '@shared/http';

import { VerifyEmailUseCase, VerifyEmailController } from '.';

let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let verifyEmailUseCase: VerifyEmailUseCase;
let verifyEmailController: VerifyEmailController;

const user_mock = {
  id: faker.datatype.uuid(),
  name: 'any_name',
  password: 'any_password',
  email: 'any_email',
};

const user_token_mock = {
  id: faker.datatype.uuid(),
  id_user: user_mock.id,
  token: 'any_token',
  expires_in: faker.date.future(),
};

const http_request = {
  query: {
    token: 'any_token',
  },
};

describe('verify email :unit', () => {
  beforeEach(() => {
    tokenRepository = new TokenRepositoryInMemory();
    dayjsFacade = new DayjsFacade();
    userRepository = new UserRepositoryInMemory();
    verifyEmailUseCase = new VerifyEmailUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
    );
    verifyEmailController = new VerifyEmailController(verifyEmailUseCase);
  });
  it('should verifyEmailUseCase call your methods correctly', async () => {
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
    const saveSpy = jest.spyOn(userRepository, 'save');
    const deleteByIdSpy = jest.spyOn(tokenRepository, 'deleteById');

    await verifyEmailUseCase.execute('any_token');

    expect(findByTokenSpy).toBeCalledWith('any_token');
    expect(dateNowSpy).toBeCalled();
    expect(compareIfBeforeSpy).toBeCalledWith(user_token_mock.expires_in, recent_date);
    expect(findByIdSpy).toBeCalledWith(user_token_mock.id_user);
    expect(saveSpy).toBeCalledWith(
      expect.objectContaining({
        isVerified: true,
      }),
    );
    expect(deleteByIdSpy).toBeCalledWith(user_token_mock.id);
  });

  it('should verifyEmailController call your methods correctly', async () => {
    const executeSpy = jest.spyOn(verifyEmailUseCase, 'execute');

    await verifyEmailController.handle(http_request);

    expect(executeSpy).toBeCalledWith('any_token');
  });

  it('should verify a email of a registered user', async () => {
    await tokenRepository.save({
      ...user_token_mock,
    });

    await userRepository.save({
      ...user_mock,
    });

    const httpResponse = await verifyEmailController.handle(http_request);

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should not accept a request missing the token in the query', async () => {
    const httpResponse = await verifyEmailController.handle({ query: {} });

    expect(httpResponse).toEqual(
      badRequest(new MissingParamError('Token missing on the route query')),
    );
  });

  it('should not accept a invalid token', async () => {
    const http_request = {
      query: {
        token: 'token invalid',
      },
    };

    const httpResponse = await verifyEmailController.handle(http_request);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should not accept a expired token', async () => {
    await tokenRepository.save({
      ...user_token_mock,
      expires_in: faker.date.past(),
    });

    const httpResponse = await verifyEmailController.handle(http_request);
    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should return a sever error if verifyEmailUseCase.execute() throws an error', async () => {
    jest
      .spyOn(verifyEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await verifyEmailController.handle(http_request);

    expect(httpResponse).toEqual(serverError());
  });
});
