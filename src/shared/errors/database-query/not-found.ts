export class NotFoundError extends Error {
  constructor(value: string) {
    super(`No matches found fo this value: ${value}`);
    this.name = 'NotFoundError';
  }
}
