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
import { EmptyBodyError } from '@shared/errors/validator';
import { badRequest, notFound, serverError } from '@shared/http';

import { SendVerifyEmailController, SendVerifyEmailUseCase } from '.';

jest.mock('path', () => ({
  resolve: () => 'any_path',
  dirname: () => 'any_dirname',
}));

let sendVerifyEmailUseCase: SendVerifyEmailUseCase;
let sendVerifyEmailController: SendVerifyEmailController;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let emailProvider: EmailProviderInMemory;
let bodyRequestValidator: BodyRequestValidator;
let uuidProvider: UuidFacade;

const user_mock = {
  id: faker.datatype.uuid(),
  name: 'any_email',
  password: 'any_password',
  email: 'any_email',
};

const http_request = {
  body: {
    email: 'any_email',
  },
};

describe('send verify email: unit', () => {
  beforeEach(() => {
    emailProvider = new EmailProviderInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    uuidProvider = new UuidFacade();
    userRepository = new UserRepositoryInMemory();
    tokenRepository = new TokenRepositoryInMemory();
    dayjsFacade = new DayjsFacade();
    sendVerifyEmailUseCase = new SendVerifyEmailUseCase(
      emailProvider,
      userRepository,
      tokenRepository,
      dayjsFacade,
      uuidProvider,
    );

    sendVerifyEmailController = new SendVerifyEmailController(
      sendVerifyEmailUseCase,
      bodyRequestValidator,
    );
  });

  it('should SendVerifyEmailUseCase call your methods correctly', async () => {
    const email = 'any_email';
    const expires_in = faker.date.future();

    await userRepository.save({
      ...user_mock,
    });

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const resolveSpy = jest.spyOn(path, 'resolve');
    const createSpy = jest
      .spyOn(uuidProvider, 'create')
      .mockResolvedValueOnce('any_token');
    const addHoursSpy = jest
      .spyOn(dayjsFacade, 'addHours')
      .mockReturnValueOnce(expires_in);
    const saveSpy = jest.spyOn(tokenRepository, 'save');
    const sendMail = jest.spyOn(emailProvider, 'sendMail');

    await sendVerifyEmailUseCase.execute(email);

    expect(findByEmailSpy).toBeCalledWith(email);
    expect(resolveSpy).toBeCalled();
    expect(createSpy).toBeCalled();
    expect(addHoursSpy).toBeCalledWith(3);
    expect(saveSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_token',
        expires_in,
      }),
    );

    expect(sendMail).toBeCalled();
  });

  it('should sendVerifyEmailController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(sendVerifyEmailUseCase, 'execute');

    await sendVerifyEmailController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: ['email'],
    });

    expect(executeSpy).toBeCalledWith(http_request.body.email);
  });
  it('should send a verify email if the user is registered ', async () => {
    await userRepository.save({
      ...user_mock,
    });

    const httpResponse = await sendVerifyEmailController.handle(http_request);

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should returns a not found status if the email is no registered', async () => {
    const httpResponse = await sendVerifyEmailController.handle(http_request);

    expect(httpResponse).toEqual(notFound(new UserNotFoundError()));
  });

  it('should return an bad request status if the email field in the request body is missing', async () => {
    const httpResponse = await sendVerifyEmailController.handle({ body: {} });

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should return a sever error status if sendForgotPasswordEmailUseCase.execute() throws an error', async () => {
    jest
      .spyOn(sendVerifyEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await sendVerifyEmailController.handle(http_request);

    expect(httpResponse).toEqual(serverError());
  });
});
