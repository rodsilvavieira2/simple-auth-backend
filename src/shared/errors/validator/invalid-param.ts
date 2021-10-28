export class InvalidParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParamError';
  }
}
