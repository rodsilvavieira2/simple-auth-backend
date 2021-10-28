export class UserMustHaveAddressError extends Error {
  constructor() {
    super('A user must already have an address to update then.');
    this.name = 'UserMustHaveAddressError';
  }
}
