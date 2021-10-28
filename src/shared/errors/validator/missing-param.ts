export class MissingParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingParamError';
  }
}
