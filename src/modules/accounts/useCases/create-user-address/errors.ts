export class UserAlreadyHaveAddress extends Error {
  constructor() {
    super('This user already has a address');
    this.name = 'UserAlreadyHaveAddress';
  }
}
