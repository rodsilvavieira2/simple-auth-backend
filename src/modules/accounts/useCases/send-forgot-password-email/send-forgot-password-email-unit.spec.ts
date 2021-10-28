import faker from 'faker';
import path from 'path';

import {
  TokenRepositoryInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { EmailProviderInMemory } from '@shared/container/providers/email/in-memory';
import { UuidFacade } from '@shared/container/providers/uuid/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { notFound, serverError } from '@shared/http';

import {
  SendForgotPasswordEmailUseCase,
  SendForgotPasswordEmailController,
} from '.';

jest.mock('path', () => ({
  resolve: () => 'any_pash',
  dirname: () => 'any_dirname',
}));

let sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase;
let sendForgotPasswordEmailController: SendForgotPasswordEmailController;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let emailProvider: EmailProviderInMemory;
let bodyRequestValidator: BodyRequestValidator;
let uuidProvider: UuidFacade;

describe('send forgot password email: unit', () => {
  beforeEach(() => {
    dayjsFacade = new DayjsFacade();
    tokenRepository = new TokenRepositoryInMemory();
    emailProvider = new EmailProviderInMemory();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    uuidProvider = new UuidFacade();
    sendForgotPasswordEmailUseCase = new SendForgotPasswordEmailUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
      uuidProvider,
      emailProvider,
    );

    sendForgotPasswordEmailController = new SendForgotPasswordEmailController(
      sendForgotPasswordEmailUseCase,
      bodyRequestValidator,
    );
  });

  it('should sendForgotPasswordEmailController call correctly your methods', async () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
      },
    };

    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(sendForgotPasswordEmailUseCase, 'execute');

    await sendForgotPasswordEmailController.handle(httpRequest);

    expect(checkSpy).toBeCalledWith({
      body: httpRequest.body,
      fields: ['email'],
    });

    expect(executeSpy).toBeCalledWith(httpRequest.body.email);
  });

  it('should sendForgotPasswordEmailUseCase call correctly your methods', async () => {
    const email = faker.internet.email();

    userRepository.users.push({
      id: faker.datatype.uuid(),
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      updated_at: faker.date.soon(),
      email,
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: true,
    });

    const expires_in = faker.date.recent();

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const resolveSpy = jest.spyOn(path, 'resolve').mockReturnValue('any_path');
    const createSpy = jest
      .spyOn(uuidProvider, 'create')
      .mockResolvedValueOnce('any_token');
    const addDaysSpy = jest
      .spyOn(dayjsFacade, 'addDays')
      .mockReturnValueOnce(expires_in);
    const saveSpy = jest.spyOn(tokenRepository, 'save');
    const sendMailSpy = jest.spyOn(emailProvider, 'sendMail');

    await sendForgotPasswordEmailUseCase.execute(email);

    expect(findByEmailSpy).toBeCalledWith(email);

    expect(createSpy).toBeCalled();
    expect(addDaysSpy).toBeCalledWith(3);
    expect(resolveSpy).toBeCalled();
    expect(saveSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_token',
        expires_in,
      }),
    );

    expect(sendMailSpy).toBeCalled();
  });
  it('should send a email reset password email for a registered user', async () => {
    const email = faker.internet.email();

    userRepository.users.push({
      id: faker.datatype.uuid(),
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      email,
      name: faker.internet.userName(),
      updated_at: faker.date.soon(),
      password: faker.internet.password(),
      isVerified: true,
    });

    const httpRequest = {
      body: {
        email,
      },
    };

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should returns a not found status if the email is not registered', async () => {
    const httpRequest = {
      body: {
        email: 'any_email',
      },
    };

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse).toEqual(notFound(new UserNotFoundError()));
  });

  it('should returns a server error status if sendForgotPasswordEmailUseCase.execute() throws a error', async () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
      },
    };

    jest
      .spyOn(sendForgotPasswordEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse).toEqual(serverError());
  });
});
