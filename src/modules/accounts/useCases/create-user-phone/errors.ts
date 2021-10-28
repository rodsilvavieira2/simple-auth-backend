export class UserAlreadyHavePhone extends Error {
  constructor() {
    super('This user already has a phone');
    this.name = 'UserAlreadyHavePhone';
  }
}
