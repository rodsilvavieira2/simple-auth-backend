export class UserMustHavePhoneError extends Error {
  constructor() {
    super('A user must already have an phone to update then.');
    this.name = 'UserMustHaveAddressError';
  }
}
