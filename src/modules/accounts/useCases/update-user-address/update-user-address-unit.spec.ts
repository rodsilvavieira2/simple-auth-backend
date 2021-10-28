import faker from 'faker';

import {
  UserAddressInMemoryRepository,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import {
  BodyRequestValidator,
  UpdateUserAddressParamsValidator,
} from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import {
  EmptyBodyError,
  InvalidParamError,
} from '@shared/errors/validator';
import { badRequest, serverError } from '@shared/http';

import { UpdateUserAddressController } from './update-user-address-controller';
import { UpdateUserAddressUseCase } from './update-user-address-useCase';

let updateUserAddressUseCase: UpdateUserAddressUseCase;
let updateUserAddressController: UpdateUserAddressController;
let userAddressRepository: UserAddressInMemoryRepository;
let userRepository: UserRepositoryInMemory;
let bodyRequestValidator: BodyRequestValidator;
let updateUserAddressParamsValidator: UpdateUserAddressParamsValidator;

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
    id: user_mock.id,
  },
};
describe('Create user address: unit', () => {
  beforeEach(() => {
    userAddressRepository = new UserAddressInMemoryRepository();
    userRepository = new UserRepositoryInMemory();

    updateUserAddressParamsValidator = new UpdateUserAddressParamsValidator();
    updateUserAddressUseCase = new UpdateUserAddressUseCase(
      userRepository,
      userAddressRepository,
      updateUserAddressParamsValidator,
    );

    bodyRequestValidator = new BodyRequestValidator();
    updateUserAddressController = new UpdateUserAddressController(
      updateUserAddressUseCase,
      bodyRequestValidator,
    );
  });
  it('should updateUserAddressUseCase call your methods correctly', async () => {
    await userAddressRepository.save({
      ...user_address_mock,
    });

    await userRepository.save({
      ...user_mock,
    });

    const checkSpy = jest.spyOn(updateUserAddressParamsValidator, 'check');
    const findByIdSpy = jest.spyOn(userRepository, 'findById');
    const updateSpy = jest.spyOn(userAddressRepository, 'update');
    const findByUserIdSpy = jest.spyOn(userAddressRepository, 'findByUserId');

    await updateUserAddressUseCase.execute(user_address_mock);

    expect(checkSpy).toBeCalledWith(user_address_mock);
    expect(findByIdSpy).toBeCalledWith(user_address_mock.id_user);
    expect(findByUserIdSpy).toBeCalledWith(user_address_mock.id_user);
    expect(updateSpy).toBeCalledWith(user_address_mock);
  });

  it('should updateUserAddressController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(updateUserAddressUseCase, 'execute');

    await updateUserAddressController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: [],
    });

    expect(executeSpy).toBeCalledWith(user_address_mock);
  });

  it('should update a new user address for a registered user', async () => {
    await userAddressRepository.save({
      ...user_address_mock,
    });

    await userRepository.save({
      ...user_mock,
    });

    const http_response = await updateUserAddressController.handle(
      http_request,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id_user, ...rest } = user_address_mock;

    expect(http_response.statusCode).toEqual(200);
    expect(http_response.body).toEqual(rest);
  });

  it('should not accept a empty body request', async () => {
    const http_response = await updateUserAddressController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not update a new user address for a not registered user', async () => {
    const http_response = await updateUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });

  it('should not accept a invalid postal_code', async () => {
    const invalid_Body = {
      ...user_address_mock,
      postal_code: 'any',
    };

    const http_response = await updateUserAddressController.handle({
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

    const http_response = await updateUserAddressController.handle({
      body: invalid_Body,
      params: user_address_mock.id_user,
    });

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      ),
    );
  });

  it('should returns a server error if updateUserAddressUseCase throws an error', async () => {
    jest
      .spyOn(updateUserAddressUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await updateUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(serverError());
  });
});
