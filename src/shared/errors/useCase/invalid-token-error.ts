export class InvalidTokenError extends Error {
  constructor() {
    super('Token invalid');
    this.name = 'InvalidTokenError';
  }
}
