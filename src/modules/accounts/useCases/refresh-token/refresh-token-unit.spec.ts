import faker from 'faker';
import { sign } from 'jsonwebtoken';

import auth from '@config/auth';
import { TokenRepositoryInMemory } from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { JwtFacade } from '@shared/container/providers/jwt/implementations';
import { serverError, unauthorized } from '@shared/http';

import { RefreshTokenController, RefreshTokenUseCase } from '.';
import { InvalidRefreshToken, UserTokenDoesNotExists } from './errors';

let tokenProvider: JwtFacade;
let dateProvider: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let refreshTokenUseCase: RefreshTokenUseCase;
let refreshTokenController: RefreshTokenController;

const id = faker.datatype.uuid();

const token = sign({}, auth.secret_refresh_token, {
  subject: id,
});

const token_mock = {
  id: faker.datatype.uuid(),
  id_user: id,
  token,
  expires_in: faker.date.soon(),
};

const http_request = {
  body: {
    token,
  },
};

describe('refresh token: unit', () => {
  beforeAll(() => {
    tokenProvider = new JwtFacade();
    dateProvider = new DayjsFacade();
    tokenRepository = new TokenRepositoryInMemory();
    refreshTokenUseCase = new RefreshTokenUseCase(
      tokenRepository,
      dateProvider,
      tokenProvider,
    );
    refreshTokenController = new RefreshTokenController(refreshTokenUseCase);
  });

  it('should refreshTokenUseCase call your methods correctly', async () => {
    await tokenRepository.save({
      ...token_mock,
    });

    const refresh_token = 'any_refresh_token';
    const expires_in = faker.date.future();

    const verifySpy = jest.spyOn(tokenProvider, 'verify');
    const decodeSpy = jest.spyOn(tokenProvider, 'decode');
    const findByUserIdAndTokenSpy = jest.spyOn(
      tokenRepository,
      'findByUserIdAndToken',
    );
    const deleteByIdSpy = jest.spyOn(tokenRepository, 'deleteById');
    const createTokenSpy = jest
      .spyOn(tokenProvider, 'createToken')
      .mockResolvedValueOnce(refresh_token);
    const addDaysSpy = jest
      .spyOn(dateProvider, 'addDays')
      .mockReturnValueOnce(expires_in);
    const saveSpy = jest.spyOn(tokenRepository, 'save');

    await refreshTokenUseCase.execute(token);

    expect(verifySpy).toBeCalledWith(token, auth.secret_refresh_token);
    expect(decodeSpy).toBeCalledWith(token);
    expect(findByUserIdAndTokenSpy).toBeCalledWith(id, token);
    expect(deleteByIdSpy).toBeCalledWith(token_mock.id);
    expect(createTokenSpy).toBeCalledTimes(2);
    expect(addDaysSpy).toBeCalledWith(auth.expires_refresh_token_days);
    expect(saveSpy).toBeCalledWith({
      expires_in,
      id_user: id,
      token: refresh_token,
    });
  });

  it('should refreshTokenController call your methods correctly', async () => {
    const executeSpy = jest.spyOn(refreshTokenUseCase, 'execute');

    await refreshTokenController.handle(http_request);

    expect(executeSpy).toBeCalledWith(token);
  });

  it('should accept a valid refresh token', async () => {
    await tokenRepository.save({
      ...token_mock,
    });

    const http_response = await refreshTokenController.handle(http_request);

    expect(http_response.statusCode).toBe(201);
    expect(http_response.body.access_token).toBeTruthy();
    expect(http_response.body.refresh_token).toBeTruthy();
  });

  it('should not accept a invalid refresh_token', async () => {
    const token = sign({}, 'invalid_secret');

    const invalid_http_request = {
      body: {
        token,
      },
    };

    const http_response = await refreshTokenController.handle(
      invalid_http_request,
    );

    expect(http_response).toEqual(unauthorized(new InvalidRefreshToken()));
  });

  it('should not accept a not registered refresh token', async () => {
    const http_response = await refreshTokenController.handle(http_request);

    expect(http_response).toEqual(unauthorized(new UserTokenDoesNotExists()));
  });

  it('should return a server error if refreshTokenUseCase throws a error', async () => {
    jest
      .spyOn(refreshTokenUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await refreshTokenController.handle(http_request);

    expect(http_response).toEqual(serverError());
  });
});
