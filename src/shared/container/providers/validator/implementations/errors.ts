export enum USER_PARAMS_VALIDATOR_ERRORS {
  email = 'The email field is a invalid email address',
  name = 'The name field is a empty string or less than 2 characters',
  password = 'The password field is a password with less than 8 characters',
}

export enum TOKEN_ERRORS {
  uuid = 'The id_user does not have a valid uuid format',
}

export enum PHONE_ERRORS {
  phone_number = 'The param: phone_number have less than 9 characters',
  type = 'The param: type is invalid',
}

export enum ADDRESS_ERRORS {
  postal_code = 'The param postal_code is not valid',
}
