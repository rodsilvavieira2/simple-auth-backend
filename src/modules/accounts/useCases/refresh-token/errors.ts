/* eslint-disable max-classes-per-file */
export class InvalidRefreshToken extends Error {
  constructor() {
    super('Invalid refresh token');
    this.name = 'InvalidRefreshToken';
  }
}

export class UserTokenDoesNotExists extends Error {
  constructor() {
    super('Refresh Token does not exists!');
    this.name = 'UserTokenDoesNotExists';
  }
}
